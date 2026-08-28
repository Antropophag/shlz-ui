import {
  isCalendarDateDisabled,
  type CalendarConstraints,
} from "./calendar-model.js";
import {
  formatLocalizedDate,
  isIsoDate,
  parseLocalizedDate,
  resolveDateLocale,
} from "./date-only.js";

export interface DateFieldControllerOptions extends CalendarConstraints {
  label: string;
  name?: string;
  value?: string;
  locale?: string;
  description?: string;
  error?: string;
  triggerLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

export interface DateFieldChangeDetail {
  value: string;
}

let nextDateFieldId = 0;

export class DateFieldController {
  readonly root: HTMLElement;
  readonly input: HTMLInputElement;
  readonly formInput: HTMLInputElement;
  readonly trigger: HTMLButtonElement;
  readonly locale: string;
  readonly constraints: CalendarConstraints;
  readonly initialValue: string;
  readonly #error: HTMLElement | null;
  readonly #abort = new AbortController();
  #value: string;

  constructor(root: HTMLElement, options: DateFieldControllerOptions) {
    const value = options.value ?? "";
    if (value && !isIsoDate(value))
      throw new TypeError(`${value} is not a valid ISO date`);
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
    if (value && isCalendarDateDisabled(value, this.constraints))
      throw new RangeError("Date Field initial value violates its constraints");
    this.initialValue = value;
    this.#value = value;

    const id = root.id || `shlz-date-field-${++nextDateFieldId}`;
    root.id = id;
    root.classList.add("shlz-date-field");
    root.replaceChildren();
    const document = root.ownerDocument;
    const label = document.createElement("label");
    label.className = "shlz-date-field__label";
    label.htmlFor = `${id}-input`;
    label.textContent = options.label;
    this.input = document.createElement("input");
    this.input.id = `${id}-input`;
    this.input.className = "shlz-date-field__input";
    this.input.type = "text";
    this.input.disabled = options.disabled ?? false;
    this.input.readOnly = options.readOnly ?? false;
    this.input.required = options.required ?? false;
    this.input.autocomplete = "off";
    this.input.setAttribute("aria-invalid", "false");
    this.input.defaultValue = value
      ? formatLocalizedDate(value, this.locale)
      : "";

    const describedBy: string[] = [];
    if (options.description) {
      const description = document.createElement("div");
      description.id = `${id}-description`;
      description.className = "shlz-date-field__description";
      description.textContent = options.description;
      describedBy.push(description.id);
      root.append(label, this.input, description);
    } else root.append(label, this.input);

    this.#error = options.error ? document.createElement("div") : null;
    if (this.#error) {
      this.#error.id = `${id}-error`;
      this.#error.className = "shlz-date-field__error";
      this.#error.textContent = options.error ?? "";
      this.#error.hidden = true;
      describedBy.push(this.#error.id);
      root.append(this.#error);
    }
    if (describedBy.length)
      this.input.setAttribute("aria-describedby", describedBy.join(" "));

    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "shlz-date-field__trigger";
    this.trigger.disabled = Boolean(options.disabled || options.readOnly);
    const defaultTriggerLabel = this.locale.toLowerCase().startsWith("ru")
      ? `Открыть календарь для поля «${options.label}»`
      : `Open calendar for “${options.label}”`;
    this.trigger.setAttribute(
      "aria-label",
      options.triggerLabel ?? defaultTriggerLabel,
    );
    root.append(this.trigger);

    this.formInput = document.createElement("input");
    this.formInput.type = "hidden";
    this.formInput.name = options.name ?? "";
    this.formInput.disabled = options.disabled ?? false;
    this.formInput.defaultValue = value;
    root.append(this.formInput);
    this.#showCommittedValue();
    this.#bind();
  }

  get value(): string {
    return this.#value;
  }

  setValue(value: string, { emit = false } = {}): void {
    if (value && !isIsoDate(value))
      throw new TypeError(`${value} is not a valid ISO date`);
    if (value && isCalendarDateDisabled(value, this.constraints))
      throw new RangeError("Date Field value violates its constraints");
    const changed = value !== this.#value;
    this.#value = value;
    this.formInput.value = value;
    this.#showCommittedValue();
    this.#setInvalid(false);
    if (emit && changed) this.#emitChange();
  }

  destroy(): void {
    this.#abort.abort();
    this.root.replaceChildren();
  }

  #showCommittedValue(): void {
    this.input.value = this.#value
      ? formatLocalizedDate(this.#value, this.locale)
      : "";
  }

  #setInvalid(invalid: boolean): void {
    this.input.setAttribute("aria-invalid", String(invalid));
    this.root.classList.toggle("shlz-date-field--invalid", invalid);
    if (this.#error) this.#error.hidden = !invalid;
  }

  #commitText(): void {
    const text = this.input.value;
    if (!text && !this.input.required) {
      this.setValue("", { emit: true });
      return;
    }
    const parsed = parseLocalizedDate(text, this.locale);
    if (!parsed || isCalendarDateDisabled(parsed, this.constraints)) {
      this.#setInvalid(true);
      return;
    }
    this.setValue(parsed, { emit: true });
  }

  #emitChange(): void {
    this.formInput.dispatchEvent(new Event("input", { bubbles: true }));
    this.formInput.dispatchEvent(new Event("change", { bubbles: true }));
    this.root.dispatchEvent(
      new CustomEvent<DateFieldChangeDetail>("shlz:date-field-change", {
        bubbles: true,
        detail: { value: this.#value },
      }),
    );
  }

  #bind(): void {
    const { signal } = this.#abort;
    this.input.addEventListener("change", () => this.#commitText(), { signal });
    this.input.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        this.#commitText();
      },
      { signal },
    );
    this.trigger.addEventListener(
      "click",
      () => {
        this.root.dispatchEvent(
          new CustomEvent("shlz:date-field-trigger", { bubbles: true }),
        );
      },
      { signal },
    );
    this.input.form?.addEventListener(
      "reset",
      () => {
        this.#value = this.initialValue;
        this.formInput.value = this.initialValue;
        this.#showCommittedValue();
        this.#setInvalid(false);
      },
      { signal },
    );
  }
}
