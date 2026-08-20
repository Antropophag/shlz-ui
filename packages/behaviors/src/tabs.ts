function tabsIn(tablist: HTMLElement): HTMLElement[] {
  return [...tablist.querySelectorAll<HTMLElement>(":scope > [role='tab']")];
}

const controllers = new WeakMap<HTMLElement, TabsController>();

function isDisabled(tab: HTMLElement): boolean {
  return (
    tab.getAttribute("aria-disabled") === "true" ||
    (tab as HTMLButtonElement).disabled
  );
}

function validateRelationships(root: HTMLElement, tablist: HTMLElement): void {
  const tabs = tabsIn(tablist);
  for (const tab of tabs) {
    const tabId = tab.id;
    const panelId = tab.getAttribute("aria-controls");
    if (!tabId || !panelId)
      throw new TypeError("Every Tabs tab requires id and aria-controls.");
    const panels = root.querySelectorAll<HTMLElement>(
      `#${CSS.escape(panelId)}`,
    );
    const panel = panels[0];
    if (
      panels.length !== 1 ||
      document.querySelectorAll(`#${CSS.escape(tabId)}`).length !== 1 ||
      document.querySelectorAll(`#${CSS.escape(panelId)}`).length !== 1 ||
      panel?.getAttribute("role") !== "tabpanel" ||
      panel.getAttribute("aria-labelledby") !== tabId
    )
      throw new TypeError(
        `Tabs relationship ${tabId || "<missing>"} -> ${panelId} must be unique and root-scoped.`,
      );
  }
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
    validateRelationships(root, tablist);
    this.root = root;
    this.tablist = tablist;
    controllers.set(root, this);
    this.#initialize();
  }

  activate(tab: HTMLElement, { focus = false } = {}): void {
    if (this.#destroyed || isDisabled(tab)) return;
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
      if (controllers.get(this.root) === this) controllers.delete(this.root);
    }
  }

  #initialize(): void {
    const tabs = tabsIn(this.tablist);
    const initial =
      tabs.find(
        (tab) =>
          tab.getAttribute("aria-selected") === "true" && !isDisabled(tab),
      ) ?? tabs.find((tab) => !isDisabled(tab));
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
        const enabled = tabsIn(this.tablist).filter((tab) => !isDisabled(tab));
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
    (root) => controllers.get(root) ?? new TabsController(root),
  );
}
