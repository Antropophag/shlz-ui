import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Showcase owns a public-API-only Date Picker form consumer", async () => {
  const [consumer, main, manifest] = await Promise.all([
    readFile("apps/showcase/src/date-picker-consumer.js", "utf8"),
    readFile("apps/showcase/src/main.js", "utf8"),
    readFile("docs/component-audits/date-picker-calendar.json", "utf8").then(
      JSON.parse,
    ),
  ]);

  assert.match(consumer, /from ["']@shlz\/behaviors\/date-picker["']/);
  assert.doesNotMatch(consumer, /packages\/|\.\.\/\.\.\//);
  assert.match(consumer, /<form/);
  assert.match(consumer, /new (?:globalThis\.)?FormData/);
  assert.match(consumer, /DatePickerController/);
  assert.match(main, /datePickerConsumerMarkup/);
  assert.match(main, /enhanceDatePickerConsumer/);
  assert.deepEqual(
    manifest.occurrences.find(
      ({ id }) => id === "date-picker-calendar-showcase-form-consumer",
    ),
    {
      id: "date-picker-calendar-showcase-form-consumer",
      kind: "live-consumer",
    },
  );
});
