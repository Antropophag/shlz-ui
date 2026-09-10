import {
  tableFilter,
  tablePriority,
  tableSorter,
  positionTableMenus,
} from "./table-parts.js";

const variants = [
  ["Text", "Default", false, "Header", false, 110],
  ["Text", "Hover", false, "Header", false, 110],
  ["Text", "Filter active", false, "Header", false, 110],
  ["Text", "Both active (descending)", false, "Header", false, 110],
  ["Text", "Both active (ascending)", false, "Header", false, 110],
  ["Text", "Ascending sorter", false, "Header", false, 110],
  ["Text", "Descending sorter", false, "Header", false, 110],
  ["Text", "Default", false, "Row", true, 110],
  ["Text", "Hover", false, "Row", true, 110],
  ["Empty", "Default", false, "Row", false, 110],
  ["Empty", "Hover", false, "Row", false, 110],
  ["Status", "Default", false, "Row", true, 110],
  ["Status", "Hover", false, "Row", true, 110],
  ["Check", "Default", false, "Row", false, 40],
  ["Check", "Default", false, "Row", true, 40],
  ["Check", "Hover", false, "Row", false, 40],
  ["Icon", "Default", false, "Header", false, 48],
  ["Priority", "Default", false, "Row", true, 48],
  ["Priority", "Hover", false, "Row", true, 48],
  ["Icon", "Hover", false, "Header", false, 48],
  ["Icon", "Ascending sorter", false, "Header", false, 48],
  ["Text", "Default", true, "Row", false, 140],
  ["Status", "Default", true, "Row", false, 140],
  ["Status", "Hover", true, "Row", false, 140],
  ["Text", "Hover", true, "Row", false, 140],
  ["Text", "Pressed", true, "Row", false, 140],
  ["Text", "Default", true, "Row", true, 140],
  ["Dropdown", "Default", true, "Row", true, 140],
  ["Text", "Hover", true, "Row", true, 140],
  ["Text", "Typing", true, "Row", true, 140],
  ["Check", "Default", true, "Row", false, 40],
  ["Button", "Default", false, "Row", true, 167],
  ["Button", "Pressed", false, "Row", true, 167],
  ["Button", "Hover", false, "Row", true, 167],
  ["Check", "Default", true, "Row", true, 40],
  ["Check", "Hover", true, "Row", false, 40],
  ["Switch", "Default", true, "Row", false, 54],
  ["Switch", "Default", true, "Row", true, 54],
  ["Switch", "Hover", true, "Row", false, 54],
  ["Status", "Default", true, "Row", true, 140],
  ["Status", "Hover", true, "Row", true, 140],
  ["Text", "Typing", true, "Row", false, 140, "popup"],
  ["Status", "Pressed", true, "Row", false, 140, "popup"],
  ["Icon", "Default", false, "Row", false, 40],
  ["Icon", "Hover", false, "Row", false, 40],
  ["Icon", "Pressed", false, "Row", false, 40],
  ["Dropdown", "Hover", true, "Row", false, 140],
  ["Dropdown", "Default", true, "Row", false, 140],
  ["Dropdown", "Pressed", true, "Row", false, 140, "popup"],
];

const icon = (iconUrl, name, alt = "") =>
  `<img class="shlz-table__cell-icon" src="${iconUrl(name)}" alt="${alt}">`;

const staticPopup = (index, type) => {
  const items =
    type === "Text"
      ? ["Комплектую...", "Комплектую..."]
      : type === "Status"
        ? ["Отгружен", "Отгружен"]
        : ["Комплектую...", "Комплектую..."];
  return `<div class="shlz-table__cell-choice-menu" data-table-source-popup="${index}" aria-hidden="true">${items.map((item) => `<span class="shlz-table__cell-choice-option">${type === "Status" ? `<span class="shlz-status shlz-status--green">${item}</span>` : item}</span>`).join("")}</div>`;
};

