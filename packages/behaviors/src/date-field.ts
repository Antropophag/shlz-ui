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
  size?: "large" | "medium";
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
    const size = options.size ?? "large";
    root.classList.add("shlz-date-field", `shlz-date-field--${size}`);
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

    const control = document.createElement("div");
    control.className = "shlz-date-field__control";

    const describedBy: string[] = [];
    if (options.description) {
      const description = document.createElement("div");
      description.id = `${id}-description`;
      description.className = "shlz-date-field__description";
      description.textContent = options.description;
      describedBy.push(description.id);
      root.append(label, control, description);
    } else root.append(label, control);

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
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.classList.add("shlz-date-field__icon");
    icon.setAttribute("viewBox", "320.426 693 24 24");
    icon.setAttribute("aria-hidden", "true");
    for (const pathData of [
      "M323.66 702.664C323.66 702.25 323.995 701.914 324.41 701.914H340.451C340.865 701.914 341.201 702.25 341.201 702.664C341.201 703.078 340.865 703.414 340.451 703.414H324.41C323.995 703.414 323.66 703.078 323.66 702.664Z",
      "M336.065 695.25C336.479 695.25 336.815 695.586 336.815 696V698.962C336.815 699.376 336.479 699.712 336.065 699.712C335.65 699.712 335.315 699.376 335.315 698.962V696C335.315 695.586 335.65 695.25 336.065 695.25ZM328.794 695.25C329.208 695.25 329.544 695.586 329.544 696V698.962C329.544 699.376 329.208 699.712 328.794 699.712C328.38 699.712 328.044 699.376 328.044 698.962V696C328.044 695.586 328.38 695.25 328.794 695.25Z",
      "M324.965 697.953C325.884 697.079 327.163 696.672 328.62 696.672H336.24C337.7 696.672 338.98 697.079 339.898 697.953C340.821 698.833 341.28 700.094 341.276 701.601V709.814C341.276 711.321 340.815 712.583 339.892 713.465C338.973 714.341 337.694 714.75 336.233 714.75H328.62C327.159 714.75 325.878 714.332 324.96 713.442C324.038 712.549 323.576 711.272 323.576 709.746V701.6C323.576 700.092 324.04 698.832 324.965 697.953ZM325.998 699.04C325.437 699.573 325.076 700.402 325.076 701.6V709.746C325.076 710.968 325.44 711.818 326.004 712.365C326.572 712.916 327.438 713.25 328.62 713.25H336.233C337.423 713.25 338.29 712.92 338.856 712.38C339.416 711.844 339.776 711.013 339.776 709.814V701.6C339.78 700.399 339.422 699.571 338.863 699.039C338.299 698.501 337.432 698.172 336.24 698.172H328.62C327.433 698.172 326.565 698.501 325.998 699.04Z",
    ]) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "currentColor");
      icon.append(path);
    }
    this.trigger.append(icon);
    control.append(this.input, this.trigger);

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
    this.input.setCustomValidity(
      invalid ? this.#error?.textContent || "Invalid date" : "",
    );
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
