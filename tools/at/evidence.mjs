import assert from "node:assert/strict";
import { speechContracts, stateContracts } from "./contracts.mjs";
import { ownsWindow } from "./foreground.mjs";

export const checkpointIds = Object.fromEntries(
  Object.entries(speechContracts).map(([id, points]) => [
    id,
    Object.keys(points),
  ]),
);
const ordered = (values) => [...values].sort((a, b) => a.localeCompare(b));

function quoted(text, start) {
  const quote = text[start];
  let value = "";
  let index = start + 1;
  while (index < text.length && text[index] !== quote) {
    if (text[index] === "\\") {
      index++;
      const escaped = { n: "\n", r: "\r", t: "\t" }[text[index]];
      value += escaped ?? text[index] ?? "";
    } else {
      value += text[index];
    }
    index++;
  }
  return { value, end: index };
}

export function speechText(lines) {
  const words = [];
  for (const line of lines) {
    let depth = 0;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === "'" || char === '"') {
        const token = quoted(line, index);
        if (depth === 0 && token.value.trim()) words.push(token.value);
        index = token.end;
      } else if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth = Math.max(0, depth - 1);
      }
    }
  }
  return words.join(" ");
}

function assertRead(rule, reads) {
  const matches = reads.filter(
    (read) =>
      read.selector === rule.selector &&
      (rule.actionIndex === undefined || read.actionIndex === rule.actionIndex),
  );
  assert.ok(matches.length, `missing runtime snapshot: ${rule.selector}`);
  const selected = rule.every ? matches : matches.slice(-1);
  for (const { state } of selected) {
    for (const [key, expected] of Object.entries(rule.values)) {
      assert.deepEqual(
        state[key],
        expected,
        `runtime state mismatch: ${rule.selector}.${key}`,
      );
    }
    if (rule.anyTrue)
      assert.ok(
        rule.anyTrue.some((key) => state[key] === true),
        "background DOM focus reached",
      );
    if (rule.textIncludes)
      assert.ok(
        state.text?.includes(rule.textIncludes),
        "required consumer text missing",
      );
  }
}

export function assertSemanticCheckpoint(value) {
  assert.ok(value?.id, "checkpoint identity is required");
  assert.ok(
    Array.isArray(value.speech) &&
      value.speech.length > 0 &&
      value.speech.every(
        (line) => typeof line === "string" && line.startsWith("Speaking ["),
      ),
    "actual NVDA speech is required",
  );
  const text = speechText(value.speech);
  assert.ok(text.trim(), "NVDA commands alone are not speech");
  const speech = speechContracts[value.workflow]?.[value.id];
  const states = stateContracts[value.workflow]?.[value.id];
  assert.ok(speech && states, "unknown checkpoint contract");
  for (const [meaning, pattern] of speech) {
    assert.match(text, pattern, `speech does not convey: ${meaning}`);
  }
  assert.ok(
    Array.isArray(value.stateReads) && value.stateReads.length > 0,
    "runtime snapshots are required",
  );
  for (const rules of Object.values(states)) {
    for (const rule of rules) assertRead(rule, value.stateReads);
  }
  assert.ok(
    Number.isInteger(value.inputEventCount) && value.inputEventCount > 0,
    "observed NVDA keyboard input is required",
  );
  assert.ok(
    Array.isArray(value.actions) &&
      value.actions.length > 0 &&
      value.actions.every(
        (action) =>
          action.kind === "os-keyboard" &&
          (typeof action.key === "string" || typeof action.text === "string"),
      ),
    "recorded OS keyboard actions are required",
  );
  assert.equal(
    value.foregroundVerified,
    true,
    "owned foreground evidence is required",
  );
}

export function assertCheckpoint(value) {
  assertSemanticCheckpoint(value);
  const span = value.foregroundSpan;
  assert.ok(
    span?.complete === true && Number.isInteger(span.browserPid),
    "complete foreground observation required",
  );
  assert.ok(
    Number.isFinite(span.start) &&
      Number.isFinite(span.end) &&
      span.start <= span.end,
    "invalid foreground interval",
  );
  assert.ok(
    span.observationStart <= span.start && span.observationEnd >= span.end,
    "foreground observation does not cover the checkpoint",
  );
  assert.ok(
    ownsWindow(span.before, span.browserPid) &&
      ownsWindow(span.after, span.browserPid),
    "foreign foreground boundary",
  );
  assert.ok(
    Array.isArray(span.events) &&
      span.events.every(
        (state) =>
          state.tick >= span.start &&
          state.tick <= span.end &&
          ownsWindow(state, span.browserPid),
      ),
    "foreign foreground transition invalidates speech",
  );
}

export function assertBrowser(row, environment) {
  assert.ok(row.version, "browser version is required");
  assert.equal(row.nvdaVersion, environment.nvda, "NVDA version mismatch");
  assert.deepEqual(
    ordered((row.cleanup ?? []).map((item) => item.process)),
    ["owned-browser", "owned-monitor", "owned-nvda"],
    "cleanup records are incomplete",
  );
  assert.ok(
    row.cleanup.every((item) => item.exited === true),
    "cleanup did not complete",
  );
  assert.match(row.logHash ?? "", /^[a-f0-9]{64}$/);
  assert.deepEqual(
    ordered(row.workflows.map((flow) => flow.id)),
    ordered(Object.keys(checkpointIds)),
    "workflow matrix is incomplete",
  );
  for (const flow of row.workflows) {
    assert.equal(
      flow.status,
      "pass",
      `workflow did not pass: ${row.browser}/${flow.id}`,
    );
    assert.deepEqual(
      ordered(flow.checkpoints.map((point) => point.id)),
      ordered(checkpointIds[flow.id]),
      `checkpoint matrix is incomplete: ${flow.id}`,
    );
    for (const point of flow.checkpoints) {
      assert.equal(
        point.workflow,
        flow.id,
        "checkpoint belongs to another workflow",
      );
      assert.equal(
        point.foregroundSpan.browserPid,
        row.browserPid,
        "browser ownership mismatch",
      );
      assert.equal(
        point.foregroundSpan.observationStart,
        row.monitor?.started,
        "monitor start mismatch",
      );
      assert.equal(
        point.foregroundSpan.observationEnd,
        row.monitor?.ended,
        "monitor end mismatch",
      );
      assertCheckpoint(point);
    }
  }
  return row.workflows.length;
}

export function assertMatrix(report) {
  assert.equal(report?.schemaVersion, 1);
  assert.match(report.sourceCommit ?? "", /^[a-f0-9]{40}$/);
  for (const field of ["os", "build", "nvda"])
    assert.ok(report.environment?.[field], `missing environment ${field}`);
  assert.match(report.environment.settingsHash ?? "", /^[a-f0-9]{64}$/);
  assert.deepEqual(
    ordered(report.browsers.map((row) => row.browser)),
    ["chrome", "firefox"],
    "browser matrix is incomplete",
  );
  return report.browsers.reduce(
    (count, row) => count + assertBrowser(row, report.environment),
    0,
  );
}
