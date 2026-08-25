import { execFile } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const clone = (value) => JSON.parse(JSON.stringify(value));
const adapter = process.env.SHLZ_TDD_ORACLE_ADAPTER;
const expectedRoutingOutcome = adapter
  ? (await import(pathToFileURL(path.resolve(root, adapter))))
      .contractDerivedRoutingOutcome
  : undefined;

const failureSignature = "ERR_CONTRACT_DERIVED_TDD_BYPASS wave-9-bypass";
const failedScenarioIds = [
  "harness/contract-derived-tdd-routing::Material behavior and state require enforced TDD coverage::Wave 9 behavior and state bypass is rejected",
  "harness/contract-derived-tdd-routing::Material behavior and state require enforced TDD coverage::Material scenarios have enforced coverage",
];
const assessmentBase = {
  id: "wave-9-sidebar-application-shell",
  baseline: "27f7b49aa407afd9c41e0f32f6eedc14320fcb16",
  requirementsGate: "required",
  openSpecChange: "wave-9-sidebar-application-shell",
  signals: {
    independentWorkUnits: 1,
    sharedSeams: 0,
    contracts: 1,
    consumerIntegrations: 0,
    evidenceLevels: 1,
    architectureAmbiguity: 0,
    changedScope: 1,
    reviewRisk: 1,
    contextGrowthRisk: 0,
  },
  openSpecTaskCount: 1,
  workUnits: [
    {
      id: "fixture-work",
      objective: "Exercise contract-derived planning",
      scope: ["fixture"],
      nonGoals: ["production"],
      dependencies: [],
      contracts: ["application-compositions/sidebar-application-shell"],
      contextSources: ["embedded contract"],
      implementationSurface: ["fixture"],
      focusedValidation: ["probe"],
      outputs: ["outcome"],
      handoff: ["result"],
      implementationOutcomes: ["routing"],
      preferredExecutionMode: "continue",
    },
  ],
};
const requirementsBase = {
  version: 1,
  revision: 1,
  intent: "Exercise contract-derived planning",
  route: "open-spec",
  decisions: [],
  openSpec: {
    change: "wave-9-sidebar-application-shell",
    status: "synthesized",
  },
  authorization: {
    status: "pre-authorized",
    provenance: { kind: "user", ref: "regression-fixture" },
  },
};
const scenarioId =
  "harness/contract-derived-tdd-routing::Material behavior is routed through TDD::Covered behavior";
const coveredOverlay = {
  executionIsolation: {
    version: 1,
    enforced: true,
    unavailableFallback: "stop",
  },
  workUnits: [
    {
      id: "test-design",
      objective: "Design the independent acceptance contract",
      scope: ["acceptance contract"],
      nonGoals: ["production implementation"],
      dependencies: [],
      contracts: ["harness/contract-derived-tdd-routing"],
      contextSources: ["embedded contract"],
      implementationSurface: ["acceptance fixture"],
      focusedValidation: ["RED probe"],
      outputs: ["independent oracle"],
      handoff: ["scenario mapping"],
      implementationOutcomes: ["acceptance contract"],
      preferredExecutionMode: "fresh-session",
    },
    {
      id: "implementation",
      objective: "Implement the covered material behavior",
      scope: ["production behavior"],
      nonGoals: ["acceptance design"],
      dependencies: ["test-design"],
      contracts: ["harness/contract-derived-tdd-routing"],
      contextSources: ["approved test-design handoff"],
      implementationSurface: ["production fixture"],
      focusedValidation: ["GREEN probe"],
      outputs: ["covered behavior"],
      handoff: ["validation result"],
      implementationOutcomes: ["material behavior"],
      preferredExecutionMode: "fresh-session",
    },
  ],
  specDrivenTdd: {
    version: 1,
    slices: [
      {
        id: "covered-behavior",
        applicability: "enforced",
        scenarioIds: [scenarioId],
        authorities: [
          {
            scenarioId,
            source: "explicit-openspec-literal",
            ref: "embedded material-covered contract",
          },
        ],
        seam: "harness plan",
        command: [
          process.execPath,
          "tools/tests/contract-derived-tdd-routing-probe.mjs",
        ],
        acceptanceSurface: [
          "tools/tests/contract-derived-tdd-routing-probe.mjs",
        ],
        fixtureSurface: ["docs/exec-plans/probe-cases/**"],
        productionSurface: ["tools/lib/harness/**"],
        testDesignPacket: "test-design",
        implementationPacket: "implementation",
        controls: {
          environment: { TZ: "UTC" },
          timeoutMs: 10000,
          normalization: ["repo-root"],
        },
        repeatCount: 2,
      },
    ],
  },
};
const duplicateCoverageOverlay = clone(coveredOverlay);
duplicateCoverageOverlay.specDrivenTdd.slices.push({
  ...clone(duplicateCoverageOverlay.specDrivenTdd.slices[0]),
  id: "duplicate-covered-behavior",
});
const wave9Scenarios = [
  [
    "Sidebar states are source-traceable and operable",
    "Opened and closed compositions",
    "material-state",
  ],
  [
    "Sidebar states are source-traceable and operable",
    "Active and default items",
    "material-state",
  ],
  [
    "Sidebar states are source-traceable and operable",
    "Keyboard navigation",
    "material-behavior",
  ],
  [
    "Header states preserve native input behavior",
    "Default and hover",
    "material-state",
  ],
  [
    "Header states preserve native input behavior",
    "Typing and filled",
    "material-state",
  ],
  [
    "Responsive behavior is bounded by evidence",
    "Narrow content stress",
    "material-behavior",
  ],
];
const contract = (rows) =>
  `## ADDED Requirements\n\n${rows.map(([requirement, scenario, semantics]) => `### Requirement: ${requirement}\n\n#### Scenario: ${scenario}\n<!-- implementation-semantics: ${semantics} -->\n- **WHEN** the case is planned\n- **THEN** its routing obligation is deterministic\n`).join("\n")}`;
