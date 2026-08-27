#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertIsolatedExecutionAllowed,
  baseline,
  conformance,
  contract,
  delivery,
  failureProof,
  readJson,
  receipt,
  requirements,
  review,
  route,
  sourceManifest,
  tdd,
  telemetry,
  validation,
  verify,
  writeJson,
  digest,
} from "./lib/harness/core.mjs";
import { launchCodexWorker } from "./lib/harness/codex-worker.mjs";

export const publicCommands = [
  "route",
  "requirements",
  "baseline",
  "contract",
  "tdd",
  "validate",
  "review",
  "failure-proof",
  "run-isolated",
  "conformance",
  "delivery",
  "telemetry-summary",
];

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const [name, ...args] = process.argv.slice(2);
const option = (flag) => {
  const index = args.indexOf(flag);
  return index < 0 ? null : args[index + 1];
};
const positional = args.filter(
  (value, index) =>
    !value.startsWith("--") &&
    (index === 0 || !args[index - 1].startsWith("--")),
);
const absolute = (file) => {
  const target = path.resolve(repoRoot, file);
  if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
    throw new Error(`path escapes repository: ${file}`);
  return target;
};
const load = (file) => readJson(absolute(file));
const emit = async (value) => {
  const output = option("--out");
  if (output) await writeJson(absolute(output), value);
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};
const usage = () => {
  process.stdout.write(
    `usage: npm run harness -- <${publicCommands.join("|")}> ... [--out receipt.json]\n`,
  );
  process.stdout.write(
    "Each command validates immutable inputs and emits one content-addressed receipt.\n",
  );
};

async function isolated(manifest) {
  const dependencies = await Promise.all(
    (manifest.dependencies ?? []).map(load),
  );
  for (const dependency of dependencies) verify(dependency);
  assertIsolatedExecutionAllowed(dependencies);
  const sources = await sourceManifest(
    repoRoot,
    manifest.sources ?? [],
    manifest.byteBudget ?? null,
  );
  if (!sources.allowed)
    throw new Error(
      `context byte budget exceeded: ${sources.bytes} > ${sources.byteBudget}; contributors: ${sources.contributors.map(({ path: name, bytes }) => `${name}:${bytes}`).join(", ")}`,
    );
  const launchManifest = {
    version: 1,
    objective: manifest.objective,
    sourceManifest: sources,
    dependencyDigests: dependencies.map(({ digest: value }) => value),
  };
  const result = await launchCodexWorker({
    brief: launchManifest,
    cwd: repoRoot,
    command: manifest.command ?? "codex",
    timeoutMs: manifest.timeoutMs,
  });
  if (
    result.terminalStatus !== "completed" ||
    !result.evidence?.runtimeId ||
    !result.workerReport ||
    !result.workerReportDigest
  )
    throw new Error(`isolated execution incomplete: ${result.terminalStatus}`);
  return receipt("isolated-result", {
    manifestDigest: digest(launchManifest),
    sourceManifest: sources,
    dependencyDigests: launchManifest.dependencyDigests,
    launchId: result.launchId,
    runtimeId: result.evidence.runtimeId,
    reportDigest: result.workerReportDigest,
    outcome: "pass",
    telemetry: telemetry(result.usage ?? {}, {
      sourceBytes: sources.bytes,
      sourceCount: sources.contributors.length,
    }),
  });
}

try {
  let result;
  switch (name) {
    case "route":
      result = route(await load(positional[0]));
      break;
    case "requirements":
      result = requirements(
        await load(positional[0]),
        await load(positional[1]),
      );
      break;
    case "baseline":
      result = await baseline({
        repoRoot,
        routeReceipt: await load(positional[0]),
        requirementsReceipt: positional[1] ? await load(positional[1]) : null,
        defaultBranch: option("--default") ?? "main",
        pullRequestUrl: option("--pull-request"),
      });
      break;
    case "contract":
      result = await contract(absolute(positional[0]));
      break;
    case "tdd": {
      const input = await load(positional[0]);
      result = await tdd({
        ...input,
        contractReceipt: await load(input.contract),
        baselineReceipt: await load(input.baseline),
        cwd: repoRoot,
      });
      break;
    }
    case "validate": {
      const input = await load(positional[0]);
      result = await validation({
        ...input,
        repoRoot,
        routeReceipt: input.route ? await load(input.route) : null,
        contractReceipt: await load(input.contract),
        priorReceipt: input.prior ? await load(input.prior) : null,
      });
      break;
    }
    case "review": {
      const input = await load(positional[0]);
      result = review({
        ...input,
        contractReceipt: await load(input.contract),
      });
      break;
    }
    case "failure-proof": {
      const input = await load(positional[0]);
      result = await failureProof({
        ...input,
        contractReceipt: await load(input.contract),
        cwd: repoRoot,
      });
      break;
    }
    case "run-isolated":
      result = await isolated(await load(positional[0]));
      break;
    case "conformance":
      result = await conformance({
        repoRoot,
        routeReceipt: await load(positional[0]),
        baselineReceipt: await load(positional[1]),
        discovered: await load(positional[2]),
      });
      break;
    case "delivery": {
      const input = await load(positional[0]);
      result = await delivery({
        repoRoot,
        ...Object.fromEntries(
          await Promise.all(
            Object.entries(input.receipts).map(async ([key, value]) => [
              key,
              Array.isArray(value)
                ? await Promise.all(value.map(load))
                : value
                  ? await load(value)
                  : null,
            ]),
          ),
        ),
        pullRequestUrl: input.pullRequestUrl,
      });
      break;
    }
    case "telemetry-summary": {
      const input = await load(positional[0]);
      result = telemetry(input.runtime, input.observations);
      break;
    }
    case "help":
    case "--help":
    case undefined:
      usage();
      process.exit(0);
      break;
    default:
      throw new Error(`unknown command: ${name}`);
  }
  await emit(result);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
