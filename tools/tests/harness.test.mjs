import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import {
  affectedValidation,
  assertValidationRun,
  claimPacket,
  completePacket,
  classify,
  contextIndex,
  createExecutionState,
  createWorkerBrief,
  failWorkerReservation,
  createPlan,
  createReviewState,
  matchesPattern,
  pausePacket,
  readyPackets,
  recordEvent,
  recordFailurePathDegradation,
  recordFailurePathProof,
  recordWorkerAttempt,
  reserveWorkerPacket,
  relevantValidationFiles,
  recordReview,
  recordValidation,
  requirementsStatus,
  assertImplementationDelivery,
  assertExecutionBaselineState,
  assertImplementationPreflight,
  assertRouteConformance,
  evaluateExecutionStrategy,
  evaluateRouteEligibility,
  failurePathResultDigest,
  loadChangeFailureInvariants,
  resumePacket,
  retryWorkerPacket,
  reviewContext,
  resolveReviewFindings,
  summarizeEvents,
  gitEvidence,
  fingerprint,
  validateHandoff,
  validateExecutionBaseline,
  validatePlan,
  validateRequirementsState,
} from "../lib/harness/core.mjs";
import {
  launchCodexWorker,
  parseCodexExecJsonl,
  probeCodexExec,
} from "../lib/harness/codex-worker.mjs";

const root = process.cwd();
const load = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const config = await load("docs/exec-plans/config.json");
const wave7 = await load("docs/exec-plans/fixtures/wave-7-assessment.json");
const clone = (value) => JSON.parse(JSON.stringify(value));
const exec = promisify(execFile);
const oid = "a".repeat(40);
const mainlineExecution = (overrides = {}) => ({
  currentBranch: "feat/task",
  defaultBranch: "main",
  baselineKind: "mainline",
  localHead: oid,
  baseCurrent: true,
  startedAtCurrentBase: true,
  preImplementationChanges: [],
  ...overrides,
});

const directAssessment = (overrides = {}) => ({
  version: 1,
  intent: "Fix a local typo",
  route: "direct",
  directEvidence: {
    behaviorPreserving: true,
    local: true,
    reversible: true,
    noExternalEffects: true,
    noContractChange: true,
    ambiguityResolved: true,
  },
  materialSignals: {
    newCapability: false,
    publishingOrRelease: false,
    externalEffects: false,
    publicUrlOrDomain: false,
    deploymentSemantics: false,
    permissionsOrSecurity: false,
    destructiveOrIrreversible: false,
    externalAutomation: false,
    publicContract: false,
    materialAmbiguity: false,
  },
  ...overrides,
});

test("direct eligibility is positive, narrow, and conservative", () => {
  assert.equal(evaluateRouteEligibility(directAssessment()).eligible, true);
  assert.equal(
    evaluateRouteEligibility(
      directAssessment({ intent: "Mechanical implementation-only refactor" }),
    ).eligible,
    true,
  );
  assert.equal(
    evaluateRouteEligibility(
      directAssessment({
        materialSignals: {
          ...directAssessment().materialSignals,
          publicContract: true,
        },
      }),
    ).requiredRoute,
    "open-spec",
  );
  assert.equal(
    evaluateRouteEligibility(
      directAssessment({
        materialSignals: {
          ...directAssessment().materialSignals,
          externalEffects: "unknown",
        },
      }),
    ).eligible,
    false,
  );
  assert.equal(
    evaluateRouteEligibility({
      ...directAssessment(),
      route: "open-spec",
      directEvidence: undefined,
      openSpecChange: "unnecessary-spec",
      requiredDecisions: [],
    }).eligible,
    false,
  );
});

test("fully determined contract work routes to OpenSpec without interview", () => {
  const assessment = directAssessment({
    intent: "Add a fully specified public contract",
    route: "open-spec",
    directEvidence: undefined,
    openSpecChange: "add-capability",
    requiredDecisions: [],
    materialSignals: {
      ...directAssessment().materialSignals,
      publicContract: true,
    },
  });
  const state = requirementsState({
    intent: assessment.intent,
    decisions: [],
  });
  assert.deepEqual(evaluateRouteEligibility(assessment), {
    eligible: true,
    selectedRoute: "open-spec",
    requiredRoute: "open-spec",
    materialSignals: ["publicContract"],
    unresolvedMaterialSignals: [],
  });
  assert.doesNotThrow(() =>
    assertImplementationPreflight(assessment, state, {
      ...mainlineExecution(),
      currentBranch: "feat/public-contract",
    }),
  );
});

test("execution strategy keeps semantics, specification, size, orchestration, and review independent", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/harness-routing-evaluation.json",
  );
  for (const scenario of fixture.scenarios) {
    const assessment =
      scenario.semanticRoute === "direct"
        ? directAssessment({ intent: scenario.intent })
        : {
            ...directAssessment({ intent: scenario.intent }),
            route: "open-spec",
            directEvidence: undefined,
            openSpecChange: scenario.id,
            requiredDecisions: [],
            materialSignals: {
              ...directAssessment().materialSignals,
              [scenario.materialSignal]: true,
            },
          };
    const eligibility = evaluateRouteEligibility(assessment);
    assert.equal(eligibility.eligible, true, scenario.id);
    assert.deepEqual(
      evaluateExecutionStrategy({
        eligibility,
        classification: { size: scenario.size },
        contextGrowthUncertain: scenario.contextGrowthUncertain ?? false,
        reviewRisk: scenario.reviewRisk ?? false,
      }),
      scenario.expectedStrategy,
      scenario.id,
    );
    const discovered = {
      version: 1,
      changedFiles: ["local.js"],
      materialSignals: {
        ...directAssessment().materialSignals,
        publicContract: true,
      },
    };
    if (scenario.expectedEscalation === "reroute-required")
      assert.throws(
        () => assertRouteConformance(assessment, discovered, ["local.js"]),
        /re-route required/,
        scenario.id,
      );
    else
      assert.doesNotThrow(
        () => assertRouteConformance(assessment, discovered, ["local.js"]),
        scenario.id,
      );
  }
  assert.equal(fixture.pr30.observed.parentChangedFiles, 32);
  assert.equal(fixture.pr30.observed.followupChangedFiles, 2);
  assert.deepEqual(fixture.pr30.after.contextFiles, [
    "tools/playwright/notification-snackbar-wave8.spec.js",
    "tools/tests/notification-source.test.mjs",
  ]);
  assert.equal(fixture.pr30.observed.usage.source, "user-report");
});

test("implementation preflight supports a verified immutable existing-PR episode", () => {
  const execution = {
    ...mainlineExecution(),
    baselineKind: "existing-pull-request",
    currentBranch: "feat/wave-8-notification-snackbar",
    upstreamBranch: "feat/wave-8-notification-snackbar",
    upstreamHead: oid,
    pullRequest: {
      url: "https://github.com/Antropophag/shlz-ui/pull/30",
      state: "OPEN",
      baseRefName: "main",
      headRefName: "feat/wave-8-notification-snackbar",
      headRefOid: oid,
    },
    baseCurrent: false,
    startedAtCurrentBase: false,
  };
  const result = assertImplementationPreflight(
    directAssessment(),
    null,
    execution,
  );
  assert.deepEqual(result.baseline, {
    version: 1,
    kind: "existing-pull-request",
    commit: oid,
    branch: "feat/wave-8-notification-snackbar",
    defaultBranch: "main",
    pullRequestUrl: "https://github.com/Antropophag/shlz-ui/pull/30",
  });
  assert.doesNotThrow(() => validateExecutionBaseline(result.baseline));
  assert.doesNotThrow(() =>
    assertExecutionBaselineState(result.baseline, {
      branch: result.baseline.branch,
      isAncestor: true,
    }),
  );
  assert.throws(
    () =>
      assertExecutionBaselineState(result.baseline, {
        branch: "feat/other",
        isAncestor: true,
      }),
    /different task branch/,
  );
  for (const invalid of [
    { preImplementationChanges: ["openspec/changes/example/design.md"] },
    { upstreamHead: "b".repeat(40) },
    { pullRequest: { ...execution.pullRequest, state: "CLOSED" } },
    { pullRequest: { ...execution.pullRequest, baseRefName: "release" } },
    { upstreamBranch: "other" },
  ])
    assert.throws(
      () =>
        assertImplementationPreflight(directAssessment(), null, {
          ...execution,
          ...invalid,
        }),
      /existing pull-request baseline|existing pull request/,
    );
});

test("CLI requires persisted execution baselines for preflight and conformance", async () => {
  await assert.rejects(
    exec(
      "node",
      [
        "tools/harness.mjs",
        "implementation-preflight",
        "docs/exec-plans/active/decouple-harness-routing/route-assessment.json",
      ],
      { cwd: root },
    ),
    /requires --out/,
  );
  await assert.rejects(
    exec(
      "node",
      [
        "tools/harness.mjs",
        "route-conformance",
        "docs/exec-plans/active/decouple-harness-routing/route-assessment.json",
        "docs/exec-plans/active/decouple-harness-routing/discovered-surface.json",
      ],
      { cwd: root },
    ),
    /requires --execution/,
  );
  await assert.rejects(
    exec(
      "node",
      [
        "tools/harness.mjs",
        "delivery-check",
        "docs/exec-plans/active/require-change-specific-failure-invariants/delivery-evidence.json",
      ],
      { cwd: root },
    ),
    /requires --plan <plan> --state <state> or --direct <route-assessment>/,
  );
});