const headerContent = (index, type, state, iconUrl) => {
  const iconHeader = type === "Icon";
  const ascending = state.includes("Ascending") || state.includes("ascending");
  const descending =
    state.includes("descending") || state.includes("Descending");
  const filtered = state.includes("Filter") || state.includes("Both");
  const controlsVisible = state !== "Default";
  const headingClasses = [
    "shlz-table__heading",
    iconHeader && "shlz-table__heading--icon",
    state === "Hover" && "shlz-table__heading--visual-hover",
  ]
    .filter(Boolean)
    .join(" ");
  const label = iconHeader
    ? `<img class="shlz-table__header-icon" src="${iconUrl("flag-filled")}" alt="">`
    : `<span>Номер</span>`;
  const controls = `${tableSorter("Сортировать по номеру", `data-table-source-sorter="${index}" ${ascending || descending ? ' aria-pressed="true"' : ""}`)}${tableFilter("Фильтровать по номеру", `data-table-source-filter="${index}" ${filtered ? ' aria-pressed="true"' : ""}`)}`;
  return `<span class="${headingClasses}"${controlsVisible ? ' data-table-heading-controls-visible="true"' : ""}>${label}<span class="shlz-table__actions">${controls}</span></span>`;
};

const bodyContent = (index, type, state, editable, filled, iconUrl) => {
  if (type === "Empty") return "";
  if (type === "Text" && state === "Pressed")
    return `<input class="shlz-table__editor" aria-label="Пустой редактор" value="">`;
  if (type === "Text")
    return state === "Typing"
      ? `<input class="shlz-table__editor" aria-label="Диагностический редактор ${index}" value="${filled ? "3" : "Комп"}">`
      : `<span>${filled ? (editable ? "3" : "Номер") : ""}</span>`;
  if (type === "Status")
    return filled
      ? `<span class="shlz-status${editable ? " shlz-status--green" : ""}">${editable ? "Отгружен" : "Новое"}</span>`
      : "";
  if (type === "Check")
    return `<input class="shlz-checkbox" type="checkbox" aria-label="Диагностический выбор ${index}"${filled ? " checked" : ""}>`;
  if (type === "Priority") return `<span>${tablePriority("Приоритет")}</span>`;
  if (type === "Switch")
    return `<input class="shlz-switch__input" type="checkbox" role="switch" aria-label="Диагностический переключатель ${index}"${filled ? " checked" : ""}>`;
  if (type === "Button")
    return `<button class="shlz-table__add-row${state === "Pressed" ? " shlz-table__add-row--visual-pressed" : ""}" type="button">${icon(iconUrl, "plus-alt-2")}Добавить строку</button>`;
  if (type === "Icon")
    return index === 44
      ? ""
      : `<button class="shlz-table__icon-action" type="button" aria-label="Копировать строку">${icon(iconUrl, "copy-2")}</button>`;
  if (!filled) return "";
  return `<button class="shlz-table__cell-choice-trigger" type="button" aria-label="Выбрать значение">3</button>`;
};

