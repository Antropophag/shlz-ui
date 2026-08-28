import {
  type CalendarConstraints,
  type CalendarFocusCommand,
  type CalendarState,
  type CreateCalendarOptions,
  canNavigateCalendarMonth,
  createCalendarState,
  isCalendarDateDisabled,
  moveCalendarFocus,
  navigateCalendarMonth,
  selectCalendarDate,
} from "./calendar-model.js";
import {
  compareIsoDates,
  getMonthMatrix,
  getWeekdayOrder,
  parseIsoDate,
  resolveDateLocale,
} from "./date-only.js";

export type CalendarControllerOptions = CreateCalendarOptions &
  CalendarConstraints & {
    focusedDate?: string;
    today?: string;
    locale?: string;
    label: string;
  };

export interface CalendarChangeDetail {
  mode: CalendarState["mode"];
  value: CalendarState["value"];
  committed: boolean;
}

const focusCommands = new Set<CalendarFocusCommand>([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

function dateAtUtcNoon(value: string): Date {
  const date = parseIsoDate(value);
  if (!date) throw new TypeError(`${value} is not a valid ISO date`);
  const result = new Date(0);
  result.setUTCHours(12, 0, 0, 0);
  result.setUTCFullYear(date.year, date.month - 1, date.day);
  return result;
}

function monthLabel(month: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateAtUtcNoon(`${month}-01`));
}

function fullDateLabel(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateAtUtcNoon(date));
}

function weekdayLabel(
  isoWeekday: number,
  locale: string,
  width: "short" | "long",
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: width,
    timeZone: "UTC",
  }).format(
    dateAtUtcNoon(`2026-08-${String(2 + isoWeekday).padStart(2, "0")}`),
  );
}

function monthOf(date: string): string {
  return date.slice(0, 7);
}

function rangePosition(
  state: CalendarState,
  date: string,
): "start" | "middle" | "end" | null {
  if (state.mode !== "range") return null;
  if (state.provisionalStart === date) return "start";
  if (!state.value) return null;
  if (state.value.start === date) return "start";
  if (state.value.end === date) return "end";
  return compareIsoDates(date, state.value.start) > 0 &&
    compareIsoDates(date, state.value.end) < 0
    ? "middle"
    : null;
}

export class CalendarController {
  readonly root: HTMLElement;
  readonly locale: string;
  readonly constraints: CalendarConstraints;
  readonly label: string;
  readonly today?: string;
  state: CalendarState;
  focusedDate: string;

  readonly #abort = new AbortController();

  constructor(root: HTMLElement, options: CalendarControllerOptions) {
    this.root = root;
    this.locale = resolveDateLocale(
      options.locale,
      root.ownerDocument.documentElement.lang,
    );
    this.constraints = {
      min: options.min,
      max: options.max,
      isDateDisabled: options.isDateDisabled,
    };
    this.label = options.label;
    this.today = options.today;
    this.state = createCalendarState(options);
    this.focusedDate =
      options.focusedDate ??
      (this.state.mode === "single"
        ? this.state.value
        : this.state.value?.start) ??
      `${this.state.visibleMonth}-01`;
    if (isCalendarDateDisabled(this.focusedDate, this.constraints))
      this.focusedDate = moveCalendarFocus(
        this.focusedDate,
        "ArrowRight",
        this.constraints,
        this.#firstDay(),
      );
    this.#bind();
    this.render();
  }

  destroy(): void {
    this.#abort.abort();
    this.root.replaceChildren();
  }

  render({ focus = false } = {}): void {
    const document = this.root.ownerDocument;
    const parsedMonth = parseIsoDate(`${this.state.visibleMonth}-01`);
    if (!parsedMonth)
      throw new TypeError("Calendar state contains an invalid visible month");
    const headingId = `${this.root.id || "shlz-calendar"}-month`;
    this.root.classList.add("shlz-calendar");
    this.root.setAttribute("role", "region");
    this.root.setAttribute("aria-label", this.label);
    this.root.replaceChildren();

    const header = document.createElement("div");
    header.className = "shlz-calendar__header";
    const previous = this.#navigationButton("previous", "Предыдущий месяц", -1);
    const heading = document.createElement("h2");
    heading.id = headingId;
    heading.className = "shlz-calendar__title";
    heading.textContent = monthLabel(this.state.visibleMonth, this.locale);
    const next = this.#navigationButton("next", "Следующий месяц", 1);
    header.append(previous, heading, next);

    const grid = document.createElement("div");
    grid.className = "shlz-calendar__grid";
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-labelledby", headingId);
    const weekdayRow = document.createElement("div");
    weekdayRow.className = "shlz-calendar__weekdays";
    weekdayRow.setAttribute("role", "row");
    for (const weekday of getWeekdayOrder(this.locale)) {
      const headerCell = document.createElement("div");
      headerCell.setAttribute("role", "columnheader");
      headerCell.setAttribute(
        "aria-label",
        weekdayLabel(weekday, this.locale, "long"),
      );
      headerCell.textContent = weekdayLabel(weekday, this.locale, "short");
      weekdayRow.append(headerCell);
    }
    grid.append(weekdayRow);

    const cells = getMonthMatrix({
      ...parsedMonth,
      firstDay: this.#firstDay(),
    });
    const enabled = cells.filter(
      ({ date }) => !isCalendarDateDisabled(date, this.constraints),
    );
    if (!enabled.some(({ date }) => date === this.focusedDate))
      this.focusedDate =
        enabled.find(({ inMonth }) => inMonth)?.date ??
        enabled[0]?.date ??
        this.focusedDate;
    for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
      const row = document.createElement("div");
      row.setAttribute("role", "row");
      for (const cell of cells.slice(rowIndex * 7, rowIndex * 7 + 7))
        row.append(this.#dateCell(cell.date, cell.inMonth));
      grid.append(row);
    }
    this.root.append(header, grid);
    if (focus)
      this.root
        .querySelector<HTMLButtonElement>(
          `button[data-date="${this.focusedDate}"]`,
        )
        ?.focus();
  }

