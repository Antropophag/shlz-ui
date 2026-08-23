import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

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
const addedWorktrees = new Set();
const runProbe = async (targetRoot) =>
  JSON.parse(
    (
      await exec(process.execPath, [probe], {
        cwd: targetRoot,
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

let runError;
const cleanupErrors = [];
let knownBad;
let reviewed;
try {
  await addHistoricalWorktree(badRoot, knownBadRevision);
  await addHistoricalWorktree(goodRoot, reviewedHead);
  [knownBad, reviewed] = await Promise.all([
    runProbe(badRoot),
    runProbe(goodRoot),
  ]);
} catch (error) {
  runError = error;
} finally {
  for (const worktree of [badRoot, goodRoot]) {
    if (!addedWorktrees.has(worktree)) {
      await rm(worktree, { recursive: true, force: true });
      continue;
    }
    const status = await exec("git", ["-C", worktree, "status", "--porcelain"])
      .then(({ stdout }) => stdout)
      .catch(() => null);
    if (status === null) {
      cleanupErrors.push(`could not verify PR 33 fixture worktree ${worktree}`);
      continue;
    }
    if (status.trim()) {
      cleanupErrors.push(`PR 33 fixture left changes in ${worktree}`);
      continue;
    }
    await exec("git", ["worktree", "remove", worktree]);
  }
  await exec("git", ["worktree", "prune"]);
}
if (runError && cleanupErrors.length)
  throw new AggregateError(
    [runError, ...cleanupErrors.map((message) => new Error(message))],
    "fixture and cleanup failed",
  );
if (runError) throw runError;
if (cleanupErrors.length) throw new Error(cleanupErrors.join("; "));

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
