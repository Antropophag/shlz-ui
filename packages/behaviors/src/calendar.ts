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
  addMonths,
  compareIsoDates,
  getMonthMatrix,
  getWeekdayOrder,
  monthOfIsoDate,
  parseIsoDate,
  resolveDateLocale,
} from "./date-only.js";

export type CalendarControllerOptions = CreateCalendarOptions &
  CalendarConstraints & {
    focusedDate?: string;
    today?: string;
    locale?: string;
    label: string;
    monthCount?: 1 | 2;
  };

export interface CalendarChangeDetail {
  mode: CalendarState["mode"];
  value: CalendarState["value"];
  committed: boolean;
}

export interface CalendarConstraintMismatchDetail {
  mode: CalendarState["mode"];
  value: CalendarState["value"];
  mismatch: boolean;
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
  readonly monthCount: 1 | 2;
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
    this.monthCount = options.monthCount ?? 1;
    this.state = createCalendarState(options);
    this.focusedDate =
      options.focusedDate ??
      (this.state.mode === "single"
        ? this.state.value || undefined
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

  setConstraints(constraints: CalendarConstraints): void {
    this.constraints.min = constraints.min;
    this.constraints.max = constraints.max;
    this.constraints.isDateDisabled = constraints.isDateDisabled;
    this.render();
    this.root.dispatchEvent(
      new CustomEvent<CalendarConstraintMismatchDetail>(
        "shlz:calendar-constraint-mismatch",
        {
          bubbles: true,
          detail: {
            mode: this.state.mode,
            value: this.state.value,
            mismatch: this.#hasConstraintMismatch(),
          },
        },
      ),
    );
  }

  render({ focus = false } = {}): void {
    const document = this.root.ownerDocument;
    this.root.classList.add("shlz-calendar");
    this.root.classList.toggle(
      "shlz-calendar--two-months",
      this.monthCount === 2,
    );
    this.root.setAttribute("role", "region");
    this.root.setAttribute("aria-label", this.label);
    this.root.dataset.constraintMismatch = String(
      this.#hasConstraintMismatch(),
    );
    this.root.replaceChildren();

    const months = Array.from({ length: this.monthCount }, (_, index) =>
      addMonths(`${this.state.visibleMonth}-01`, index).slice(0, 7),
    );
    const monthCells = months.map((month) => {
      const parsedMonth = parseIsoDate(`${month}-01`);
      if (!parsedMonth)
        throw new TypeError("Calendar state contains an invalid visible month");
      return getMonthMatrix({ ...parsedMonth, firstDay: this.#firstDay() });
    });
    const enabled = monthCells
      .flat()
      .filter(({ date }) => !isCalendarDateDisabled(date, this.constraints));
    if (
      !months.includes(monthOfIsoDate(this.focusedDate)) ||
      !enabled.some(({ date }) => date === this.focusedDate)
    )
      this.focusedDate =
        monthCells[0]?.find(
          ({ date, inMonth }) =>
            inMonth && !isCalendarDateDisabled(date, this.constraints),
        )?.date ??
        enabled[0]?.date ??
        this.focusedDate;

    const monthsElement = document.createElement("div");
    monthsElement.className = "shlz-calendar__months";
    months.forEach((month, index) =>
      monthsElement.append(this.#month(month, monthCells[index] ?? [], index)),
    );
    this.root.append(monthsElement);
    if (focus)
      this.root
        .querySelector<HTMLButtonElement>(
          `button[data-date="${this.focusedDate}"]`,
        )
        ?.focus();
  }

  #month(
    month: string,
    cells: ReturnType<typeof getMonthMatrix>,
    index: number,
  ): HTMLElement {
    const document = this.root.ownerDocument;
    const panel = document.createElement("div");
    panel.className = "shlz-calendar__month";
    const headingId = `${this.root.id || "shlz-calendar"}-month-${index}`;
    const header = document.createElement("div");
    header.className = "shlz-calendar__header";
    header.append(
      index === 0
        ? this.#navigationButton("previous", "Предыдущий месяц", -1)
        : this.#navigationSpacer(),
    );
    const heading = document.createElement("h2");
    heading.id = headingId;
    heading.className = "shlz-calendar__title";
    heading.textContent = monthLabel(month, this.locale);
    header.append(heading);
    if (index === this.monthCount - 1) {
      header.append(this.#navigationButton("next", "Следующий месяц", 1));
    } else if (index === 0) {
      const narrowNext = this.#navigationButton("next", "Следующий месяц", 1);
      narrowNext.classList.add("shlz-calendar__navigation--narrow");
      header.append(narrowNext);
    } else {
      header.append(this.#navigationSpacer());
    }

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
    for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
      const row = document.createElement("div");
      row.setAttribute("role", "row");
      for (const cell of cells.slice(rowIndex * 7, rowIndex * 7 + 7))
        row.append(this.#dateCell(cell.date, cell.inMonth, month));
      grid.append(row);
    }
    panel.append(header, grid);
    return panel;
  }

  #navigationSpacer(): HTMLElement {
    const spacer = this.root.ownerDocument.createElement("span");
    spacer.className = "shlz-calendar__navigation-spacer";
    spacer.setAttribute("aria-hidden", "true");
    return spacer;
  }

  #firstDay(): number {
    return getWeekdayOrder(this.locale)[0] ?? 1;
  }

  #hasConstraintMismatch(): boolean {
    if (this.state.mode === "single")
      return Boolean(
        this.state.value &&
        isCalendarDateDisabled(this.state.value, this.constraints),
      );
    return Boolean(
      this.state.value &&
      (isCalendarDateDisabled(this.state.value.start, this.constraints) ||
        isCalendarDateDisabled(this.state.value.end, this.constraints)),
    );
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

  #dateCell(date: string, inMonth: boolean, month: string): HTMLElement {
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
    gridcell.setAttribute("aria-selected", String(selected));
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
    button.tabIndex =
      !disabled &&
      date === this.focusedDate &&
      (monthOfIsoDate(date) === month || this.monthCount === 1)
        ? 0
        : -1;
    button.setAttribute(
      "aria-label",
      [fullDateLabel(date, this.locale), stateLabel].filter(Boolean).join(", "),
    );
    button.dataset.selected = String(selected);
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
        this.state = {
          ...this.state,
          visibleMonth: monthOfIsoDate(this.focusedDate),
        };
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
