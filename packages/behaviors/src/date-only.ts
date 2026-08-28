export interface PlainDate {
  year: number;
  month: number;
  day: number;
}

export interface MonthCell {
  date: string;
  inMonth: boolean;
}

export interface MonthMatrixOptions {
  year: number;
  month: number;
  /** ISO weekday: Monday is 1 and Sunday is 7. */
  firstDay: number;
}

export type LocalizedDatePatternPart =
  | { type: "day" | "month"; value: "2-digit" }
  | { type: "year"; value: "numeric" }
  | { type: "literal"; value: string };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

const modulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR)
    throw new RangeError("Year is outside the supported date range");
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new RangeError("Month must be between 1 and 12");
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseIsoDate(value: string): PlainDate | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (date.year < MIN_YEAR || date.year > MAX_YEAR || date.month < 1 || date.month > 12)
    return null;
  return date.day >= 1 && date.day <= daysInMonth(date.year, date.month) ? date : null;
}

export function isIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

function requireIsoDate(value: string): PlainDate {
  const date = parseIsoDate(value);
  if (!date) throw new TypeError(`${value} is not a valid ISO date`);
  return date;
}

function formatIsoDate({ year, month, day }: PlainDate): string {
  if (year < MIN_YEAR || year > MAX_YEAR)
    throw new RangeError("Result is outside the supported date range");
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Days relative to 1970-01-01, calculated without Date or timezone state. */
function toEpochDay({ year, month, day }: PlainDate): number {
  let adjustedYear = year;
  if (month <= 2) adjustedYear -= 1;
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const monthPrime = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * monthPrime + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

function fromEpochDay(epochDay: number): PlainDate {
  const shifted = epochDay + 719468;
  const era = Math.floor(shifted / 146097);
  const dayOfEra = shifted - era * 146097;
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
  let year = yearOfEra + era * 400;
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPrime = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthPrime + 2) / 5) + 1;
  const month = monthPrime + (monthPrime < 10 ? 3 : -9);
  if (month <= 2) year += 1;
  return { year, month, day };
}

export function compareIsoDates(left: string, right: string): -1 | 0 | 1 {
  const leftDay = toEpochDay(requireIsoDate(left));
  const rightDay = toEpochDay(requireIsoDate(right));
  return leftDay === rightDay ? 0 : leftDay < rightDay ? -1 : 1;
}

export function addDays(value: string, amount: number): string {
  if (!Number.isInteger(amount)) throw new TypeError("Day amount must be an integer");
  return formatIsoDate(fromEpochDay(toEpochDay(requireIsoDate(value)) + amount));
}

export function addMonths(value: string, amount: number): string {
  if (!Number.isInteger(amount)) throw new TypeError("Month amount must be an integer");
  const date = requireIsoDate(value);
  const monthIndex = date.year * 12 + date.month - 1 + amount;
  const year = Math.floor(monthIndex / 12);
  const month = modulo(monthIndex, 12) + 1;
  if (year < MIN_YEAR || year > MAX_YEAR)
    throw new RangeError("Result is outside the supported date range");
  return formatIsoDate({ year, month, day: Math.min(date.day, daysInMonth(year, month)) });
}

function isoWeekday(value: string): number {
  return modulo(toEpochDay(requireIsoDate(value)) + 3, 7) + 1;
}

export function getMonthMatrix({ year, month, firstDay }: MonthMatrixOptions): MonthCell[] {
  if (!Number.isInteger(firstDay) || firstDay < 1 || firstDay > 7)
    throw new RangeError("First day must be an ISO weekday from 1 to 7");
  const first = formatIsoDate({ year, month, day: 1 });
  const leadingDays = modulo(isoWeekday(first) - firstDay, 7);
  const start = addDays(first, -leadingDays);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    return { date, inMonth: parseIsoDate(date)?.month === month };
  });
}

export function getWeekdayOrder(locale: string): number[] {
  const resolved = new Intl.Locale(locale);
  const weekInfo = (resolved as Intl.Locale & { weekInfo?: { firstDay: number } }).weekInfo;
  const firstDay = weekInfo?.firstDay ?? 1;
  return Array.from({ length: 7 }, (_, index) => modulo(firstDay - 1 + index, 7) + 1);
}

export function resolveDateLocale(requested?: string, documentLanguage?: string): string {
  const candidate = requested?.trim() || documentLanguage?.trim() || "en";
  return new Intl.DateTimeFormat(candidate).resolvedOptions().locale;
}

function numericDateFormatter(locale: string): Intl.DateTimeFormat {
  const localeInfo = new Intl.Locale(locale);
  if (localeInfo.numberingSystem && localeInfo.numberingSystem !== "latn")
    throw new RangeError(`Date input supports Latin decimal digits; ${localeInfo.numberingSystem} is not supported`);
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
  if (formatter.resolvedOptions().numberingSystem !== "latn")
    throw new RangeError("Date input supports only Latin decimal digits");
  return formatter;
}

function utcDate({ year, month, day }: PlainDate): Date {
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, month - 1, day);
  return value;
}

export function getLocalizedDatePattern(locale: string): LocalizedDatePatternPart[] {
  const parts = numericDateFormatter(locale).formatToParts(utcDate({ year: 2006, month: 11, day: 22 }));
  return parts.map((part) => {
    if (part.type === "day" || part.type === "month")
      return { type: part.type, value: "2-digit" };
    if (part.type === "year") return { type: "year", value: "numeric" };
    if (part.type === "literal") return { type: "literal", value: part.value };
    throw new RangeError(`Unsupported date format part: ${part.type}`);
  });
}

export function formatLocalizedDate(value: string, locale: string): string {
  return numericDateFormatter(locale).format(utcDate(requireIsoDate(value)));
}

const escapeRegularExpression = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function parseLocalizedDate(value: string, locale: string): string | null {
  const pattern = getLocalizedDatePattern(locale);
  const fields: Array<"day" | "month" | "year"> = [];
  const expression = pattern.map((part) => {
    if (part.type === "literal") return escapeRegularExpression(part.value);
    fields.push(part.type);
    return part.type === "year" ? "(\\d{4})" : "(\\d{2})";
  }).join("");
  const match = new RegExp(`^${expression}$`, "u").exec(value);
  if (!match) return null;
  const values: Partial<Record<"day" | "month" | "year", number>> = {};
  fields.forEach((field, index) => { values[field] = Number(match[index + 1]); });
  const iso = `${String(values.year).padStart(4, "0")}-${String(values.month).padStart(2, "0")}-${String(values.day).padStart(2, "0")}`;
  return isIsoDate(iso) ? iso : null;
}
