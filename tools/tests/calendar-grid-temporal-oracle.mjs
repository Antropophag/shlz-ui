import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const candidateFixture = path.join(
  repoRoot,
  "tools/fixtures/calendar-grid.html",
);
const knownBadFixture = path.join(
  repoRoot,
  "tools/tests/fixtures/calendar-grid-temporal-groups-known-bad.html",
);
const requestedTarget = process.argv[2];
const knownBadRelative =
  "tools/tests/fixtures/calendar-grid-temporal-groups-known-bad.html";
const source =
  requestedTarget === "." || requestedTarget === repoRoot
    ? candidateFixture
    : requestedTarget === knownBadFixture ||
        requestedTarget === knownBadRelative
      ? knownBadFixture
      : null;
assert.ok(source, "target must be an allowed Calendar Grid fixture");
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
