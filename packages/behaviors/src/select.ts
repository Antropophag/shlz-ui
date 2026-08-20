import { listenForOutsidePointer } from "./internal/dismissal.js";

const optionSelector = '[role="option"]';
const controllers = new WeakMap<HTMLElement, SelectController>();

export class SelectController {
  readonly root: HTMLElement;
  readonly trigger: HTMLButtonElement;
  readonly listbox: HTMLElement;
  readonly input: HTMLInputElement;

  #abortController = new AbortController();

  constructor(root: HTMLElement) {
    const trigger = root.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="listbox"][aria-controls]',
    );
    const listboxId = trigger?.getAttribute("aria-controls");
    const listbox = listboxId ? document.getElementById(listboxId) : null;
    const input = root.querySelector<HTMLInputElement>('input[type="hidden"]');
    if (!trigger || !listbox || !input || !root.contains(listbox))
      throw new TypeError(
        "Select requires a listbox trigger, its contained listbox, and a hidden form input.",
      );
    this.root = root;
    this.trigger = trigger;
    this.listbox = listbox;
    this.input = input;
    this.#initialize();
  }

  get expanded(): boolean {
    return this.trigger.getAttribute("aria-expanded") === "true";
  }

  open(focusSelected = false): void {
    if (this.trigger.disabled) return;
    this.trigger.setAttribute("aria-expanded", "true");
    this.listbox.hidden = false;
    if (focusSelected) (this.#selected() ?? this.#options()[0])?.focus();
  }

  close({ restoreFocus = false } = {}): void {
    this.trigger.setAttribute("aria-expanded", "false");
    this.listbox.hidden = true;
    if (restoreFocus) this.trigger.focus();
  }

  destroy(): void {
    this.#abortController.abort();
    controllers.delete(this.root);
  }

  setValue(value: string, { emit = false } = {}): void {
    const options = [
      ...this.listbox.querySelectorAll<HTMLElement>(optionSelector),
    ];
    const selected = options.find((option) => option.dataset.value === value);
    for (const option of options)
      option.setAttribute("aria-selected", String(option === selected));
    this.input.value = value;
    this.trigger.classList.toggle(
      "shlz-select__trigger--selected",
      Boolean(value),
    );
    const valueNode = this.trigger.querySelector<HTMLElement>(
      "[data-shlz-select-value]",
    );
    if (valueNode)
      valueNode.textContent =
        selected?.textContent?.trim() ?? valueNode.dataset.placeholder ?? "";
    if (emit) {
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
      this.input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  #initialize(): void {
    const { signal } = this.#abortController;
    this.close();
    for (const option of this.#options()) option.tabIndex = -1;
    this.trigger.addEventListener(
      "click",
      () => (this.expanded ? this.close() : this.open(false)),
      { signal },
    );
    this.trigger.addEventListener(
      "keydown",
      (event) => {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
          event.preventDefault();
          this.open(true);
        }
      },
      { signal },
    );
    this.listbox.addEventListener(
      "click",
      (event) => {
        const option = (event.target as Element).closest<HTMLElement>(
          optionSelector,
        );
        if (option && !option.matches('[aria-disabled="true"]'))
          this.#select(option);
      },
      { signal },
    );
    this.listbox.addEventListener(
      "keydown",
      (event) => this.#onKeydown(event),
      {
        signal,
      },
    );
    listenForOutsidePointer(
      [this.root],
      () => {
        if (this.expanded) this.close();
      },
      signal,
    );
  }

  #options(): HTMLElement[] {
    return [
      ...this.listbox.querySelectorAll<HTMLElement>(optionSelector),
    ].filter((option) => option.getAttribute("aria-disabled") !== "true");
  }

  #selected(): HTMLElement | null {
    return this.listbox.querySelector<HTMLElement>(
      `${optionSelector}[aria-selected="true"]`,
    );
  }

  #select(option: HTMLElement): void {
    const value = option.dataset.value ?? option.textContent?.trim() ?? "";
    this.setValue(value, { emit: true });
    this.close({ restoreFocus: true });
  }

  #onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      this.close({ restoreFocus: event.key === "Escape" });
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const active = document.activeElement as HTMLElement;
      if (active.matches(optionSelector)) {
        event.preventDefault();
        this.#select(active);
      }
      return;
    }
    const options = this.#options();
    const current = options.indexOf(document.activeElement as HTMLElement);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (current + 1) % options.length;
    if (event.key === "ArrowUp")
      next = (current - 1 + options.length) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (next === undefined || options.length === 0) return;
    event.preventDefault();
    options[next]?.focus();
  }
}

export function enhanceSelects(
  scope: ParentNode = document,
): SelectController[] {
  return [...scope.querySelectorAll<HTMLElement>("[data-shlz-select]")].map(
    (root) => {
      const existing = controllers.get(root);
      if (existing) return existing;
      const controller = new SelectController(root);
      controllers.set(root, controller);
      return controller;
    },
  );
}
