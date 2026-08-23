import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
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
  createPlan,
  createReviewState,
  matchesPattern,
  pausePacket,
  readyPackets,
  recordEvent,
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
  assert.equal(state.handoffs["shared-native-dialog"], undefined);
  retryWorkerPacket(state, "shared-native-dialog");
  assert.equal(state.packets["shared-native-dialog"].status, "pending");
  const retryBrief = createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline: executionBaseline,
    claimId: "claim-retry",
  });
  reserve(plan, state, "shared-native-dialog", retryBrief, "worker-retry");
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
        workerReport: "bounded completed work report",
        workerReportDigest: "e".repeat(64),
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
      workerReportDigest: "e".repeat(64),
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
  resumePacket(plan, state, "discovery-contracts", "session-b", updated);
  assert.deepEqual(state.packets["discovery-contracts"], {
    status: "claimed",
    session: "session-b",
    requirementsRevision: 2,
  });
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
    discovery: "fixed-diff-and-known-findings-only",
  });
  resolveReviewFindings(state, ["F1"], "def456");
  assert.deepEqual(reviewContext(state).unresolvedFindings, []);
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
