import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "../..");
const baseline = "50bee6f6603e0e4d7b3f511fe610dc1522c233fd";
const testSourceRef = "850586c493ca4993091fc19f5a132826e9783d81";
const sandbox = await mkdtemp(path.join(tmpdir(), "context-cost-red-proof-"));
const archive = path.join(sandbox, "baseline.tar");

try {
  await exec("git", ["archive", `--output=${archive}`, baseline], {
    cwd: repoRoot,
  });
  await exec("tar", ["-xf", archive, "-C", sandbox]);
  const { stdout: testSource } = await exec(
    "git",
    ["show", `${testSourceRef}:tools/tests/harness.test.mjs`],
    { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  await writeFile(
    path.join(sandbox, "tools/tests/harness.test.mjs"),
    testSource,
  );

  let failure;
  try {
    await exec(
      process.execPath,
      [
        "--test",
        "--test-name-pattern=context cost",
        "tools/tests/harness.test.mjs",
      ],
      { cwd: sandbox, maxBuffer: 10 * 1024 * 1024 },
    );
  } catch (error) {
    failure = error;
  }

  assert.ok(failure, "context-cost tests unexpectedly passed on the baseline");
  process.stdout.write(
    `${JSON.stringify(
      {
        baseline,
        testSourceRef,
        result: "red",
        exitCode: failure.code,
        exercisedTestSourceAgainstBaseline: true,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