test("exact GitHub Pages intent is non-direct and blocks mutation on owned decisions", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/github-pages-requirements-eval.json",
  );
  assert.equal(
    fixture.intent,
    "Опубликуй showcase этого проекта на GitHub Pages.",
  );
  assert.equal(
    evaluateRouteEligibility(fixture.routeAssessment).eligible,
    false,
  );
  assert.equal(
    evaluateRouteEligibility(fixture.routeAssessment).requiredRoute,
    "open-spec",
  );
  assert.deepEqual(
    fixture.requirementsState.decisions
      .filter(
        ({ owner, status, blocking }) =>
          owner === "user" && status === "unresolved" && blocking,
      )
      .map(({ id }) => id),
    ["release-policy", "public-url"],
  );
  assert.throws(
    () =>
      assertImplementationPreflight(
        { ...fixture.routeAssessment, route: "open-spec" },
        fixture.requirementsState,
        {
          currentBranch: "feat/pages",
          defaultBranch: "main",
          baseCurrent: true,
          startedAtCurrentBase: true,
          preImplementationChanges: [],
        },
      ),
    /requirements are not ready.*release-policy, public-url/,
  );
  const unrelatedReady = requirementsState({
    intent: fixture.intent,
    openSpec: { change: "showcase-publishing", status: "synthesized" },
  });
  assert.throws(
    () =>
      assertImplementationPreflight(
        { ...fixture.routeAssessment, route: "open-spec" },
        unrelatedReady,
        {
          currentBranch: "feat/pages",
          defaultBranch: "main",
          baseCurrent: true,
          startedAtCurrentBase: true,
          preImplementationChanges: [],
        },
      ),
    /required decisions are missing: release-policy, public-url/,
  );
  const wrongOwnership = requirementsState({
    intent: fixture.intent,
    decisions: fixture.requirementsState.decisions.map((decision) => ({
      ...decision,
      owner: "repo",
      status: "resolved",
      blocking: false,
    })),
    openSpec: { change: "showcase-publishing", status: "synthesized" },
  });
  assert.throws(
    () =>
      assertImplementationPreflight(
        { ...fixture.routeAssessment, route: "open-spec" },
        wrongOwnership,
        {
          currentBranch: "feat/pages",
          defaultBranch: "main",
          baseCurrent: true,
          startedAtCurrentBase: true,
          preImplementationChanges: [],
        },
      ),
    /required decision ownership does not match: release-policy, public-url/,
  );
  assert.equal(
    fixture.expectedBeforeDecisionResolution.implementationMutations,
    0,
  );
});

test("direct completion re-routes on material discovered surface but not harmless workflow maintenance", () => {
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/pages.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/pages.yml",
            status: "added",
            patch:
              "+name: Deploy Pages\n+jobs:\n+  deploy:\n+    uses: actions/deploy-pages@v4",
          },
        ],
      ),
    /deterministic risk floor.*publishingOrRelease.*re-route required/,
  );
  assert.doesNotThrow(() =>
    assertRouteConformance(
      directAssessment(),
      {
        version: 1,
        changedFiles: [".github/workflows/ci.yml"],
        materialSignals: directAssessment().materialSignals,
      },
      [
        {
          path: ".github/workflows/ci.yml",
          status: "modified",
          patch: "-name: CI\n+name: CI checks\n+# clarify display label",
        },
      ],
    ),
  );
  for (const permissionPatch of [
    "+permissions: write-all",
    "+    contents: write",
    "+permissions: { pages: write, id-token: write }",
    "+permissions: { pages: write, id-token: write } # deploy",
  ])
    assert.throws(
      () =>
        assertRouteConformance(
          directAssessment(),
          {
            version: 1,
            changedFiles: [".github/workflows/ci.yml"],
            materialSignals: directAssessment().materialSignals,
          },
          [
            {
              path: ".github/workflows/ci.yml",
              status: "modified",
              patch: permissionPatch,
            },
          ],
        ),
      /deterministic risk floor.*permissionsOrSecurity.*re-route required/,
    );
  for (const harmlessText of [
    "+name: Documents pages: write behavior",
    '+run: echo "contents: write"',
  ])
    assert.doesNotThrow(() =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/ci.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/ci.yml",
            status: "modified",
            patch: harmlessText,
          },
        ],
      ),
    );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/ci.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/ci.yml",
            status: "modified",
            patch: "-    contents: write\n+contents: write",
          },
        ],
      ),
    /deterministic risk floor.*permissionsOrSecurity.*re-route required/,
  );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/ci.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/ci.yml",
            status: "modified",
            patch:
              "@@ -4,3 +4,2 @@ jobs:\n-    permissions: write-all\n@@ -12,2 +11,3 @@ other-job:\n+    permissions: write-all",
          },
        ],
      ),
    /deterministic risk floor.*permissionsOrSecurity.*re-route required/,
  );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/ci.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/ci.yml",
            status: "modified",
            patch:
              "@@ -4,3 +4,2 @@ jobs:\n-    contents: write\n@@ -12,2 +11,3 @@ other-job:\n+    contents: write",
          },
        ],
      ),
    /deterministic risk floor.*permissionsOrSecurity.*re-route required/,
  );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/pages.yml"],
          materialSignals: directAssessment().materialSignals,
        },
        [
          {
            path: ".github/workflows/pages.yml",
            status: "modified",
            patch: "-    on: push\n+      on: push",
          },
        ],
      ),
    /deterministic risk floor.*deploymentSemantics.*re-route required/,
  );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [".github/workflows/pages.yml"],
          materialSignals: {
            ...directAssessment().materialSignals,
            publishingOrRelease: true,
            deploymentSemantics: true,
            permissionsOrSecurity: true,
          },
        },
        [".github/workflows/pages.yml"],
      ),
    /direct route no longer conforms.*re-route required/,
  );
  assert.doesNotThrow(() =>
    assertRouteConformance(
      directAssessment(),
      {
        version: 1,
        changedFiles: [".github/workflows/ci.yml"],
        materialSignals: directAssessment().materialSignals,
      },
      [".github/workflows/ci.yml"],
    ),
  );
  assert.throws(
    () =>
      assertRouteConformance(
        directAssessment(),
        {
          version: 1,
          changedFiles: [],
          materialSignals: directAssessment().materialSignals,
        },
        [".github/workflows/pages.yml"],
      ),
    /does not match actual target-relevant diff/,
  );
});

test("implementation preflight and delivery enforce task branch to PR", () => {
  assert.throws(
    () =>
      assertImplementationPreflight(directAssessment(), null, {
        currentBranch: "main",
        defaultBranch: "main",
        baseCurrent: true,
        startedAtCurrentBase: true,
        preImplementationChanges: [],
      }),
    /default branch main.*mutation forbidden/,
  );
  assert.throws(
    () =>
      assertImplementationDelivery({
        defaultBranch: "main",
        pullRequestUrl: null,
        actual: {
          repository: "Antropophag/shlz-ui",
          currentBranch: "feat/guard",
          pushRemote: "origin",
          pushBranch: "main",
        },
      }),
    /direct push to default branch main is forbidden/,
  );
  assert.doesNotThrow(() =>
    assertImplementationDelivery({
      defaultBranch: "main",
      pullRequestUrl: "https://github.com/Antropophag/shlz-ui/pull/29",
      actual: {
        repository: "Antropophag/shlz-ui",
        currentBranch: "feat/guard",
        pushRemote: "origin",
        pushBranch: "feat/guard",
        localHead: "abc",
        upstreamHead: "abc",
        pullRequest: {
          url: "https://github.com/Antropophag/shlz-ui/pull/29",
          headRefName: "feat/guard",
          headRefOid: "abc",
          baseRefName: "main",
          state: "OPEN",
        },
      },
    }),
  );
  assert.throws(
    () =>
      assertImplementationDelivery({
        defaultBranch: "main",
        pullRequestUrl: "https://github.com/other/repo/pull/1",
        actual: {
          repository: "Antropophag/shlz-ui",
          currentBranch: "feat/guard",
          pushRemote: "origin",
          pushBranch: "feat/guard",
          localHead: "abc",
          upstreamHead: "abc",
          pullRequest: {
            url: "https://github.com/other/repo/pull/1",
            headRefName: "feat/guard",
            headRefOid: "abc",
            baseRefName: "main",
            state: "OPEN",
          },
        },
      }),
    /pull request does not belong to Antropophag\/shlz-ui/,
  );
  assert.throws(
    () =>
      assertImplementationDelivery({
        defaultBranch: "main",
        pullRequestUrl: "https://github.com/Antropophag/shlz-ui/pull/29",
        actual: {
          repository: "Antropophag/shlz-ui",
          currentBranch: "feat/guard",
          pushRemote: "origin",
          pushBranch: "feat/guard",
          localHead: "new",
          upstreamHead: "old",
          pullRequest: {
            url: "https://github.com/Antropophag/shlz-ui/pull/29",
            headRefName: "feat/guard",
            headRefOid: "old",
            baseRefName: "main",
            state: "OPEN",
          },
        },
      }),
    /not fully pushed to the pull request/,
  );
});

test("Wave 7 is large before implementation and decomposes along semantic seams", () => {
  const plan = createPlan(wave7, config);
  assert.match(plan.classification.size, /^(L|XL)$/);
  assert.equal(
    plan.classification.kind,
    "routing-heuristic-not-token-forecast",
  );
  assert.equal(plan.regroupCheck.required, true);
  assert.equal(plan.regroupCheck.openSpecTaskCount, 31);
  assert.deepEqual(
    plan.packets.map(({ id }) => id),
    [
      "discovery-contracts",
      "shared-native-dialog",
      "modal",
      "drawer",
      "nested-integration",
      "certification-review",
    ],
  );
  assert.deepEqual(
    plan.packets.find(({ id }) => id === "shared-native-dialog").dependencies,
    ["discovery-contracts"],
  );
  assert.deepEqual(
    plan.packets.find(({ id }) => id === "nested-integration").dependencies,
    ["modal", "drawer"],
  );
});

test("classification bands are configurable and honest", () => {
  const assessment = clone(wave7);
  Object.keys(assessment.signals).forEach((key) => {
    assessment.signals[key] = 0;
  });
  assert.equal(classify(assessment, config).size, "S");
  const tuned = clone(config);
  tuned.sizing.bands.M = 1;
  assessment.signals.sharedSeams = 1;
  assert.equal(classify(assessment, tuned).size, "M");
});

