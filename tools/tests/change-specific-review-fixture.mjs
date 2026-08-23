import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const change = "require-change-specific-failure-invariants";
const knownBadRevision = "fd4f1cfb6f214ee7068160f97e32ac34c4c9404c";
const reviewedHead = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
const { stdout } = await exec(
  process.execPath,
  ["tools/tests/pr32-failure-path-fixture.mjs"],
  {
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  },
);
const baseline = JSON.parse(stdout);
const parent = path.join(homedir(), ".cache");
await mkdir(parent, { recursive: true });
const badRoot = await mkdtemp(path.join(parent, "shlz-change-invariants-bad-"));
const probe = path.resolve(
  "tools/tests/change-specific-review-behavior-probe.mjs",
);
const addedWorktrees = new Set();
const runProbe = async (targetRoot) =>
  JSON.parse(
    (
      await exec(process.execPath, [probe, targetRoot], {
        maxBuffer: 10 * 1024 * 1024,
      })
    ).stdout,
  );
const addHistoricalWorktree = async (targetRoot, revision) => {
  try {
    await exec("git", ["worktree", "add", "--detach", targetRoot, revision], {
      maxBuffer: 10 * 1024 * 1024,
    });
    addedWorktrees.add(targetRoot);
  } catch (error) {
    throw new Error(
      `historical revision ${revision} is unavailable; fetch full history before running this proof`,
      { cause: error },
    );
  }
};
let knownBad;
let reviewed;
let runError;
const cleanupErrors = [];
try {
  await addHistoricalWorktree(badRoot, knownBadRevision);
  [knownBad, reviewed] = await Promise.all([runProbe(badRoot), runProbe(".")]);
} catch (error) {
  runError = error;
} finally {
  if (addedWorktrees.has(badRoot)) {
    const status = await exec("git", ["-C", badRoot, "status", "--porcelain"])
      .then(({ stdout: value }) => value)
      .catch(() => null);
    if (status === null || status.trim())
      cleanupErrors.push(
        new Error("change-specific fixture could not clean its worktree"),
      );
    else
      await exec("git", ["worktree", "remove", badRoot]).catch((error) =>
        cleanupErrors.push(error),
      );
  } else await rm(badRoot, { recursive: true, force: true });
  await exec("git", ["worktree", "prune"]).catch((error) =>
    cleanupErrors.push(error),
  );
}
if (runError && cleanupErrors.length)
  throw new AggregateError(
    [runError, ...cleanupErrors],
    "fixture and cleanup failed",
  );
if (runError) throw runError;
if (cleanupErrors.length)
  throw new AggregateError(cleanupErrors, "fixture cleanup failed");
const concerns = {
  "marked-contracts-require-manifest": "state-machine",
  "manifest-sources-are-grounded": "persistence",
  "marked-contract-coverage-is-complete": "persistence",
  "change-specific-results-discriminate": "state-machine",
  "contract-edits-stale-proof": "persistence",
  "stale-plan-or-pending-packet-blocks-delivery": "state-machine",
};
const checks = Object.entries(concerns).map(([id, concern]) => ({
  id,
  concern,
  pass: reviewed[id],
  knownBadPass: knownBad[id],
}));
baseline.invariants.push(
  ...checks.map(({ id, concern, pass, knownBadPass }) => ({
    id: `${change}/${id}`,
    concern,
    knownBad: knownBadPass ? "pass" : "fail",
    reviewedHead: pass ? "pass" : "fail",
  })),
);
baseline.reviewedHead = reviewedHead;
process.stdout.write(`${JSON.stringify(baseline)}\n`);
