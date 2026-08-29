import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Calendar Grid publishes semantic styles and framework-neutral documentation", async () => {
  const [css, fixture, docs, exports] = await Promise.all([
    readFile("packages/styles/components/calendar-grid.css", "utf8"),
    readFile("tools/fixtures/calendar-grid.html", "utf8"),
    readFile("docs/components/calendar-grid.md", "utf8"),
    readFile("packages/behaviors/package.json", "utf8"),
  ]);
  assert.match(css, /position: sticky/);
  assert.match(css, /overflow: auto/);
  assert.match(css, /data-shlz-calendar-grid-unavailable/);
  assert.match(fixture, /<table aria-label=/);
  assert.match(fixture, /<th scope="row"/);
  assert.match(
    fixture,
    /data-shlz-calendar-grid-header-row="temporal"[^]*scope="colgroup"[^]*>Past<[^]*colspan="1"[^]*>Today<[^]*colspan="3"[^]*>Future</,
  );
  assert.match(
    fixture,
    /data-shlz-calendar-grid-header-row="dates"[^]*<th[^]*scope="col"[^]*28 Aug[^]*Friday/,
  );
  assert.doesNotMatch(fixture, /Past · Friday|Future · Tuesday/);
  assert.match(
    fixture,
    /headers="row-design calendar-group-today date-2026-08-29"/,
  );
  assert.match(
    fixture,
    /data-shlz-calendar-grid-state="today"[^]*data-shlz-calendar-grid-unavailable="weekend"/,
  );
  assert.match(docs, /Consumers own row, date, and item identities/);
  assert.match(exports, /\.\/calendar-grid/);
});

test("Calendar Grid source authority retains its attested hash", async () => {
  const { createHash } = await import("node:crypto");
  const source = await readFile("shlz-design-source/raw/svg/Calendar.svg");
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    "da5c97cd453930458634ec3317452dced33b8de41c418d744bf253ed75af8714",
  );
});

test("generated distribution contains the Calendar Grid runtime styles", async () => {
  const bundle = await readFile("packages/styles/dist/shlz.css", "utf8");
  assert.match(bundle, /\.shlz-calendar-grid/);
  assert.match(bundle, /position: sticky/);
});