test("Wave 8 guarded packets cannot reuse root labels as physical isolation", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/wave-8-execution-isolation.json",
  );
  assert.equal(fixture.classification, "XL");
  assert.equal(fixture.packets.length, 4);
  assert.deepEqual(
    new Set(fixture.before.logicalSessions),
    new Set(["root-wave8"]),
  );
  assert.equal(fixture.before.approximateTotalUsageTokens, 592000);
  assert.equal(fixture.before.remainingContextPercent, 53);

  const assessment = clone(wave7);
  assessment.workUnits[0].preferredExecutionMode = "continue";
  assessment.executionIsolation = {
    version: 1,
    enforced: true,
    unavailableFallback: "stop",
  };
  const plan = createPlan(assessment, config);
  const state = createExecutionState(plan);
  claimPacket(plan, state, "discovery-contracts", "root-wave8");
  completePacket(plan, state, {
    completedPacket: "discovery-contracts",
    changed: [],
    provenChecks: [],
    settledDecisions: [],
    unresolvedFindings: [],
    nextPacket: "shared-native-dialog",
    invalidatedAssumptions: [],
  });
  assert.throws(
    () => claimPacket(plan, state, "shared-native-dialog", "root-wave8"),
    /requires runtime-issued codex exec JSONL evidence/,
  );
  const evidence = {
    version: 1,
    source: "codex-exec-jsonl",
    runtimeId: "thread-worker-1",
    launchId: "launch-1",
    startedAt: "2026-08-23T00:00:00.000Z",
    evidenceDigest: "a".repeat(64),
  };
  claimPacket(plan, state, "shared-native-dialog", "worker-1", null, evidence);
  assert.equal(
    state.packets["shared-native-dialog"].execution.runtimeId,
    "thread-worker-1",
  );
});

test("S and coherent M plans do not acquire isolation ceremony", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/execution-isolation-sizing.json",
  );
  assert.equal(
    fixture.scenarios.find(({ size }) => size === "S").modes[0],
    "continue",
  );
  assert.equal(
    fixture.scenarios.find(({ id }) => id === "m-coherent-continuation")
      .expectedEnforced,
    false,
  );
  assert.equal(
    fixture.scenarios.find(({ id }) => id === "l-decomposed").expectedEnforced,
    true,
  );
});

test("new L and XL plans cannot disable enforced isolation", () => {
  const assessment = clone(wave7);
  assessment.executionIsolation = {
    version: 1,
    enforced: false,
    unavailableFallback: "continue",
  };
  const plan = createPlan(assessment, config);
  assert.equal(plan.executionIsolation.enforced, true);
  assert.equal(plan.executionIsolation.unavailableFallback, "stop");
  const disabled = clone(plan);
  disabled.executionIsolation.enforced = false;
  assert.throws(
    () => validatePlan(disabled, config),
    /requires an executionIsolation policy/,
  );
  const degraded = clone(plan);
  degraded.executionIsolation.unavailableFallback = "continue";
  assert.throws(
    () => validatePlan(degraded, config),
    /requires an executionIsolation policy/,
  );
});

const guardedWorkerFixture = () => {
  const assessment = clone(wave7);
  assessment.workUnits[0].preferredExecutionMode = "continue";
  assessment.executionIsolation = {
    version: 1,
    enforced: true,
    unavailableFallback: "stop",
  };
  const plan = createPlan(assessment, config);
  const state = createExecutionState(plan);
  claimPacket(plan, state, "discovery-contracts", "root");
  completePacket(plan, state, {
    completedPacket: "discovery-contracts",
    changed: [],
    provenChecks: [],
    settledDecisions: [],
    unresolvedFindings: [],
    nextPacket: "shared-native-dialog",
    invalidatedAssumptions: [],
  });
  return { plan, state };
};

const executionBaseline = {
  version: 1,
  kind: "mainline",
  commit: oid,
  branch: "feat/task",
  defaultBranch: "main",
};

const fakeCodexRun =
  (jsonl, { exitCode = 0, help = true } = {}) =>
  async ({ args }) =>
    args.includes("--help")
      ? {
          code: help ? 0 : 1,
          stdout: help ? "Usage: codex exec --json" : "",
          stderr: "",
        }
      : { code: exitCode, stdout: jsonl, stderr: "", timedOut: false };

const reserve = (plan, state, packetId, brief, session) =>
  reserveWorkerPacket(plan, state, packetId, brief, session);

test("codex exec adapter probes capability and derives identity/status/usage only from JSONL", async () => {
  assert.equal(
    (await probeCodexExec({ run: fakeCodexRun("", { help: false }) }))
      .available,
    false,
  );
  const jsonl = [
    JSON.stringify({ type: "thread.started", thread_id: "runtime-42" }),
    JSON.stringify({
      type: "item.completed",
      item: { type: "agent_message", text: "bounded worker report" },
    }),
    JSON.stringify({
      type: "turn.completed",
      usage: { input_tokens: 12, output_tokens: 3 },
    }),
  ].join("\n");
  assert.deepEqual(parseCodexExecJsonl(jsonl).usage, {
    input_tokens: 12,
    output_tokens: 3,
  });
  const result = await launchCodexWorker({
    brief: { bounded: true },
    cwd: root,
    run: fakeCodexRun(jsonl),
    launchId: "launch-42",
    startedAt: "2026-08-23T00:00:00.000Z",
  });
  assert.equal(result.terminalStatus, "completed");
  assert.equal(result.evidence.runtimeId, "runtime-42");
  assert.equal(result.workerReport, "bounded worker report");
  assert.match(result.workerReportDigest, /^[0-9a-f]{64}$/);
  assert.match(result.evidence.evidenceDigest, /^[0-9a-f]{64}$/);
  const unattested = await launchCodexWorker({
    brief: {},
    cwd: root,
    run: fakeCodexRun(JSON.stringify({ type: "turn.completed" })),
  });
  assert.equal(unattested.terminalStatus, "unattested");
  assert.equal(unattested.evidence, undefined);
  const launchFailure = await launchCodexWorker({
    brief: {},
    cwd: root,
    run: async ({ args }) => {
      if (args.includes("--help"))
        return { code: 0, stdout: "Usage: codex exec --json", stderr: "" };
      throw new Error("spawn failed");
    },
  });
  assert.equal(launchFailure.terminalStatus, "launch-failed");
  assert.equal(launchFailure.evidence, undefined);

  const reconnectThenComplete = parseCodexExecJsonl(
    [
      JSON.stringify({
        type: "thread.started",
        thread_id: "runtime-reconnect",
      }),
      JSON.stringify({ type: "error", message: "reconnecting" }),
      JSON.stringify({
        type: "item.completed",
        item: { item_type: "assistant_message", text: "legacy report" },
      }),
      JSON.stringify({ type: "turn.completed", usage: {} }),
    ].join("\n"),
  );
  assert.equal(reconnectThenComplete.terminalStatus, "completed");
  assert.equal(reconnectThenComplete.workerReport, "legacy report");
  assert.equal(
    parseCodexExecJsonl(
      [
        JSON.stringify({ type: "thread.started", thread_id: "runtime-failed" }),
        JSON.stringify({ type: "turn.completed", usage: {} }),
        JSON.stringify({ type: "turn.failed" }),
      ].join("\n"),
    ).terminalStatus,
    "failed",
  );
});

test("bounded worker briefs are immutable and exclude parent context", () => {
  const { plan, state } = guardedWorkerFixture();
  const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline: executionBaseline,
    claimId: "claim-1",
  });
  assert.equal(Object.isFrozen(brief), true);
  assert.equal(Object.isFrozen(brief.packet.scope), true);
  assert.equal(brief.requirements.revision, null);
  assert.deepEqual(Object.keys(brief.dependencyDigests), [
    "discovery-contracts",
  ]);
  assert.equal("parentConversation" in brief, false);
  assert.equal("events" in brief, false);
  assert.match(brief.briefDigest, /^[0-9a-f]{64}$/);
});

test("public telemetry cannot forge physical boundaries or runtime usage", async () => {
  const directory = await mkdtemp(
    path.join(tmpdir(), "shlz-harness-telemetry-"),
  );
  const file = path.join(directory, "telemetry.jsonl");
  try {
    await assert.rejects(
      recordEvent(file, {
        type: "execution-boundary",
        packet: "notification",
        session: "forged-session",
        agent: "worker",
        phase: "implementation",
        runtimeId: "forged-runtime",
        executionSource: "codex-exec-jsonl",
      }),
      /must be imported from adapter-bound execution state/,
    );
    await assert.rejects(
      recordEvent(file, {
        type: "usage",
        packet: "notification",
        session: "forged-session",
        agent: "worker",
        phase: "implementation",
        tokens: 1,
        usageSource: "caller-asserted",
      }),
      /must be imported from adapter-bound execution state/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("guarded packet resume returns to pending for a new worker context", () => {
  const { plan, state } = guardedWorkerFixture();
  const packetId = "shared-native-dialog";
  state.requirementsRevision = 2;
  state.packets[packetId] = {
    status: "paused",
    session: "old-runtime",
    requirementsRevision: 2,
  };
  resumePacket(
    plan,
    state,
    packetId,
    "caller-session-must-not-be-used",
    requirementsState({ revision: 2 }),
  );
  assert.deepEqual(state.packets[packetId], {
    status: "pending",
    requirementsRevision: 2,
    attempts: 1,
  });
});

test("worker lifecycle fails closed, retries, and never unlocks dependents on partial completion", () => {
  const { plan, state } = guardedWorkerFixture();
  const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline: executionBaseline,
    claimId: "claim-failed",
  });
  reserve(plan, state, "shared-native-dialog", brief, "worker-failed");
  recordWorkerAttempt(
    plan,
    state,
    "shared-native-dialog",
    brief,
    {
      launchId: "launch-failed",
      terminalStatus: "unattested",
      evidenceDigest: "b".repeat(64),
    },
    "worker-failed",
  );
  assert.equal(state.packets["shared-native-dialog"].status, "failed");
  assert.deepEqual(readyPackets(plan, state), []);

  retryWorkerPacket(state, "shared-native-dialog");
  const reportlessBrief = createWorkerBrief(
    plan,
    state,
    "shared-native-dialog",
    { baseline: executionBaseline, claimId: "claim-reportless" },
  );
  reserve(
    plan,
    state,
    "shared-native-dialog",
    reportlessBrief,
    "worker-reportless",
  );
  recordWorkerAttempt(
    plan,
    state,
    "shared-native-dialog",
    reportlessBrief,
    {
      launchId: "launch-reportless",
      terminalStatus: "completed",
      evidence: {
        version: 1,
        source: "codex-exec-jsonl",
        runtimeId: "runtime-reportless",
        launchId: "launch-reportless",
        startedAt: "2026-08-23T00:00:00.000Z",
        evidenceDigest: "f".repeat(64),
      },
    },
    "worker-reportless",
  );
  assert.equal(state.packets["shared-native-dialog"].status, "failed");
  assert.equal(
    state.packets["shared-native-dialog"].failure.terminalStatus,
    "invalid-worker-report",
  );
  assert.equal(state.handoffs["shared-native-dialog"], undefined);
  retryWorkerPacket(state, "shared-native-dialog");
  assert.equal(state.packets["shared-native-dialog"].status, "pending");
  assert.equal(
    state.packets["shared-native-dialog"].attemptHistory.at(-1).failure
      .terminalStatus,
    "invalid-worker-report",
  );
  const retryBrief = createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline: executionBaseline,
    claimId: "claim-retry",
  });
  reserve(plan, state, "shared-native-dialog", retryBrief, "worker-retry");
  assert.equal(state.packets["shared-native-dialog"].attempts, 2);
  assert.equal(
    state.packets["shared-native-dialog"].attemptHistory.at(-1).failure
      .terminalStatus,
    "invalid-worker-report",
  );
  recordWorkerAttempt(
    plan,
    state,
    "shared-native-dialog",
    retryBrief,
    {
      launchId: "launch-retry",
      terminalStatus: "failed",
      evidence: {
        version: 1,
        source: "codex-exec-jsonl",
        runtimeId: "runtime-retry",
        launchId: "launch-retry",
        startedAt: "2026-08-23T00:00:00.000Z",
        evidenceDigest: "c".repeat(64),
      },
    },
    "worker-retry",
  );
  assert.equal(state.packets["shared-native-dialog"].status, "failed");
  assert.deepEqual(readyPackets(plan, state), []);
});

