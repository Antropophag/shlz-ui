import {
  addDays,
  addMonths,
  compareIsoDates,
  daysInMonth,
  getIsoWeekday,
  isIsoDate,
  monthOfIsoDate,
  parseIsoDate,
  positiveModulo,
} from "./date-only.js";

export interface DateRange {
  start: string;
  end: string;
}

export interface CalendarConstraints {
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
}

interface CalendarStateBase {
  visibleMonth: string;
}

export interface SingleCalendarState extends CalendarStateBase {
  mode: "single";
  value: string;
  provisionalStart: null;
}

export interface RangeCalendarState extends CalendarStateBase {
  mode: "range";
  value: DateRange | null;
  provisionalStart: string | null;
}

export type CalendarState = SingleCalendarState | RangeCalendarState;

export type CreateCalendarOptions =
  | { mode: "single"; value?: string; visibleMonth?: string }
  | { mode: "range"; value?: DateRange | null; visibleMonth?: string };

export interface CalendarSelectionResult {
  state: CalendarState;
  committed: boolean;
  rejected: boolean;
}

const MONTH = /^(\d{4})-(\d{2})$/;

function requireDate(value: string): void {
  if (!isIsoDate(value))
    throw new TypeError(`${value} is not a valid ISO date`);
}

function requireMonth(value: string): void {
  const match = MONTH.exec(value);
  if (
    !match ||
    Number(match[1]) < 1 ||
    Number(match[1]) > 9999 ||
    Number(match[2]) < 1 ||
    Number(match[2]) > 12
  )
    throw new TypeError(`${value} is not a valid ISO month`);
}

function currentMonth(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
  }).formatToParts();
  const year = parts.find(({ type }) => type === "year")?.value;
  const month = parts.find(({ type }) => type === "month")?.value;
  return `${year}-${month}`;
}

export function createCalendarState(
  options: CreateCalendarOptions,
): CalendarState {
  if (options.mode === "single") {
    const value = options.value ?? "";
    if (value) requireDate(value);
    const visibleMonth =
      options.visibleMonth ?? (value ? monthOfIsoDate(value) : currentMonth());
    requireMonth(visibleMonth);
    return { mode: "single", value, provisionalStart: null, visibleMonth };
  }

  const value = options.value ?? null;
  if (value) {
    requireDate(value.start);
    requireDate(value.end);
    if (compareIsoDates(value.start, value.end) > 0)
      throw new RangeError("Calendar value must be an ordered range");
  }
  const visibleMonth =
    options.visibleMonth ??
    (value ? monthOfIsoDate(value.start) : currentMonth());
  requireMonth(visibleMonth);
  return { mode: "range", value, provisionalStart: null, visibleMonth };
}

export function isCalendarDateDisabled(
  date: string,
  constraints: CalendarConstraints = {},
): boolean {
  requireDate(date);
  if (constraints.min) {
    requireDate(constraints.min);
    if (compareIsoDates(date, constraints.min) < 0) return true;
  }
  if (constraints.max) {
    requireDate(constraints.max);
    if (compareIsoDates(date, constraints.max) > 0) return true;
  }
  return constraints.isDateDisabled?.(date) ?? false;
}

export function selectCalendarDate(
  state: CalendarState,
  date: string,
  constraints: CalendarConstraints = {},
): CalendarSelectionResult {
  requireDate(date);
  if (isCalendarDateDisabled(date, constraints))
    return { state, committed: false, rejected: true };

  if (state.mode === "single")
    return {
      state: { ...state, value: date, visibleMonth: monthOfIsoDate(date) },
      committed: true,
      rejected: false,
    };

  if (!state.provisionalStart)
    return {
      state: {
        ...state,
        provisionalStart: date,
        visibleMonth: monthOfIsoDate(date),
      },
      committed: false,
      rejected: false,
    };

  const [start, end] =
    compareIsoDates(state.provisionalStart, date) <= 0
      ? [state.provisionalStart, date]
      : [date, state.provisionalStart];
  return {
    state: {
      ...state,
      value: { start, end },
      provisionalStart: null,
      visibleMonth: monthOfIsoDate(date),
    },
    committed: true,
    rejected: false,
  };
}

