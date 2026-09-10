import {
  tableSorter,
  tableFilter,
  tablePriority,
  positionTableMenus,
} from "./table-parts.js";
import { renderComponentDocumentation } from "./component-docs.js";

const avatarImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23d9b08c'/%3E%3Ccircle cx='32' cy='25' r='13' fill='%236b4332'/%3E%3Cpath d='M10 64c2-17 10-25 22-25s20 8 22 25' fill='%23253d98'/%3E%3C/svg%3E";

const avatar = (size, type, iconUrl) => {
  const content = {
    text: "U",
    image: `<img class="shlz-avatar__image" src="${avatarImage}" alt="">`,
    icon: `<img class="shlz-avatar__icon" src="${iconUrl("user-1")}" alt="">`,
  }[type];
  return `<span class="shlz-avatar shlz-avatar--${size}${type === "icon" ? " shlz-avatar--icon" : ""}" data-avatar-size="${size}" data-avatar-type="${type}" data-component-audit-id="avatar-showcase-${size}-${type}"${type === "text" ? ` role="img" aria-label="User ${size}"` : ""}>${content}</span>`;
};

export const wave3Markup = (iconUrl) => `
<article id="link-demo"><h3>Link</h3>${renderComponentDocumentation("link")}<div class="shlz-cluster"><a class="shlz-link" href="#link-demo">Default</a><a class="shlz-link shlz-link--visual-hover" href="#link-demo">Hover</a><a class="shlz-link shlz-link--visual-pressed" href="#link-demo">Pressed</a><span class="shlz-link shlz-link--disabled">Disabled</span></div></article>
<article id="avatar-demo"><h3>Avatar</h3>${renderComponentDocumentation("avatar")}<p>Complete source matrix: four exact sizes × text, image and icon content.</p><div class="shlz-avatar-matrix"><b>Size</b><b>Text</b><b>Image</b><b>Icon</b>${[24, 32, 40, 64].map((size) => `<span>${size}px</span>${avatar(size, "text", iconUrl)}${avatar(size, "image", iconUrl)}${avatar(size, "icon", iconUrl)}`).join("")}</div></article>
<article id="table-demo"><h3>Table</h3><p>Native table with application-owned sorting, filtering, selection and editing.</p><div class="shlz-table-wrap"><table class="shlz-table"><caption class="shlz-visually-hidden">Generic table foundation example</caption><thead class="shlz-table__head"><tr><th class="shlz-table__cell shlz-table__cell--check" scope="col"><input class="shlz-checkbox shlz-checkbox--sm" type="checkbox" aria-label="Select all rows"></th><th class="shlz-table__cell shlz-table__cell--priority" scope="col" aria-label="Priority">PRI</th><th class="shlz-table__cell" scope="col" aria-sort="ascending"><span class="shlz-table__heading"><span>Name</span><span class="shlz-table__actions">${tableSorter("Sort by name", "data-table-demo-sort")}${tableFilter("Show Alpha only", 'data-table-demo-filter aria-pressed="false"')}</span></span></th><th class="shlz-table__cell" scope="col">Status</th><th class="shlz-table__cell" scope="col">Owner</th><th class="shlz-table__cell" scope="col">Mode</th><th class="shlz-table__cell" scope="col">Action</th></tr></thead><tbody><tr class="shlz-table__row"><td class="shlz-table__cell shlz-table__cell--check"><input class="shlz-checkbox shlz-checkbox--sm" type="checkbox" aria-label="Select Alpha"></td><td class="shlz-table__cell shlz-table__cell--priority">${tablePriority("Priority")}</td><td class="shlz-table__cell">Alpha request</td><td class="shlz-table__cell"><span class="shlz-status" data-component-audit-id="status-table-alpha">Active</span></td><td class="shlz-table__cell"><span class="shlz-avatar shlz-avatar--24" data-component-audit-id="avatar-table-alpha" role="img" aria-label="AP">AP</span></td><td class="shlz-table__cell shlz-table__cell--editable"><span class="shlz-dropdown shlz-table__cell-choice" data-shlz-dropdown data-table-menu-root data-component-audit-id="dropdown-table-standard"><button class="shlz-table__cell-choice-trigger" type="button" aria-haspopup="menu" aria-controls="table-mode-standard" aria-expanded="false">Standard</button><span class="shlz-dropdown__menu shlz-table__cell-choice-menu" role="menu" id="table-mode-standard" aria-label="Change mode" hidden><button class="shlz-dropdown__item" type="button" role="menuitem">Standard</button><button class="shlz-dropdown__item" type="button" role="menuitem">Review</button></span></span></td><td class="shlz-table__cell"><button class="shlz-button shlz-button--xs" type="button">Open</button></td></tr><tr class="shlz-table__row"><td class="shlz-table__cell shlz-table__cell--check"><input class="shlz-checkbox shlz-checkbox--sm" type="checkbox" aria-label="Select Beta" checked></td><td class="shlz-table__cell shlz-table__cell--icon"><img class="shlz-table__cell-icon" src="${iconUrl("user-1")}" alt="Assigned"></td><td class="shlz-table__cell shlz-table__cell--editable"><input class="shlz-table__editor" value="Beta request" aria-label="Edit name"></td><td class="shlz-table__cell"><span class="shlz-table__empty">—</span></td><td class="shlz-table__cell"><span class="shlz-avatar shlz-avatar--24 shlz-avatar--icon" data-component-audit-id="avatar-table-beta" aria-hidden="true"><img class="shlz-avatar__icon" src="${iconUrl("user-1")}" alt=""></span></td><td class="shlz-table__cell shlz-table__cell--editable"><span class="shlz-dropdown shlz-table__cell-choice" data-shlz-dropdown data-table-menu-root data-component-audit-id="dropdown-table-review"><button class="shlz-table__cell-choice-trigger" type="button" aria-haspopup="menu" aria-controls="table-mode-review" aria-expanded="false">Review</button><span class="shlz-dropdown__menu shlz-table__cell-choice-menu" role="menu" id="table-mode-review" aria-label="Change mode" hidden><button class="shlz-dropdown__item" type="button" role="menuitem">Standard</button><button class="shlz-dropdown__item" type="button" role="menuitem">Review</button></span></span></td><td class="shlz-table__cell"><button class="shlz-button shlz-button--primary shlz-button--xs" type="button">Save</button></td></tr></tbody></table></div><p role="status" data-table-demo-result>Two example rows.</p></article>`;

