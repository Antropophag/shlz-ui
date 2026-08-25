import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const adapterPath = path.join(
  root,
  process.env.SHLZ_CONTEXT_ENVELOPE_ADAPTER ?? "tools/lib/harness/core.mjs",
);
const { summarizeEvents } = await import(pathToFileURL(adapterPath));

const runtimeAttempt = ({
  packet,
  session,
  runtimeId,
  inputTokens,
  cachedInputTokens,
  outputTokens,
}) => [
  {
    packet,
    session,
    agent: "codex-worker",
    phase: "implementation",
    type: "execution-boundary",
    executionSource: "codex-exec-jsonl",
    runtimeId,
  },
  {
    packet,
    session,
    agent: "codex-worker",
    phase: "implementation",
    type: "usage",
    usageSource: "codex-exec-jsonl:turn.completed",
    inputTokens,
    cachedInputTokens,
    outputTokens,
  },
];

const observed = summarizeEvents([
  ...runtimeAttempt({
    packet: "implementation",
    session: "implementation-r1",
    runtimeId: "runtime-1",
    inputTokens: 100,
    cachedInputTokens: 60,
    outputTokens: 7,
  }),
  ...runtimeAttempt({
    packet: "implementation",
    session: "implementation-r2",
    runtimeId: "runtime-2",
    inputTokens: 250,
    cachedInputTokens: 200,
    outputTokens: 11,
  }),
  ...runtimeAttempt({
    packet: "review",
    session: "review-r1",
    runtimeId: "runtime-3",
    inputTokens: 80,
    cachedInputTokens: 40,
    outputTokens: 5,
  }),
]);

assert.deepEqual(observed.runtimeUsage, {
  inputTokens: 430,
  cachedInputTokens: 300,
  uncachedInputTokens: 130,
  outputTokens: 23,
  source: "codex-exec-jsonl:turn.completed",
});
assert.deepEqual(observed.byPacket.implementation, {
  attempts: 2,
  physicalBoundaries: 2,
  sessions: ["implementation-r1", "implementation-r2"],
  inputTokens: 350,
  cachedInputTokens: 260,
  uncachedInputTokens: 90,
  outputTokens: 18,
});
assert.deepEqual(observed.bySession["implementation-r2"], {
  packet: "implementation",
  phase: "implementation",
  attempt: 2,
  runtimeId: "runtime-2",
  inputTokens: 250,
  cachedInputTokens: 200,
  uncachedInputTokens: 50,
  outputTokens: 11,
});

const incomplete = summarizeEvents([
  {
    packet: "legacy",
    session: "legacy-r1",
    agent: "codex-worker",
    phase: "implementation",
    type: "usage",
    usageSource: "codex-exec-jsonl:turn.completed",
    inputTokens: 25,
  },
]);
assert.equal(incomplete.runtimeUsage.cachedInputTokens, "unavailable");
assert.equal(incomplete.runtimeUsage.uncachedInputTokens, "unavailable");
assert.equal(incomplete.runtimeUsage.outputTokens, "unavailable");

const fixture = JSON.parse(
  await readFile(
    path.join(
      root,
      "docs/exec-plans/fixtures/context-envelope-efficiency-eval.json",
    ),
    "utf8",
  ),
);
const report = JSON.parse(
  await readFile(path.join(root, fixture.expectedReport), "utf8"),
);
assert.equal(report.fixture, fixture.id);
assert.equal(report.sample.changes, fixture.telemetrySources.length);
assert.equal(report.runtime.cachedInputTokens, "unavailable");
assert.equal(report.runtime.uncachedInputTokens, "unavailable");
assert.equal(report.runtime.outputTokens, "unavailable");
assert.equal(report.proxies.contextRelevance, "unavailable");
assert.deepEqual(report.sourceEnvelopes[0].broadPattern, {
  pattern: fixture.sourceEnvelopes[0].declaredPattern,
  sourceCount: fixture.sourceEnvelopes[0].patternSourceCount,
  sourceBytes: fixture.sourceEnvelopes[0].patternSourceBytes,
});
