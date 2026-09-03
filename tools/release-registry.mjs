#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { URL } from "node:url";
import { promisify } from "node:util";
import {
  executeTagTransaction,
  PACKAGE_NAMES,
  planCandidatePublication,
  planPromotion,
  planRollback,
  validateCandidateManifest,
  validateRegistryConfiguration,
} from "./lib/release.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const [command, ...arguments_] = process.argv.slice(2);
const option = (name) => {
  const index = arguments_.indexOf(name);
  return index < 0 ? null : arguments_[index + 1];
};

async function run(binary, args, options = {}) {
  return exec(binary, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
}

async function json(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

function assertTrustedRelease(candidate) {
  if (
    process.env.GITHUB_REF !== "refs/heads/main" ||
    process.env.GITHUB_SHA !== candidate.commit
  )
    throw new Error(
      "release mutation requires the candidate commit on protected main",
    );
}

async function withNpmConfiguration(mode, operation) {
  const configuration = validateRegistryConfiguration(process.env, mode);
  const directory = await mkdtemp(path.join(tmpdir(), "shlz-release-npm-"));
  const userConfig = path.join(directory, "npmrc");
  const registry = new URL(configuration.registry);
  const token =
    mode === "verify"
      ? process.env.GITLAB_NPM_READ_TOKEN
      : process.env.GITLAB_NPM_PUBLISH_TOKEN;
  const authenticationPath = `//${registry.host}${registry.pathname}:_authToken=${token}`;
  await writeFile(
    userConfig,
    `@shlz:registry=${configuration.registry}\n${authenticationPath}\nalways-auth=true\n`,
    { mode: 0o600 },
  );
  try {
    return await operation({
      configuration,
      npm: async (args) =>
        run("npm", [
          ...args,
          "--registry",
          configuration.registry,
          "--userconfig",
          userConfig,
        ]),
      userConfig,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function view(npm, specifier, field) {
  try {
    const { stdout } = await npm(["view", specifier, field, "--json"]);
    return stdout.trim() ? JSON.parse(stdout) : null;
  } catch (error) {
    if (/E404|404 Not Found/.test(`${error.stderr ?? ""}`)) return null;
    throw error;
  }
}

async function exactRegistryState(npm, candidate) {
  return Object.fromEntries(
    await Promise.all(
      candidate.packages.map(async ({ name, version }) => {
        const integrity = await view(
          npm,
          `${name}@${version}`,
          "dist.integrity",
        );
        return [name, integrity ? { integrity, version } : null];
      }),
    ),
  );
}

async function latestState(npm) {
  return Object.fromEntries(
    await Promise.all(
      PACKAGE_NAMES.map(async (name) => [
        name,
        await view(npm, name, "dist-tags.latest"),
      ]),
    ),
  );
}

async function writeAudit(value) {
  const target = option("--audit");
  if (target) await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

async function publish() {
  const manifestPath = option("--manifest");
  if (!manifestPath) throw new Error("publish requires --manifest");
  const candidate = await json(manifestPath);
  validateCandidateManifest(candidate);
  assertTrustedRelease(candidate);
  return withNpmConfiguration("publish", async ({ npm }) => {
    const registry = await exactRegistryState(npm, candidate);
    const plan = planCandidatePublication({ candidate, registry });
    const completed = [];
    for (const item of plan) {
      if (item.action === "publish") {
        const packed = candidate.packages.find(
          ({ name }) => name === item.name,
        );
        await npm([
          "publish",
          path.resolve(path.dirname(manifestPath), packed.filename),
          "--tag",
          "candidate",
          "--access",
          "restricted",
        ]);
      }
      completed.push(item);
    }
    const verified = await exactRegistryState(npm, candidate);
    planPromotion({ candidate, registry: verified });
    return writeAudit({
      candidateDigest: candidate.digest,
      operation: "candidate-publication",
      outcome: "pass",
      packages: completed,
    });
  });
}

async function verify() {
  const manifestPath = option("--manifest");
  if (!manifestPath) throw new Error("verify requires --manifest");
  const candidate = await json(manifestPath);
  validateCandidateManifest(candidate);
  return withNpmConfiguration("verify", async ({ npm, userConfig }) => {
    const registry = await exactRegistryState(npm, candidate);
    planPromotion({ candidate, registry });
    await run(
      "node",
      ["tools/package-consumer-smoke.mjs", "--manifest", manifestPath],
      {
        env: {
          ...process.env,
          NPM_CONFIG_USERCONFIG: userConfig,
        },
      },
    );
    return writeAudit({
      candidateDigest: candidate.digest,
      operation: "registry-verification",
      outcome: "pass",
      version: candidate.releaseVersion,
    });
  });
}

async function promote() {
  const manifestPath = option("--manifest");
  if (!manifestPath) throw new Error("promote requires --manifest");
  const candidate = await json(manifestPath);
  validateCandidateManifest(candidate);
  assertTrustedRelease(candidate);
  return withNpmConfiguration("publish", async ({ npm }) => {
    const registry = await exactRegistryState(npm, candidate);
    const mutations = planPromotion({ candidate, registry });
    const previous = await latestState(npm);
    const priorVersions = Object.values(previous);
    const initialRelease = priorVersions.every((version) => !version);
    if (
      !initialRelease &&
      (priorVersions.some((version) => !version) ||
        new Set(priorVersions).size !== 1)
    )
      throw new Error("promotion requires a coherent prior latest set");
    const transaction = await executeTagTransaction({
      mutate: ({ name, tag, version }) =>
        npm(["dist-tag", "add", `${name}@${version}`, tag]),
      mutations,
      previous,
      restore: ({ mutation, previousVersion }) =>
        previousVersion
          ? npm([
              "dist-tag",
              "add",
              `${mutation.name}@${previousVersion}`,
              mutation.tag,
            ])
          : npm(["dist-tag", "rm", mutation.name, mutation.tag]),
      verify: async () => {
        const actual = await latestState(npm);
        if (
          PACKAGE_NAMES.some(
            (name) => actual[name] !== candidate.releaseVersion,
          )
        )
          throw new Error("stable tags did not converge on the candidate");
      },
    });
    return writeAudit({
      candidateDigest: candidate.digest,
      operation: "promotion",
      outcome: "pass",
      previous,
      transaction,
      version: candidate.releaseVersion,
    });
  });
}

async function rollback() {
  const targetPath = option("--target-manifest");
  const defectiveVersion = option("--defective-version");
  const reason = option("--reason");
  if (!targetPath || !defectiveVersion || !reason)
    throw new Error(
      "rollback requires --target-manifest, --defective-version, and --reason",
    );
  const target = await json(targetPath);
  validateCandidateManifest(target);
  if (process.env.GITHUB_REF !== "refs/heads/main")
    throw new Error("rollback mutation requires protected main");
  if (!process.env.GITHUB_ACTOR)
    throw new Error("rollback mutation requires an authenticated operator");
  return withNpmConfiguration("rollback", async ({ npm }) => {
    const targetRegistry = await exactRegistryState(npm, target);
    planPromotion({ candidate: target, registry: targetRegistry });
    const currentLatest = await latestState(npm);
    const plan = planRollback({
      currentLatest,
      defectiveVersion,
      reason,
      target,
    });
    const transaction = await executeTagTransaction({
      mutate: ({ name, tag, version }) =>
        npm(["dist-tag", "add", `${name}@${version}`, tag]),
      mutations: plan.mutations,
      previous: plan.priorLatest,
      verify: async () => {
        const actual = await latestState(npm);
        if (PACKAGE_NAMES.some((name) => actual[name] !== plan.targetVersion))
          throw new Error("rollback tags did not converge on the target");
      },
    });
    for (const item of plan.deprecations)
      await npm(["deprecate", `${item.name}@${item.version}`, item.message]);
    return writeAudit({
      actor: process.env.GITHUB_ACTOR,
      defectiveVersion,
      operation: "rollback",
      outcome: "pass",
      priorLatest: plan.priorLatest,
      reason,
      targetDigest: target.digest,
      targetVersion: plan.targetVersion,
      transaction,
    });
  });
}

try {
  let result;
  if (command === "publish") result = await publish();
  else if (command === "verify") result = await verify();
  else if (command === "promote") result = await promote();
  else if (command === "rollback") result = await rollback();
  else
    throw new Error(
      "usage: node tools/release-registry.mjs <publish|verify|promote|rollback>",
    );
  process.stdout.write(`${JSON.stringify(await result, null, 2)}\n`);
} catch (error) {
  const auditTarget = option("--audit");
  if (auditTarget) {
    await writeFile(
      auditTarget,
      `${JSON.stringify(
        {
          details: error.audit ?? null,
          message: error.message,
          operation: command ?? "unknown",
          outcome: "fail",
        },
        null,
        2,
      )}\n`,
    );
  }
  process.stderr.write(`${error.message}\n`);
  if (error.audit)
    process.stderr.write(
      `${JSON.stringify({ audit: error.audit }, null, 2)}\n`,
    );
  process.exitCode = 1;
}