test("worker attempts reject stale briefs and record only declared unavailable fallback", () => {
  {
    const { plan, state } = guardedWorkerFixture();
    const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
      baseline: executionBaseline,
      claimId: "claim-stale",
    });
    reserve(plan, state, "shared-native-dialog", brief, "root");
    plan.packets
      .find(({ id }) => id === "shared-native-dialog")
      .scope.push("new-contract");
    recordWorkerAttempt(
      plan,
      state,
      "shared-native-dialog",
      brief,
      { terminalStatus: "unavailable", launchId: "stale-launch" },
      "root",
    );
    assert.equal(state.packets["shared-native-dialog"].status, "failed");
    assert.equal(
      state.packets["shared-native-dialog"].failure.terminalStatus,
      "stale-brief",
    );
    retryWorkerPacket(state, "shared-native-dialog");
    assert.equal(state.packets["shared-native-dialog"].status, "pending");
  }
  {
    const { plan, state } = guardedWorkerFixture();
    plan.classification.size = "M";
    plan.executionIsolation.unavailableFallback = "continue";
    const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
      baseline: executionBaseline,
      claimId: "claim-degraded",
    });
    reserve(plan, state, "shared-native-dialog", brief, "root");
    recordWorkerAttempt(
      plan,
      state,
      "shared-native-dialog",
      brief,
      {
        terminalStatus: "unavailable",
        capability: { reason: "codex executable is unavailable" },
      },
      "root",
    );
    assert.deepEqual(state.packets["shared-native-dialog"].execution, {
      source: "declared-fallback",
      mode: "continue",
      reason: "codex executable is unavailable",
    });
    const handoff = {
      completedPacket: "shared-native-dialog",
      changed: [],
      provenChecks: ["declared fallback remained explicit"],
      settledDecisions: [],
      unresolvedFindings: [],
      nextPacket: "modal",
      invalidatedAssumptions: [],
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
    };
    completePacket(plan, state, handoff, null, {
      baseline: executionBaseline,
    });
    assert.equal(state.packets["shared-native-dialog"].status, "completed");
  }
});

test("post-launch recording failures leave a retryable durable state", () => {
  const { plan, state } = guardedWorkerFixture();
  const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline: executionBaseline,
    claimId: "claim-recording-failed",
  });
  reserve(
    plan,
    state,
    "shared-native-dialog",
    brief,
    "worker-recording-failed",
  );
  failWorkerReservation(
    state,
    "shared-native-dialog",
    new Error("duplicate runtime evidence"),
    {
      launchId: "launch-recording-failed",
      evidence: {
        runtimeId: "runtime-recording-failed",
        evidenceDigest: "e".repeat(64),
      },
    },
  );
  assert.deepEqual(state.packets["shared-native-dialog"].failure, {
    terminalStatus: "recording-failed",
    launchId: "launch-recording-failed",
    runtimeId: "runtime-recording-failed",
    evidenceDigest: "e".repeat(64),
    reason: "duplicate runtime evidence",
  });
  assert.equal(state.packets["shared-native-dialog"].retryable, true);
  retryWorkerPacket(state, "shared-native-dialog");
  assert.equal(state.packets["shared-native-dialog"].status, "pending");
});

test("persisted execution-isolation handoffs remain canonical and report-bound", async () => {
  const directory = "docs/exec-plans/active/execution-context-isolation";
  const plan = await load(`${directory}/plan.json`);
  const state = await load(`${directory}/state.json`);
  for (const packetId of [
    "worker-adapter",
    "telemetry-operator",
    "dogfood-review-delivery",
  ]) {
    const packet = state.packets[packetId];
    const handoff = state.handoffs[packetId];
    validateHandoff(handoff, plan);
    assert.equal(packet.status, "completed");
    assert.equal(packet.claimId, handoff.claimId);
    assert.equal(packet.briefDigest, handoff.briefDigest);
    assert.equal(
      createHash("sha256").update(packet.launch.workerReport).digest("hex"),
      packet.launch.workerReportDigest,
    );
    assert.equal(packet.launch.workerReportDigest, handoff.workerReportDigest);
  }
});

test("guarded completion binds claim, brief, baseline, dependency handoff, and packet contract", () => {
  const start = () => {
    const { plan, state } = guardedWorkerFixture();
    const brief = createWorkerBrief(plan, state, "shared-native-dialog", {
      baseline: executionBaseline,
      claimId: "claim-ok",
    });
    reserve(plan, state, "shared-native-dialog", brief, "worker-ok");
    const workerReport = "bounded completed work report";
    const workerReportDigest = createHash("sha256")
      .update(workerReport)
      .digest("hex");
    recordWorkerAttempt(
      plan,
      state,
      "shared-native-dialog",
      brief,
      {
        launchId: "launch-ok",
        terminalStatus: "completed",
        evidence: {
          version: 1,
          source: "codex-exec-jsonl",
          runtimeId: "runtime-ok",
          launchId: "launch-ok",
          startedAt: "2026-08-23T00:00:00.000Z",
          evidenceDigest: "d".repeat(64),
        },
        workerReport,
        workerReportDigest,
      },
      "worker-ok",
    );
    const handoff = {
      completedPacket: "shared-native-dialog",
      changed: ["tools/lib/harness/"],
      provenChecks: ["focused"],
      settledDecisions: [],
      unresolvedFindings: [],
      nextPacket: "modal",
      invalidatedAssumptions: [],
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
      workerReportDigest,
    };
    return { plan, state, handoff };
  };
  {
    const { plan, state, handoff } = start();
    assert.throws(
      () =>
        completePacket(plan, state, { ...handoff, claimId: "stale" }, null, {
          baseline: executionBaseline,
        }),
      /active claim/,
    );
  }
  {
    const { plan, state, handoff } = start();
    assert.throws(
      () =>
        completePacket(plan, state, handoff, null, {
          baseline: { ...executionBaseline, commit: "b".repeat(40) },
        }),
      /baseline is stale/,
    );
  }
  {
    const { plan, state, handoff } = start();
    state.handoffs["discovery-contracts"].changed.push("late-change");
    assert.throws(
      () =>
        completePacket(plan, state, handoff, null, {
          baseline: executionBaseline,
        }),
      /dependency handoff is stale/,
    );
  }
  {
    const { plan, state, handoff } = start();
    plan.packets
      .find(({ id }) => id === "shared-native-dialog")
      .scope.push("replanned");
    assert.throws(
      () =>
        completePacket(plan, state, handoff, null, {
          baseline: executionBaseline,
        }),
      /packet contract is stale/,
    );
  }
  {
    const { plan, state, handoff } = start();
    completePacket(plan, state, handoff, null, { baseline: executionBaseline });
    assert.equal(state.packets["shared-native-dialog"].status, "completed");
    assert.deepEqual(
      readyPackets(plan, state)
        .map(({ id }) => id)
        .sort(),
      ["drawer", "modal"],
    );
  }
});

const requirementsState = (overrides = {}) => ({
  version: 1,
  intent: "Add a substantial capability",
  route: "open-spec",
  decisions: [],
  openSpec: { change: "add-capability", status: "synthesized" },
  authorization: {
    status: "pre-authorized",
    provenance: { kind: "user", ref: "request:1" },
  },
  ...overrides,
});

test("requirements state rejects unresolved blockers and normative payloads", () => {
  const blocked = requirementsState({
    revision: 2,
    decisions: [
      {
        id: "public-scope",
        owner: "user",
        status: "unresolved",
        blocking: true,
        provenance: { kind: "inspection", ref: "repo:none" },
      },
    ],
  });
  assert.deepEqual(requirementsStatus(blocked).unresolvedBlocking, [
    "public-scope",
  ]);
  assert.equal(requirementsStatus(blocked).readyForPlanning, false);
  assert.throws(
    () =>
      validateRequirementsState({
        ...blocked,
        answers: { "public-scope": "ship everything" },
      }),
    /requirements field answers is not allowed/,
  );
});

