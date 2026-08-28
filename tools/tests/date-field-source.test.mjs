import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Date Field package and generated declarations expose the documented API", async () => {
  const packageJson = JSON.parse(
    await readFile("packages/behaviors/package.json", "utf8"),
  );
  assert.deepEqual(packageJson.exports["./date-field"], {
    types: "./dist/date-field.d.ts",
    import: "./dist/date-field.js",
  });

  const declarations = await readFile(
    "packages/behaviors/dist/date-field.d.ts",
    "utf8",
  );
  for (const contract of [
    "DateFieldControllerOptions",
    "label: string",
    "name?: string",
    "value?: string",
    "locale?: string",
    "description?: string",
    "error?: string",
    "triggerLabel?: string",
    "disabled?: boolean",
    "readOnly?: boolean",
    "required?: boolean",
    "DateFieldChangeDetail",
    "get value(): string",
    "setValue(value: string",
    "destroy(): void",
  ])
    assert.ok(
      declarations.includes(contract),
      `missing declaration: ${contract}`,
    );
});

test("Date Field documentation points to its executable plain-HTML example", async () => {
  const [documentation, fixture] = await Promise.all([
    readFile("docs/components/date-field.md", "utf8"),
    readFile("tools/fixtures/date-field.html", "utf8"),
  ]);
  assert.match(documentation, /tools\/fixtures\/date-field\.html/);
  assert.match(documentation, /@shlz\/behaviors\/date-field/);
  assert.match(fixture, /new DateFieldController/);
  assert.match(
    fixture,
    /data-component-audit-id="date-picker-calendar-date-field-fixture"/,
  );
});

test("Date Field visual layer records source-backed sizes and interactive states", async () => {
  const [entrypoint, styles, declarations] = await Promise.all([
    readFile("packages/styles/shlz.css", "utf8"),
    readFile("packages/styles/components/date-field.css", "utf8"),
    readFile("packages/behaviors/dist/date-field.d.ts", "utf8"),
  ]);

  assert.match(entrypoint, /components\/date-field\.css/);
  assert.match(declarations, /size\?: "large" \| "medium"/);
  for (const contract of [
    "FACT: Date-Picker.svg",
    ".shlz-date-field--large",
    ".shlz-date-field--medium",
    ":hover",
    ":focus-within",
    '[aria-invalid="true"]',
    ":disabled",
  ])
    assert.ok(
      styles.includes(contract),
      `missing visual contract: ${contract}`,
    );
});

test("Calendar visual layer records every authoritative cell state", async () => {
  const [entrypoint, styles] = await Promise.all([
    readFile("packages/styles/shlz.css", "utf8"),
    readFile("packages/styles/components/calendar.css", "utf8"),
  ]);
  assert.match(entrypoint, /components\/calendar\.css/);
  for (const contract of [
    "FACT: Picker-Dropdown",
    "FACT: Picker-Cell/Month",
    ".shlz-calendar__header",
    ".shlz-calendar__weekdays",
    '[aria-current="date"]',
    '[aria-selected="true"]',
    '[data-in-range="true"]',
    '[data-in-month="false"]',
    ":hover",
    ":focus-visible",
    ":disabled",
  ])
    assert.ok(styles.includes(contract), `missing Calendar state: ${contract}`);
});
