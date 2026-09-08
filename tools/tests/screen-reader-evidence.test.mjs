import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import {
  assertCheckpoint,
  assertMatrix,
  assertBrowser,
  checkpointIds,
  speechText,
} from "../at/evidence.mjs";
import { stateContracts } from "../at/contracts.mjs";

// Unit references, not published AT evidence: recorded speech examples plus
// synthetic state snapshots. Negative tests mutate them independently.
const speech = JSON.parse(
  readFileSync(
    new URL("./fixtures/screen-reader-unit-speech.json", import.meta.url),
    "utf8",
  ),
);
function checkpoint(workflow = "input", id = "name-value", pid = 123) {
  const stateReads = [];
  for (const rules of Object.values(stateContracts[workflow][id])) {
    for (const rule of rules) {
      stateReads.push({
        selector: rule.selector,
        actionIndex: rule.actionIndex ?? 1,
        state: {
          ...rule.values,
          ...(rule.anyTrue ? { [rule.anyTrue[0]]: true } : {}),
          ...(rule.textIncludes ? { text: rule.textIncludes } : {}),
        },
      });
    }
  }
  for (const read of stateReads) {
    const siblings = stateReads.filter(
      (other) =>
        other.selector === read.selector &&
        other.actionIndex === read.actionIndex,
    );
    read.state = Object.assign({}, ...siblings.map((other) => other.state));
  }
  return {
    workflow,
    id,
    speech: speech[workflow][id],
    stateReads,
    inputEventCount: 1,
    actions: [{ kind: "os-keyboard", key: "NVDA+Tab" }],
    foregroundVerified: true,
    foregroundSpan: {
      complete: true,
      browserPid: pid,
      start: 10,
      end: 20,
      observationStart: 0,
      observationEnd: 1000,
      before: { pid, tick: 10 },
      after: { pid, tick: 20 },
      events: [],
    },
  };
}
function matrix() {
  return {
    schemaVersion: 1,
    sourceCommit: "a".repeat(40),
    environment: {
      os: "Windows 10",
      build: "19045",
      nvda: "2026.2",
      settingsHash: "b".repeat(64),
    },
    browsers: ["chrome", "firefox"].map((browser, index) => ({
      browser,
      browserPid: 123 + index,
      version: "152.0",
      nvdaVersion: "2026.2",
      logHash: "c".repeat(64),
      monitor: { started: 0, ended: 1000 },
      cleanup: ["owned-nvda", "owned-browser", "owned-monitor"].map(
        (process) => ({ process, exited: true }),
      ),
      workflows: Object.entries(checkpointIds).map(([id, ids]) => ({
        id,
        status: "pass",
        checkpoints: ids.map((point) => checkpoint(id, point, 123 + index)),
      })),
    })),
  };
}

test("real speech is required even when browser assertions pass", () => {
  const value = checkpoint();
  value.speech = [];
  assert.throws(() => assertCheckpoint(value), /speech/);
});
test("language and cancellation commands are not spoken content", () => {
  const value = checkpoint();
  value.speech = [
    "Speaking [LangChangeCommand ('en'), CancellableSpeech (still valid)]",
  ];
  assert.throws(() => assertCheckpoint(value), /speech/);
  assert.equal(
    speechText(["Speaking [LangChangeCommand ('en'), 'Name (test)', 'edit']"]),
    "Name (test) edit",
  );
});
test("unrelated speech and forged verdicts cannot satisfy a checkpoint", () => {
  const value = checkpoint("modal", "opened");
  value.speech = speech.input["name-value"];
  value.assertions = [{ meaning: "dialog name", passed: true }];
  assert.throws(() => assertCheckpoint(value), /speech does not convey/);
  const wrongState = checkpoint();
  wrongState.stateReads[0].state.value = "wrong";
  wrongState.assertions = [{ meaning: "native value", passed: true }];
  assert.throws(() => assertCheckpoint(wrongState), /runtime state mismatch/);
});
test("lost-and-returned foreground invalidates retained speech", () => {
  const value = checkpoint();
  value.foregroundSpan.events = [
    { pid: 999, tick: 12 },
    { pid: 123, tick: 15 },
  ];
  assert.throws(() => assertCheckpoint(value), /foreign foreground transition/);
});
test("observed input, ownership and runtime snapshots are mandatory", () => {
  for (const delta of [
    { inputEventCount: 0 },
    { foregroundVerified: false },
    { actions: [] },
    { stateReads: [] },
  ]) {
    assert.throws(() => assertCheckpoint({ ...checkpoint(), ...delta }));
  }
});
test("partial browser validation also enforces cleanup and reader version", () => {
  const record = matrix();
  record.browsers[0].cleanup[0].exited = false;
  assert.throws(
    () => assertBrowser(record.browsers[0], record.environment),
    /cleanup/,
  );
  const mismatch = matrix();
  mismatch.browsers[0].nvdaVersion = "another version";
  assert.throws(() => assertMatrix(mismatch), /version/);
});
test("complete matrix requires both browsers and every named checkpoint", () => {
  assert.equal(assertMatrix(matrix()), 14);
  const missingBrowser = matrix();
  missingBrowser.browsers.pop();
  assert.throws(() => assertMatrix(missingBrowser), /browser/);
  const missingPoint = matrix();
  missingPoint.browsers[0].workflows[0].checkpoints.pop();
  assert.throws(() => assertMatrix(missingPoint), /checkpoint/);
});
test("duplicate or failed workflows cannot complete the matrix", () => {
  const duplicate = matrix();
  duplicate.browsers[0].workflows[1] = duplicate.browsers[0].workflows[0];
  assert.throws(() => assertMatrix(duplicate), /workflow/);
  const failed = matrix();
  failed.browsers[1].workflows[2].status = "fail";
  assert.throws(() => assertMatrix(failed), /workflow/);
});
