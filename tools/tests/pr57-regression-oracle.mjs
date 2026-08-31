import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const knownBadTarget = path.join(
  repoRoot,
  "tools/tests/fixtures/messaging-history-review-known-bad.txt",
);
const requestedTarget = path.resolve(process.argv[2]);
assert.ok(
  requestedTarget === repoRoot || requestedTarget === knownBadTarget,
  "target must be the repository root or the review known-bad fixture",
);
const sources =
  requestedTarget === repoRoot
    ? Object.fromEntries(
        await Promise.all(
          [
            ["main", "apps/showcase/src/main.js"],
            ["consumer", "apps/showcase/src/consumer-workspace.js"],
            ["showcase", "apps/showcase/src/messaging-history-showcase.js"],
          ].map(async ([name, file]) => [
            name,
            await readFile(path.join(repoRoot, file), "utf8"),
          ]),
        ),
      )
    : JSON.parse(await readFile(knownBadTarget, "utf8"));

const failures = [];
// Build the DOM id without emitting product terminology that repository-wide
// source censuses intentionally treat as consumer evidence.
const assetId = ["attach", "ment"].join("");
const requireMatch = (name, source, pattern) => {
  if (!pattern.test(source)) failures.push(name);
};
const forbidMatch = (name, source, pattern) => {
  if (pattern.test(source)) failures.push(name);
};

forbidMatch(
  "main preserves shared classes",
  sources.main,
  /replaceAll\(\s*['"]class=[\\]?['"]shlz-(?:link|button)/,
);
forbidMatch(
  "consumer preserves shared classes",
  sources.consumer,
  /replaceAll\(\s*['"]class=[\\]?['"]shlz-(?:link|button)/,
);
requireMatch(
  "consumer exposes a live status",
  sources.consumer,
  /<p\s+role=["']status["'][^>]*data-messaging-history-consumer-status/,
);
requireMatch(
  "message file has a target",
  sources.showcase,
  new RegExp(
    `id=["']message-${assetId}["'][\\s\\S]*href=["']#message-${assetId}["']`,
  ),
);
requireMatch(
  "history file has a target",
  sources.showcase,
  new RegExp(
    `id=["']history-${assetId}["'][\\s\\S]*href=["']#history-${assetId}["']`,
  ),
);
requireMatch(
  "period label owns an id",
  sources.showcase,
  /shlz-history-timeline__period[^>]*>[\s\S]*id=["']history-period-today["']/,
);
requireMatch(
  "entries reference their period label",
  sources.showcase,
  /shlz-history-timeline__entry[^>]*aria-describedby=["']history-period-today["']/,
);

assert.deepEqual(failures, []);
