import {
  observeFloating,
  positionFloating,
  readFloatingPlacement,
  readNonNegativeNumber,
} from "./internal/floating.js";
import {
  claimActiveFloatingEscape,
  setActiveFloating,
} from "./internal/active-floating.js";

const controllers = new WeakMap<HTMLElement, TooltipController>();

function describedBy(
  trigger: HTMLElement,
  tooltipId: string,
  add: boolean,
): void {
  const ids = new Set(
    (trigger.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );
  if (add) ids.add(tooltipId);
  else ids.delete(tooltipId);
  if (ids.size) trigger.setAttribute("aria-describedby", [...ids].join(" "));
  else trigger.removeAttribute("aria-describedby");
}

export class TooltipController {
  readonly trigger: HTMLElement;
  readonly tooltip: HTMLElement;
  #abort = new AbortController();
  #positionCleanup?: () => void;
  #openTimer?: number;
  #closeTimer?: number;
  #focusWithin = false;
  #pointerWithin = false;
  #destroyed = false;

  constructor(trigger: HTMLElement) {
    const id = trigger.dataset.shlzTooltipTrigger;
    const tooltip = id ? trigger.ownerDocument.getElementById(id) : null;
    if (!id || !tooltip?.matches("[data-shlz-tooltip][role='tooltip']")) {
      throw new TypeError(
        "Tooltip requires [data-shlz-tooltip-trigger] identifying [data-shlz-tooltip][role=tooltip].",
      );
    }
    this.trigger = trigger;
    this.tooltip = tooltip;
    controllers.get(trigger)?.destroy();
    controllers.set(trigger, this);
    this.#initialize();
  }

  get openDelay(): number {
    return readNonNegativeNumber(
      this.trigger.dataset.shlzTooltipOpenDelay,
      400,
    );
  }
  get closeDelay(): number {
    return readNonNegativeNumber(
      this.trigger.dataset.shlzTooltipCloseDelay,
      100,
    );
  }
  get expanded(): boolean {
    return !this.tooltip.hidden;
  }

  open(): void {
    if (this.#destroyed || this.expanded) return;
    this.#clearTimers();
    describedBy(this.trigger, this.tooltip.id, true);
    this.tooltip.hidden = false;
    setActiveFloating(this.trigger.ownerDocument, this, true);
    this.#positionCleanup = observeFloating(
      this.trigger,
      this.tooltip,
      () => void this.updatePosition(),
    );
  }

  close(): void {
    if (!this.expanded) return;
    this.#clearTimers();
    this.#positionCleanup?.();
    this.#positionCleanup = undefined;
    this.tooltip.hidden = true;
    describedBy(this.trigger, this.tooltip.id, false);
    setActiveFloating(this.trigger.ownerDocument, this, false);
  }

  async updatePosition(): Promise<void> {
    if (this.#destroyed || !this.expanded) return;
    await positionFloating(this.trigger, this.tooltip, {
      placement: readFloatingPlacement(
        this.trigger.dataset.shlzTooltipPlacement,
        "top",
      ),
      offset: readNonNegativeNumber(this.trigger.dataset.shlzTooltipOffset, 8),
      arrow: this.tooltip.querySelector<HTMLElement>(".shlz-tooltip__arrow"),
    });
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.close();
    this.#clearTimers();
    setActiveFloating(this.trigger.ownerDocument, this, false);
    this.#destroyed = true;
    this.#abort.abort();
    if (controllers.get(this.trigger) === this)
      controllers.delete(this.trigger);
  }

  #scheduleOpen(): void {
    window.clearTimeout(this.#closeTimer);
    this.#openTimer = window.setTimeout(() => this.open(), this.openDelay);
  }

  #scheduleClose(): void {
    window.clearTimeout(this.#openTimer);
    if (this.#focusWithin || this.#pointerWithin) return;
    this.#closeTimer = window.setTimeout(() => this.close(), this.closeDelay);
  }

  #clearTimers(): void {
    window.clearTimeout(this.#openTimer);
    window.clearTimeout(this.#closeTimer);
  }

  #initialize(): void {
    const signal = this.#abort.signal;
    this.tooltip.hidden = true;
    describedBy(this.trigger, this.tooltip.id, false);
    this.trigger.addEventListener(
      "pointerenter",
      () => {
        this.#pointerWithin = true;
        this.#scheduleOpen();
      },
      { signal },
    );
    this.trigger.addEventListener(
      "pointerleave",
      () => {
        this.#pointerWithin = false;
        this.#scheduleClose();
      },
      { signal },
    );
    this.tooltip.addEventListener(
      "pointerenter",
      () => {
        this.#pointerWithin = true;
        this.#clearTimers();
      },
      { signal },
    );
    this.tooltip.addEventListener(
      "pointerleave",
      () => {
        this.#pointerWithin = false;
        this.#scheduleClose();
      },
      { signal },
    );
    this.trigger.addEventListener(
      "focus",
      () => {
        this.#focusWithin = true;
        this.#scheduleOpen();
      },
      { signal },
    );
    this.trigger.addEventListener(
      "blur",
      () => {
        this.#focusWithin = false;
        this.#scheduleClose();
      },
      { signal },
    );
    this.trigger.ownerDocument.addEventListener(
      "keydown",
      (event) => {
        if (
          this.expanded &&
          claimActiveFloatingEscape(this.trigger.ownerDocument, this, event)
        ) {
          event.preventDefault();
          this.close();
        }
      },
      { signal },
    );
  }
}

export function enhanceTooltips(
  scope: ParentNode = document,
): TooltipController[] {
  return [
    ...scope.querySelectorAll<HTMLElement>("[data-shlz-tooltip-trigger]"),
  ].map(
    (trigger) => controllers.get(trigger) ?? new TooltipController(trigger),
  );
}
