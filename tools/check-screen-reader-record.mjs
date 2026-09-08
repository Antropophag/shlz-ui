import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { assertMatrix } from "./at/evidence.mjs";

const recordPath = "docs/accessibility-evidence/windows-nvda.json";
const [evidence, set, member] = process.argv.slice(2);
if (evidence !== undefined) {
  assert.equal(evidence, recordPath);
  assert.equal(set, "screen-reader-support.checkpoints");
  assert.ok(member, "a checkpoint member is required");
}
const report = JSON.parse(
  await readFile(new URL(`../${recordPath}`, import.meta.url), "utf8"),
);
assert.equal(report.phase, "verification");
assert.ok(Number.isFinite(Date.parse(report.measuredAt)));
assert.equal(assertMatrix(report), 14);
const members = report.browsers.flatMap((row) =>
  row.workflows.flatMap((flow) =>
    flow.checkpoints.map((point) => `${row.browser}|${flow.id}|${point.id}`),
  ),
);
assert.equal(members.length, 58);
if (member !== undefined) assert.ok(members.includes(member));
console.log(
  `${fileURLToPath(new URL(`../${recordPath}`, import.meta.url))}: recorded evidence valid (${member ?? "14 workflows / 58 checkpoints"}); no live AT run performed`,
);
