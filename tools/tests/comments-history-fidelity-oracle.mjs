import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const knownBad = path.join(
  repoRoot,
  "tools/tests/fixtures/comments-history-fidelity-known-bad.json",
);
const target = path.resolve(process.argv[2]);
assert.ok(target === repoRoot || target === knownBad, "unknown oracle target");

const sources =
  target === repoRoot
    ? Object.fromEntries(
        await Promise.all(
          [
            ["bundle", "packages/styles/shlz.css"],
            ["comments", "apps/showcase/src/comment-feed-showcase.js"],
            ["history", "apps/showcase/src/messaging-history-showcase.js"],
            ["consumer", "apps/showcase/src/comments-history-consumer.js"],
          ].map(async ([name, file]) => [
            name,
            await readFile(path.join(repoRoot, file), "utf8"),
          ]),
        ),
      )
    : JSON.parse(await readFile(knownBad, "utf8"));

assert.match(sources.bundle, /components\/comment-feed\.css/);
for (const state of [
  "default",
  "composer-populated",
  "comment-added",
  "own-comment-actions",
  "other-comment-reply",
  "mention-suggestions",
  "comment-deleted",
])
  assert.match(sources.comments, new RegExp(`state\\("${state}"`));
for (const kind of [
  "created",
  "status",
  "comment",
  "field",
  "tags",
  "people",
  "attachment",
])
  assert.match(sources.history, new RegExp(`entry\\("${kind}"`));
assert.doesNotMatch(sources.history, /history-timeline__marker/);
assert.match(sources.consumer, /comment-feed-source-consumer/);
assert.match(sources.consumer, /history-timeline-source-consumer/);