const specimen = (variant, offset, iconUrl) => {
  const index = offset + 1;
  const [type, state, editable, cell, filled, width, popup] = variant;
  const isHeader = cell === "Header";
  const stateClass =
    state === "Hover" && !isHeader
      ? " shlz-table__cell--visual-hover"
      : state === "Pressed"
        ? " shlz-table__cell--visual-pressed"
        : state === "Typing"
          ? " shlz-table__cell--typing"
          : "";
  const content = isHeader
    ? headerContent(index, type, state, iconUrl)
    : bodyContent(index, type, state, editable, filled, iconUrl);
  const sort =
    state.includes("ascending") || state.includes("Ascending")
      ? ' aria-sort="ascending"'
      : state.includes("descending") || state.includes("Descending")
        ? ' aria-sort="descending"'
        : "";
  const cellMarkup = `<${isHeader ? "th" : "td"} class="shlz-table__cell${editable ? " shlz-table__cell--editable" : ""}${type === "Icon" ? " shlz-table__cell--icon" : type === "Check" ? " shlz-table__cell--check" : type === "Priority" ? " shlz-table__cell--priority" : ""}${type === "Button" ? " shlz-table__cell--button" : ""}${stateClass}" ${isHeader ? `scope="col"${sort}` : ""}>${content}${popup ? staticPopup(index, type) : ""}</${isHeader ? "th" : "td"}>`;
  const rows = isHeader
    ? `<thead class="shlz-table__head"><tr>${cellMarkup}</tr></thead><tbody></tbody>`
    : `<thead class="shlz-visually-hidden"><tr><th scope="col">Значение</th></tr></thead><tbody><tr class="shlz-table__row">${cellMarkup}</tr></tbody>`;
  return `<figure class="shlz-table-cell-source" data-table-source-cell="${index}" data-source-reference="table-cell-${index}.svg" data-source-width="${width}" data-source-content-height="${popup ? 154 : 50}" data-source-svg-width="${popup ? 200 : width}" data-source-svg-height="${popup ? 188 : 50}" data-source-type="${type}" data-source-state="${state}" data-source-cell-kind="${cell}"><figcaption>${index}. ${type} · ${state} · ${cell}${editable ? " · editable" : ""}${filled ? " · filled" : ""}${popup ? " · popup export" : ""}</figcaption><table class="shlz-table" data-component-audit-id="table-cell-source-${index}" style="inline-size:${width}px;table-layout:fixed"><caption class="shlz-visually-hidden">Table Cell source variant ${index}: ${type}, ${state}, ${cell}</caption><colgroup><col style="inline-size:${width}px"></colgroup>${rows}</table></figure>`;
};

const liveChoice = (id, auditId, value, items) =>
  `<div class="shlz-dropdown shlz-table__cell-choice" data-shlz-dropdown data-table-live-choice data-table-menu-root data-component-audit-id="${auditId}"><button class="shlz-table__cell-choice-trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}-menu"><span data-table-live-choice-value${id === "table-editing-status" ? ' class="shlz-status shlz-status--green"' : ""}>${value}</span></button><div class="shlz-dropdown__menu shlz-table__cell-choice-menu" id="${id}-menu" role="menu" hidden>${items.map((item) => `<button class="shlz-dropdown__item" type="button" role="menuitem" data-value="${item}">${id === "table-editing-status" ? `<span class="shlz-status shlz-status--green">${item}</span>` : item}</button>`).join("")}</div></div>`;

const editingExample = (iconUrl) =>
  `<section class="shlz-table-editing-example" id="table-editing-example"><h4>Executable table editing example</h4><p data-table-editing-status role="status">No changes yet.</p><div class="shlz-table-wrap" data-table-editing-wrap><table class="shlz-table" data-component-audit-id="table-editing-example"><caption>Редактирование заявки</caption><thead class="shlz-table__head"><tr><th class="shlz-table__cell shlz-table__cell--check" scope="col"><input class="shlz-checkbox" type="checkbox" aria-label="Выбрать все строки" data-table-select-all></th><th class="shlz-table__cell" scope="col">Название</th><th class="shlz-table__cell" scope="col">Статус</th><th class="shlz-table__cell" scope="col">Режим</th><th class="shlz-table__cell" scope="col">Включено</th><th class="shlz-table__cell" scope="col">Действия</th></tr></thead><tbody data-table-editing-body><tr class="shlz-table__row"><td class="shlz-table__cell shlz-table__cell--check"><input class="shlz-checkbox" type="checkbox" aria-label="Выбрать заявку" data-table-select-row></td><td class="shlz-table__cell shlz-table__cell--editable"><div class="shlz-table__cell-choice" data-table-suggestions data-table-menu-root><input class="shlz-table__editor shlz-table__cell-choice-trigger" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="table-editing-name-suggestions" data-table-live-name aria-label="Название заявки" value="Замена пропуска"><div class="shlz-table__cell-choice-menu" id="table-editing-name-suggestions" role="listbox" aria-label="Предложения названия" hidden><button class="shlz-table__cell-choice-option" id="table-name-option-1" type="button" role="option" tabindex="-1" aria-selected="false">Комплектующие</button><button class="shlz-table__cell-choice-option" id="table-name-option-2" type="button" role="option" tabindex="-1" aria-selected="false">Комплектование</button></div></div></td><td class="shlz-table__cell shlz-table__cell--editable shlz-table__cell--status">${liveChoice("table-editing-status", "dropdown-table-editing-status", "Новый", ["Новый", "В работе", "Закрыт"])}</td><td class="shlz-table__cell shlz-table__cell--editable">${liveChoice("table-editing-mode", "dropdown-table-editing-mode", "Обычный", ["Обычный", "Срочный"])}</td><td class="shlz-table__cell"><label class="shlz-switch"><input class="shlz-switch__input" data-table-live-switch type="checkbox" role="switch"><span class="shlz-visually-hidden">Включить заявку</span></label></td><td class="shlz-table__cell"><span class="shlz-cluster"><button class="shlz-table__icon-action" type="button" data-table-live-icon aria-pressed="false" aria-label="Отметить заявку">${icon(iconUrl, "flag")}</button><button class="shlz-table__add-row" type="button" data-table-live-add>${icon(iconUrl, "plus-circle")}Добавить строку</button></span></td></tr></tbody></table></div></section>`;

