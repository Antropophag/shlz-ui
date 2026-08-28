import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Date Picker exposes its framework-neutral composition contract", async () => {
  const [packageJson, index, controller, fixture] = await Promise.all([
    readFile("packages/behaviors/package.json", "utf8"),
    readFile("packages/behaviors/src/index.ts", "utf8"),
    readFile("packages/behaviors/src/date-picker.ts", "utf8"),
    readFile("tools/fixtures/date-picker.html", "utf8"),
  ]);
  assert.match(packageJson, /"\.\/date-picker"/);
  assert.match(index, /DatePickerController/);
  assert.match(controller, /surface\.dataset\.shlzPopover/);
  assert.match(fixture, /date-picker-calendar-single-fixture/);
  assert.match(fixture, /date-picker-calendar-range-fixture/);
});
