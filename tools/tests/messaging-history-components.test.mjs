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
  assert.match(
    message,
    /> \.shlz-message-thread__message:first-child[\s\S]*grid-column: 1 \/ -1/,
  );
  assert.doesNotMatch(history, /\.shlz-history-timeline__entry::before/);
  assert.match(history, /list-style: none/);
  assert.match(history, /\.shlz-history-timeline__old-value/);
  assert.match(history, /\.shlz-history-timeline__quote/);
});

test("public docs and fixtures preserve native list semantics and consumer ownership", async () => {
  const [showcase, consumer, main, fixture, messageDocs, historyDocs] =
    await Promise.all([
      read("apps/showcase/src/messaging-history-showcase.js"),
      read("apps/showcase/src/consumer-workspace.js"),
      read("apps/showcase/src/main.js"),
      read("tools/fixtures/messaging-history-components.html"),
      read("docs/components/message-thread.md"),
      read("docs/components/history-timeline.md"),
    ]);
  for (const source of [showcase, fixture]) {
    assert.match(
      source,
      /<ol\b[^>]*\bclass=(["'])[^"']*\bshlz-message-thread\b[^"']*\1/,
    );
    assert.match(
      source,
      /<ol\b[^>]*\bclass=(["'])[^"']*\bshlz-history-timeline\b[^"']*\1/,
    );
  }
  assert.match(showcase, /id="message-attachment"/);
  assert.match(showcase, /data-component-audit-id="file-row-history-source"/);
  assert.doesNotMatch(showcase, /role="presentation"/);
  assert.match(showcase, /entry\("status"/);
  assert.match(consumer, /class="shlz-link"/);
  assert.match(consumer, /class="shlz-button shlz-button--sm"/);
  assert.match(
    consumer,
    /<p role="status" data-messaging-history-consumer-status>/,
  );
  assert.doesNotMatch(consumer, /messagingHistoryWorkspaceMarkup\.replaceAll/);
  assert.doesNotMatch(main, /messagingHistoryShowcaseMarkup\.replaceAll/);
  assert.match(messageDocs, /sanitization/);
  assert.match(historyDocs, /DOM order is authoritative/);
  assert.match(historyDocs, /status transitions/);
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
