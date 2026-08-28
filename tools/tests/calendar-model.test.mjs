import assert from "node:assert/strict";
import test from "node:test";

import {
  canNavigateCalendarMonth,
  createCalendarState,
  getCalendarConstraintMismatch,
  moveCalendarFocus,
  navigateCalendarMonth,
  selectCalendarDate,
} from "../../packages/behaviors/dist/calendar-model.js";

test("single selection commits one enabled date", () => {
  const initial = createCalendarState({ mode: "single", value: "2026-08-10" });
  const result = selectCalendarDate(initial, "2026-08-28");
  assert.equal(result.committed, true);
  assert.equal(result.state.value, "2026-08-28");
  assert.equal(result.state.visibleMonth, "2026-08");
});

test("range selection remains provisional until an ordered second endpoint commits", () => {
  const initial = createCalendarState({ mode: "range", value: { start: "2026-08-10", end: "2026-08-12" } });
  const replacement = selectCalendarDate(initial, "2026-08-28");
  assert.equal(replacement.committed, false);
  assert.deepEqual(replacement.state.value, { start: "2026-08-10", end: "2026-08-12" });
  assert.equal(replacement.state.provisionalStart, "2026-08-28");

  const ordered = selectCalendarDate(replacement.state, "2026-08-20");
  assert.equal(ordered.committed, true);
  assert.deepEqual(ordered.state.value, { start: "2026-08-20", end: "2026-08-28" });
  assert.equal(ordered.state.provisionalStart, null);
});

test("min, max, and disabled dates prevent selection without mutating state", () => {
  const state = createCalendarState({ mode: "single", value: "2026-08-15" });
  const constraints = {
    min: "2026-08-10",
    max: "2026-08-20",
    isDateDisabled: (date) => date === "2026-08-16",
  };
  for (const date of ["2026-08-09", "2026-08-16", "2026-08-21"]) {
    const result = selectCalendarDate(state, date, constraints);
    assert.equal(result.committed, false, date);
    assert.equal(result.rejected, true, date);
    assert.deepEqual(result.state, state, date);
  }
  assert.equal(selectCalendarDate(state, "2026-08-20", constraints).state.value, "2026-08-20");
});

test("month navigation is bounded when the target month has no selectable date", () => {
  const state = createCalendarState({ mode: "single", value: "", visibleMonth: "2026-08" });
  assert.equal(canNavigateCalendarMonth(state, -1, { min: "2026-08-01" }), false);
  assert.equal(canNavigateCalendarMonth(state, 1, { max: "2026-08-31" }), false);
  assert.deepEqual(navigateCalendarMonth(state, -1, { min: "2026-08-01" }), state);
  assert.equal(navigateCalendarMonth(state, 1, { max: "2026-10-31" }).visibleMonth, "2026-09");

  const allSeptemberDisabled = { isDateDisabled: (date) => date.startsWith("2026-09-") };
  assert.equal(canNavigateCalendarMonth(state, 1, allSeptemberDisabled), false);
});

test("dynamic constraints report mismatch without replacing committed consumer data", () => {
  const single = createCalendarState({ mode: "single", value: "2026-08-28" });
  assert.equal(getCalendarConstraintMismatch(single, { max: "2026-08-20" }), true);
  assert.equal(single.value, "2026-08-28");

  const range = createCalendarState({ mode: "range", value: { start: "2026-08-10", end: "2026-08-20" } });
  assert.equal(getCalendarConstraintMismatch(range, { isDateDisabled: (date) => date === "2026-08-20" }), true);
  assert.deepEqual(range.value, { start: "2026-08-10", end: "2026-08-20" });
});

test("invalid initial ranges and values fail at the public model boundary", () => {
  assert.throws(() => createCalendarState({ mode: "single", value: "2026-02-30" }), /valid ISO date/i);
  assert.throws(() => createCalendarState({ mode: "range", value: { start: "2026-08-20", end: "2026-08-10" } }), /ordered range/i);
});

test("arrow focus moves by days and weeks, crosses months, and skips disabled dates", () => {
  assert.equal(moveCalendarFocus("2026-08-31", "ArrowRight"), "2026-09-01");
  assert.equal(moveCalendarFocus("2026-08-10", "ArrowDown"), "2026-08-17");
  assert.equal(moveCalendarFocus("2026-08-10", "ArrowUp"), "2026-08-03");
  assert.equal(moveCalendarFocus("2026-08-28", "ArrowRight", { isDateDisabled: (date) => date === "2026-08-29" }), "2026-08-30");
});

test("Home and End use the active locale week and skip unavailable boundary dates", () => {
  assert.equal(moveCalendarFocus("2026-08-28", "Home", {}, 1), "2026-08-24");
  assert.equal(moveCalendarFocus("2026-08-28", "End", {}, 1), "2026-08-30");
  assert.equal(moveCalendarFocus("2026-08-28", "Home", { isDateDisabled: (date) => date === "2026-08-24" }, 1), "2026-08-25");
  assert.equal(moveCalendarFocus("2026-08-28", "Home", {}, 7), "2026-08-23");
});

test("Page navigation clamps the day and skips disabled targets", () => {
  assert.equal(moveCalendarFocus("2026-01-31", "PageDown"), "2026-02-28");
  assert.equal(moveCalendarFocus("2024-03-31", "PageUp"), "2024-02-29");
  assert.equal(moveCalendarFocus("2026-01-31", "PageDown", { isDateDisabled: (date) => date === "2026-02-28" }), "2026-03-01");
});

test("focus remains stable at bounds and when no enabled destination is discoverable", () => {
  assert.equal(moveCalendarFocus("2026-08-28", "ArrowRight", { max: "2026-08-28" }), "2026-08-28");
  assert.equal(moveCalendarFocus("2026-08-28", "ArrowRight", { isDateDisabled: () => true }), "2026-08-28");
});