  #firstDay(): number {
    return getWeekdayOrder(this.locale)[0] ?? 1;
  }

  #navigationButton(
    kind: string,
    label: string,
    amount: -1 | 1,
  ): HTMLButtonElement {
    const button = this.root.ownerDocument.createElement("button");
    button.type = "button";
    button.className = `shlz-calendar__navigation shlz-calendar__navigation--${kind}`;
    button.dataset.monthDelta = String(amount);
    button.setAttribute("aria-label", label);
    button.disabled = !canNavigateCalendarMonth(
      this.state,
      amount,
      this.constraints,
    );
    return button;
  }

  #dateCell(date: string, inMonth: boolean): HTMLElement {
    const document = this.root.ownerDocument;
    const gridcell = document.createElement("div");
    gridcell.setAttribute("role", "gridcell");
    const button = document.createElement("button");
    const disabled = isCalendarDateDisabled(date, this.constraints);
    const position = rangePosition(this.state, date);
    const selected =
      this.state.mode === "single"
        ? this.state.value === date
        : position !== null;
    const stateLabel =
      position === "start"
        ? "начало диапазона"
        : position === "middle"
          ? "в диапазоне"
          : position === "end"
            ? "конец диапазона"
            : null;
    button.type = "button";
    button.className = "shlz-calendar__day";
    button.dataset.date = date;
    button.dataset.inMonth = String(inMonth);
    button.disabled = disabled;
    button.tabIndex = !disabled && date === this.focusedDate ? 0 : -1;
    button.setAttribute(
      "aria-label",
      [fullDateLabel(date, this.locale), stateLabel].filter(Boolean).join(", "),
    );
    button.setAttribute("aria-selected", String(selected));
    if (date === this.today) button.setAttribute("aria-current", "date");
    if (position) {
      button.dataset.rangePosition = position;
      button.dataset.inRange = "true";
    }
    button.textContent = String(parseIsoDate(date)?.day);
    gridcell.append(button);
    return gridcell;
  }

  #bind(): void {
    const { signal } = this.#abort;
    this.root.addEventListener(
      "click",
      (event) => {
        const target =
          event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>("button")
            : null;
        if (!target || !this.root.contains(target)) return;
        const delta = Number(target.dataset.monthDelta);
        if (delta === -1 || delta === 1) {
          this.state = navigateCalendarMonth(
            this.state,
            delta,
            this.constraints,
          );
          this.focusedDate = `${this.state.visibleMonth}-01`;
          this.render();
          return;
        }
        if (target.dataset.date) this.#select(target.dataset.date);
      },
      { signal },
    );
    this.root.addEventListener(
      "keydown",
      (event) => {
        const target =
          event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>("button[data-date]")
            : null;
        if (!target || !this.root.contains(target)) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.#select(target.dataset.date ?? "");
          return;
        }
        if (!focusCommands.has(event.key as CalendarFocusCommand)) return;
        event.preventDefault();
        this.focusedDate = moveCalendarFocus(
          target.dataset.date ?? this.focusedDate,
          event.key as CalendarFocusCommand,
          this.constraints,
          this.#firstDay(),
        );
        this.state = { ...this.state, visibleMonth: monthOf(this.focusedDate) };
        this.render({ focus: true });
      },
      { signal },
    );
  }

  #select(date: string): void {
    const result = selectCalendarDate(this.state, date, this.constraints);
    if (result.rejected) return;
    this.state = result.state;
    this.focusedDate = date;
    this.render({ focus: true });
    this.root.dispatchEvent(
      new CustomEvent<CalendarChangeDetail>("shlz:calendar-change", {
        bubbles: true,
        detail: {
          mode: this.state.mode,
          value: this.state.value,
          committed: result.committed,
        },
      }),
    );
  }
}
