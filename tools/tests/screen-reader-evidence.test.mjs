import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCheckpoint,
  assertMatrix,
  checkpointIds,
  speechText,
} from "../at/evidence.mjs";

const checkpoint = (id) => ({
  id,
  speech: ["Speaking ['Поиск по заявкам', 'edit', 'focused']"],
  inputEventCount: 1,
  actions: [{ kind: "os-keyboard", key: "NVDA+Tab" }],
  foregroundVerified: true,
  assertions: [{ meaning: "name and role", passed: true }],
});
const matrix = () => ({
  schemaVersion: 1,
  sourceCommit: "a".repeat(40),
  environment: {
    os: "Windows 10",
    build: "19045",
    nvda: "2026.2",
    settingsHash: "b".repeat(64),
  },
  browsers: ["chrome", "firefox"].map((browser) => ({
    browser,
    version: "152.0",
    nvdaVersion: "2026.2",
    logHash: "c".repeat(64),
    cleanup: [
      { process: "owned-nvda", exited: true },
      { process: "owned-browser", exited: true },
    ],
    workflows: Object.entries(checkpointIds).map(([id, ids]) => ({
      id,
      status: "pass",
      checkpoints: ids.map(checkpoint),
    })),
  })),
});

test("real speech is required even when browser assertions pass", () => {
  const value = checkpoint("name-value");
  value.speech = [];
  assert.throws(() => assertCheckpoint(value), /speech/);
});

test("language and cancellation commands are not spoken content", () => {
  const value = checkpoint("name-value");
  value.speech = [
    "Speaking [LangChangeCommand ('en'), CancellableSpeech (still valid)]",
  ];
  assert.throws(() => assertCheckpoint(value), /speech/);
  assert.equal(
    speechText(["Speaking [LangChangeCommand ('en'), 'Name (test)', 'edit']"]),
    "Name (test) edit",
  );
});

test("observed OS input and foreground ownership are required", () => {
  for (const delta of [
    { inputEventCount: 0 },
    { foregroundVerified: false },
    { actions: [] },
  ]) {
    assert.throws(() =>
      assertCheckpoint({ ...checkpoint("name-value"), ...delta }),
    );
  }
});

test("reader version mismatches and unsuccessful cleanup cannot pass", () => {
  const mismatch = matrix();
  mismatch.browsers[0].nvdaVersion = "another version";
  assert.throws(() => assertMatrix(mismatch), /version/);
  const unclean = matrix();
  unclean.browsers[1].cleanup[0].exited = false;
  assert.throws(() => assertMatrix(unclean), /cleanup/);
});

test("a failed semantic assertion cannot be a checkpoint pass", () => {
  const value = checkpoint("name-value");
  value.assertions[0].passed = false;
  assert.throws(() => assertCheckpoint(value), /assertion/);
});

test("the complete matrix requires both browsers and every named checkpoint", () => {
  assert.equal(assertMatrix(matrix()), 14);
  const missingBrowser = matrix();
  missingBrowser.browsers.pop();
  assert.throws(() => assertMatrix(missingBrowser), /browser/);
  const missingCheckpoint = matrix();
  missingCheckpoint.browsers[0].workflows[0].checkpoints.pop();
  assert.throws(() => assertMatrix(missingCheckpoint), /checkpoint/);
});

test("duplicate or failed workflows cannot complete the matrix", () => {
  const duplicate = matrix();
  duplicate.browsers[0].workflows[1] = duplicate.browsers[0].workflows[0];
  assert.throws(() => assertMatrix(duplicate), /workflow/);
  const failed = matrix();
  failed.browsers[1].workflows[2].status = "fail";
  assert.throws(() => assertMatrix(failed), /workflow/);
});