test("delegation transfers ownership once and retains provenance", () => {
  const delegated = requirementsState({
    decisions: [
      {
        id: "presentation-choice",
        owner: "agent",
        status: "delegated",
        blocking: true,
        provenance: { kind: "user-delegation", ref: "reply:2" },
      },
    ],
  });
  assert.equal(requirementsStatus(delegated).readyForPlanning, true);
  assert.throws(
    () =>
      validateRequirementsState({
        ...delegated,
        decisions: [
          {
            ...delegated.decisions[0],
            owner: "user",
          },
        ],
      }),
    /must be agent-owned/,
  );
});

test("requirements-gated plans require synthesis and execution authorization", () => {
  const assessment = {
    ...clone(wave7),
    requirementsGate: "required",
    openSpecChange: "add-capability",
  };
  assert.throws(
    () => createPlan(assessment, config),
    /requires readiness state/,
  );
  assert.throws(
    () =>
      createPlan(
        assessment,
        config,
        requirementsState({
          authorization: {
            status: "approval-required",
            provenance: { kind: "default", ref: "policy" },
          },
        }),
      ),
    /not ready: approval-required/,
  );
  assert.throws(
    () =>
      createPlan(
        { ...assessment, openSpecChange: "different-change" },
        config,
        requirementsState(),
      ),
    /links add-capability, expected different-change/,
  );
  assert.doesNotThrow(() =>
    createPlan(assessment, config, requirementsState()),
  );
  assert.doesNotThrow(() => createPlan(wave7, config));
});

test("apply-time ambiguity durably pauses and gates packet resume", () => {
  const assessment = {
    ...clone(wave7),
    requirementsGate: "required",
    openSpecChange: "add-capability",
    executionIsolation: {
      version: 1,
      enforced: false,
      unavailableFallback: "stop",
    },
  };
  const ready = requirementsState();
  const plan = createPlan(assessment, config, ready);
  plan.version = 1;
  plan.executionIsolation.enforced = false;
  const state = createExecutionState(plan);
  claimPacket(plan, state, "discovery-contracts", "session-a", ready);
  const blocked = requirementsState({
    revision: 2,
    decisions: [
      {
        id: "new-public-choice",
        owner: "user",
        status: "unresolved",
        blocking: true,
        provenance: { kind: "apply", ref: "packet:discovery-contracts" },
      },
    ],
    openSpec: { change: "add-capability", status: "pending" },
    authorization: {
      status: "approval-required",
      provenance: {
        kind: "scope-expansion",
        ref: "packet:discovery-contracts",
      },
    },
  });
  pausePacket(plan, state, "discovery-contracts", blocked);
  assert.equal(state.packets["discovery-contracts"].status, "paused");
  assert.throws(
    () =>
      resumePacket(plan, state, "discovery-contracts", "session-b", blocked),
    /requirements are not ready/,
  );
  assert.throws(
    () =>
      completePacket(
        plan,
        state,
        {
          completedPacket: "discovery-contracts",
          changed: [],
          provenChecks: [],
          settledDecisions: [],
          unresolvedFindings: [],
          nextPacket: "shared-native-dialog",
          invalidatedAssumptions: [],
        },
        blocked,
      ),
    /requirements are not ready/,
  );
  assert.throws(
    () => resumePacket(plan, state, "discovery-contracts", "session-b", ready),
    /revision 1 is stale; expected at least 2/,
  );
  const updated = requirementsState({ revision: 2 });
  assert.throws(
    () =>
      resumePacket(plan, state, "discovery-contracts", "session-b", updated),
    /execution plan revision 1 is stale; expected 2/,
  );
  plan.requirementsRevision = 2;
  resumePacket(plan, state, "discovery-contracts", "session-b", updated);
  assert.deepEqual(state.packets["discovery-contracts"], {
    status: "claimed",
    session: "session-b",
    requirementsRevision: 2,
  });
});

test("delivery rejects an incomplete mandatory packet graph", () => {
  const ready = requirementsState();
  const plan = createPlan(
    {
      ...clone(wave7),
      requirementsGate: "required",
      openSpecChange: "add-capability",
    },
    config,
    ready,
  );
  const state = createExecutionState(plan);
  const delivery = {
    defaultBranch: "main",
    pullRequestUrl: "https://github.com/Antropophag/shlz-ui/pull/29",
    actual: {
      repository: "Antropophag/shlz-ui",
      currentBranch: "feat/guard",
      pushRemote: "origin",
      pushBranch: "feat/guard",
      localHead: "abc",
      upstreamHead: "abc",
      pullRequest: {
        url: "https://github.com/Antropophag/shlz-ui/pull/29",
        headRefName: "feat/guard",
        headRefOid: "abc",
        baseRefName: "main",
        state: "OPEN",
      },
    },
  };
  assert.throws(
    () =>
      assertImplementationDelivery(delivery, {
        plan,
        state,
        requirementsState: ready,
      }),
    /delivery requires completed mandatory packets: discovery-contracts, shared-native-dialog, modal, drawer, nested-integration/,
  );
});

test("agent routing preserves eligibility, readiness, conformance, and apply re-entry", async () => {
  const [agents, routing, protocol, execution, propose, apply, update] =
    await Promise.all(
      [
        "AGENTS.md",
        "docs/openspec.md",
        "docs/requirements-elicitation.md",
        "docs/agent-execution.md",
        ".agents/skills/openspec-propose/SKILL.md",
        ".agents/skills/openspec-apply-change/SKILL.md",
        ".agents/skills/openspec-update-change/SKILL.md",
      ].map((file) => readFile(path.join(root, file), "utf8")),
    );
  assert.match(agents, /requirements-elicitation\.md/);
  assert.match(agents, /generated OpenSpec skills/);
  assert.match(agents, /Explicit pre-authorization/);
  assert.match(agents, /positively proven narrow route/);
  assert.match(
    agents,
    /Never commit or push implementation directly to `main`/,
  );
  assert.match(routing, /harness -- route-check/);
  assert.match(routing, /harness -- implementation-preflight/);
  assert.match(protocol, /no unresolved blocking user-owned decisions/);
  assert.match(protocol, /repo-owned/);
  assert.match(protocol, /agent-owned/);
  assert.match(protocol, /user-owned/);
  assert.match(protocol, /harness -- pause/);
  assert.match(protocol, /delegated/);
  assert.match(execution, /harness -- route-conformance/);
  assert.match(execution, /harness -- delivery-check/);
  for (const generatedSkill of [propose, apply, update])
    assert.doesNotMatch(
      generatedSkill,
      /requirements-elicitation|pre-authorized|harness pause|without asking the same decision again/,
    );
});

test("requirements smoke matrix covers all ten routes deterministically", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/requirements-elicitation-smoke.json",
  );
  assert.equal(fixture.scenarios.length, 10);
  assert.deepEqual(
    fixture.scenarios.map(({ id }) => id),
    [
      "trivial-direct",
      "complete-contract",
      "short-new-capability",
      "repo-owned-answer",
      "user-owned-blocker",
      "delegated-decision",
      "explicit-preauthorization",
      "default-approval-stop",
      "apply-reentry",
      "fresh-session-recovery",
    ],
  );
  for (const scenario of fixture.scenarios.filter(({ state }) => state)) {
    const status = requirementsStatus(scenario.state);
    assert.equal(
      status.readyForSpec,
      scenario.expected.readyForSpec,
      scenario.id,
    );
    assert.equal(
      status.readyForPlanning,
      scenario.expected.readyForPlanning,
      scenario.id,
    );
    assert.equal(
      status.unresolvedBlocking.length > 0,
      scenario.expected.interview,
      scenario.id,
    );
  }
  assert.equal(fixture.scenarios[0].expected.stateRequired, false);

  const reentry = clone(
    fixture.scenarios.find(({ id }) => id === "apply-reentry").state,
  );
  reentry.decisions[0] = {
    ...reentry.decisions[0],
    owner: "agent",
    status: "delegated",
    provenance: { kind: "user-delegation", ref: "reply:decide-yourself" },
  };
  reentry.openSpec.status = "synthesized";
  reentry.authorization = {
    status: "approved",
    provenance: { kind: "user", ref: "approval:updated-spec" },
  };
  assert.equal(requirementsStatus(reentry).readyForPlanning, true);

  const shortIntent = fixture.scenarios.find(
    ({ id }) => id === "short-new-capability",
  );
  assert.ok(shortIntent.resolvedState);
  assert.equal(
    requirementsStatus(shortIntent.resolvedState).readyForPlanning,
    false,
  );
  assert.equal(
    requirementsStatus(shortIntent.resolvedState).readyForSpec,
    true,
  );
  assert.equal(shortIntent.expectedOpenSpec.capability, "publish-capability");
  const synthesized = clone(shortIntent.resolvedState);
  synthesized.openSpec.status = "synthesized";
  assert.equal(requirementsStatus(synthesized).readyForSpec, true);
});

test("GitHub Pages retrospective separates facts, decisions, and spec without implementation", async () => {
  const fixture = await load(
    "docs/exec-plans/fixtures/github-pages-requirements-eval.json",
  );
  assert.equal(fixture.nonExecutable, true);
  assert.equal(fixture.repoOwnedFacts.length, 5);
  assert.equal(fixture.userOwnedQuestions.length, 2);
  assert.ok(fixture.expectedOpenSpec.requirements.length >= 4);
  const evidence = await gitEvidence(root, "origin/main");
  for (const forbidden of fixture.forbiddenImplementationPaths)
    assert.ok(!evidence.changedFiles.includes(forbidden), forbidden);
});

test("fresh-session requirements state is recoverable through the CLI", async () => {
  const file =
    "docs/exec-plans/active/requirements-elicitation-harness/requirements.json";
  const { stdout } = await exec(
    "node",
    ["tools/harness.mjs", "requirements-check", file],
    { cwd: root },
  );
  assert.deepEqual(JSON.parse(stdout), {
    route: "open-spec",
    unresolvedBlocking: [],
    readyForSpec: true,
    readyForPlanning: true,
    authorization: "approved",
  });
});

