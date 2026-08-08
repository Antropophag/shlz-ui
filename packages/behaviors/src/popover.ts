import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from "@floating-ui/dom";

import { listenForOutsidePointer } from "./internal/dismissal.js";

const supportedPlacements = new Set<Placement>([
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
]);

const oppositeSide = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
} as const;

function readPlacement(trigger: HTMLButtonElement): Placement {
  const value = trigger.dataset.shlzPopoverPlacement as Placement | undefined;
  return value && supportedPlacements.has(value) ? value : "bottom";
}

function readOffset(trigger: HTMLButtonElement): number {
  const value = Number(trigger.dataset.shlzPopoverOffset ?? 8);
  return Number.isFinite(value) && value >= 0 ? value : 8;
}

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
    this.#initialize();
  }

  get expanded(): boolean {
    return this.trigger.getAttribute("aria-expanded") === "true";
  }

  open(): void {
    if (this.#destroyed || this.trigger.disabled || this.expanded) return;
    this.trigger.setAttribute("aria-expanded", "true");
    this.popover.hidden = false;
    this.#cleanupPositioning = autoUpdate(
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
    const { x, y, placement, strategy, middlewareData } = await computePosition(
      this.trigger,
      this.popover,
      {
        placement: readPlacement(this.trigger),
        strategy: "fixed",
        middleware: [
          offset(readOffset(this.trigger)),
          flip({ padding: 8 }),
          shift({ padding: 8 }),
          arrowElement && arrow({ element: arrowElement, padding: 12 }),
        ],
      },
    );

    Object.assign(this.popover.style, {
      left: `${x}px`,
      top: `${y}px`,
      position: strategy,
    });
    this.popover.dataset.placement = placement;

    if (arrowElement) {
      const side = placement.split("-")[0] as keyof typeof oppositeSide;
      const arrowData = middlewareData.arrow;
      Object.assign(arrowElement.style, {
        left: arrowData?.x == null ? "" : `${arrowData.x}px`,
        top: arrowData?.y == null ? "" : `${arrowData.y}px`,
        right: "",
        bottom: "",
        [oppositeSide[side]]: "-5px",
      });
    }
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.close();
    this.#destroyed = true;
    this.#abortController.abort();
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
        if (event.key === "Escape" && this.expanded) {
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
  ].map((trigger) => new PopoverController(trigger));
}
