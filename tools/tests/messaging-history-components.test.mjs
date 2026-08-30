import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Message Thread and History Timeline ship through the public style bundle", async () => {
  const [bundle, message, history] = await Promise.all([
    read("packages/styles/shlz.css"),
    read("packages/styles/components/message-thread.css"),
    read("packages/styles/components/history-timeline.css"),
  ]);
  assert.match(bundle, /message-thread\.css/);
  assert.match(bundle, /history-timeline\.css/);
  assert.match(
    message,
    /\.shlz-message-thread__item\[data-direction="outgoing"\]/,
  );
  assert.match(message, /overflow-wrap: anywhere/);
  assert.match(history, /\.shlz-history-timeline__entry::before/);
  assert.match(history, /list-style: none/);
});

test("public docs and fixtures preserve native list semantics and consumer ownership", async () => {
  const [showcase, fixture, messageDocs, historyDocs] = await Promise.all([
    read("apps/showcase/src/messaging-history-showcase.js"),
    read("tools/fixtures/messaging-history-components.html"),
    read("docs/components/message-thread.md"),
    read("docs/components/history-timeline.md"),
  ]);
  for (const source of [showcase, fixture]) {
    assert.match(source, /<ol[\s\S]*?class=["\\]shlz-message-thread/);
    assert.match(source, /<ol[\s\S]*?class=["\\]shlz-history-timeline/);
  }
  assert.match(messageDocs, /sanitization/);
  assert.match(historyDocs, /DOM order is authoritative/);
});

test("component manifests classify fixture and live-consumer evidence without gallery consumers", async () => {
  for (const component of ["message-thread", "history-timeline"]) {
    const manifest = JSON.parse(
      await read(`docs/component-audits/${component}.json`),
    );
    assert.equal(manifest.occurrences.length, 3);
    assert.deepEqual(
      new Set(manifest.occurrences.map(({ kind }) => kind)),
      new Set(["executable-fixture", "live-consumer"]),
    );
    assert.equal(manifest.findings.length, 0);
  }
});
