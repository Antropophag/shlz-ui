import { CalendarController, type CalendarChangeDetail } from "./calendar.js";
import {
  createCalendarState,
  type CalendarConstraints,
  type DateRange,
} from "./calendar-model.js";
import {
  DateFieldController,
  type DateFieldChangeDetail,
} from "./date-field.js";
import { compareIsoDates } from "./date-only.js";
import { PopoverController } from "./popover.js";

interface DatePickerOptionsBase extends CalendarConstraints {
  label: string;
  calendarLabel: string;
  locale?: string;
  size?: "large" | "medium";
  visibleMonth?: string;
  monthCount?: 1 | 2;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export type DatePickerControllerOptions =
  | (DatePickerOptionsBase & {
      mode: "single";
      name?: string;
      value?: string;
    })
  | (DatePickerOptionsBase & {
      mode: "range";
      endLabel: string;
      startName?: string;
      endName?: string;
      value?: DateRange | null;
    });

export interface DatePickerChangeDetail {
  mode: "single" | "range";
  value: string | DateRange | null;
}

let nextDatePickerId = 0;

export class DatePickerController {
  readonly root: HTMLElement;
  readonly field: DateFieldController;
  readonly endField: DateFieldController | null;
  readonly calendar: CalendarController;
  readonly popover: PopoverController;
  readonly surface: HTMLElement;

  readonly #options: DatePickerControllerOptions;
  readonly #initialValue: string | DateRange | null;
  readonly #abort = new AbortController();
  #committedValue: string | DateRange | null;

  constructor(root: HTMLElement, options: DatePickerControllerOptions) {
    this.root = root;
    this.#options = options;
    this.#initialValue = cloneValue(
      options.value ?? (options.mode === "single" ? "" : null),
    );
    this.#committedValue = cloneValue(this.#initialValue);

    const id = root.id || `shlz-date-picker-${++nextDatePickerId}`;
    root.id = id;
    root.classList.add("shlz-date-picker", `shlz-date-picker--${options.mode}`);
    root.replaceChildren();

    const document = root.ownerDocument;
    const fields = document.createElement("div");
    fields.className = "shlz-date-picker__fields";
    const startRoot = document.createElement("div");
    fields.append(startRoot);
    root.append(fields);

    const commonFieldOptions = {
      locale: options.locale,
      size: options.size,
      min: options.min,
      max: options.max,
      isDateDisabled: options.isDateDisabled,
      disabled: options.disabled,
      readOnly: options.readOnly,
      required: options.required,
    };
    this.field = new DateFieldController(startRoot, {
      ...commonFieldOptions,
      label: options.label,
      name: options.mode === "single" ? options.name : options.startName,
      value: options.mode === "single" ? options.value : options.value?.start,
    });

    if (options.mode === "range") {
      const endRoot = document.createElement("div");
      fields.append(endRoot);
      this.endField = new DateFieldController(endRoot, {
        ...commonFieldOptions,
        label: options.endLabel,
        name: options.endName,
        value: options.value?.end,
      });
      // The range is one composite picker; its leading field owns the shared trigger.
      this.endField.trigger.hidden = true;
    } else this.endField = null;

    this.surface = document.createElement("div");
    this.surface.id = `${id}-popover`;
    this.surface.className = "shlz-popover shlz-date-picker__popover";
    this.surface.dataset.shlzPopover = "";
    const calendarRoot = document.createElement("div");
    calendarRoot.id = `${id}-calendar`;
    this.surface.append(calendarRoot);
    root.append(this.surface);

    this.calendar = new CalendarController(calendarRoot, {
      mode: options.mode,
      value: cloneValue(options.value) as never,
      visibleMonth: options.visibleMonth,
      locale: options.locale,
      label: options.calendarLabel,
      monthCount: options.monthCount,
      min: options.min,
      max: options.max,
      isDateDisabled: options.isDateDisabled,
    });
    this.field.trigger.dataset.shlzPopoverTrigger = this.surface.id;
    this.popover = new PopoverController(this.field.trigger);
    this.#bind();
  }

  setDisabled(disabled: boolean): void {
    if (disabled) {
      this.popover.close();
      this.#restoreCommittedCalendar();
    }
    for (const field of [this.field, this.endField]) {
      if (!field) continue;
      field.input.disabled = disabled;
      field.formInput.disabled = disabled;
      field.trigger.disabled = disabled || field.input.readOnly;
    }
    this.root.classList.toggle("shlz-date-picker--disabled", disabled);
  }

