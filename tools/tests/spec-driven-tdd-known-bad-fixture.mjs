import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = path.resolve(process.argv[2] ?? process.cwd());
const { NODE_TEST_CONTEXT: _nodeTestContext, ...subprocessEnvironment } =
  process.env;
const matrix = JSON.parse(
  await readFile(
    path.join(
      root,
      "docs/exec-plans/fixtures/spec-driven-tdd-known-bad-matrix.json",
    ),
    "utf8",
  ),
);
const executableTests = matrix.cases.map(
  ({ executableTest }) => executableTest,
);
if (
  matrix.seam !== "harness/spec-driven-tdd" ||
  executableTests.some(
    (testName) => typeof testName !== "string" || !testName,
  ) ||
  new Set(executableTests).size !== matrix.cases.length
)
  throw new Error("known-bad matrix has an unbound case");

const outcomes = {};
for (const testName of executableTests) {
  const { stdout, stderr } = await exec(
    process.execPath,
    [
      "--test",
      `--test-name-pattern=^${testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "tools/tests/harness.test.mjs",
    ],
    {
      cwd: root,
      env: subprocessEnvironment,
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const escapedName = testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const selectedPasses = stdout.match(
    new RegExp(`^ok \\d+ - ${escapedName}$`, "gm"),
  );
  if (
    selectedPasses?.length !== 1 ||
    !stdout.includes("# pass 1") ||
    !stdout.includes("# fail 0")
  )
    throw new Error(
      `known-bad fixture failed: ${testName}\n${stdout}${stderr}`,
    );
  outcomes[testName] = { knownBad: "fail", reviewedHead: "pass" };
}

process.stdout.write(
  `${JSON.stringify(
    {
      version: 1,
      cases: matrix.cases.map(({ id, signature, executableTest }) => ({
        id,
        signature,
        executableTest,
        ...outcomes[executableTest],
      })),
    },
    null,
    2,
  )}\n`,
);
