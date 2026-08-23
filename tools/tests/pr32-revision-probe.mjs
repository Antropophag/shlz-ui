import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2]);
const core = await import(
  pathToFileURL(path.join(root, "tools/lib/harness/core.mjs"))
);
const worker = await import(
  pathToFileURL(path.join(root, "tools/lib/harness/codex-worker.mjs"))
);
const load = async (file) =>
  JSON.parse(await readFile(path.join(root, file), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const config = await load("docs/exec-plans/config.json");
const wave7 = await load("docs/exec-plans/fixtures/wave-7-assessment.json");
const baseline = {
  version: 1,
  kind: "mainline",
  commit: "a".repeat(40),
  branch: "feat/probe",
  defaultBranch: "main",
};
const fixture = () => {
  const assessment = clone(wave7);
  assessment.workUnits[0].preferredExecutionMode = "continue";
  assessment.executionIsolation = {
    version: 1,
    enforced: true,
    unavailableFallback: "stop",
  };
  const plan = core.createPlan(assessment, config);
  const state = core.createExecutionState(plan);
  core.claimPacket(plan, state, "discovery-contracts", "root");
  core.completePacket(plan, state, {
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
const briefFor = (plan, state, claimId) =>
  core.createWorkerBrief(plan, state, "shared-native-dialog", {
    baseline,
    claimId,
  });
const result = [];
const check = async (id, concern, operation) => {
  try {
    result.push({ id, concern, pass: Boolean(await operation()) });
  } catch {
    result.push({ id, concern, pass: false });
  }
};

await check("launch-recording-is-recoverable", "state-machine", () => {
  if (typeof core.failWorkerReservation !== "function") return false;
  const { plan, state } = fixture();
  const brief = briefFor(plan, state, "recording-failure");
  core.reserveWorkerPacket(
    plan,
    state,
    "shared-native-dialog",
    brief,
    "worker",
  );
  core.failWorkerReservation(
    state,
    "shared-native-dialog",
    new Error("recording rejected"),
    {},
  );
  return (
    state.packets["shared-native-dialog"].status === "failed" &&
    state.packets["shared-native-dialog"].retryable === true
  );
});
await check("declared-fallback-can-complete", "state-machine", () => {
  const { plan, state } = fixture();
  plan.classification.size = "M";
  plan.executionIsolation.unavailableFallback = "continue";
  const brief = briefFor(plan, state, "fallback");
  core.reserveWorkerPacket(plan, state, "shared-native-dialog", brief, "root");
  core.recordWorkerAttempt(
    plan,
    state,
    "shared-native-dialog",
    brief,
    { terminalStatus: "unavailable", capability: { reason: "probe" } },
    "root",
  );
  core.completePacket(
    plan,
    state,
    {
      completedPacket: "shared-native-dialog",
      changed: [],
      provenChecks: [],
      settledDecisions: [],
      unresolvedFindings: [],
      nextPacket: "modal",
      invalidatedAssumptions: [],
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
    },
    null,
    { baseline },
  );
  return state.packets["shared-native-dialog"].status === "completed";
});
await check("retry-state-is-monotonic", "persistence", () => {
  const { plan, state } = fixture();
  const first = briefFor(plan, state, "first");
  core.reserveWorkerPacket(
    plan,
    state,
    "shared-native-dialog",
    first,
    "worker",
  );
  core.recordWorkerAttempt(
    plan,
    state,
    "shared-native-dialog",
    first,
    { terminalStatus: "unattested" },
    "worker",
  );
  core.retryWorkerPacket(state, "shared-native-dialog");
  const second = briefFor(plan, state, "second");
  core.reserveWorkerPacket(
    plan,
    state,
    "shared-native-dialog",
    second,
    "worker",
  );
  return (
    state.packets["shared-native-dialog"].attempts === 1 &&
    state.packets["shared-native-dialog"].attemptHistory.length === 1
  );
});
await check("stdin-failure-settles-once", "subprocess", async () => {
  if (typeof worker.defaultRun !== "function") return false;
  try {
    await worker.defaultRun({
      command: `missing-pr32-probe-${process.pid}`,
      args: [],
      cwd: root,
      input: "probe",
      timeoutMs: 100,
    });
    return false;
  } catch (error) {
    return error.code === "ENOENT";
  }
});
await check(
  "terminal-events-have-defined-precedence",
  "subprocess",
  () =>
    worker.parseCodexExecJsonl(
      [
        JSON.stringify({ type: "thread.started", thread_id: "probe" }),
        JSON.stringify({ type: "error", message: "reconnecting" }),
        JSON.stringify({ type: "turn.completed", usage: {} }),
      ].join("\n"),
    ).terminalStatus === "completed",
);
await check(
  "persisted-completions-are-report-bound",
  "persistence",
  async () => {
    const state = await load(
      "docs/exec-plans/active/execution-context-isolation/state.json",
    );
    return ["worker-adapter", "telemetry-operator"].every((id) => {
      const packet = state.packets[id];
      const handoff = state.handoffs[id];
      return (
        packet?.launch?.workerReport &&
        packet.launch.workerReportDigest ===
          createHash("sha256")
            .update(packet.launch.workerReport)
            .digest("hex") &&
        handoff?.workerReportDigest === packet.launch.workerReportDigest
      );
    });
  },
);
process.stdout.write(`${JSON.stringify(result)}\n`);
