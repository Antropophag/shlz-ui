import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const requiredStressScenarios = [
  "single",
  "range",
  "constraints",
  "invalid-input",
  "one-month",
  "two-month",
  "narrow",
  "long-label",
  "locale",
];

test("Showcase exposes every source Date Picker variant and required stress scenario", async () => {
  const [showcase, main] = await Promise.all([
    readFile("apps/showcase/src/date-picker-showcase.js", "utf8"),
    readFile("apps/showcase/src/main.js", "utf8"),
  ]);

  assert.match(main, /datePickerShowcaseMarkup/);
  assert.match(main, /enhanceDatePickerShowcase/);
  assert.equal([...showcase.matchAll(/sourceKey:/g)].length, 20);
  for (const scenario of requiredStressScenarios)
    assert.match(showcase, new RegExp(`id: ["']${scenario}["']`));
  assert.match(showcase, /DatePickerController/);
  assert.match(showcase, /@shlz\/behaviors/);
});

test("Date Picker Showcase roots are classified as executable fixtures", async () => {
  const manifest = JSON.parse(
    await readFile("docs/component-audits/date-picker-calendar.json", "utf8"),
  );
  const showcaseOccurrences = manifest.occurrences.filter(
    ({ id, kind }) =>
      id.startsWith("date-picker-calendar-showcase-") &&
      kind === "executable-fixture",
  );

  assert.equal(showcaseOccurrences.length, 29);
  assert.ok(
    showcaseOccurrences.every(({ kind }) => kind === "executable-fixture"),
  );
});
