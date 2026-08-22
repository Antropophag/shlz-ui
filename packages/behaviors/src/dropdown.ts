import { listenForOutsidePointer } from "./internal/dismissal.js";
import {
  claimActiveFloatingEscape,
  setActiveFloating,
} from "./internal/active-floating.js";

const itemSelector = '[role="menuitem"]';
const controllers = new WeakMap<HTMLElement, DropdownController>();

function isAvailable(item: HTMLElement): boolean {
  return !(
    item.matches(":disabled") || item.getAttribute("aria-disabled") === "true"
  );
}

export class DropdownController {
  readonly root: HTMLElement;
  readonly trigger: HTMLButtonElement;
  readonly menu: HTMLElement;

  #abortController = new AbortController();
  #destroyed = false;

  constructor(root: HTMLElement) {
    const trigger = root.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="menu"][aria-controls]',
    );
    const menuId = trigger?.getAttribute("aria-controls");
    const menu = menuId ? document.getElementById(menuId) : null;

    if (!trigger || !menu || !root.contains(menu)) {
      throw new TypeError(
        "Dropdown requires a button[aria-haspopup=menu][aria-controls] and a contained menu with the matching id.",
      );
    }

    this.root = root;
    this.trigger = trigger;
    this.menu = menu;
    controllers.get(root)?.destroy();
    controllers.set(root, this);
    this.#initialize();
  }

  get expanded(): boolean {
    return this.trigger.getAttribute("aria-expanded") === "true";
  }

  open(focus: "first" | "last" | false = false): void {
    if (this.#destroyed || this.trigger.disabled) return;
    this.trigger.setAttribute("aria-expanded", "true");
    this.menu.hidden = false;
    setActiveFloating(this.trigger.ownerDocument, this, true);
    if (focus) {
      const items = this.#items();
      items[focus === "first" ? 0 : items.length - 1]?.focus();
    }
  }

  close({ restoreFocus = false } = {}): void {
    if (this.#destroyed) return;
    this.trigger.setAttribute("aria-expanded", "false");
    this.menu.hidden = true;
    setActiveFloating(this.trigger.ownerDocument, this, false);
    if (restoreFocus) this.trigger.focus();
  }

  toggle(): void {
    if (this.#destroyed) return;
    if (this.expanded) this.close();
    else this.open();
  }

  destroy(): void {
    if (this.#destroyed || controllers.get(this.root) !== this) return;
    this.close();
    this.#destroyed = true;
    this.#abortController.abort();
    controllers.delete(this.root);
  }

  #initialize(): void {
    const { signal } = this.#abortController;
    this.trigger.setAttribute("aria-expanded", "false");
    this.menu.hidden = true;
    for (const item of this.menu.querySelectorAll<HTMLElement>(itemSelector)) {
      item.tabIndex = -1;
    }

    this.trigger.addEventListener(
      "click",
      (event) => {
        if (this.expanded) this.close();
        else this.open(event.detail === 0 ? "first" : false);
      },
      { signal },
    );
    this.trigger.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          this.open(event.key === "ArrowDown" ? "first" : "last");
        } else if (
          this.expanded &&
          claimActiveFloatingEscape(this.trigger.ownerDocument, this, event)
        ) {
          event.preventDefault();
          event.stopPropagation();
          this.close({ restoreFocus: true });
        }
      },
      { signal },
    );
    this.menu.addEventListener(
      "keydown",
      (event) => this.#onMenuKeydown(event),
      {
        signal,
      },
    );
    this.menu.addEventListener(
      "click",
      (event) => {
        const target = (event.target as Element).closest<HTMLElement>(
          itemSelector,
        );
        if (target && isAvailable(target)) this.close({ restoreFocus: true });
      },
      { signal },
    );
    listenForOutsidePointer(
      [this.root],
      () => {
        if (this.expanded) this.close();
      },
      signal,
    );
  }

  #items(): HTMLElement[] {
    return [...this.menu.querySelectorAll<HTMLElement>(itemSelector)].filter(
      isAvailable,
    );
  }

  #onMenuKeydown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      this.close();
      return;
    }
    if (claimActiveFloatingEscape(this.trigger.ownerDocument, this, event)) {
      event.preventDefault();
      event.stopPropagation();
      this.close({ restoreFocus: true });
      return;
    }

    const items = this.#items();
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (current + 1) % items.length;
    if (event.key === "ArrowUp")
      next = (current - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next === undefined || items.length === 0) return;
    event.preventDefault();
    items[next]?.focus();
  }
}

export function enhanceDropdowns(
  scope: ParentNode = document,
): DropdownController[] {
  return [...scope.querySelectorAll<HTMLElement>("[data-shlz-dropdown]")].map(
    (root) => controllers.get(root) ?? new DropdownController(root),
  );
}
