import { execFile } from "node:child_process";
import { readFile, realpath, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
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
const harness = timeoutMatches === 1 ? acceleratedHarness : originalHarness;
if (timeoutMatches === 1) {
  await writeFile(
    acceleratedHarness,
    harnessSource.replace(timeoutNeedle, "timeout: 25"),
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
  const settled = await Promise.all(
    ["F1", "F2"].map((id) =>
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
      ),
    ),
  );
  let observed = JSON.parse(await readFile(absolute("concurrent-state")));
  for (const id of ["F1", "F2"])
    if (
      observed.findings.find((finding) => finding.id === id).status !==
      "resolved"
    )
      await runHarness([
        "review-resolve",
        relative("concurrent-state"),
        "--ids",
        id,
        "--head",
        "head",
      ]);
  observed = JSON.parse(await readFile(absolute("concurrent-state")));
  results["review-state-updates-serialize"] =
    settled.includes(false) &&
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