export const tableCellsMarkup = (iconUrl) =>
  `<article id="table-cell-demo"><h3>Table Cell source matrix</h3><p>All 49 source exports are labelled inert diagnostics. Hover, pressed, and typing labels describe captured source states; only the editing example below claims runtime behavior.</p><div class="shlz-table-cell-gallery" inert aria-hidden="true">${variants.map((variant, index) => specimen(variant, index, iconUrl)).join("")}</div>${editingExample(iconUrl)}</article>`;

export const initTableCells = (scope = document, { enhanceDropdowns } = {}) => {
  const gallery = scope.querySelector("#table-cell-demo");
  if (!gallery || gallery.dataset.tableCellsReady) return null;
  gallery.dataset.tableCellsReady = "true";
  const abort = new window.AbortController();
  const { signal } = abort;
  const choices = [...gallery.querySelectorAll("[data-table-live-choice]")];
  const controllers = enhanceDropdowns?.(gallery) ?? [];
  const stopPositioning = positionTableMenus(gallery);
  const status = gallery.querySelector("[data-table-editing-status]");
  const announce = (message) => {
    status.textContent = message;
  };
  for (const choice of choices)
    choice.addEventListener(
      "click",
      (event) => {
        const item = event.target.closest("[role='menuitem']");
        if (
          !item ||
          item.disabled ||
          item.getAttribute("aria-disabled") === "true"
        )
          return;
        const value = choice.querySelector("[data-table-live-choice-value]");
        value.textContent = item.dataset.value;
        announce(`Выбрано: ${item.dataset.value}.`);
      },
      { signal },
    );
  bindTableSuggestions(
    gallery.querySelector("[data-table-suggestions]"),
    signal,
    announce,
  );
  const body = gallery.querySelector("[data-table-editing-body]");
  const selectAll = gallery.querySelector("[data-table-select-all]");
  const updateSelection = () => {
    const rows = [...body.rows];
    const selected = rows.filter(
      (row) => row.querySelector("[data-table-select-row]").checked,
    );
    selectAll.checked = rows.length > 0 && selected.length === rows.length;
    selectAll.indeterminate =
      selected.length > 0 && selected.length < rows.length;
    for (const row of rows)
      row.dataset.selected = String(
        row.querySelector("[data-table-select-row]").checked,
      );
  };
  gallery.addEventListener(
    "input",
    (event) => {
      if (event.target.matches("[data-table-live-name]"))
        announce(`Название: ${event.target.value || "пусто"}.`);
    },
    { signal },
  );
  gallery.addEventListener(
    "change",
    (event) => {
      if (event.target === selectAll) {
        for (const row of body.rows)
          row.querySelector("[data-table-select-row]").checked =
            selectAll.checked;
        announce(
          selectAll.checked ? "Все строки выбраны." : "Выбор строк снят.",
        );
      } else if (event.target.matches("[data-table-select-row]"))
        announce(
          event.target.checked ? "Строка выбрана." : "Строка не выбрана.",
        );
      else if (event.target.matches("[data-table-live-switch]"))
        announce(
          event.target.checked ? "Заявка включена." : "Заявка выключена.",
        );
      updateSelection();
    },
    { signal },
  );
  gallery.addEventListener(
    "click",
    (event) => {
      const iconButton = event.target.closest("[data-table-live-icon]");
      if (iconButton) {
        const marked = iconButton.getAttribute("aria-pressed") !== "true";
        iconButton.setAttribute("aria-pressed", String(marked));
        announce(marked ? "Заявка отмечена." : "Отметка снята.");
      }
      if (event.target.closest("[data-table-live-add]")) {
        const number = body.rows.length + 1;
        const added = body.insertRow();
        added.className = "shlz-table__row";
        added.innerHTML = `<td class="shlz-table__cell shlz-table__cell--check"><input class="shlz-checkbox" type="checkbox" checked aria-label="Выбрать добавленную заявку ${number}" data-table-select-row></td><td class="shlz-table__cell shlz-table__cell--editable"><input class="shlz-table__editor" aria-label="Название заявки ${number}" value="Новая заявка ${number}" data-table-live-name></td><td class="shlz-table__cell"><span class="shlz-status">Новый</span></td><td class="shlz-table__cell">Обычный</td><td class="shlz-table__cell"><input class="shlz-switch__input" type="checkbox" role="switch" aria-label="Включить заявку ${number}" data-table-live-switch></td><td class="shlz-table__cell"><button class="shlz-button shlz-button--xs" type="button" data-table-live-icon aria-pressed="false">Отметить</button></td>`;
        updateSelection();
        announce(`Добавлена строка ${number}.`);
      }
    },
    { signal },
  );
  return {
    destroy() {
      abort.abort();
      stopPositioning();
      controllers.forEach((controller) => controller.destroy());
      delete gallery.dataset.tableCellsReady;
    },
  };
};

