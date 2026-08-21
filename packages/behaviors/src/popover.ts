import { listenForOutsidePointer } from "./internal/dismissal.js";
import {
  observeFloating,
  positionFloating,
  readFloatingPlacement,
  readNonNegativeNumber,
} from "./internal/floating.js";
import {
  isActiveFloating,
  setActiveFloating,
} from "./internal/active-floating.js";

const controllers = new WeakMap<HTMLButtonElement, PopoverController>();

export class PopoverController {
  readonly trigger: HTMLButtonElement;
  readonly popover: HTMLElement;

  #abortController = new AbortController();
  #cleanupPositioning?: () => void;
  #destroyed = false;

  constructor(trigger: HTMLButtonElement) {
    const popoverId = trigger.dataset.shlzPopoverTrigger;
    const popover = popoverId
      ? trigger.ownerDocument.getElementById(popoverId)
      : null;

    if (!popoverId || !popover?.matches("[data-shlz-popover]")) {
      throw new TypeError(
        "Popover requires a button[data-shlz-popover-trigger] whose value identifies a [data-shlz-popover] element.",
      );
    }
    const controlledId = trigger.getAttribute("aria-controls");
    if (controlledId && controlledId !== popoverId) {
      throw new TypeError(
        "Popover trigger aria-controls must match data-shlz-popover-trigger.",
      );
    }

    this.trigger = trigger;
    this.popover = popover as HTMLElement;
    controllers.get(trigger)?.destroy();
    controllers.set(trigger, this);
    this.#initialize();
  }

  get expanded(): boolean {
    return this.trigger.getAttribute("aria-expanded") === "true";
  }

  open(): void {
    if (this.#destroyed || this.trigger.disabled || this.expanded) return;
    this.trigger.setAttribute("aria-expanded", "true");
    this.popover.hidden = false;
    setActiveFloating(this.trigger.ownerDocument, this, true);
    this.#cleanupPositioning = observeFloating(
      this.trigger,
      this.popover,
      () => void this.updatePosition(),
    );
  }

  close({ restoreFocus = false } = {}): void {
    if (!this.expanded) return;
    this.#cleanupPositioning?.();
    this.#cleanupPositioning = undefined;
    this.trigger.setAttribute("aria-expanded", "false");
    this.popover.hidden = true;
    setActiveFloating(this.trigger.ownerDocument, this, false);
    if (restoreFocus) this.trigger.focus();
  }

  toggle(): void {
    if (this.expanded) this.close();
    else this.open();
  }

  async updatePosition(): Promise<void> {
    if (this.#destroyed || !this.expanded) return;
    const arrowElement = this.popover.querySelector<HTMLElement>(
      ".shlz-popover__arrow",
    );
    await positionFloating(this.trigger, this.popover, {
      placement: readFloatingPlacement(
        this.trigger.dataset.shlzPopoverPlacement,
        "bottom",
      ),
      offset: readNonNegativeNumber(this.trigger.dataset.shlzPopoverOffset, 8),
      arrow: arrowElement,
      arrowPadding: 12,
    });
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.close();
    this.#destroyed = true;
    this.#abortController.abort();
    if (controllers.get(this.trigger) === this)
      controllers.delete(this.trigger);
  }

  #initialize(): void {
    const { signal } = this.#abortController;
    this.trigger.setAttribute("aria-controls", this.popover.id);
    this.trigger.setAttribute("aria-expanded", "false");
    this.popover.hidden = true;

    this.trigger.addEventListener("click", () => this.toggle(), { signal });
    this.popover.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest("[data-shlz-popover-close]")
        ) {
          this.close({ restoreFocus: true });
        }
      },
      { signal },
    );
    this.trigger.ownerDocument.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          this.expanded &&
          isActiveFloating(this.trigger.ownerDocument, this)
        ) {
          event.preventDefault();
          this.close({ restoreFocus: true });
        }
      },
      { signal },
    );
    listenForOutsidePointer(
      [this.trigger, this.popover],
      () => {
        if (this.expanded) this.close();
      },
      signal,
    );
  }
}

export function enhancePopovers(
  scope: ParentNode = document,
): PopoverController[] {
  return [
    ...scope.querySelectorAll<HTMLButtonElement>(
      "button[data-shlz-popover-trigger]",
    ),
  ].map(
    (trigger) => controllers.get(trigger) ?? new PopoverController(trigger),
  );
}
