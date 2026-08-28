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
