#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  assertSafeReleaseDocumentation,
  createCandidateManifest,
  PACKAGE_ORDER,
  requireCleanReleaseState,
  synchronizeWorkspaceConsumer,
  validateChangesetConfig,
  validatePackageSet,
  validatePackedPackage,
  validateReleaseIntent,
} from "./lib/release.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const [command, ...arguments_] = process.argv.slice(2);

const option = (name) => {
  const index = arguments_.indexOf(name);
  return index < 0 ? null : arguments_[index + 1];
};
const has = (name) => arguments_.includes(name);
const run = async (binary, args, cwd = root) =>
  exec(binary, args, { cwd, maxBuffer: 20 * 1024 * 1024 });
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function readReleaseInputs() {
  const manifests = {};
  for (const name of PACKAGE_ORDER) {
    manifests[name] = await readJson(
      path.join(root, "packages", name, "package.json"),
    );
  }
  const config = await readJson(path.join(root, ".changeset", "config.json"));
  return { config, manifests };
}

async function validatePolicy() {
  const { config, manifests } = await readReleaseInputs();
  validateChangesetConfig(config);
  const releaseSet = validatePackageSet(manifests);
  assertSafeReleaseDocumentation(
    await readFile(path.join(root, "docs", "releasing.md"), "utf8"),
  );
  return releaseSet;
}

async function changesets() {
  const directory = path.join(root, ".changeset");
  const output = [];
  for (const name of await readdir(directory)) {
    if (!name.endsWith(".md") || name === "README.md") continue;
    const contents = await readFile(path.join(directory, name), "utf8");
    const match = contents.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error(`invalid changeset frontmatter: ${name}`);
    const releases = match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const fields = line.match(/^"?([^":]+)"?:\s*(patch|minor|major)$/);
        if (!fields) throw new Error(`invalid changeset release: ${name}`);
        return { name: fields[1], type: fields[2] };
      });
    output.push({
      id: name.replace(/\.md$/, ""),
      releases,
      summary: match[2].trim(),
    });
  }
  return output;
}

async function validateIntent() {
  const base = option("--base");
  if (!base) throw new Error("intent requires --base <commit>");
  const { stdout } = await run("git", [
    "diff",
    "--name-only",
    `${base}...HEAD`,
  ]);
  const changedPaths = stdout.trim().split(/\r?\n/).filter(Boolean);
  const parsedChangesets = await changesets();
  if (has("--version-pr") && !parsedChangesets.length) {
    const allowed = changedPaths.every(
      (name) =>
        name === "package-lock.json" ||
        /^packages\/(tokens|icons|styles|behaviors)\/(package\.json|CHANGELOG\.md)$/.test(
          name,
        ) ||
        /^\.changeset\/[^/]+\.md$/.test(name),
    );
    if (!allowed) throw new Error("version PR contains non-release changes");
    const { version } = await validatePolicy();
    for (const name of PACKAGE_ORDER) {
      const changelog = await readFile(
        path.join(root, "packages", name, "CHANGELOG.md"),
        "utf8",
      );
      if (!changelog.includes(`## ${version}`))
        throw new Error(`version PR changelog is missing ${name}@${version}`);
    }
    return { mode: "version-pr", version };
  }
  return {
    mode: "changeset",
    ...validateReleaseIntent({ changedPaths, changesets: parsedChangesets }),
  };
}

async function buildCandidate() {
  const output = option("--out");
  const tarballDirectory = option("--tarballs");
  if (!output || !tarballDirectory)
    throw new Error("candidate requires --out and --tarballs");
  const status = (await run("git", ["status", "--porcelain"])).stdout;
  requireCleanReleaseState(status);
  const { manifests } = await readReleaseInputs();
  await validatePolicy();
  await mkdir(tarballDirectory, { recursive: true });
  const packages = [];
  const changelogDigests = {};
  for (const name of PACKAGE_ORDER) {
    const packageDirectory = path.join(root, "packages", name);
    const { stdout } = await run(
      "npm",
      ["pack", ".", "--json", "--pack-destination", tarballDirectory],
      packageDirectory,
    );
    const packOutput = JSON.parse(stdout);
    const [pack] = Array.isArray(packOutput)
      ? packOutput
      : Object.values(packOutput);
    packages.push(validatePackedPackage(manifests[name], pack));
    changelogDigests[manifests[name].name] = sha256(
      await readFile(path.join(packageDirectory, "CHANGELOG.md")),
    );
  }
  const commit = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
  const candidate = createCandidateManifest({
    changelogDigests,
    commit,
    packages,
    validation: "pass",
  });
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(candidate, null, 2)}\n`);
  return candidate;
}

async function syncWorkspaceConsumer() {
  const { version } = await validatePolicy();
  const filename = path.join(root, "apps", "showcase", "package.json");
  const packageJson = await readJson(filename);
  const synchronized = synchronizeWorkspaceConsumer(packageJson, version);
  await writeFile(filename, `${JSON.stringify(synchronized, null, 2)}\n`);
  return { consumer: packageJson.name, version };
}

try {
  let result;
  switch (command) {
    case "policy":
      result = await validatePolicy();
      break;
    case "intent":
      result = await validateIntent();
      break;
    case "candidate":
      result = await buildCandidate();
      break;
    case "sync-workspace-consumer":
      result = await syncWorkspaceConsumer();
      break;
    default:
      throw new Error(
        "usage: node tools/release.mjs <policy|intent|candidate|sync-workspace-consumer> [options]",
      );
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