const wave9Plan = JSON.parse(
  await readFile(
    path.join(root, "docs/exec-plans/fixtures/wave-9-plan.json"),
    "utf8",
  ),
);
if (
  wave9Plan.id !== "wave-9-sidebar-application-shell" ||
  wave9Plan.specDrivenTdd !== undefined
)
  throw new Error("Wave 9 regression plan does not preserve the bypass shape");
const wave9Assessment = {
  id: wave9Plan.id,
  baseline: wave9Plan.baseline,
  requirementsGate: wave9Plan.requirementsGate,
  openSpecChange: wave9Plan.openSpecChange,
  signals: wave9Plan.classification.contributions,
  openSpecTaskCount: wave9Plan.regroupCheck.openSpecTaskCount,
  executionIsolation: wave9Plan.executionIsolation,
  workUnits: wave9Plan.packets.map((packet) =>
    Object.fromEntries(
      Object.entries(packet).filter(([key]) => key !== "status"),
    ),
  ),
};
const wave9Contract = await readFile(
  path.join(root, "docs/exec-plans/fixtures/wave-9-contract-derived-tdd.md"),
  "utf8",
);
const cases = [
  {
    id: "wave-9-bypass",
    contract: wave9Contract,
    assessment: wave9Assessment,
    capability: "application-compositions/sidebar-application-shell",
    expected: "reject",
    uncovered: wave9Scenarios.map(
      ([requirement, scenario]) =>
        `application-compositions/sidebar-application-shell::${requirement}::${scenario}`,
    ),
  },
  {
    id: "material-covered",
    contract: contract([
      [
        "Material behavior is routed through TDD",
        "Covered behavior",
        "material-behavior",
      ],
    ]),
    assessment: coveredOverlay,
    expected: "accept",
  },
  {
    id: "material-duplicate-coverage",
    contract: contract([
      [
        "Material behavior is routed through TDD",
        "Covered behavior",
        "material-behavior",
      ],
    ]),
    assessment: duplicateCoverageOverlay,
    expected: "reject",
    diagnostics: [scenarioId],
  },
  {
    id: "unavailable-contract",
    expected: "reject",
    skipContract: true,
    planMustBeAbsent: true,
    diagnostics: ["cannot read OpenSpec delta specs"],
  },
  ...[
    ["source-only", "source-only"],
    ["absence-only", "absence-only"],
    ["documentation-only", "documentation-only"],
  ].map(([id, semantics]) => ({
    id,
    contract: contract([[`${id} evidence`, `${id} scenario`, semantics]]),
    expected: "accept",
  })),
];