test("plan contract rejects missing fields, cycles, and undecomposed large work", () => {
  const plan = createPlan(wave7, config);
  const unguarded = clone(plan);
  delete unguarded.executionIsolation;
  assert.throws(
    () => validatePlan(unguarded, config),
    /requires an executionIsolation policy/,
  );
  const unclassified = clone(plan);
  delete unclassified.classification;
  assert.throws(
    () => validatePlan(unclassified, config),
    /requires classification\.size/,
  );
  const missing = clone(plan);
  delete missing.packets[0].nonGoals;
  assert.throws(() => validatePlan(missing, config), /missing nonGoals/);
  const cycle = clone(plan);
  cycle.packets[0].dependencies = ["certification-review"];
  assert.throws(() => validatePlan(cycle, config), /cycle/);
  const monolith = clone(plan);
  monolith.packets = [monolith.packets[0]];
  assert.throws(() => validatePlan(monolith, config), /requires decomposition/);
});

test("context disclosure resolves only the packet working set and compact dependency handoff", async () => {
  const plan = createPlan(wave7, config);
  const handoff = {
    completedPacket: "shared-native-dialog",
    changed: [],
    provenChecks: [],
    settledDecisions: ["one private owner"],
    unresolvedFindings: [],
    nextPacket: "modal",
    invalidatedAssumptions: [],
  };
  const index = await contextIndex(plan, "modal", root, handoff);
  assert.ok(index.sources.includes("packages/behaviors/src/modal.ts"));
  assert.ok(index.sources.includes("packages/styles/components/modal.css"));
  assert.ok(!index.sources.includes("packages/behaviors/src/drawer.ts"));
  assert.equal(index.dependencyHandoffs.length, 1);
  assert.equal(index.disclosure, "paths-and-current-handoff-only");
});

test("fresh sessions derive ready packets and validate structured handoff", () => {
  const plan = createPlan(wave7, config);
  assert.deepEqual(
    readyPackets(plan).map(({ id }) => id),
    ["discovery-contracts"],
  );
  const handoff = validateHandoff(
    {
      completedPacket: "discovery-contracts",
      completedPackets: ["discovery-contracts"],
      changed: ["specs"],
      provenChecks: ["source"],
      settledDecisions: ["authority"],
      unresolvedFindings: [],
      nextPacket: "shared-native-dialog",
      invalidatedAssumptions: [],
    },
    plan,
  );
  assert.deepEqual(
    readyPackets(plan, handoff).map(({ id }) => id),
    ["shared-native-dialog"],
  );
  assert.throws(
    () => validateHandoff({ ...handoff, chatTranscript: "huge" }, plan),
    /not allowed/,
  );
  assert.throws(
    () => validateHandoff({ ...handoff, completedPackets: ["unknown"] }, plan),
    /known packet ids/,
  );
});

test("claims are exclusive and dependency joins receive every direct handoff", async () => {
  const plan = createPlan(wave7, config);
  plan.version = 1;
  plan.executionIsolation.enforced = false;
  const state = createExecutionState(plan);
  claimPacket(plan, state, "discovery-contracts", "session-a");
  assert.throws(
    () => claimPacket(plan, state, "discovery-contracts", "session-b"),
    /not ready or already claimed/,
  );
  const complete = (id, nextPacket) =>
    completePacket(plan, state, {
      completedPacket: id,
      changed: [id],
      provenChecks: ["focused"],
      settledDecisions: [],
      unresolvedFindings: [],
      nextPacket,
      invalidatedAssumptions: [],
    });
  complete("discovery-contracts", "shared-native-dialog");
  claimPacket(plan, state, "shared-native-dialog", "session-b");
  complete("shared-native-dialog", "modal");
  claimPacket(plan, state, "modal", "session-c");
  complete("modal", "nested-integration");
  claimPacket(plan, state, "drawer", "session-d");
  complete("drawer", "nested-integration");
  const index = await contextIndex(plan, "nested-integration", root, state);
  assert.deepEqual(
    index.dependencyHandoffs.map(({ completedPacket }) => completedPacket),
    ["modal", "drawer"],
  );
});

test("packets added after state initialization are pending by default", () => {
  const plan = createPlan(wave7, config);
  const state = createExecutionState(plan);
  delete state.packets["discovery-contracts"];
  assert.deepEqual(
    readyPackets(plan, state).map(({ id }) => id),
    ["discovery-contracts"],
  );
});

test("affected validation routes docs, component, shared seam, and manifest changes", () => {
  assert.deepEqual(
    affectedValidation(["docs/exec-plans/README.md"], config).map(
      ({ id }) => id,
    ),
    ["docs", "harness"],
  );
  assert.deepEqual(
    affectedValidation(["packages/behaviors/src/modal.ts"], config).map(
      ({ id }) => id,
    ),
    ["modal-unit", "modal-browser"],
  );
  assert.deepEqual(
    affectedValidation(
      ["packages/behaviors/src/internal/native-dialog.ts"],
      config,
    ).map(({ id }) => id),
    ["modal-unit", "drawer-browser", "modal-browser", "overlay-integration"],
  );
  assert.deepEqual(
    affectedValidation(["docs/component-audits/modal.json"], config).map(
      ({ id }) => id,
    ),
    ["audit-manifest"],
  );
  assert.ok(
    !affectedValidation(["docs/exec-plans/README.md"], config).some(
      ({ command }) => command.includes("playwright"),
    ),
  );
  assert.deepEqual(
    affectedValidation(["packages/tokens/src/new-contract.ts"], config).map(
      ({ id }) => id,
    ),
    ["full"],
  );
  assert.deepEqual(
    affectedValidation(["apps/showcase/src/consumer-workspace.js"], config).map(
      ({ id }) => id,
    ),
    ["drawer-browser"],
  );
  assert.deepEqual(
    affectedValidation(["tools/playwright/overlay.spec.js"], config).map(
      ({ id }) => id,
    ),
    ["overlay-integration"],
  );
});

test("validation targets derive their own relevant changed-file set", () => {
  assert.deepEqual(
    relevantValidationFiles(
      [
        "docs/agent-execution.md",
        "tools/harness.mjs",
        "packages/behaviors/src/modal.ts",
      ],
      "harness",
      config,
    ),
    ["tools/harness.mjs"],
  );
  assert.throws(
    () =>
      relevantValidationFiles(
        ["docs/agent-execution.md"],
        "full-browser",
        config,
      ),
    /no changed files are relevant/,
  );
  assert.deepEqual(
    relevantValidationFiles(
      [
        "tools/harness.mjs",
        "docs/exec-plans/active/adaptive-codex-harness/validation-ledger.json",
      ],
      "harness",
      config,
    ),
    ["tools/harness.mjs"],
  );
});

test("expensive successful reruns require an invalidation reason", () => {
  const ledger = [
    { target: "full-browser", fingerprint: "same", outcome: "pass" },
  ];
  assert.throws(
    () =>
      assertValidationRun(
        { target: "full-browser", currentFingerprint: "same" },
        ledger,
        config,
      ),
    /reason is required/,
  );
  assert.doesNotThrow(() =>
    assertValidationRun(
      {
        target: "full-browser",
        currentFingerprint: "same",
        reason: "substantive remediation changed runtime inputs",
      },
      ledger,
      config,
    ),
  );
  assert.throws(
    () =>
      assertValidationRun(
        { target: "modal-browser", currentFingerprint: "same" },
        [{ target: "modal-browser", fingerprint: "same", outcome: "pass" }],
        config,
      ),
    /reason is required/,
  );
});

test("validation records compute fingerprints and durably enforce invalidation", async () => {
  const ledger = [];
  const request = {
    target: "full-browser",
    files: ["tools/harness.mjs"],
    outcome: "pass",
    packet: "integration",
    session: "s1",
  };
  await recordValidation(request, ledger, config, root);
  assert.match(ledger[0].fingerprint, /^[0-9a-f]{64}$/);
  await assert.rejects(
    recordValidation(request, ledger, config, root),
    /reason is required/,
  );
  await recordValidation(
    { ...request, reason: "substantive remediation" },
    ledger,
    config,
    root,
  );
  assert.equal(ledger.at(-1).reason, "substantive remediation");
  const deletedLedger = [];
  await recordValidation(
    { ...request, target: "full", files: ["tools/deleted-fixture.mjs"] },
    deletedLedger,
    config,
    root,
  );
  assert.match(deletedLedger[0].fingerprint, /^[0-9a-f]{64}$/);
  assert.notEqual(
    fingerprint(["x"], { x: "<deleted>" }),
    fingerprint(["x"], { x: { state: "deleted" } }),
  );
  await assert.rejects(
    recordValidation(
      { ...request, files: ["../outside"] },
      ledger,
      config,
      root,
    ),
    /escapes repository/,
  );
});

test("review state reuses the remediation diff and unresolved findings", () => {
  const state = createReviewState("origin/main");
  recordReview(state, {
    axis: "Standards",
    head: "abc123",
    findings: [{ id: "F1", severity: "P1", summary: "ledger missing" }],
  });
  assert.deepEqual(reviewContext(state), {
    diff: "abc123..HEAD",
    base: "origin/main",
    unresolvedFindings: [state.findings[0]],
    failurePathProof: {
      required: false,
      concerns: [],
      complete: false,
      degradation: null,
    },
    discovery: "fixed-diff-and-known-findings-only",
  });
  resolveReviewFindings(state, ["F1"], "def456");
  assert.deepEqual(reviewContext(state).unresolvedFindings, []);
});

