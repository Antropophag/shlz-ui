// Source paths: Table Cell.svg, local Sorter/Filter exports. CSS owns state paint.
export const tableSorter = (label, attributes = "") =>
  `<button class="shlz-table__affordance shlz-table__sorter" type="button" aria-label="${label}" ${attributes}><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path class="shlz-table__sort-down" d="M8.16294 12.7726L10.2743 9.81669C10.3689 9.68432 10.2742 9.50044 10.1116 9.50044H5.88883C5.72615 9.50044 5.63153 9.68432 5.72608 9.81669L7.83744 12.7726C7.91721 12.8843 8.08317 12.8843 8.16294 12.7726Z"/><path class="shlz-table__sort-up" d="M8.16294 3.22828L10.2743 6.18419C10.3689 6.31656 10.2742 6.50044 10.1116 6.50044H5.88883C5.72615 6.50044 5.63153 6.31656 5.72608 6.18419L7.83744 3.22828C7.91721 3.11661 8.08317 3.11661 8.16294 3.22828Z"/></svg></button>`;

export const tableFilter = (label, attributes = "") =>
  `<button class="shlz-table__affordance shlz-table__filter" type="button" aria-label="${label}" ${attributes}><svg viewBox="0 0 16 18" aria-hidden="true" focusable="false"><path d="M9.79004 10.4521V12.6426C9.78998 12.8402 9.63109 12.9999 9.43457 13H6.50293C6.30632 13 6.14752 12.8403 6.14746 12.6426V10.4521H9.79004ZM12.0811 5C12.3548 5 12.5257 5.29816 12.3906 5.53613L9.91797 9.7373H6.02051L3.54883 5.53613C3.41142 5.29818 3.58181 5.0001 3.85547 5H12.0811Z"/></svg></button>`;

export const tablePriority = (label = "Приоритет") =>
  `<svg class="shlz-table__priority" viewBox="0 0 16 16" role="img" aria-label="${label}"><rect x="3" y="9" width="2" height="4" rx=".2"/><rect x="7" y="6" width="2" height="7" rx=".2"/><rect class="shlz-table__priority-muted" x="11" y="3" width="2" height="10" rx=".2"/></svg>`;

// Byte-preserved path geometry from raw Icons.svg; normalized viewport from extraction.
export const tableEditIcon =
  () => `<svg class="shlz-table__cell-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g transform="translate(-224.0000 -692.9890)"><path d="M240.777 696.368C241.021 696.079 241.323 695.844 241.664 695.678C242.004 695.512 242.376 695.418 242.755 695.402C243.134 695.387 243.512 695.45 243.865 695.587C244.219 695.725 244.539 695.934 244.807 696.201C245.074 696.469 245.282 696.788 245.418 697.14C245.554 697.492 245.615 697.868 245.597 698.244C245.578 698.621 245.481 698.989 245.311 699.326C245.142 699.663 244.903 699.961 244.611 700.201L231.671 713.141L226.4 714.578L227.838 709.307L240.777 696.368Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M238.86 698.284L242.694 702.118" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g></svg>`;

// Byte-preserved path geometry from raw Icons.svg; normalized viewport from extraction.
export const tableMoreIcon =
  () => `<svg class="shlz-table__cell-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g transform="translate(-655.9997 -692.9997)"><path d="M669 698.875C669 699.358 668.552 699.75 668 699.75C667.448 699.75 667 699.358 667 698.875C667 698.392 667.448 698 668 698C668.552 698 669 698.392 669 698.875Z" fill="currentColor"/>
  <path d="M669 705C669 705.483 668.552 705.875 668 705.875C667.448 705.875 667 705.483 667 705C667 704.517 667.448 704.125 668 704.125C668.552 704.125 669 704.517 669 705Z" fill="currentColor"/>
  <path d="M669 711.125C669 711.608 668.552 712 668 712C667.448 712 667 711.608 667 711.125C667 710.642 667.448 710.25 668 710.25C668.552 710.25 669 710.642 669 711.125Z" fill="currentColor"/>
  <path d="M669 698.875C669 699.358 668.552 699.75 668 699.75C667.448 699.75 667 699.358 667 698.875C667 698.392 667.448 698 668 698C668.552 698 669 698.392 669 698.875Z" stroke="currentColor" stroke-width="1.6875" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M669 705C669 705.483 668.552 705.875 668 705.875C667.448 705.875 667 705.483 667 705C667 704.517 667.448 704.125 668 704.125C668.552 704.125 669 704.517 669 705Z" stroke="currentColor" stroke-width="1.6875" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M669 711.125C669 711.608 668.552 712 668 712C667.448 712 667 711.608 667 711.125C667 710.642 667.448 710.25 668 710.25C668.552 710.25 669 710.642 669 711.125Z" stroke="currentColor" stroke-width="1.6875" stroke-linecap="round" stroke-linejoin="round"/>
  </g></svg>`;

// Consumer integration for existing menu semantics inside an overflow wrapper.
export const positionTableMenus = (scope) => {
  const abort = new window.AbortController();
  const observers = [];
  for (const root of scope.querySelectorAll("[data-table-menu-root]")) {
    const trigger = root.querySelector("[aria-controls]");
    const menu =
      trigger &&
      root.querySelector(
        `#${window.CSS.escape(trigger.getAttribute("aria-controls"))}`,
      );
    if (!menu) continue;
    const reposition = () => {
      if (menu.hidden) return;
      const gutter = 8;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(140, window.innerWidth - gutter * 2);
      Object.assign(menu.style, {
        position: "fixed",
        inlineSize: `${width}px`,
        maxBlockSize: `${Math.max(40, window.innerHeight - 2 * gutter)}px`,
        overflowY: "auto",
        margin: "0",
        inset: "auto",
      });
      const height = menu.getBoundingClientRect().height;
      const left = Math.max(
        gutter,
        Math.min(rect.left, window.innerWidth - width - gutter),
      );
      const top =
        rect.bottom + 4 + height <= window.innerHeight - gutter
          ? rect.bottom + 4
          : Math.max(gutter, rect.top - height - 4);
      menu.style.left = `${left}px`;
      menu.style.top = `${Math.min(top, window.innerHeight - height - gutter)}px`;
    };
    const observer = new window.MutationObserver(reposition);
    observer.observe(root, {
      attributes: true,
      subtree: true,
      attributeFilter: ["aria-expanded", "hidden"],
    });
    observers.push(observer);
    window.addEventListener("resize", reposition, { signal: abort.signal });
    window.addEventListener("scroll", reposition, {
      capture: true,
      signal: abort.signal,
    });
  }
  return () => {
    abort.abort();
    observers.forEach((observer) => observer.disconnect());
  };
};
