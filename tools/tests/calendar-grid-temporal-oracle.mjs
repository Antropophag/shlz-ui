import assert from "node:assert/strict";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = await realpath(process.cwd());
const target = await realpath(path.resolve(repoRoot, process.argv[2] ?? ""));
assert.ok(
  target === repoRoot || target.startsWith(`${repoRoot}${path.sep}`),
  "target must stay within the repository",
);
const source = (await stat(target)).isDirectory()
  ? path.join(target, "tools/fixtures/calendar-grid.html")
  : target;
const html = await readFile(source, "utf8");

const temporalRow = html.match(
  /<tr data-shlz-calendar-grid-header-row="temporal">([^]*?)<\/tr>/,
)?.[1];
assert.ok(temporalRow, "a standalone temporal header row is required");
const temporalHeaders = [
  ...temporalRow.matchAll(/<th\b[^>]*>[\s\S]*?<\/th>/g),
].map(([header]) => header);

for (const [state, label, colspan] of [
  ["past", "Past", "1"],
  ["today", "Today", "1"],
  ["future", "Future", "3"],
]) {
  const header = temporalHeaders.find((candidate) =>
    candidate.includes(`data-shlz-calendar-grid-state="${state}"`),
  );
  assert.ok(header, `${label} must have its own temporal group header`);
  assert.match(header, /scope="colgroup"/);
  assert.match(header, new RegExp(`colspan="${colspan}"`));
  assert.match(header, new RegExp(`>${label}<|>${label}</span>`));
}

const dateRow = html.match(
  /<tr data-shlz-calendar-grid-header-row="dates">([^]*?)<\/tr>/,
)?.[1];
assert.ok(dateRow, "a separate date header row is required");
assert.equal(dateRow.match(/scope="col"/g)?.length, 5);
assert.doesNotMatch(dateRow, /Past|Today|Future/);
