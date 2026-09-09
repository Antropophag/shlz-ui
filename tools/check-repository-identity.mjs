import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..");
const [target = repoRoot, invariant, member] = process.argv.slice(2);
if (invariant && invariant !== "repository-identity-integrity")
  throw new Error(`unknown identity invariant or evidence set: ${invariant}`);
if (member && !["legacy", "v2"].includes(member))
  throw new Error(`unknown identity version: ${member}`);
let temporary;
try {
  let core;
  if ((await stat(target)).isDirectory()) {
    core = path.join(target, "tools/lib/harness/core.mjs");
  } else {
    const baseline = JSON.parse(await readFile(target, "utf8"));
    assert.match(baseline.commit, /^[0-9a-f]{40}$/);
    assert.equal(baseline.path, "tools/lib/harness/core.mjs");
    const { stdout } = await exec(
      "git",
      ["show", `${baseline.commit}:${baseline.path}`],
      { cwd: repoRoot },
    );
    temporary = await mkdtemp(path.join(tmpdir(), "shlz-identity-oracle-"));
    core = path.join(temporary, "core.mjs");
    await writeFile(core, stdout);
  }
  const { stdout } = await exec(
    process.execPath,
    [
      "--test",
      ...(invariant && !member
        ? ["--test-name-pattern=altered legacy fields"]
        : []),
      path.join(repoRoot, "tools/tests/harness-repository.test.mjs"),
    ],
    { cwd: repoRoot, env: { ...process.env, SHLZ_IDENTITY_CORE: core } },
  );
  process.stdout.write(stdout);
} catch (error) {
  process.stderr.write(error.stdout ?? `${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
