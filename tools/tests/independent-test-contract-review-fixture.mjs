import { execFile } from "node:child_process";
import { mkdir, mkdtemp } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createHistoricalWorktreeManager } from "./historical-worktree-fixture.mjs";

const exec = promisify(execFile);
const change = "require-independent-test-contract-review";
const knownBadRevision = "eecb39d767d4ec3cacd3b1fbcd7748dc193da64e";
const reviewedHead = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
const reviewBase = process.env.SHLZ_REVIEW_BASE ?? knownBadRevision;
const parent = path.join(homedir(), ".cache");
await mkdir(parent, { recursive: true });
const badRoot = await mkdtemp(
  path.join(parent, "shlz-independent-review-bad-"),
);
const probe = path.resolve(
  "tools/tests/independent-test-contract-review-probe.mjs",
);
const worktrees = createHistoricalWorktreeManager(
  exec,
  "independent review fixture",
);
const runProbe = async (revision) =>
  JSON.parse(
    (
      await exec(process.execPath, [probe, ...(revision ? [revision] : [])], {
        maxBuffer: 10 * 1024 * 1024,
      })
    ).stdout,
  );
let knownBad;
let reviewed;
let runError;
const cleanupErrors = [];
try {
  await worktrees.add(badRoot, knownBadRevision);
  [knownBad, reviewed] = await Promise.all([
    runProbe(knownBadRevision),
    runProbe(),
  ]);
} catch (error) {
  runError = error;
} finally {
  cleanupErrors.push(...(await worktrees.cleanup([badRoot])));
}
if (runError) throw runError;
if (cleanupErrors.length)
  throw new AggregateError(cleanupErrors, "fixture cleanup failed");
const concerns = {
  "unreviewed-contract-cannot-authorize-production": "state-machine",
  "stale-test-contract-approval-is-rejected": "persistence",
};
const baseline = JSON.parse(
  (
    await exec(
      process.execPath,
      ["tools/tests/pr32-failure-path-fixture.mjs"],
      {
        env: { ...process.env, SHLZ_REVIEW_BASE: reviewBase },
        maxBuffer: 10 * 1024 * 1024,
      },
    )
  ).stdout,
);
process.stdout.write(
  `${JSON.stringify({
    version: 1,
    reviewBase,
    knownBadRevision,
    reviewedHead,
    invariants: [
      ...baseline.invariants.filter(({ concern }) =>
        ["state-machine", "persistence"].includes(concern),
      ),
      ...Object.entries(concerns).map(([id, concern]) => ({
        id: `${change}/${id}`,
        concern,
        knownBad: knownBad[id] ? "pass" : "fail",
        reviewedHead: reviewed[id] ? "pass" : "fail",
      })),
    ],
  })}\n`,
);
