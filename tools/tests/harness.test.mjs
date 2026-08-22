import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
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
  createPlan,
  createReviewState,
  matchesPattern,
  readyPackets,
  relevantValidationFiles,
  recordReview,
  recordValidation,
  reviewContext,
  resolveReviewFindings,
  summarizeEvents,
  gitEvidence,
  validateHandoff,
  validatePlan,
} from "../lib/harness/core.mjs";

const root = process.cwd();
const load = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const config = await load("docs/exec-plans/config.json");
const wave7 = await load("docs/exec-plans/fixtures/wave-7-assessment.json");
const clone = (value) => JSON.parse(JSON.stringify(value));
const exec = promisify(execFile);

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

test("plan contract rejects missing fields, cycles, and undecomposed large work", () => {
  const plan = createPlan(wave7, config);
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
  assert.doesNotThrow(() =>
    assertValidationRun(
      { target: "modal-browser", currentFingerprint: "same" },
      ledger,
      config,
    ),
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
      /state is already being updated/,
    );
  } finally {
    await unlink(lock);
  }
});
