import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("Comment Feed ships separately from Message Thread with exact source authority", async () => {
  const [bundle, css, contract, commentsSource, messagesManifest] =
    await Promise.all([
      read("packages/styles/shlz.css"),
      read("packages/styles/components/comment-feed.css"),
      read("docs/component-audits/comment-feed-contract.md"),
      read("shlz-design-source/raw/svg/Комментарии.svg"),
      read("docs/component-audits/message-thread.json"),
    ]);

  assert.match(bundle, /components\/comment-feed\.css/);
  assert.match(css, /\.shlz-comment-feed\b/);
  assert.match(contract, /Комментарии\.svg/);
  assert.match(contract, /seven 1440×1000 application frames/);
  assert.equal(
    createHash("sha256").update(commentsSource).digest("hex"),
    "20e2dc809b8fa832cc73bd078abd57678c9614a70da7dbf376ab1a1f25458a88",
  );
  for (const [x, y] of [
    [340, 340],
    [1930, 340],
    [3520, 340],
    [5110, 340],
    [6700, 340],
    [1930, 1490],
    [5110, 1490],
  ])
    assert.match(
      commentsSource,
      new RegExp(
        `<rect width="1440" height="1000" transform="translate\\(${x} ${y}\\)"`,
      ),
    );
  assert.match(messagesManifest, /shlz-design-source\/raw\/svg\/Messages\.svg/);
  assert.doesNotMatch(messagesManifest, /Комментарии\.svg/);
});

test("Comment Feed fixtures expose the complete source-observed anatomy", async () => {
  const [showcase, fixture, docs] = await Promise.all([
    read("apps/showcase/src/comment-feed-showcase.js"),
    read("tools/fixtures/comment-feed.html"),
    read("docs/components/comment-feed.md"),
  ]);
  for (const source of [showcase, fixture]) {
    assert.match(source, /<ol\b[^>]*shlz-comment-feed/);
    assert.match(source, /shlz-comment-feed__author/);
    assert.match(source, /shlz-comment-feed__time/);
    assert.match(source, /shlz-comment-feed__mention/);
    assert.match(source, /shlz-comment-feed__attachments/);
    assert.match(source, /shlz-comment-feed__attachment-summary/);
    assert.match(source, /shlz-comment-feed__composer/);
  }
  for (const state of [
    "default",
    "composer-populated",
    "comment-added",
    "own-comment-actions",
    "other-comment-reply",
    "mention-suggestions",
    "comment-deleted",
  ])
    assert.match(showcase, new RegExp(`state\\("${state}"`));
  assert.match(showcase, />Изменить</);
  assert.match(showcase, />Удалить</);
  assert.match(showcase, />Ответить</);
  assert.match(showcase, />Отменить</);
  assert.match(docs, /consumer-owned/i);
  assert.match(docs, /Комментарии\.svg/);
});

test("History source fixture exposes all seven structured event payloads", async () => {
  const [showcase, css, contract] = await Promise.all([
    read("apps/showcase/src/messaging-history-showcase.js"),
    read("packages/styles/components/history-timeline.css"),
    read("docs/component-audits/history-timeline-contract.md"),
  ]);
  for (const kind of [
    "created",
    "status",
    "comment",
    "field",
    "tags",
    "people",
    "attachment",
  ])
    assert.match(showcase, new RegExp(`entry\\("${kind}"`));
  assert.match(showcase, /shlz-history-timeline__old-value/);
  assert.match(showcase, /shlz-history-timeline__new-value/);
  assert.match(showcase, /shlz-history-timeline__quote/);
  assert.match(showcase, /shlz-history-timeline__people/);
  assert.match(showcase, /shlz-history-timeline__attachment/);
  assert.doesNotMatch(showcase, /history-timeline__marker/);
  assert.doesNotMatch(css, /history-timeline__entry::before/);
  assert.match(contract, /seven visibly distinct event presentations/);
});
