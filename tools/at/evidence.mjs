import assert from "node:assert/strict";

export const checkpointIds = {
  input: ["name-value", "invalid-description"],
  checkbox: ["unchecked", "checked", "mixed", "disabled"],
  select: [
    "collapsed",
    "opened",
    "option-next",
    "committed",
    "cancelled",
    "disabled",
  ],
  modal: ["opened", "contained", "dismissed"],
  popover: ["expanded", "input", "action", "dismissed"],
  "date-picker": ["opened", "next-day", "committed", "cancelled"],
  "file-upload": ["trigger", "selected", "error", "plain-error", "disabled"],
};

const ordered = (values) => [...values].sort((a, b) => a.localeCompare(b));

export function speechText(lines) {
  const words = [];
  const tokens =
    /[A-Za-z]\w*\s*\([^)]*\)|'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"/g;
  for (const line of lines) {
    for (const match of line.matchAll(tokens)) {
      const word = match[1] ?? match[2];
      if (word?.trim()) words.push(word.replace(/\\(['"\\])/g, "$1"));
    }
  }
  return words.join(" ");
}

export function assertCheckpoint(value) {
  assert.ok(value?.id, "checkpoint identity is required");
  assert.ok(
    Array.isArray(value.speech) &&
      value.speech.length > 0 &&
      value.speech.every(
        (line) =>
          typeof line === "string" &&
          line.startsWith("Speaking [") &&
          line.length > 12,
      ),
    "actual NVDA speech is required",
  );
  assert.ok(
    speechText(value.speech).trim(),
    "NVDA commands alone are not speech",
  );
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
  assert.ok(
    Array.isArray(value.assertions) && value.assertions.length > 0,
    "semantic assertions are required",
  );
  for (const assertion of value.assertions) {
    assert.ok(
      assertion.meaning && assertion.passed === true,
      `failed assertion: ${assertion.meaning}`,
    );
  }
}

export function assertMatrix(report) {
  assert.equal(report?.schemaVersion, 1);
  assert.match(report.sourceCommit ?? "", /^[a-f0-9]{40}$/);
  for (const field of ["os", "build", "nvda"]) {
    assert.ok(report.environment?.[field], `missing environment ${field}`);
  }
  assert.match(report.environment.settingsHash ?? "", /^[a-f0-9]{64}$/);
  assert.deepEqual(
    ordered(report.browsers.map((row) => row.browser)),
    ["chrome", "firefox"],
    "browser matrix is incomplete",
  );
  let total = 0;
  for (const row of report.browsers) {
    assert.ok(row.version, "browser version is required");
    assert.equal(
      row.nvdaVersion,
      report.environment.nvda,
      "NVDA version mismatch",
    );
    assert.deepEqual(
      ordered((row.cleanup ?? []).map((item) => item.process)),
      ["owned-browser", "owned-nvda"],
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
      flow.checkpoints.forEach(assertCheckpoint);
      total++;
    }
  }
  return total;
}
