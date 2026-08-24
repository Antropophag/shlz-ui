import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { registeredWorktreeAtRevision } from "./validated-worktree-root.mjs";

const targetRoot = process.argv[2]
  ? await registeredWorktreeAtRevision(process.argv[2])
  : process.cwd();
const core = await import(
  `${pathToFileURL(path.join(targetRoot, "tools/lib/harness/core.mjs"))}?review=${Date.now()}`
);
const load = async (file) =>
  JSON.parse(await readFile(path.join(targetRoot, file), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const digest = (character) => character.repeat(64);
const candidateHead = "a".repeat(40);

const assessment = clone(
  await load("docs/exec-plans/fixtures/wave-7-assessment.json"),
);
assessment.specDrivenTdd = {
  version: 1,
  slices: [
    {
      id: "review-slice",
      applicability: "enforced",
      scenarioIds: ["implementation-claim-requires-red"],
      authorities: [
        {
          scenarioId: "implementation-claim-requires-red",
          source: "explicit-openspec-literal",
          ref: "openspec/changes/enforce-spec-driven-tdd/specs/harness/spec-driven-tdd/spec.md",
        },
      ],
      seam: "harness/spec-driven-tdd",
      command: ["node", "tools/tests/harness.test.mjs"],
      acceptanceSurface: ["tools/tests/harness.test.mjs"],
      fixtureSurface: ["docs/exec-plans/fixtures/spec-driven-tdd-oracle.json"],
      productionSurface: ["tools/lib/harness/core.mjs"],
      testDesignPacket: "discovery-contracts",
      implementationPacket: "shared-native-dialog",
      controls: {
        environment: { TZ: "UTC" },
        timeoutMs: 5000,
        normalization: ["repo-root"],
      },
      repeatCount: 2,
    },
  ],
};
const config = await load("docs/exec-plans/config.json");
const plan = core.createPlan(assessment, config);
const state = core.createExecutionState(plan);
state.packets["discovery-contracts"] = {
  status: "completed",
  execution: { runtimeId: "designer-runtime" },
};
state.handoffs["discovery-contracts"] = {
  completedPacket: "discovery-contracts",
  changed: [],
  provenChecks: [],
  settledDecisions: [],
  unresolvedFindings: [],
  nextPacket: "shared-native-dialog",
  invalidatedAssumptions: [],
};
const implementationClaimRequiresRed = !core
  .readyPackets(plan, state)
  .some(({ id }) => id === "shared-native-dialog");

const design = {
  version: 1,
  sliceId: "review-slice",
  runtimeId: "designer-runtime",
  requirementsRevision: 1,
  baselineDigest: digest("a"),
  scenarioMappings: [
    {
      scenarioId: "implementation-claim-requires-red",
      authorityRef:
        "openspec/changes/enforce-spec-driven-tdd/specs/harness/spec-driven-tdd/spec.md",
    },
  ],
  acceptanceDigest: digest("b"),
  fixtureDigest: digest("c"),
  controlsDigest: digest("d"),
  contractDigest: digest("e"),
  oracleChallengeDigest: digest("f"),
  inputs: [
    "openspec/changes/enforce-spec-driven-tdd/specs/harness/spec-driven-tdd/spec.md",
  ],
  expectedResultSource: {
    kind: "explicit-openspec-literal",
    ref: "openspec/changes/enforce-spec-driven-tdd/specs/harness/spec-driven-tdd/spec.md",
  },
  oracleMethod: {
    kind: "behavioral-assertion",
    observesSeam: "harness/spec-driven-tdd",
  },
  oracleChallenge: {
    version: 1,
    adapterEnvironment: "SHLZ_TDD_ORACLE_ADAPTER",
    controlAdapter: "tools/tests/fixtures/tdd-oracle-control.mjs",
    decoyAdapter: "tools/tests/fixtures/tdd-oracle-decoy.mjs",
    expectedFailureSignature: "ERR_CONTRACT_INCORRECT",
    scenarioIds: ["implementation-claim-requires-red"],
  },
  oracleChallengeRuns: {
    control: [
      { exitCode: 0, output: "" },
      { exitCode: 0, output: "" },
    ],
    decoy: [
      { exitCode: 1, output: "ERR_CONTRACT_INCORRECT" },
      { exitCode: 1, output: "ERR_CONTRACT_INCORRECT" },
    ],
  },
};
let deliveryRejectsStaleGreen = false;
if (
  core.recordTddDesign &&
  core.recordTddRed &&
  core.authorizeTddImplementation &&
  core.recordTddGreen &&
  core.createTddReviewBinding
) {
  core.recordTddDesign(plan, state, design);
  core.recordTddRed(plan, state, {
    ...design,
    runtimeId: "red-runtime",
    normalizedFailureSignature: "ERR_CONTRACT_MISSING",
    failedScenarioIds: ["implementation-claim-requires-red"],
  });
  core.authorizeTddImplementation(
    plan,
    state,
    "review-slice",
    "implementation-runtime",
  );
  core.recordTddGreen(plan, state, { ...design, candidateHead });
  try {
    core.createTddReviewBinding(plan, state, "b".repeat(40));
  } catch (error) {
    deliveryRejectsStaleGreen = /candidate head is stale/.test(error.message);
  }
}

const gatedAssessment = clone(assessment);
gatedAssessment.requirementsGate = "required";
gatedAssessment.openSpecChange = "enforce-spec-driven-tdd";
const readyRequirements = {
  version: 1,
  revision: 1,
  intent: "enforce spec-driven TDD",
  route: "open-spec",
  decisions: [],
  openSpec: { change: "enforce-spec-driven-tdd", status: "synthesized" },
  authorization: {
    status: "pre-authorized",
    provenance: { kind: "user", ref: "packet" },
  },
};
const gatedPlan = core.createPlan(gatedAssessment, config, readyRequirements);
gatedPlan.version = 1;
gatedPlan.executionIsolation.enforced = false;
const gatedState = core.createExecutionState(gatedPlan);
core.claimPacket(
  gatedPlan,
  gatedState,
  "discovery-contracts",
  "designer",
  readyRequirements,
);
const blockedRequirements = {
  ...readyRequirements,
  revision: 2,
  decisions: [
    {
      id: "changed-contract",
      owner: "user",
      status: "unresolved",
      blocking: true,
      provenance: { kind: "apply", ref: "review-slice" },
    },
  ],
  openSpec: { change: "enforce-spec-driven-tdd", status: "pending" },
  authorization: {
    status: "approval-required",
    provenance: { kind: "scope-expansion", ref: "revision:2" },
  },
};
core.pausePacket(
  gatedPlan,
  gatedState,
  "discovery-contracts",
  blockedRequirements,
  {
    version: 1,
    fromRevision: 1,
    toRevision: 2,
    slices: [{ sliceId: "review-slice", classification: "affected" }],
  },
);
const affectedSliceRequiresFreshRed =
  gatedState.specDrivenTdd?.slices?.["review-slice"]?.status ===
  "pending-test-design";

process.stdout.write(
  `${JSON.stringify({
    "implementation-claim-requires-red": implementationClaimRequiresRed,
    "affected-slice-requires-fresh-red": affectedSliceRequiresFreshRed,
    "delivery-rejects-stale-green": deliveryRejectsStaleGreen,
  })}\n`,
);