test("PR 32 failure-path fixture makes material review prove discriminating invariants", async () => {
  const definition = await load(
    "docs/exec-plans/fixtures/pr32-failure-path-proof.json",
  );
  const { stdout } = await exec(
    definition.command[0],
    definition.command.slice(1),
    {
      cwd: root,
      env: {
        ...process.env,
        SHLZ_REVIEW_BASE: "53936615ea50fcd58117b084c5b601556fc01dd2",
      },
    },
  );
  const observed = JSON.parse(stdout);
  const proof = {
    ...observed,
    command: definition.command,
  };
  proof.resultDigest = failurePathResultDigest(proof);
  const concerns = ["state-machine", "persistence", "subprocess"];
  const state = createReviewState(
    "53936615ea50fcd58117b084c5b601556fc01dd2",
    concerns,
  );
  recordReview(state, {
    axis: "Standards",
    head: "stale-head",
    findings: [
      {
        id: "STALE-1",
        severity: "P1",
        summary: "finding from the superseded head",
      },
    ],
  });
  assert.throws(
    () =>
      recordReview(state, {
        axis: "Spec",
        head: "stale-head",
        findings: [],
      }),
    /requires executable failure-path proof/,
  );
  recordFailurePathProof(state, proof);
  assert.deepEqual(state.passes, []);
  assert.equal(state.findings[0].introducedPass, null);
  recordReview(state, {
    axis: "Spec",
    head: proof.reviewedHead,
    findings: [],
  });
  assert.throws(
    () =>
      recordReview(state, { axis: "Standards", head: "stale", findings: [] }),
    /stale for the reviewed head/,
  );
  assert.deepEqual(reviewContext(state).failurePathProof, {
    required: true,
    concerns,
    complete: true,
    degradation: null,
  });

  const mutationCases = [
    [
      (value) => ({ ...value, reviewedHead: value.knownBadRevision }),
      /contract is invalid/,
    ],
    [
      (value) => ({
        ...value,
        invariants: value.invariants.map((item, index) =>
          index === 0 ? { ...item, knownBad: "pass" } : item,
        ),
      }),
      /must discriminate/,
    ],
    [
      (value) => ({
        ...value,
        invariants: value.invariants.filter(
          ({ concern }) => concern !== "subprocess",
        ),
      }),
      /does not cover/,
    ],
  ];
  for (const [mutate, expected] of mutationCases) {
    const mutated = mutate(JSON.parse(JSON.stringify(proof)));
    mutated.resultDigest = failurePathResultDigest(mutated);
    assert.throws(
      () =>
        recordFailurePathProof(
          createReviewState(proof.reviewBase, concerns),
          mutated,
        ),
      expected,
    );
  }
});

test("failure-path capability degradation is durable and blocks proof completion", () => {
  const state = createReviewState("origin/main", ["subprocess"]);
  recordFailurePathDegradation(
    state,
    "independent-method",
    "reviewer cannot inject the stream boundary",
  );
  assert.equal(
    reviewContext(state).failurePathProof.degradation.capability,
    "independent-method",
  );
  assert.equal(reviewContext(state).failurePathProof.complete, false);
});

test("change-specific failure invariants are grounded in marked delta scenarios", async () => {
  const manifest = await load(
    "docs/exec-plans/active/require-change-specific-failure-invariants/failure-invariants.json",
  );
  const binding = await loadChangeFailureInvariants(
    manifest.change,
    manifest,
    root,
  );
  assert.equal(binding.invariants.length, 6);
  assert.match(binding.manifestDigest, /^[0-9a-f]{64}$/);
  assert.match(binding.contractDigest, /^[0-9a-f]{64}$/);
  await assert.rejects(
    loadChangeFailureInvariants(
      manifest.change,
      { ...manifest, change: "another-change" },
      root,
    ),
    /manifest is invalid/,
  );
  await assert.rejects(
    loadChangeFailureInvariants(
      manifest.change,
      { ...manifest, invariants: manifest.invariants.slice(1) },
      root,
    ),
    /do not cover: marked-contracts-require-manifest/,
  );
  await assert.rejects(
    loadChangeFailureInvariants(
      manifest.change,
      {
        ...manifest,
        invariants: [manifest.invariants[0], manifest.invariants[0]],
      },
      root,
    ),
    /entry is invalid/,
  );
  await assert.rejects(
    loadChangeFailureInvariants(
      manifest.change,
      {
        ...manifest,
        invariants: manifest.invariants.map((item, index) =>
          index === 0 ? { ...item, scenario: "Missing scenario" } : item,
        ),
      },
      root,
    ),
    /is ungrounded/,
  );
  await assert.rejects(
    loadChangeFailureInvariants(
      manifest.change,
      {
        ...manifest,
        invariants: manifest.invariants.map((item, index) =>
          index === 0 ? { ...item, concern: "subprocess" } : item,
        ),
      },
      root,
    ),
    /is ungrounded/,
  );
});

test("material review requires baseline and current-change red-green proof", async () => {
  const manifest = await load(
    "docs/exec-plans/active/require-change-specific-failure-invariants/failure-invariants.json",
  );
  const binding = await loadChangeFailureInvariants(
    manifest.change,
    manifest,
    root,
  );
  const concerns = ["state-machine", "persistence"];
  const state = createReviewState("origin/main", concerns, binding);
  const baseline = [
    ["launch-recording-is-recoverable", "state-machine"],
    ["declared-fallback-can-complete", "state-machine"],
    ["retry-state-is-monotonic", "persistence"],
    ["persisted-completions-are-report-bound", "persistence"],
  ];
  const proof = {
    version: 1,
    reviewBase: "origin/main",
    knownBadRevision: "a".repeat(40),
    reviewedHead: "b".repeat(40),
    command: ["node", "fixture.mjs"],
    openSpecChange: binding.change,
    manifestDigest: binding.manifestDigest,
    contractDigest: binding.contractDigest,
    invariants: [
      ...baseline.map(([id, concern]) => ({
        id,
        concern,
        knownBad: "fail",
        reviewedHead: "pass",
      })),
      ...binding.invariants.map(({ id, concern }) => ({
        id: `${binding.change}/${id}`,
        concern,
        knownBad: "fail",
        reviewedHead: "pass",
      })),
    ],
  };
  proof.resultDigest = failurePathResultDigest(proof);
  recordFailurePathProof(state, proof);
  assert.equal(reviewContext(state).failurePathProof.change, binding.change);
  const baselineOnly = { ...proof, invariants: proof.invariants.slice(0, 4) };
  baselineOnly.resultDigest = failurePathResultDigest(baselineOnly);
  assert.throws(
    () =>
      recordFailurePathProof(
        createReviewState("origin/main", concerns, binding),
        baselineOnly,
      ),
    /does not cover/,
  );
  const stale = {
    ...proof,
    contractDigest: "c".repeat(64),
  };
  stale.resultDigest = failurePathResultDigest(stale);
  assert.throws(
    () =>
      recordFailurePathProof(
        createReviewState("origin/main", concerns, binding),
        stale,
      ),
    /contract is invalid/,
  );
});

