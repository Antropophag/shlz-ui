import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  affectedValidation,
  assertValidationRun,
  classify,
  contextIndex,
  createPlan,
  matchesPattern,
  readyPackets,
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