export const enhanceTableDemo = (scope = document) => {
  const demo = scope.querySelector("#table-demo");
  if (!demo) return;
  positionTableMenus(demo);
  const body = demo.querySelector("tbody");
  const result = demo.querySelector("[data-table-demo-result]");
  const all = demo.querySelector("thead input");
  const update = () => {
    const rows = [...body.rows].filter((row) => !row.hidden);
    const selected = rows.filter(
      (row) => row.querySelector("input[type=checkbox]").checked,
    );
    all.checked = rows.length > 0 && selected.length === rows.length;
    all.indeterminate = selected.length > 0 && selected.length < rows.length;
    for (const row of body.rows)
      row.dataset.selected = String(
        row.querySelector("input[type=checkbox]").checked,
      );
    result.textContent = `${selected.length} selected / ${rows.length} visible`;
  };
  demo.addEventListener("change", (event) => {
    if (event.target === all)
      for (const row of body.rows) {
        if (!row.hidden)
          row.querySelector("input[type=checkbox]").checked = all.checked;
      }
    update();
  });
  demo
    .querySelector("[data-table-demo-sort]")
    .addEventListener("click", (event) => {
      const th = event.currentTarget.closest("th");
      const descending = th.getAttribute("aria-sort") !== "descending";
      th.setAttribute("aria-sort", descending ? "descending" : "ascending");
      const name = (row) =>
        row.cells[2].querySelector("input")?.value ?? row.cells[2].textContent;
      body.append(
        ...[...body.rows].sort(
          (a, b) => name(a).localeCompare(name(b)) * (descending ? -1 : 1),
        ),
      );
    });
  demo
    .querySelector("[data-table-demo-filter]")
    .addEventListener("click", (event) => {
      const active =
        event.currentTarget.getAttribute("aria-pressed") !== "true";
      event.currentTarget.setAttribute("aria-pressed", String(active));
      for (const row of body.rows) {
        row.hidden = active && !row.cells[2].textContent.includes("Alpha");
        if (row.hidden)
          row.querySelector("input[type=checkbox]").checked = false;
      }
      update();
    });
  demo.addEventListener("click", (event) => {
    const option = event.target.closest('[role="menuitem"]');
    if (option)
      option
        .closest("[data-shlz-dropdown]")
        .querySelector("[aria-haspopup]").textContent = option.textContent;
    const action = event.target.closest(".shlz-button");
    if (action)
      result.textContent =
        action.textContent === "Save"
          ? `Saved: ${demo.querySelector(".shlz-table__editor").value}`
          : "Opened Alpha request";
  });
  update();
};
