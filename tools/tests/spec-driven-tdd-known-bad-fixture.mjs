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
const testByCase = {
  "asymmetric-oracle":
    "spec-driven TDD public CLI rejects revision-specific overrides",
  "tautological-oracle":
    "spec-driven TDD public CLI proves symmetric deterministic RED and GREEN",
  "source-inspection-oracle":
    "spec-driven TDD public CLI proves symmetric deterministic RED and GREEN",
  "timing-dependent-probe":
    "spec-driven TDD public CLI proves symmetric deterministic RED and GREEN",
  "post-red-acceptance-edit":
    "spec-driven TDD public CLI proves symmetric deterministic RED and GREEN",
  "implementation-runtime-reuse":
    "spec-driven TDD binds RED and GREEN to immutable evidence",
  "requirements-reentry":
    "requirements re-entry invalidates affected TDD slices and retains only digest-identical completed slices",
  "inapplicable-slice":
    "spec-driven TDD supports explicit inapplicability and legacy plans",
};

if (
  matrix.seam !== "harness/spec-driven-tdd" ||
  matrix.cases.some(({ id }) => !testByCase[id])
)
  throw new Error("known-bad matrix has an unbound case");

const outcomes = {};
for (const testName of new Set(Object.values(testByCase))) {
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
  if (!stdout.includes("# fail 0"))
    throw new Error(
      `known-bad fixture failed: ${testName}\n${stdout}${stderr}`,
    );
  outcomes[testName] = "pass";
}

process.stdout.write(
  `${JSON.stringify(
    {
      version: 1,
      cases: matrix.cases.map(({ id, signature }) => ({
        id,
        signature,
        executableTest: testByCase[id],
        outcome: outcomes[testByCase[id]],
      })),
    },
    null,
    2,
  )}\n`,
);
