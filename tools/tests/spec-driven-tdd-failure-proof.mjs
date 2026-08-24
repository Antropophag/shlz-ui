import { execFile } from "node:child_process";
import { mkdir, mkdtemp } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createHistoricalWorktreeManager } from "./historical-worktree-fixture.mjs";

const exec = promisify(execFile);
const changeBaselineRevision = "93ff4081aca8ae628696826ef79cc6ba870b2376";
const knownBadRevision = "fd4f1cfb6f214ee7068160f97e32ac34c4c9404c";
const reviewedHead = (
  await exec("git", ["rev-parse", "HEAD"], { cwd: process.cwd() })
).stdout.trim();
const reviewBase = process.env.SHLZ_REVIEW_BASE ?? changeBaselineRevision;
const parent = path.join(homedir(), ".cache");
await mkdir(parent, { recursive: true });
const badRoot = await mkdtemp(path.join(parent, "shlz-tdd-known-bad-"));
const probe = path.resolve("tools/tests/spec-driven-tdd-review-probe.mjs");
const worktrees = createHistoricalWorktreeManager(
  exec,
  "spec-driven TDD fixture",
);
const runProbe = async (revision) =>
  JSON.parse(
    (
      await exec(process.execPath, [probe, ...(revision ? [revision] : [])], {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
      })
    ).stdout,
  );

let runError;
const cleanupErrors = [];
let knownBad;
let reviewed;
try {
  await worktrees.add(badRoot, changeBaselineRevision);
  [knownBad, reviewed] = await Promise.all([
    runProbe(changeBaselineRevision),
    runProbe(),
  ]);
} catch (error) {
  runError = error;
} finally {
  cleanupErrors.push(...(await worktrees.cleanup([badRoot])));
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
  "implementation-claim-requires-red": "state-machine",
  "affected-slice-requires-fresh-red": "state-machine",
  "delivery-rejects-stale-green": "persistence",
};
const invariants = Object.entries(concerns).map(([id, concern]) => ({
  id: `enforce-spec-driven-tdd/${id}`,
  concern,
  knownBad: knownBad[id] ? "pass" : "fail",
  reviewedHead: reviewed[id] ? "pass" : "fail",
}));
const baselineProof = JSON.parse(
  (
    await exec(
      process.execPath,
      ["tools/tests/pr32-failure-path-fixture.mjs"],
      {
        cwd: process.cwd(),
        env: { ...process.env, SHLZ_REVIEW_BASE: reviewBase },
        maxBuffer: 10 * 1024 * 1024,
      },
    )
  ).stdout,
);
process.stdout.write(
  `${JSON.stringify({ version: 1, reviewBase, knownBadRevision, changeBaselineRevision, reviewedHead, invariants: [...baselineProof.invariants.filter(({ concern }) => ["state-machine", "persistence"].includes(concern)), ...invariants] })}\n`,
);
