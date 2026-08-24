import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const subprocessEnvironment = { ...process.env };
delete subprocessEnvironment.NODE_TEST_CONTEXT;
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
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const { id, executableTest: testName } of matrix.cases) {
  const { stdout, stderr } = await exec(
    process.execPath,
    [
      "--test",
      "--test-reporter=tap",
      `--test-name-pattern=^${escapePattern(testName)}$`,
      "tools/tests/harness.test.mjs",
    ],
    {
      cwd: root,
      env: { ...subprocessEnvironment, SHLZ_TDD_OBSERVATION_CASE: id },
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const escapedName = escapePattern(testName);
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
  const observedKnownBad = stdout.includes(
    `# known-bad-observation ${id}=fail`,
  );
  if (!observedKnownBad)
    throw new Error(
      `known-bad fixture did not observe ${id}\n${stdout}${stderr}`,
    );
  outcomes[testName] = {
    knownBad: observedKnownBad ? "fail" : "pass",
    reviewedHead:
      stdout.includes("# pass 1") && stdout.includes("# fail 0")
        ? "pass"
        : "fail",
  };
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
