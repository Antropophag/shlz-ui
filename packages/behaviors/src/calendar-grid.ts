export type CalendarGridDisclosureKind = "row" | "cell";

export interface CalendarGridDisclosureDetail {
  kind: CalendarGridDisclosureKind;
  id: string;
  expanded: boolean;
}

const controllers = new WeakMap<HTMLElement, CalendarGridController>();

function buttons(root: HTMLElement): HTMLButtonElement[] {
  return [
    ...root.querySelectorAll<HTMLButtonElement>(
      "button[data-shlz-calendar-grid-disclosure]",
    ),
  ];
}

function relationship(root: HTMLElement, button: HTMLButtonElement) {
  const kind = button.dataset.shlzCalendarGridDisclosure;
  const id = button.getAttribute("aria-controls");
  if ((kind !== "row" && kind !== "cell") || !id)
    throw new TypeError(
      "Calendar Grid disclosure requires row or cell kind and aria-controls.",
    );
  const tree = root.getRootNode() as ParentNode;
  const targets = root.querySelectorAll<HTMLElement>(`#${CSS.escape(id)}`);
  if (
    targets.length !== 1 ||
    tree.querySelectorAll(`#${CSS.escape(id)}`).length !== 1
  )
    throw new TypeError(
      `Calendar Grid relationship ${id} must be globally unique and root-scoped.`,
    );
  return { kind, id, target: targets[0] } as const;
}

export class CalendarGridController {
  readonly root: HTMLElement;
  #abort = new AbortController();
  #destroyed = false;

  constructor(root: HTMLElement) {
    if (!root.matches("[data-shlz-calendar-grid]"))
      throw new TypeError(
        "Calendar Grid requires a [data-shlz-calendar-grid] root.",
      );
    for (const button of buttons(root)) relationship(root, button);
    this.root = root;
    controllers.get(root)?.destroy();
    controllers.set(root, this);
    root.addEventListener(
      "click",
      (event) => {
        const button =
          event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>(
                "button[data-shlz-calendar-grid-disclosure]",
              )
            : null;
        if (!button || !root.contains(button)) return;
        const { kind, id } = relationship(root, button);
        this.#set(kind, id, button.getAttribute("aria-expanded") !== "true");
      },
      { signal: this.#abort.signal },
    );
  }

  setRowExpanded(id: string, expanded: boolean): void {
    this.#set("row", id, expanded);
  }
  setCellExpanded(id: string, expanded: boolean): void {
    this.#set("cell", id, expanded);
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#abort.abort();
    if (controllers.get(this.root) === this) controllers.delete(this.root);
  }

  #set(kind: CalendarGridDisclosureKind, id: string, expanded: boolean): void {
    if (this.#destroyed) return;
    const button = buttons(this.root).find((candidate) => {
      const relation = relationship(this.root, candidate);
      return relation.kind === kind && relation.id === id;
    });
    if (!button)
      throw new TypeError(
        `Calendar Grid ${kind} disclosure ${id} is not owned by this root.`,
      );
    const { target } = relationship(this.root, button);
    button.setAttribute("aria-expanded", String(expanded));
    target.hidden = !expanded;
    this.root.dispatchEvent(
      new CustomEvent<CalendarGridDisclosureDetail>(
        "shlz:calendar-grid-disclosure",
        {
          bubbles: true,
          detail: { kind, id, expanded },
        },
      ),
    );
  }
}

export function enhanceCalendarGrids(
  scope: ParentNode = document,
): CalendarGridController[] {
  return [
    ...scope.querySelectorAll<HTMLElement>("[data-shlz-calendar-grid]"),
  ].map((root) => controllers.get(root) ?? new CalendarGridController(root));
}
