import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import {
  addDays,
  addMonths,
  compareIsoDates,
  getMonthMatrix,
  formatLocalizedDate,
  getLocalizedDatePattern,
  getWeekdayOrder,
  isIsoDate,
  parseIsoDate,
  parseLocalizedDate,
  resolveDateLocale,
} from "../../packages/behaviors/src/date-only.ts";

test("strict ISO validation accepts only real proleptic Gregorian dates", () => {
  for (const value of ["2024-02-29", "2026-08-28", "0001-01-01", "9999-12-31"])
    assert.equal(isIsoDate(value), true, value);

  for (const value of [
    "",
    "2023-02-29",
    "2024-02-30",
    "2026-00-10",
    "2026-13-10",
    "2026-8-28",
    "28-08-2026",
    "2026-08-28T00:00:00Z",
    "0000-01-01",
    "10000-01-01",
  ])
    assert.equal(isIsoDate(value), false, value);

  assert.deepEqual(parseIsoDate("2024-02-29"), {
    year: 2024,
    month: 2,
    day: 29,
  });
  assert.equal(parseIsoDate("2023-02-29"), null);
});

test("ISO comparison is chronological and rejects invalid operands", () => {
  assert.equal(compareIsoDates("2026-08-28", "2026-08-28"), 0);
  assert.equal(compareIsoDates("2025-12-31", "2026-01-01"), -1);
  assert.equal(compareIsoDates("2026-09-01", "2026-08-31"), 1);
  assert.throws(
    () => compareIsoDates("2026-02-30", "2026-03-01"),
    /valid ISO date/i,
  );
});

test("day and month arithmetic crosses boundaries without overflow", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2024-02-28", 2), "2024-03-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2023-01-31", 1), "2023-02-28");
  assert.equal(addMonths("2024-03-31", -1), "2024-02-29");
  assert.throws(() => addDays("9999-12-31", 1), /supported date range/i);
});

test("month matrix is a stable six-week grid aligned to locale week order", () => {
  const monday = getMonthMatrix({ year: 2026, month: 8, firstDay: 1 });
  assert.equal(monday.length, 42);
  assert.deepEqual(monday[0], { date: "2026-07-27", inMonth: false });
  assert.deepEqual(monday[5], { date: "2026-08-01", inMonth: true });
  assert.deepEqual(monday.at(-1), { date: "2026-09-06", inMonth: false });

  const sunday = getMonthMatrix({ year: 2026, month: 8, firstDay: 7 });
  assert.equal(sunday[0].date, "2026-07-26");
  assert.equal(sunday[6].date, "2026-08-01");
  assert.deepEqual(getWeekdayOrder("ru-RU"), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(getWeekdayOrder("en-US"), [7, 1, 2, 3, 4, 5, 6]);
});

test("date-only arithmetic is invariant across process timezones", () => {
  const moduleUrl = new globalThis.URL(
    "../../packages/behaviors/src/date-only.ts",
    import.meta.url,
  ).href;
  const script = `import { addDays, addMonths, getMonthMatrix } from ${JSON.stringify(moduleUrl)}; console.log(JSON.stringify([addDays("2026-03-29", 1), addMonths("2026-03-31", 1), getMonthMatrix({year: 2026, month: 3, firstDay: 1})[0].date]));`;
  const run = (TZ) =>
    execFileSync(process.execPath, ["--input-type=module", "--eval", script], {
      encoding: "utf8",
      env: { ...process.env, TZ },
    }).trim();
  assert.equal(run("UTC"), run("Europe/Moscow"));
  assert.equal(run("UTC"), run("America/Los_Angeles"));
});

test("Intl display parts produce an exact numeric pattern for the active locale", () => {
  assert.equal(resolveDateLocale("ru-RU", "en-US"), "ru-RU");
  assert.equal(resolveDateLocale(undefined, "en-US"), "en-US");
  assert.deepEqual(getLocalizedDatePattern("ru-RU"), [
    { type: "day", value: "2-digit" },
    { type: "literal", value: "." },
    { type: "month", value: "2-digit" },
    { type: "literal", value: "." },
    { type: "year", value: "numeric" },
  ]);
  assert.equal(formatLocalizedDate("2026-08-28", "ru-RU"), "28.08.2026");
  assert.equal(formatLocalizedDate("2026-08-28", "en-US"), "08/28/2026");
});

test("localized parsing accepts only the complete active display pattern", () => {
  assert.equal(parseLocalizedDate("28.08.2026", "ru-RU"), "2026-08-28");
  assert.equal(parseLocalizedDate("08/28/2026", "en-US"), "2026-08-28");

  for (const value of [
    "28.8.2026",
    "28/08/2026",
    "08/28/2026",
    "28.08.26",
    "28.08.",
    "31.02.2026",
  ])
    assert.equal(parseLocalizedDate(value, "ru-RU"), null, value);
  for (const value of [
    "8/28/2026",
    "28/08/2026",
    "08.28.2026",
    "02/30/2026",
    "08/28/",
  ])
    assert.equal(parseLocalizedDate(value, "en-US"), null, value);
});

test("unsupported numbering systems fail explicitly instead of misparsing", () => {
  assert.throws(
    () => getLocalizedDatePattern("ar-EG"),
    /Latin decimal digits/i,
  );
  assert.throws(
    () => parseLocalizedDate("٢٨‏/٠٨‏/٢٠٢٦", "ar-EG"),
    /Latin decimal digits/i,
  );
});