// A bounded consumer combobox; Table itself owns no suggestions/data model.
const bindTableSuggestions = (root, signal, announce) => {
  const input = root.querySelector("input");
  const menu = root.querySelector('[role="listbox"]');
  const options = [...menu.querySelectorAll('[role="option"]')];
  let active = -1;
  const visible = () => options.filter((option) => !option.hidden);
  const highlight = (index) => {
    active = index;
    options.forEach((option) =>
      option.setAttribute("aria-selected", String(option === visible()[index])),
    );
    const option = visible()[index];
    if (option) input.setAttribute("aria-activedescendant", option.id);
    else input.removeAttribute("aria-activedescendant");
  };
  const close = () => {
    menu.hidden = true;
    input.setAttribute("aria-expanded", "false");
    highlight(-1);
  };
  const open = () => {
    const query = input.value.toLocaleLowerCase("ru");
    options.forEach((option) => {
      option.hidden = !option.textContent
        .toLocaleLowerCase("ru")
        .startsWith(query);
    });
    menu.hidden = visible().length === 0;
    input.setAttribute("aria-expanded", String(!menu.hidden));
    highlight(-1);
  };
  const choose = (option) => {
    input.value = option.textContent;
    close();
    input.focus();
    announce(`Название: ${input.value}.`);
  };
  input.addEventListener("input", open, { signal });
  input.addEventListener("blur", close, { signal });
  input.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" || event.key === "Tab") {
        close();
        return;
      }
      if (event.key === "Enter" && !menu.hidden && active >= 0) {
        event.preventDefault();
        choose(visible()[active]);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      if (menu.hidden) open();
      const count = visible().length;
      if (count)
        highlight(
          event.key === "ArrowDown"
            ? (active + 1) % count
            : active < 0
              ? count - 1
              : (active - 1 + count) % count,
        );
    },
    { signal },
  );
  menu.addEventListener("pointerdown", (event) => event.preventDefault(), {
    signal,
  });
  menu.addEventListener(
    "click",
    (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && !option.hidden) choose(option);
    },
    { signal },
  );
  signal.addEventListener("abort", close, { once: true });
};