function targetMonth(visibleMonth: string, amount: number): string {
  return monthOfIsoDate(addMonths(`${visibleMonth}-01`, amount));
}

export function canNavigateCalendarMonth(
  state: CalendarState,
  amount: number,
  constraints: CalendarConstraints = {},
): boolean {
  if (!Number.isInteger(amount) || amount === 0) return false;
  let month: string;
  try {
    month = targetMonth(state.visibleMonth, amount);
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
  const parsed = parseIsoDate(`${month}-01`);
  if (!parsed) return false;
  const count = daysInMonth(parsed.year, parsed.month);
  let date = `${month}-01`;
  for (let day = 1; day <= count; day += 1) {
    if (!isCalendarDateDisabled(date, constraints)) return true;
    if (day < count) date = addDays(date, 1);
  }
  return false;
}

export function navigateCalendarMonth(
  state: CalendarState,
  amount: number,
  constraints: CalendarConstraints = {},
): CalendarState {
  return canNavigateCalendarMonth(state, amount, constraints)
    ? { ...state, visibleMonth: targetMonth(state.visibleMonth, amount) }
    : state;
}

export function getCalendarConstraintMismatch(
  state: CalendarState,
  constraints: CalendarConstraints = {},
): boolean {
  if (state.mode === "single")
    return (
      state.value !== "" && isCalendarDateDisabled(state.value, constraints)
    );
  return (
    state.value !== null &&
    (isCalendarDateDisabled(state.value.start, constraints) ||
      isCalendarDateDisabled(state.value.end, constraints))
  );
}

export type CalendarFocusCommand =
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown";

function findEnabledDate(
  target: string,
  direction: -1 | 1,
  constraints: CalendarConstraints,
  maximumSteps = 3660,
): string | null {
  let candidate = target;
  for (let step = 0; step <= maximumSteps; step += 1) {
    if (!isCalendarDateDisabled(candidate, constraints)) return candidate;
    try {
      candidate = addDays(candidate, direction);
    } catch (error) {
      if (error instanceof RangeError) return null;
      throw error;
    }
  }
  return null;
}

export function moveCalendarFocus(
  current: string,
  command: CalendarFocusCommand,
  constraints: CalendarConstraints = {},
  firstDay = 1,
): string {
  requireDate(current);
  if (!Number.isInteger(firstDay) || firstDay < 1 || firstDay > 7)
    throw new RangeError("First day must be an ISO weekday from 1 to 7");

  let target: string;
  let direction: -1 | 1;
  let maximumSteps = 3660;
  try {
    switch (command) {
      case "ArrowLeft":
        target = addDays(current, -1);
        direction = -1;
        break;
      case "ArrowRight":
        target = addDays(current, 1);
        direction = 1;
        break;
      case "ArrowUp":
        target = addDays(current, -7);
        direction = -1;
        break;
      case "ArrowDown":
        target = addDays(current, 7);
        direction = 1;
        break;
      case "PageUp":
        target = addMonths(current, -1);
        direction = -1;
        break;
      case "PageDown":
        target = addMonths(current, 1);
        direction = 1;
        break;
      case "Home": {
        const offset = positiveModulo(getIsoWeekday(current) - firstDay, 7);
        target = addDays(current, -offset);
        direction = 1;
        maximumSteps = 6;
        break;
      }
      case "End": {
        const offset = positiveModulo(firstDay + 6 - getIsoWeekday(current), 7);
        target = addDays(current, offset);
        direction = -1;
        maximumSteps = 6;
        break;
      }
    }
  } catch (error) {
    if (error instanceof RangeError) return current;
    throw error;
  }
  return (
    findEnabledDate(target, direction, constraints, maximumSteps) ?? current
  );
}
