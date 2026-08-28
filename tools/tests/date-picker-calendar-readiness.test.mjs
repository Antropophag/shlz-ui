import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import test from "node:test";

const sourceExpectations = [
  {
    path: "shlz-design-source/raw/svg/Date-Picker.svg",
    sha256: "80417fdd69bf2c20853a35f7c94926436ee097ff7db865605e3f09c2562b190f",
    canvas: [932, 2541],
  },
  {
    path: "shlz-design-source/raw/svg/Calendar.svg",
    sha256: "da5c97cd453930458634ec3317452dced33b8de41c418d744bf253ed75af8714",
    canvas: [2081, 2386],
  },
];

test("Date Picker and Calendar authorities retain their attested integrity", async () => {
  for (const expected of sourceExpectations) {
    const source = await readFile(expected.path);
    assert.equal(
      createHash("sha256").update(source).digest("hex"),
      expected.sha256,
    );
    const root = source.toString("utf8", 0, 180);
    assert.match(
      root,
      new RegExp(
        `<svg width="${expected.canvas[0]}" height="${expected.canvas[1]}" viewBox="0 0 ${expected.canvas[0]} ${expected.canvas[1]}"`,
      ),
    );
  }

  const references = JSON.parse(
    await readFile("design-source-index/reference-screens.json", "utf8"),
  );
  const calendar = references.screens.find(({ sourcePath }) =>
    sourcePath.endsWith("/Calendar.svg"),
  );
  assert.equal(calendar.sha256, sourceExpectations[1].sha256);
  assert.deepEqual(calendar.canvas, { width: 2081, height: 2386 });
  assert.equal(calendar.classification, "ADDITIONAL_REFERENCE");
  assert.match(calendar.analysisPolicy, /Metadata inventory only/);
});

test("indexed Date Picker primitives retain the attested source contract", async () => {
  const index = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const named = (name) =>
    index.components.filter((component) => component.name === name);
  const [datePicker] = named("Date-Picker");
  assert.equal(datePicker.kind, "COMPONENT_SET");
  assert.equal(datePicker.figmaNodeId, "81:16445");
  assert.equal(datePicker.variants.length, 20);
  assert.deepEqual(Object.keys(datePicker.propertyDefinitions), [
    "Size",
    "State",
    "Filled",
    "Ranged",
  ]);
  assert.deepEqual(
    new Set(
      datePicker.variants
        .filter(
          ({ properties }) =>
            properties.State !== "Focused" &&
            properties.State !== "Focused filled",
        )
        .map(
          ({ properties, dimensions }) =>
            `${properties.Size}:${dimensions.width}x${dimensions.height}`,
        ),
    ),
    new Set(["Large:250x63", "Medium:250x55"]),
  );

  const dropdowns = named("Picker-Dropdown");
  assert.deepEqual(
    dropdowns.map(({ figmaNodeId }) => figmaNodeId),
    ["89:5792", "89:13142"],
  );
  assert.deepEqual(
    dropdowns.map(({ dimensions }) => dimensions),
    [
      { width: 280, height: 274 },
      { width: 560, height: 274.0010070800781 },
    ],
  );

  const [cell] = named("Picker-Cell/Month");
  assert.equal(cell.kind, "COMPONENT_SET");
  assert.equal(cell.figmaNodeId, "82:10764");
  assert.deepEqual(cell.dimensions, { width: 296, height: 168 });
  assert.equal(cell.variants.length, 14);
  assert.ok(
    cell.variants.every(
      ({ dimensions }) => dimensions.width === 30 && dimensions.height === 30,
    ),
  );
  assert.deepEqual(Object.keys(cell.propertyDefinitions), [
    "In View",
    "Today",
    "Selected",
    "⬑ Range Start",
    "⬑ In Range",
    "⬑ Range End",
    "Hovered",
    "Disabled",
  ]);

  const [icon] = named("Interface / Calendar");
  assert.equal(icon.kind, "COMPONENT");
  assert.deepEqual(icon.dimensions, { width: 24, height: 24 });
  assert.notEqual(
    icon.figmaNodeId,
    cell.figmaNodeId,
    "the calendar icon must not stand in for the calendar composition",
  );
});

const roots = ["apps", "packages", "tools/fixtures"];
const extensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".php",
]);
const pickerOccurrence =
  /shlz-(?:calendar|date-picker)|data-(?:component-audit-id=["']date-picker-calendar-|shlz-(?:calendar|date-picker))|type\s*=\s*["']date["']/;

async function executableFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await executableFiles(path)));
    else if (extensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

test("Date Picker and Calendar census has no unclassified occurrence or substitute", async () => {
  const files = (await Promise.all(roots.map(executableFiles))).flat();
  const matches = [];
  for (const path of files)
    if (pickerOccurrence.test(await readFile(path, "utf8")))
      matches.push(relative(".", path));
  assert.deepEqual(matches, [
    "packages/behaviors/src/calendar.ts",
    "tools/fixtures/calendar.html",
  ]);

  const manifest = JSON.parse(
    await readFile("docs/component-audits/date-picker-calendar.json", "utf8"),
  );
  assert.deepEqual(manifest.implementation, [
    "packages/behaviors/src/calendar.ts",
  ]);
  assert.deepEqual(manifest.occurrences, [
    { id: "date-picker-calendar-behavior-fixture", kind: "executable-fixture" },
  ]);
  assert.equal(manifest.diagnosticOccurrenceCount, 0);
});