const sandbox = await mkdtemp(
  path.join(tmpdir(), "shlz-contract-derived-tdd-routing-"),
);
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
try {
  await mkdir(path.join(sandbox, "tools"), { recursive: true });
  await mkdir(path.join(sandbox, "docs/exec-plans"), { recursive: true });
  await cp(
    path.join(root, "tools/harness.mjs"),
    path.join(sandbox, "tools/harness.mjs"),
  );
  await cp(path.join(root, "tools/lib"), path.join(sandbox, "tools/lib"), {
    recursive: true,
  });
  await cp(
    path.join(root, "docs/exec-plans/config.json"),
    path.join(sandbox, "docs/exec-plans/config.json"),
  );
  const outcomes = [];
  const failures = [];
  for (const testCase of cases) {
    const change = `contract-derived-${testCase.id}`;
    const assessment = Object.assign(
      clone(assessmentBase),
      testCase.assessment ?? {},
      { id: change, openSpecChange: change },
    );
    const requirements = clone(requirementsBase);
    requirements.openSpec.change = change;
    const caseRoot = path.join(
      sandbox,
      "docs/exec-plans/probe-cases",
      testCase.id,
    );
    const specRoot = path.join(
      sandbox,
      "openspec/changes",
      change,
      "specs",
      testCase.capability ?? "harness/contract-derived-tdd-routing",
    );
    await mkdir(caseRoot, { recursive: true });
    if (!testCase.skipContract) await mkdir(specRoot, { recursive: true });
    await writeFile(
      path.join(caseRoot, "assessment.json"),
      `${JSON.stringify(assessment, null, 2)}\n`,
    );
    await writeFile(
      path.join(caseRoot, "requirements.json"),
      `${JSON.stringify(requirements, null, 2)}\n`,
    );
    if (!testCase.skipContract)
      await writeFile(path.join(specRoot, "spec.md"), testCase.contract);
    let result;
    try {
      const done = await exec(
        process.execPath,
        [
          "tools/harness.mjs",
          "plan",
          `docs/exec-plans/probe-cases/${testCase.id}/assessment.json`,
          `docs/exec-plans/probe-cases/${testCase.id}/plan.json`,
          "--requirements",
          `docs/exec-plans/probe-cases/${testCase.id}/requirements.json`,
        ],
        { cwd: sandbox, env, timeout: 10000 },
      );
      result = { status: "accept", output: done.stdout };
    } catch (error) {
      result = {
        status: "reject",
        output: `${error.stdout ?? ""}${error.stderr ?? ""}`.replaceAll(
          sandbox,
          "<sandbox-root>",
        ),
      };
    }
    outcomes.push({ id: testCase.id, expected: testCase.expected, ...result });
    if (testCase.expected === "accept" && result.status !== "accept")
      failures.push(
        `ERR_CONTRACT_DERIVED_TDD_FALSE_POSITIVE ${testCase.id}\n${result.output}`,
      );
    if (testCase.expected === "reject" && result.status !== "reject")
      failures.push(
        `${failureSignature} case=${testCase.id} uncovered=${(testCase.uncovered ?? []).join(",")} failedScenarioIds=${failedScenarioIds.join(",")}`,
      );
    const requiredDiagnostics =
      testCase.diagnostics ?? testCase.uncovered ?? [];
    if (
      testCase.expected === "reject" &&
      result.status === "reject" &&
      !requiredDiagnostics.every((text) => result.output.includes(text))
    )
      failures.push(
        `ERR_CONTRACT_DERIVED_TDD_DIAGNOSTIC ${testCase.id}\n${result.output}`,
      );
    if (testCase.planMustBeAbsent) {
      try {
        await readFile(path.join(caseRoot, "plan.json"));
        failures.push(`ERR_CONTRACT_DERIVED_TDD_PLAN_WRITTEN ${testCase.id}`);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  if (failures.length)
    throw new Error(
      `${failures.join("\n")} controls=${outcomes
        .filter(({ expected }) => expected === "accept")
        .map(({ id, status }) => `${id}:${status}`)
        .join(",")}`,
    );
  if (
    expectedRoutingOutcome &&
    expectedRoutingOutcome() !== "contract-derived-routing-v1"
  ) {
    process.stderr.write("ERR_CONTRACT_DERIVED_TDD_ORACLE_DECOY\n");
    process.exitCode = 1;
  } else if (expectedRoutingOutcome) {
    process.stdout.write("contract-derived-routing-v1\n");
  } else {
    process.stdout.write(
      `${JSON.stringify({ version: 1, outcomes }, null, 2)}\n`,
    );
  }
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
