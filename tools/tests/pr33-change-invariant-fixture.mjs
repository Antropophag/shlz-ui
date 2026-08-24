import { execFile } from "node:child_process";
import { mkdir, mkdtemp } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createHistoricalWorktreeManager } from "./historical-worktree-fixture.mjs";

const exec = promisify(execFile);
const knownBadRevision = "55c3eb38cd66c0dea1d9fe7f3419e19e8ca56133";
const reviewedHead = "32c2cdfdd213d4b5c0a7d27258ee13c49af02304";
const reviewBase =
  process.env.SHLZ_REVIEW_BASE ?? "6c1b997ac08f8bbfb734d349660e66d56d1976e8";
const parent = path.join(homedir(), ".cache");
await mkdir(parent, { recursive: true });
const badRoot = await mkdtemp(path.join(parent, "shlz-pr33-invariants-"));
const goodRoot = await mkdtemp(path.join(parent, "shlz-pr33-known-good-"));
const probe = path.resolve("tools/tests/pr33-review-behavior-probe.mjs");
const worktrees = createHistoricalWorktreeManager(exec, "PR 33 fixture");
const runProbe = async (targetRoot) =>
  JSON.parse(
    (
      await exec(process.execPath, [probe], {
        cwd: targetRoot,
        maxBuffer: 10 * 1024 * 1024,
      })
    ).stdout,
  );

let runError;
const cleanupErrors = [];
let knownBad;
let reviewed;
try {
  await worktrees.add(badRoot, knownBadRevision);
  await worktrees.add(goodRoot, reviewedHead);
  [knownBad, reviewed] = await Promise.all([
    runProbe(badRoot),
    runProbe(goodRoot),
  ]);
} catch (error) {
  runError = error;
} finally {
  cleanupErrors.push(...(await worktrees.cleanup([badRoot, goodRoot])));
}
if (runError && cleanupErrors.length)
  throw new AggregateError(
    [runError, ...cleanupErrors],
    "fixture and cleanup failed",
  );
if (runError) throw runError;
if (cleanupErrors.length)
  throw new AggregateError(cleanupErrors, "fixture cleanup failed");

const concern = {
  "review-state-updates-serialize": "persistence",
  "failed-proof-invalidates-stale-evidence": "persistence",
  "head-reset-preserves-finding-provenance": "persistence",
  "proof-execution-is-bounded": "subprocess",
};
const invariants = Object.keys(concern).map((id) => ({
  id,
  concern: concern[id],
  knownBad: knownBad[id] ? "pass" : "fail",
  reviewedHead: reviewed[id] ? "pass" : "fail",
}));
process.stdout.write(
  `${JSON.stringify({ version: 1, reviewBase, knownBadRevision, reviewedHead, invariants })}\n`,
);
