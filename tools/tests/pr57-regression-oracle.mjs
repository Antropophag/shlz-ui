import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const target = path.resolve(process.argv[2]);
const targetStats = await stat(target);
const sources = targetStats.isDirectory()
  ? Object.fromEntries(
      await Promise.all(
        [
          ["main", "apps/showcase/src/main.js"],
          ["consumer", "apps/showcase/src/consumer-workspace.js"],
          ["showcase", "apps/showcase/src/messaging-history-showcase.js"],
        ].map(async ([name, file]) => [
          name,
          await readFile(path.join(target, file), "utf8"),
        ]),
      ),
    )
  : JSON.parse(await readFile(target, "utf8"));

const failures = [];
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
  "message attachment has a target",
  sources.showcase,
  /id=["']message-attachment["'][\s\S]*href=["']#message-attachment["']/,
);
requireMatch(
  "history attachment has a target",
  sources.showcase,
  /id=["']history-attachment["'][\s\S]*href=["']#history-attachment["']/,
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
