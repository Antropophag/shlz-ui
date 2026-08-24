import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { registeredWorktreeAtRevision } from "./validated-worktree-root.mjs";

const targetRoot = process.argv[2]
  ? await registeredWorktreeAtRevision(process.argv[2])
  : process.cwd();
const core = await import(
  `${pathToFileURL(path.join(targetRoot, "tools/lib/harness/core.mjs"))}?independent-review=${Date.now()}`
);
const load = async (file) =>
  JSON.parse(await readFile(path.join(targetRoot, file), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const digest = (character) => character.repeat(64);
const stableDigest = (value) => {
  const stable = (item) =>
    Array.isArray(item)
      ? item.map(stable)
      : item && typeof item === "object"
        ? Object.fromEntries(
            Object.entries(item)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([key, nested]) => [key, stable(nested)]),
          )
        : item;
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
};

let unreviewedContractCannotAuthorizeProduction = false;
let staleTestContractApprovalIsRejected = false;
let effectiveReviewContextIsRejected = false;
try {
  const assessment = clone(
    await load("docs/exec-plans/fixtures/wave-7-assessment.json"),
  );
  const implementation = assessment.workUnits.find(
    ({ id }) => id === "shared-native-dialog",
  );
  assessment.workUnits.push({
    ...clone(implementation),
    id: "test-contract-review",
    dependencies: ["discovery-contracts"],
    preferredExecutionMode: "fresh-session",
  });
  implementation.dependencies = ["test-contract-review"];
  assessment.specDrivenTdd = {
    version: 2,
    slices: [
      {
        id: "independent-review",
        applicability: "enforced",
        scenarioIds: ["review-required"],
        authorities: [
          {
            scenarioId: "review-required",
            source: "explicit-openspec-literal",
            ref: "openspec/changes/require-independent-test-contract-review/specs/harness/independent-test-contract-review/spec.md",
          },
        ],
        seam: "harness/spec-driven-tdd",
        command: [process.execPath, "tools/tests/harness.test.mjs"],
        acceptanceSurface: ["tools/tests/harness.test.mjs"],
        fixtureSurface: [
          "docs/exec-plans/fixtures/spec-driven-tdd-oracle.json",
        ],
        productionSurface: ["tools/lib/harness/core.mjs"],
        testDesignPacket: "discovery-contracts",
        testReviewPacket: "test-contract-review",
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
  const plan = core.createPlan(
    assessment,
    await load("docs/exec-plans/config.json"),
  );
  const contaminatedPlan = clone(plan);
  contaminatedPlan.packets
    .find(({ id }) => id === "test-contract-review")
    .contextSources.push("tools/lib/harness/core.mjs");
  try {
    core.validatePlan(contaminatedPlan, {
      sizing: { decompositionRequired: [] },
    });
  } catch (error) {
    effectiveReviewContextIsRejected = /prohibited production context/.test(
      error.message,
    );
  }
  const state = core.createExecutionState(plan);
  state.packets["discovery-contracts"] = {
    status: "completed",
    execution: { runtimeId: "designer" },
  };
  const design = {
    version: 1,
    sliceId: "independent-review",
    runtimeId: "designer",
    requirementsRevision: 1,
    baselineDigest: digest("a"),
    acceptanceDigest: digest("b"),
    fixtureDigest: digest("c"),
    controlsDigest: digest("d"),
    contractDigest: digest("e"),
    oracleChallengeDigest: digest("f"),
    inputs: [],
    scenarioMappings: [
      {
        scenarioId: "review-required",
        authorityRef:
          "openspec/changes/require-independent-test-contract-review/specs/harness/independent-test-contract-review/spec.md",
      },
    ],
    expectedResultSource: {
      kind: "explicit-openspec-literal",
      ref: "spec:review-required",
    },
    oracleMethod: {
      kind: "behavioral-assertion",
      observesSeam: "harness/spec-driven-tdd",
    },
    oracleChallenge: { expectedFailureSignature: "ERR" },
    oracleChallengeRuns: {
      control: [
        { exitCode: 0, output: "" },
        { exitCode: 0, output: "" },
      ],
      decoy: [
        { exitCode: 1, output: "ERR" },
        { exitCode: 1, output: "ERR" },
      ],
    },
  };
  core.recordTddDesign(plan, state, design);
  try {
    core.recordTddRed(plan, state, design);
  } catch (error) {
    unreviewedContractCannotAuthorizeProduction =
      /requires approved test-contract review/.test(error.message) &&
      !core
        .readyPackets(plan, state)
        .some(({ id }) => id === "shared-native-dialog");
  }
  const reviewerHandoff = {
    completedPacket: "test-contract-review",
    changed: [],
    provenChecks: [],
    settledDecisions: [],
    unresolvedFindings: [],
    nextPacket: "shared-native-dialog",
    invalidatedAssumptions: [],
    workerReportDigest: digest("7"),
  };
  state.packets["test-contract-review"] = {
    status: "completed",
    execution: { runtimeId: "reviewer" },
    launch: { workerReportDigest: reviewerHandoff.workerReportDigest },
  };
  state.handoffs["test-contract-review"] = reviewerHandoff;
  core.recordTddReview(plan, state, {
    ...design,
    runtimeId: "reviewer",
    designDigest: state.specDrivenTdd.slices["independent-review"].designDigest,
    workerReportDigest: reviewerHandoff.workerReportDigest,
    reviewPacketHandoffDigest: stableDigest(reviewerHandoff),
    verdict: "approved",
    checklist: Object.fromEntries(
      [
        "scenarioAuthority",
        "behavioralSeam",
        "wrongBehavior",
        "fixtureIndependence",
        "productionContextExcluded",
      ].map((key) => [key, { result: "pass", evidenceRefs: ["probe"] }]),
    ),
    scenarioEvidence: [
      { scenarioId: "review-required", evidenceRefs: ["probe"] },
    ],
  });
  try {
    core.recordTddRed(plan, state, {
      ...design,
      controlsDigest: digest("9"),
      runtimeId: "red-runner",
      normalizedFailureSignature: "ERR",
      failedScenarioIds: ["review-required"],
      reviewDigest:
        state.specDrivenTdd.slices["independent-review"].reviewDigest,
    });
  } catch (error) {
    staleTestContractApprovalIsRejected =
      /does not match the designed acceptance contract/.test(error.message) &&
      state.specDrivenTdd.slices["independent-review"].status ===
        "pending-test-design";
  }
} catch {
  // Historical revisions without version 2 review support are known-bad.
}

process.stdout.write(
  `${JSON.stringify({
    "unreviewed-contract-cannot-authorize-production":
      unreviewedContractCannotAuthorizeProduction,
    "stale-test-contract-approval-is-rejected":
      staleTestContractApprovalIsRejected,
    "effective-review-context-is-rejected": effectiveReviewContextIsRejected,
  })}\n`,
);
