import { execFile } from "node:child_process";
import {
  access,
  readFile,
  realpath,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const targetRoot = await realpath(process.cwd());
const gitRoot = await exec("git", ["rev-parse", "--show-toplevel"], {
  cwd: targetRoot,
}).then(({ stdout }) => realpath(stdout.trim()));
if ((await gitRoot) !== targetRoot)
  throw new Error("PR 33 probe cwd must be a canonical Git worktree root");
const core = await import(
  pathToFileURL(path.join(targetRoot, "tools/lib/harness/core.mjs"))
);
const originalHarness = path.join(targetRoot, "tools/harness.mjs");
const acceleratedHarness = path.join(
  targetRoot,
  "tools",
  `harness-timeout-probe-${process.pid}.mjs`,
);
const harnessSource = await readFile(originalHarness, "utf8");
const timeoutNeedle = "timeout: 10 * 60 * 1000";
const timeoutMatches = harnessSource.split(timeoutNeedle).length - 1;
const lockWrite =
  "  await lock.write(`${process.pid} ${new Date().toISOString()}\\n`);";
const lockNeedle = `${lockWrite}\n  try {`;
const lockMatches = harnessSource.split(lockNeedle).length - 1;
const harness =
  timeoutMatches === 1 && lockMatches === 1
    ? acceleratedHarness
    : originalHarness;
if (harness === acceleratedHarness) {
  await writeFile(
    acceleratedHarness,
    harnessSource
      .replace(timeoutNeedle, "timeout: 25")
      .replace(
        lockNeedle,
        `${lockWrite}\n  await new Promise((resolve) => setTimeout(resolve, 100));\n  try {`,
      ),
  );
}
const relative = (name) =>
  `docs/exec-plans/pr33-probe-${process.pid}-${name}.json`;
const absolute = (name) => path.join(targetRoot, relative(name));
const files = [];
const write = async (name, value) => {
  files.push(absolute(name));
  await writeFile(absolute(name), `${JSON.stringify(value)}\n`);
};
const runHarness = (args, options = {}) =>
  exec(process.execPath, [harness, ...args], {
    cwd: targetRoot,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
const results = {};
const waitForFile = async (file, timeoutMs = 2000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (
      await access(file).then(
        () => true,
        () => false,
      )
    )
      return true;
    await delay(1);
  }
  return false;
};

try {
  const provenance = core.createReviewState("origin/main", ["persistence"]);
  core.recordReview(provenance, {
    axis: "Standards",
    head: "stale",
    findings: [{ id: "F1", severity: "P1", summary: "stale" }],
  });
  const proof = {
    version: 1,
    reviewBase: "origin/main",
    knownBadRevision: "a".repeat(40),
    reviewedHead: "b".repeat(40),
    command: ["node", "probe"],
    invariants: [
      ["retry-state-is-monotonic", "persistence"],
      ["persisted-completions-are-report-bound", "persistence"],
    ].map(([id, concern]) => ({
      id,
      concern,
      knownBad: "fail",
      reviewedHead: "pass",
    })),
  };
  proof.resultDigest = core.failurePathResultDigest(proof);
  core.recordFailurePathProof(provenance, proof);
  results["head-reset-preserves-finding-provenance"] =
    provenance.findings[0].introducedPass === null;

  const degradation = core.createReviewState("origin/main", ["subprocess"]);
  degradation.failurePathProof = { reviewedHead: "stale" };
  await write("degradation-state", degradation);
  await write("failure-command", {
    command: [process.execPath, "-e", "process.exit(2)"],
  });
  await runHarness([
    "review-proof",
    relative("degradation-state"),
    "--proof",
    relative("failure-command"),
  ]).catch(() => {});
  const degraded = JSON.parse(await readFile(absolute("degradation-state")));
  results["failed-proof-invalidates-stale-evidence"] =
    degraded.failurePathProof === undefined &&
    degraded.failurePathDegradation?.capability === "execution";

  const concurrent = core.createReviewState("origin/main");
  core.recordReview(concurrent, {
    axis: "Standards",
    head: "head",
    findings: Array.from({ length: 5000 }, (_, index) => ({
      id: `F${index}`,
      severity: "P2",
      summary: "concurrency probe",
    })),
  });
  await write("concurrent-state", concurrent);
  const resolveFinding = (id) =>
    runHarness([
      "review-resolve",
      relative("concurrent-state"),
      "--ids",
      id,
      "--head",
      "head",
    ]).then(
      () => true,
      () => false,
    );
  const first = resolveFinding("F1");
  const lockObserved = await waitForFile(
    `${absolute("concurrent-state")}.lock`,
  );
  const second = lockObserved ? resolveFinding("F2") : Promise.resolve(false);
  const settled = await Promise.all([first, second]);
  if (lockObserved)
    for (const [index, id] of ["F1", "F2"].entries())
      if (!settled[index]) await resolveFinding(id);
  const observed = JSON.parse(await readFile(absolute("concurrent-state")));
  results["review-state-updates-serialize"] =
    lockObserved &&
    settled.filter(Boolean).length === 1 &&
    ["F1", "F2"].every(
      (id) =>
        observed.findings.find((finding) => finding.id === id).status ===
        "resolved",
    );

  const timeoutState = core.createReviewState("origin/main", ["subprocess"]);
  await write("timeout-state", timeoutState);
  await write("timeout-command", {
    command: [process.execPath, "-e", "setInterval(() => {}, 1000)"],
    timeoutMs: 25,
  });
  const started = Date.now();
  await runHarness(
    [
      "review-proof",
      relative("timeout-state"),
      "--proof",
      relative("timeout-command"),
    ],
    { timeout: 2000, killSignal: "SIGKILL" },
  ).catch(() => {});
  const timed = JSON.parse(await readFile(absolute("timeout-state")));
  results["proof-execution-is-bounded"] =
    Date.now() - started < 2000 &&
    timed.failurePathDegradation?.capability === "execution";
} finally {
  await Promise.all(files.map((file) => unlink(file).catch(() => {})));
  if (harness === acceleratedHarness) await unlink(acceleratedHarness);
}

process.stdout.write(`${JSON.stringify(results)}\n`);
