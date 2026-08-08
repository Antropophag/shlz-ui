function tabsIn(tablist: HTMLElement): HTMLElement[] {
  return [...tablist.querySelectorAll<HTMLElement>(":scope > [role='tab']")];
}

export class TabsController {
  readonly root: HTMLElement;
  readonly tablist: HTMLElement;
  #abort = new AbortController();
  #destroyed = false;

  constructor(root: HTMLElement) {
    const tablist = root.querySelector<HTMLElement>(
      ":scope > [role='tablist']",
    );
    if (!tablist || tabsIn(tablist).length === 0)
      throw new TypeError(
        "Tabs requires a direct [role=tablist] with [role=tab] children.",
      );
    this.root = root;
    this.tablist = tablist;
    this.#initialize();
  }

  activate(tab: HTMLElement, { focus = false } = {}): void {
    if (
      this.#destroyed ||
      tab.getAttribute("aria-disabled") === "true" ||
      (tab as HTMLButtonElement).disabled
    )
      return;
    for (const candidate of tabsIn(this.tablist)) {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panelId = candidate.getAttribute("aria-controls");
      const panel = panelId
        ? this.root.querySelector<HTMLElement>(`#${CSS.escape(panelId)}`)
        : null;
      if (panel?.getAttribute("role") === "tabpanel") panel.hidden = !selected;
    }
    if (focus) tab.focus();
  }

  destroy(): void {
    if (!this.#destroyed) {
      this.#destroyed = true;
      this.#abort.abort();
    }
  }

  #initialize(): void {
    const tabs = tabsIn(this.tablist);
    const initial =
      tabs.find(
        (tab) =>
          tab.getAttribute("aria-selected") === "true" &&
          tab.getAttribute("aria-disabled") !== "true",
      ) ?? tabs.find((tab) => tab.getAttribute("aria-disabled") !== "true");
    if (initial) this.activate(initial);
    this.tablist.addEventListener(
      "click",
      (event) => {
        const tab =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>("[role='tab']")
            : null;
        if (tab && this.tablist.contains(tab)) this.activate(tab);
      },
      { signal: this.#abort.signal },
    );
    this.tablist.addEventListener(
      "keydown",
      (event) => {
        const enabled = tabsIn(this.tablist).filter(
          (tab) =>
            tab.getAttribute("aria-disabled") !== "true" &&
            !(tab as HTMLButtonElement).disabled,
        );
        const current =
          event.target instanceof HTMLElement
            ? enabled.indexOf(event.target)
            : -1;
        if (
          current < 0 ||
          !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
        )
          return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? enabled[0]
            : event.key === "End"
              ? enabled.at(-1)
              : enabled[
                  (current +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    enabled.length) %
                    enabled.length
                ];
        if (next) this.activate(next, { focus: true });
      },
      { signal: this.#abort.signal },
    );
  }
}

export function enhanceTabs(scope: ParentNode = document): TabsController[] {
  return [...scope.querySelectorAll<HTMLElement>("[data-shlz-tabs]")].map(
    (root) => new TabsController(root),
  );
}
