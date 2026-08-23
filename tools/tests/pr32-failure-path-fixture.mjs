import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const knownBadRevision = "fd4f1cfb6f214ee7068160f97e32ac34c4c9404c";
const reviewBase = process.env.SHLZ_REVIEW_BASE;
const reviewedHead = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
const probe = path.resolve("tools/tests/pr32-revision-probe.mjs");
const worktreeParent = path.join(homedir(), ".cache");
await mkdir(worktreeParent, { recursive: true });
const badRoot = await mkdtemp(path.join(worktreeParent, "shlz-pr32-proof-"));
const runProbe = async (root) =>
  JSON.parse(
    (
      await exec("node", [probe], {
        cwd: root,
        maxBuffer: 10 * 1024 * 1024,
      })
    ).stdout,
  );

let runError;
let cleanupError;
try {
  await exec("git", ["worktree", "add", "--detach", badRoot, knownBadRevision]);
  const [knownBad, reviewed] = await Promise.all([
    runProbe(badRoot),
    runProbe(process.cwd()),
  ]);
  const invariants = reviewed.map(({ id, concern, pass }) => ({
    id,
    concern,
    knownBad: knownBad.find((item) => item.id === id)?.pass ? "pass" : "fail",
    reviewedHead: pass ? "pass" : "fail",
  }));
  process.stdout.write(
    `${JSON.stringify({ version: 1, reviewBase, knownBadRevision, reviewedHead, invariants })}\n`,
  );
} catch (error) {
  runError = error;
} finally {
  const status = await exec("git", ["-C", badRoot, "status", "--porcelain"])
    .then(({ stdout }) => stdout)
    .catch(() => null);
  if (status?.trim())
    cleanupError = new Error(`failure-path fixture left changes in ${badRoot}`);
  if (status !== null && !cleanupError)
    await exec("git", ["worktree", "remove", badRoot]);
  await exec("git", ["worktree", "prune"]);
  if (status === null) await rm(badRoot, { recursive: true, force: true });
}
if (cleanupError) throw cleanupError;
if (runError) throw runError;
