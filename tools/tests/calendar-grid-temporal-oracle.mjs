import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const target = path.resolve(process.argv[2]);
const source = (await stat(target)).isDirectory()
  ? path.join(target, "tools/fixtures/calendar-grid.html")
  : target;
const html = await readFile(source, "utf8");

const temporalRow = html.match(
  /<tr data-shlz-calendar-grid-header-row="temporal">([^]*?)<\/tr>/,
)?.[1];
assert.ok(temporalRow, "a standalone temporal header row is required");

for (const [state, label, colspan] of [
  ["past", "Past", "1"],
  ["today", "Today", "1"],
  ["future", "Future", "3"],
]) {
  assert.match(
    temporalRow,
    new RegExp(
      `scope="colgroup"[^]*?colspan="${colspan}"[^]*?data-shlz-calendar-grid-state="${state}"[^]*?>[^]*?${label}`,
    ),
  );
}

const dateRow = html.match(
  /<tr data-shlz-calendar-grid-header-row="dates">([^]*?)<\/tr>/,
)?.[1];
assert.ok(dateRow, "a separate date header row is required");
assert.equal(dateRow.match(/scope="col"/g)?.length, 5);
assert.doesNotMatch(dateRow, /Past|Today|Future/);