test("contract identity is unique and contract edits change the binding", async () => {
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "shlz-contract-binding-"),
  );
  const change = "binding-probe";
  const specRoot = path.join(
    temporaryRoot,
    "openspec/changes",
    change,
    "specs/harness/probe",
  );
  const manifest = {
    version: 1,
    change,
    invariants: [
      {
        id: "contract-stays-current",
        concern: "persistence",
        requirement: "Proof binding",
        scenario: "Contract changes",
      },
    ],
  };
  const spec = (detail) => `## Purpose

This temporary capability verifies strict contract identity and digest behavior.

## ADDED Requirements

### Requirement: Proof binding
${detail}

<!-- failure-invariant: contract-stays-current concern=persistence -->

#### Scenario: Contract changes
- **WHEN** the contract changes
- **THEN** the digest changes
`;
  try {
    await mkdir(specRoot, { recursive: true });
    const specPath = path.join(specRoot, "spec.md");
    await writeFile(specPath, spec("First requirement text."));
    const first = await loadChangeFailureInvariants(
      change,
      manifest,
      temporaryRoot,
    );
    await writeFile(specPath, spec("Changed requirement text."));
    const second = await loadChangeFailureInvariants(
      change,
      manifest,
      temporaryRoot,
    );
    assert.notEqual(first.contractDigest, second.contractDigest);
    await writeFile(
      specPath,
      `${spec("Changed requirement text.")}
### Requirement: Proof binding
Changed requirement text.

<!-- failure-invariant: duplicate-contract concern=persistence -->

#### Scenario: Contract changes
- **WHEN** the contract changes
- **THEN** duplicate identities are rejected
`,
    );
    await assert.rejects(
      loadChangeFailureInvariants(
        change,
        {
          ...manifest,
          invariants: [
            ...manifest.invariants,
            {
              ...manifest.invariants[0],
              id: "duplicate-contract",
            },
          ],
        },
        temporaryRoot,
      ),
      /duplicate failure invariant contract identity/,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("PR 33 CodeRabbit fixture executes four dynamic findings and classifies the rest", async () => {
  const inventory = await load(
    "docs/exec-plans/fixtures/pr33-coderabbit-findings.json",
  );
  assert.equal(inventory.findings.length, 8);
  assert.deepEqual(
    inventory.findings.reduce(
      (counts, { classification }) => ({
        ...counts,
        [classification]: (counts[classification] ?? 0) + 1,
      }),
      {},
    ),
    {
      "change-specific-failure-invariant": 4,
      "test-quality-validation": 1,
      "static-validation": 2,
      "ci-environment-validation": 1,
    },
  );
  const definition = await load(
    "docs/exec-plans/fixtures/pr33-change-invariant-proof.json",
  );
  const { stdout } = await exec(
    definition.command[0],
    definition.command.slice(1),
    { cwd: root },
  );
  const observed = JSON.parse(stdout);
  assert.equal(observed.invariants.length, 4);
  assert.ok(
    observed.invariants.every(
      ({ knownBad, reviewedHead }) =>
        knownBad === "fail" && reviewedHead === "pass",
    ),
  );
  assert.equal(
    inventory.findings.find(({ id }) => id === "static-node-global-is-declared")
      .expectedCatcher,
    "lint",
  );
});

test("review-init CLI requires and records current-change invariant bindings", async () => {
  const relativeState = `docs/exec-plans/review-manifest-test-${process.pid}.json`;
  const state = path.join(root, relativeState);
  try {
    await assert.rejects(
      exec(
        process.execPath,
        [
          "tools/harness.mjs",
          "review-init",
          relativeState,
          "origin/main",
          "--failure-path-concerns",
          "state-machine,persistence",
        ],
        { cwd: root },
      ),
      /requires --change.*--invariants/,
    );
    await exec(
      process.execPath,
      [
        "tools/harness.mjs",
        "review-init",
        relativeState,
        "origin/main",
        "--failure-path-concerns",
        "state-machine,persistence",
        "--change",
        "require-change-specific-failure-invariants",
        "--invariants",
        "docs/exec-plans/active/require-change-specific-failure-invariants/failure-invariants.json",
      ],
      { cwd: root },
    );
    const recorded = JSON.parse(await readFile(state, "utf8"));
    assert.equal(
      recorded.changeFailureInvariants.change,
      "require-change-specific-failure-invariants",
    );
    assert.equal(recorded.changeFailureInvariants.invariants.length, 6);
  } finally {
    await unlink(state).catch(() => {});
  }
});

test("review-proof reloads changed contracts and durably invalidates stale proof", async () => {
  const change = `review-refresh-probe-${process.pid}`;
  const changeRoot = path.join(root, "openspec/changes", change);
  const specRoot = path.join(changeRoot, "specs/harness/probe");
  const relativeState = `docs/exec-plans/${change}-state.json`;
  const relativeManifest = `docs/exec-plans/${change}-manifest.json`;
  const relativeProof = `docs/exec-plans/${change}-proof.json`;
  const statePath = path.join(root, relativeState);
  const manifestPath = path.join(root, relativeManifest);
  const proofPath = path.join(root, relativeProof);
  const specPath = path.join(specRoot, "spec.md");
  const spec = (detail) => `## Purpose

This temporary delta verifies review-time contract freshness behavior.

## ADDED Requirements

### Requirement: Fresh review contracts
${detail}

<!-- failure-invariant: proof-uses-current-contract concern=persistence -->

#### Scenario: Contract changes
- **WHEN** the contract changes
- **THEN** stale proof is removed
`;
  try {
    await mkdir(specRoot, { recursive: true });
    await writeFile(
      path.join(changeRoot, ".openspec.yaml"),
      "schema: spec-driven\n",
    );
    await writeFile(specPath, spec("Initial contract."));
    await writeFile(
      manifestPath,
      `${JSON.stringify({
        version: 1,
        change,
        invariants: [
          {
            id: "proof-uses-current-contract",
            concern: "persistence",
            requirement: "Fresh review contracts",
            scenario: "Contract changes",
          },
        ],
      })}\n`,
    );
    await writeFile(
      proofPath,
      `${JSON.stringify({ command: [process.execPath, "-e", "process.stdout.write('{}')"] })}\n`,
    );
    await exec(
      process.execPath,
      [
        "tools/harness.mjs",
        "review-init",
        relativeState,
        "origin/main",
        "--failure-path-concerns",
        "persistence",
        "--change",
        change,
        "--invariants",
        relativeManifest,
      ],
      { cwd: root },
    );
    const initialized = JSON.parse(await readFile(statePath, "utf8"));
    initialized.failurePathProof = { reviewedHead: "stale" };
    await writeFile(statePath, `${JSON.stringify(initialized)}\n`);
    await writeFile(specPath, spec("Changed contract."));
    await assert.rejects(
      exec(
        process.execPath,
        [
          "tools/harness.mjs",
          "review-proof",
          relativeState,
          "--proof",
          relativeProof,
        ],
        { cwd: root },
      ),
      /contracts changed after review initialization/,
    );
    const invalidated = JSON.parse(await readFile(statePath, "utf8"));
    assert.equal(invalidated.failurePathProof, undefined);
  } finally {
    await Promise.all(
      [statePath, manifestPath, proofPath].map((file) =>
        unlink(file).catch(() => {}),
      ),
    );
    await rm(changeRoot, { recursive: true, force: true });
  }
});

test("failure-path proof stays off the cheap review path", () => {
  assert.deepEqual(reviewContext(createReviewState("origin/main")), {
    diff: "origin/main...HEAD",
    base: "origin/main",
    unresolvedFindings: [],
    failurePathProof: {
      required: false,
      concerns: [],
      complete: false,
      degradation: null,
    },
    discovery: "fixed-diff-and-known-findings-only",
  });
});

test("telemetry reports actual observations and never invents unavailable usage", () => {
  const base = {
    packet: "modal",
    session: "s1",
    agent: "root",
    phase: "implementation",
  };
  const summary = summarizeEvents([
    { ...base, type: "context-read", path: "a", outputBytes: 10 },
    { ...base, type: "context-read", path: "a", outputBytes: 10 },
    { ...base, type: "command", outputBytes: 40 },
    { ...base, type: "validation", level: "focused" },
    {
      ...base,
      type: "validation",
      level: "full",
      invalidationReason: "remediation",
    },
    { ...base, type: "review" },
    { ...base, type: "scope-addition" },
    { ...base, type: "remediation" },
  ]);
  assert.deepEqual(
    {
      commands: summary.commands,
      reads: summary.contextReads,
      repeats: summary.repeatedReads,
      bytes: summary.outputBytes,
      focused: summary.focusedSuites,
      full: summary.fullSuites,
    },
    { commands: 1, reads: 2, repeats: 1, bytes: 60, focused: 1, full: 1 },
  );
  assert.equal(summary.tokenUsage, "unavailable");
  assert.equal(summary.physicalBoundaries, "unavailable");
  assert.equal(summary.contextRelevance, "unavailable");
  assert.deepEqual(summary.logicalSessions, ["s1"]);
  const measured = summarizeEvents([
    {
      ...base,
      type: "usage",
      tokens: 1234,
      contextTokens: 4567,
      usageSource: "app-server:thread/tokenUsage/updated",
    },
  ]);
  assert.equal(measured.tokenUsage.actual, 1234);
  assert.equal(measured.contextUsage.actualPeak, 4567);
  assert.equal(measured.peakActiveContext.actualPeak, 4567);
});

test("telemetry distinguishes logical labels from physical boundaries and keeps relevance observational", () => {
  const base = {
    packet: "telemetry-operator",
    agent: "worker",
    phase: "implementation",
  };
  const summary = summarizeEvents([
    {
      ...base,
      session: "label-a",
      type: "context-read",
      path: "a",
      relevant: true,
    },
    {
      ...base,
      session: "label-b",
      type: "context-read",
      path: "a",
      relevant: true,
    },
    {
      ...base,
      session: "label-b",
      type: "context-read",
      path: "z",
      relevant: false,
    },
    {
      ...base,
      session: "label-b",
      type: "command",
      command: "rg TODO",
      discovery: true,
    },
    {
      ...base,
      session: "label-b",
      type: "command",
      command: "rg TODO",
      discovery: true,
    },
    {
      ...base,
      session: "label-b",
      type: "execution-boundary",
      runtimeId: "runtime-1",
      executionSource: "codex-exec-jsonl",
      handoffBytes: 321,
    },
  ]);
  assert.deepEqual(summary.logicalSessions, ["label-a", "label-b"]);
  assert.deepEqual(summary.physicalBoundaries, {
    count: 1,
    runtimeIds: ["runtime-1"],
    source: "codex-exec-jsonl",
  });
  assert.equal(summary.uniqueReads, 2);
  assert.equal(summary.repeatedReads, 1);
  assert.equal(summary.handoffBytes, 321);
  assert.deepEqual(summary.rediscoveryProxies, {
    repeatedReads: 1,
    repeatedDiscoveryCommands: 1,
  });
  assert.deepEqual(summary.contextRelevance, {
    kind: "observed-read-ratio",
    relevantReads: 2,
    classifiedReads: 3,
    ratio: 2 / 3,
  });
});

test("glob matching supports root docs, recursive paths, and brace sets", () => {
  assert.equal(matchesPattern("docs/openspec.md", "docs/**/*.md"), true);
  assert.equal(
    matchesPattern(
      "packages/behaviors/src/modal.ts",
      "packages/behaviors/src/{modal,drawer}.ts",
    ),
    true,
  );
});

test("dynamic Git evidence includes tracked and untracked working-tree files", async () => {
  await assert.rejects(gitEvidence(root), /requires a base revision/);
  const evidence = await gitEvidence(
    root,
    "410e81747243fb07d773af0bf2f048db2ebb0d1a",
  );
  assert.ok(evidence.changedFiles.includes("tools/tests/harness.test.mjs"));
  assert.equal(evidence.mutatesRepository, false);
  assert.match(evidence.currentHead, /^[0-9a-f]{40}$/);
});

test("CLI rejects repository path escapes", async () => {
  await assert.rejects(
    exec("node", ["tools/harness.mjs", "plan-check", "../outside.json"], {
      cwd: root,
    }),
    /path escapes repository/,
  );
});

test("CLI reports a missing telemetry event flag", async () => {
  await assert.rejects(
    exec("node", ["tools/harness.mjs", "telemetry-record", "missing.jsonl"], {
      cwd: root,
    }),
    /requires --event <json>/,
  );
});

test("CLI exposes the worker capability probe", async () => {
  const { stdout } = await exec("node", ["tools/harness.mjs", "worker-probe"], {
    cwd: root,
  });
  const result = JSON.parse(stdout);
  assert.equal(result.adapter, "codex-exec-jsonl");
  assert.equal(typeof result.available, "boolean");
});

test("CLI state lock rejects a concurrent packet update", async () => {
  const state = "docs/exec-plans/active/adaptive-codex-harness/state.json";
  const lock = path.join(root, `${state}.lock`);
  await writeFile(lock, "held");
  try {
    await assert.rejects(
      exec(
        "node",
        [
          "tools/harness.mjs",
          "claim",
          "docs/exec-plans/active/adaptive-codex-harness/plan.json",
          state,
          "independent-review",
          "--session",
          "racing-session",
        ],
        { cwd: root },
      ),
      /state is already being updated:.*state\.json; lock .*state\.json\.lock \(held\)/,
    );
  } finally {
    await unlink(lock);
  }
});