  setConstraints(constraints: CalendarConstraints): void {
    for (const target of [this.field.constraints, this.endField?.constraints]) {
      if (!target) continue;
      target.min = constraints.min;
      target.max = constraints.max;
      target.isDateDisabled = constraints.isDateDisabled;
    }
    this.calendar.setConstraints(constraints);
  }

  destroy(): void {
    this.#abort.abort();
    this.popover.destroy();
    this.calendar.destroy();
    this.field.destroy();
    this.endField?.destroy();
    this.root.replaceChildren();
  }

  #bind(): void {
    const { signal } = this.#abort;
    this.root.addEventListener(
      "shlz:date-field-trigger",
      () => {
        if (!this.popover.expanded) this.#restoreCommittedCalendar();
        setTimeout(() => {
          if (this.popover.expanded) this.calendar.render({ focus: true });
        }, 0);
      },
      { signal },
    );
    this.calendar.root.addEventListener(
      "shlz:calendar-change",
      (event) =>
        this.#handleCalendarChange(event as CustomEvent<CalendarChangeDetail>),
      { signal },
    );
    this.field.root.addEventListener(
      "shlz:date-field-change",
      (event) =>
        this.#handleFieldChange(
          "start",
          event as CustomEvent<DateFieldChangeDetail>,
        ),
      { signal },
    );
    this.endField?.root.addEventListener(
      "shlz:date-field-change",
      (event) =>
        this.#handleFieldChange(
          "end",
          event as CustomEvent<DateFieldChangeDetail>,
        ),
      { signal },
    );
    this.field.input.form?.addEventListener(
      "reset",
      () => {
        this.popover.close();
        this.#committedValue = cloneValue(this.#initialValue);
        queueMicrotask(() => this.#restoreCommittedCalendar());
      },
      { signal },
    );
  }

  #handleCalendarChange(event: CustomEvent<CalendarChangeDetail>): void {
    if (!event.detail.committed) return;
    this.#committedValue = cloneValue(event.detail.value);
    if (event.detail.mode === "single") {
      this.field.setValue(event.detail.value as string, { emit: true });
    } else {
      const value = event.detail.value as DateRange;
      this.field.setValue(value.start, { emit: true });
      this.endField?.setValue(value.end, { emit: true });
    }
    this.popover.close({ restoreFocus: true });
    this.#emitChange();
  }

  #handleFieldChange(
    endpoint: "start" | "end",
    event: CustomEvent<DateFieldChangeDetail>,
  ): void {
    if (this.#options.mode === "single") {
      this.#committedValue = event.detail.value;
      this.#restoreCommittedCalendar();
      this.#emitChange();
      return;
    }
    const start = endpoint === "start" ? event.detail.value : this.field.value;
    const end =
      endpoint === "end" ? event.detail.value : (this.endField?.value ?? "");
    this.#committedValue =
      start && end
        ? compareIsoDates(start, end) <= 0
          ? { start, end }
          : { start: end, end: start }
        : null;
    if (this.#committedValue) {
      this.field.setValue(this.#committedValue.start);
      this.endField?.setValue(this.#committedValue.end);
      this.#restoreCommittedCalendar();
    }
    this.#emitChange();
  }

  #restoreCommittedCalendar(): void {
    const visibleMonth =
      typeof this.#committedValue === "string"
        ? this.#committedValue.slice(0, 7) || this.calendar.state.visibleMonth
        : (this.#committedValue?.start.slice(0, 7) ??
          this.calendar.state.visibleMonth);
    this.calendar.state = createCalendarState({
      mode: this.#options.mode,
      value: cloneValue(this.#committedValue) as never,
      visibleMonth,
    });
    this.calendar.focusedDate =
      typeof this.#committedValue === "string"
        ? this.#committedValue || `${visibleMonth}-01`
        : (this.#committedValue?.start ?? `${visibleMonth}-01`);
    this.calendar.render();
  }

  #emitChange(): void {
    this.root.dispatchEvent(
      new CustomEvent<DatePickerChangeDetail>("shlz:date-picker-change", {
        bubbles: true,
        detail: {
          mode: this.#options.mode,
          value: cloneValue(this.#committedValue),
        },
      }),
    );
  }
}

function cloneValue<T extends string | DateRange | null | undefined>(
  value: T,
): T {
  return (value && typeof value === "object" ? { ...value } : value) as T;
}
