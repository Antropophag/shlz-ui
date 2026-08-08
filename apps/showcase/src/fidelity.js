import references from "../generated/source-references/manifest.json";

const urls = import.meta.glob("../generated/source-references/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});
const urlByFile = Object.fromEntries(
  Object.entries(urls).map(([file, url]) => [file.split("/").pop(), url]),
);

const source = (...components) => {
  const selected = references.filter(({ component }) =>
    components.includes(component),
  );
  return selected
    .flatMap((reference) =>
      reference.references.map(
        (crop) =>
          `<figure class="shlz-reference"><img src="${urlByFile[crop.file]}" alt="Source crop from ${reference.sourceFile}"><figcaption><code>${reference.sourceFile}</code> · crop <code>${crop.cropViewBox}</code><br>${crop.reason}</figcaption></figure>`,
      ),
    )
    .join("");
};

const unit = ({
  id,
  title,
  sources,
  implementation,
  fidelity = "MEDIUM",
  deviations = "Typography uses the documented system-sans DECISION.",
}) => `
  <article class="shlz-fidelity-unit" id="fidelity-${id}">
    <h3>${title} — fidelity <span class="shlz-fidelity-rating shlz-fidelity-rating--${fidelity.toLowerCase()}">${fidelity}</span></h3>
    <div class="shlz-fidelity-columns">
      <section><h4>Source reference</h4><div class="shlz-reference-strip">${source(...sources)}</div></section>
      <section><h4>Implementation</h4><div class="shlz-visual-fixture" inert aria-hidden="true">${implementation}</div></section>
    </div>
    <p class="shlz-fidelity-notes"><strong>Known deviations:</strong> ${deviations}</p>
  </article>`;

const dropdownMenu = (
  count,
  { wide = false, highlighted = -1, separator = false } = {},
) =>
  `<div class="shlz-dropdown"><div class="shlz-dropdown__menu${wide ? " shlz-dropdown__menu--wide" : ""}">${Array.from({ length: count }, (_, index) => `${separator && index === 3 ? '<hr class="shlz-dropdown__separator">' : ""}<button class="shlz-dropdown__item${index === highlighted ? " shlz-dropdown__item--visual-highlight" : ""}"><span class="shlz-dropdown__icon"></span>${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : index === 2 ? "rd" : "th"} menu item</button>`).join("")}</div></div>`;
const tooltip = (placement) =>
  `<div class="shlz-tooltip shlz-static-tooltip" role="tooltip" data-static-placement="${placement}">prompt text<span class="shlz-tooltip__arrow"></span></div>`;
const popover = (placement, align = "center") =>
  `<div class="shlz-popover shlz-static-popover" data-static-placement="${placement}" data-static-align="${align}"><div class="shlz-popover__header">Заголовок</div><div class="shlz-popover__body">Текст Popover</div><span class="shlz-popover__arrow"></span></div>`;
const notification = (kind, leading, title, trailing) =>
  `<div class="shlz-notification ${kind}">${leading}<div class="shlz-notification__content"><p class="shlz-notification__title">${title}</p></div>${trailing}</div>`;
const paginationItem = (content, state = "") =>
  `<span class="shlz-pagination__item${state ? ` shlz-pagination__item--${state}` : ""}">${content}</span>`;
const segmentGroup = (size = "", icons = false) =>
  `<div class="shlz-segment${size ? ` shlz-segment--${size}` : ""}">${["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map((label, index) => `<span class="shlz-segment__item${size ? ` shlz-segment__item--${size}` : ""}${index === 0 ? " shlz-segment__item--selected" : ""}">${icons ? "≡ " : ""}${label}</span>`).join("")}</div>`;
const compactModal = (kind, title) =>
  `<div class="shlz-modal__surface shlz-modal__surface--compact shlz-modal__surface--${kind}"><div class="shlz-modal__compact-content"><span class="shlz-modal__variant-icon">ⓘ</span><div class="shlz-modal__compact-copy"><h4>${title}</h4><p>Some contents...</p></div></div><div class="shlz-modal__compact-actions"><button class="shlz-button shlz-button--sm">Cancel</button><button class="shlz-button shlz-button--primary shlz-button--sm">Done</button></div></div>`;
const buttonMatrix = (variant = "") =>
  `<div class="shlz-control-matrix"><b>Size</b><b>Default</b><b>Hover</b><b>Active</b><b>Disabled</b>${[
    ["Large", ""],
    ["Medium", "sm"],
    ["Small", "xs"],
  ]
    .map(
      ([label, size]) =>
        `<span>${label}</span>${["", "visual-hover", "visual-active", "disabled"].map((state) => `<button class="shlz-button${variant ? ` shlz-button--${variant}` : ""}${size ? ` shlz-button--${size}` : ""}${state && state !== "disabled" ? ` shlz-button--${state}` : ""}"${state === "disabled" ? " disabled" : ""}>Загрузить файл</button>`).join("")}`,
    )
    .join("")}</div>`;
const fieldMatrix = (type) => {
  const element = type === "textarea" ? "textarea" : "input";
  const base = type === "textarea" ? "shlz-textarea" : "shlz-input";
  return `<div class="shlz-control-matrix shlz-control-matrix--six"><b></b><b>Default</b><b>Hover</b><b>Focus</b><b>Error</b><b>Disabled</b><b>Readonly</b><span>${type}</span>${[
    ["", ""],
    ["visual-hover", ""],
    ["visual-focus", ""],
    ["", ' aria-invalid="true"'],
    ["", " disabled"],
    ["", " readonly"],
  ]
    .map(([state, attrs]) => {
      const open = `<${element} class="${base}${state ? ` ${base}--${state}` : ""}"${attrs} placeholder="Placeholder">`;
      return element === "textarea" ? `${open}</textarea>` : open;
    })
    .join("")}</div>`;
};

const implementations = {
  button: `<div class="shlz-visual-matrix"><div><p class="shlz-visual-matrix__label">Primary · 26/32/40 · four source rows</p>${buttonMatrix("primary")}</div><div><p class="shlz-visual-matrix__label">Neutral · 26/32/40 · four source rows</p>${buttonMatrix()}</div><div class="shlz-visual-row"><button class="shlz-button shlz-button--primary"><span class="shlz-button__icon">＋</span>Icon + text</button><button class="shlz-button shlz-button--primary shlz-button--icon" aria-label="Icon">＋</button></div></div>`,
  input: fieldMatrix("input"),
  textarea: fieldMatrix("textarea"),
  checkbox: `<div class="shlz-control-matrix"><b>Size</b><b>Default</b><b>Checked</b><b>Mixed</b><b>Disabled</b>${[
    ["20", ""],
    ["16", "shlz-checkbox--sm"],
  ]
    .map(
      ([label, size]) =>
        `<span>${label}</span><input class="shlz-checkbox ${size}" type="checkbox"><input class="shlz-checkbox ${size}" type="checkbox" checked><input class="shlz-checkbox ${size}" type="checkbox" data-shlz-indeterminate><input class="shlz-checkbox ${size}" type="checkbox" checked disabled>`,
    )
    .join("")}</div>`,
  radio: `<div class="shlz-control-matrix"><b></b><b>Default</b><b>Selected</b><b>Disabled</b><b>Selected disabled</b><span>20</span><input class="shlz-radio" type="radio"><input class="shlz-radio" type="radio" checked><input class="shlz-radio" type="radio" disabled><input class="shlz-radio" type="radio" checked disabled></div>`,
  switch: `<div class="shlz-control-matrix"><b>Size</b><b>Off</b><b>On</b><b>Off disabled</b><b>On disabled</b>${[
    ["24×14", "sm"],
    ["38×20", ""],
    ["52×30", "lg"],
  ]
    .map(
      ([label, size]) =>
        `<span>${label}</span>${["", "checked", "disabled", "checked disabled"].map((attrs) => `<input class="shlz-switch__input${size ? ` shlz-switch__input--${size}` : ""}" type="checkbox" role="switch" ${attrs}>`).join("")}`,
    )
    .join("")}</div>`,
  status: `<div class="shlz-visual-matrix"><div class="shlz-visual-row"><span class="shlz-status">Blue</span><span class="shlz-status shlz-status--green">Green</span><span class="shlz-status shlz-status--orange">Orange</span><span class="shlz-status shlz-status--purple">Violet</span><span class="shlz-status shlz-status--cyan">Cyan</span><span class="shlz-status shlz-status--neutral">Neutral</span></div><div class="shlz-visual-row"><span class="shlz-badge">12</span><span class="shlz-badge shlz-badge--neutral">12</span><span class="shlz-badge shlz-badge--lg">100</span><span class="shlz-badge shlz-badge--lg shlz-badge--neutral">100</span></div></div>`,
  dropdown: `<div class="shlz-visual-matrix"><div><p class="shlz-visual-matrix__label">200 px source families</p><div class="shlz-static-floating-row">${[2, 3, 4, 5, 6, 7, 8].map((count, index) => dropdownMenu(count, { highlighted: index % 2 ? 1 : -1, separator: count === 8 })).join("")}</div></div><div><p class="shlz-visual-matrix__label">Search / check-slot / scrollbar-looking visual</p><div class="shlz-dropdown"><div class="shlz-dropdown__menu"><input class="shlz-dropdown__search" placeholder="Поиск">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button class="shlz-dropdown__item"><span class="shlz-dropdown__check-slot"></span>${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} menu item</button>`).join("")}</div></div></div><div><p class="shlz-visual-matrix__label">216 px status composition</p><div class="shlz-dropdown"><div class="shlz-dropdown__menu shlz-dropdown__menu--wide">${[
    ["Новое", ""],
    ["В работе ОКС", "green"],
    ["Передано в ОГО", "orange"],
    ["В работе у ОГО", ""],
    ["Передано в БГО", "purple"],
    ["Реализация решения", "cyan"],
    ["Передано поставщику", "purple"],
    ["Выполнено", "green"],
  ]
    .map(
      ([label, kind]) =>
        `<span class="shlz-dropdown__item"><span class="shlz-status${kind ? ` shlz-status--${kind}` : ""}">${label}</span></span>`,
    )
    .join(
      "",
    )}</div></div></div><div><p class="shlz-visual-matrix__label">216 px family · highlighted-looking state semantics UNKNOWN</p>${dropdownMenu(7, { wide: true, highlighted: 2 })}</div></div>`,
  tooltip: `<div class="shlz-tooltip-matrix">${["top-start", "top", "top-end", "left", "right", "bottom-start", "bottom", "bottom-end"].map(tooltip).join("")}</div>`,
  popover: `<div class="shlz-popover-matrix">${["top", "bottom", "left", "right"].flatMap((placement) => ["start", "center", "end"].map((align) => popover(placement, align))).join("")}</div>`,
  tabs: `<div class="shlz-visual-matrix">${["", "pill", "boxed"].map((variant) => `<div class="shlz-tabs${variant ? ` shlz-tabs--${variant}` : ""}"><div class="shlz-tabs__list" role="tablist"><button class="shlz-tabs__tab" role="tab">Default</button><button class="shlz-tabs__tab shlz-tabs__tab--visual-hover" role="tab">Hover</button><button class="shlz-tabs__tab" role="tab" aria-selected="true">Selected</button><button class="shlz-tabs__tab" role="tab" disabled>Disabled</button></div></div>`).join("")}</div>`,
  pagination: `<div class="shlz-visual-matrix"><div class="shlz-pagination-matrix"><b></b><b>Prev</b><b>Next</b><b>Number</b><b>Ellipsis</b><b>Last</b>${[
    ["Default", "", ""],
    ["Hover", "visual-hover", "visual-hover"],
    ["Pressed", "visual-pressed", "visual-pressed"],
    ["Disabled", "disabled", "disabled"],
  ]
    .map(
      ([label, state]) =>
        `<span>${label}</span>${paginationItem("‹", state)}${paginationItem("›", state)}${paginationItem("1", state)}${paginationItem("…", `ellipsis${state ? ` shlz-pagination__item--${state}` : ""}`)}${paginationItem("»", state)}`,
    )
    .join(
      "",
    )}</div><div><p class="shlz-visual-matrix__label">Group</p><div class="shlz-pagination__group">${paginationItem("‹", "disabled")}${paginationItem("1", "visual-pressed")}${paginationItem("2")}${paginationItem("3")}${paginationItem("…", "ellipsis")}${paginationItem("8")}${paginationItem("›")}</div></div><div class="shlz-pagination__group"><span class="shlz-pagination__summary">1–20 из 289</span><span class="shlz-pagination__page-size-label">Показывать по:</span>${paginationItem("20", "visual-pressed")}${paginationItem("50")}${paginationItem("80")}</div></div>`,
  tag: `<div class="shlz-visual-matrix"><div class="shlz-visual-row"><span class="shlz-tag">По гарантии</span><span class="shlz-tag shlz-tag--outlined">По гарантии</span></div><div class="shlz-visual-row"><span class="shlz-tag shlz-tag--outlined"><span class="shlz-tag__avatar">А</span>Александр Васильев</span><span class="shlz-tag shlz-tag--outlined"><span class="shlz-tag__avatar">А</span>Александр Васильев<button class="shlz-tag__remove" aria-label="Remove">×</button></span></div></div>`,
  segment: `<div class="shlz-visual-matrix"><div><p class="shlz-visual-matrix__label">Segmented-Group · text</p><div class="shlz-visual-matrix">${segmentGroup("sm")}${segmentGroup()}${segmentGroup("lg")}</div></div><div><p class="shlz-visual-matrix__label">Segmented-Group · icon slots</p><div class="shlz-visual-matrix">${segmentGroup("sm", true)}${segmentGroup("", true)}${segmentGroup("lg", true)}</div></div><div><p class="shlz-visual-matrix__label">Segmented-Item matrix · state meaning UNKNOWN</p><div class="shlz-segment-item-matrix">${["sm", "", "lg"].flatMap((size) => ["", "disabled", "selected"].map((state) => `<span class="shlz-segment__item${state ? ` shlz-segment__item--${state}` : ""}${size ? ` shlz-segment__item--${size}` : ""}">Daily</span>`)).join("")}</div></div></div>`,
  notification: `<div class="shlz-notification-matrix">${notification("", '<span class="shlz-notification__icon">✓</span>', "Notification Title", '<button class="shlz-notification__close" aria-label="Close">×</button>')}${notification("shlz-notification--danger", '<span class="shlz-notification__icon">✓</span>', "Notification Title", '<button class="shlz-notification__close" aria-label="Close">×</button>')}${notification("", '<span class="shlz-notification__icon">✓</span>', "Notification Title", '<button class="shlz-notification__action">Удалить</button>')}${[5, 4, 3, 2, 1, 0].map((n) => notification("", `<span class="shlz-notification__leading-progress" style="--shlz-progress:${n / 5}">${n}</span>`, "Сообщение отправлено", '<button class="shlz-notification__action">Отменить</button>')).join("")}${notification("", '<span class="shlz-notification__leading-progress" style="--shlz-progress:.72"></span>', "Сообщение отправляется", '<button class="shlz-notification__action">Отменить</button>')}</div>`,
  modal: `<div class="shlz-modal-matrix"><div class="shlz-modal__surface shlz-modal__surface--structured"><header class="shlz-modal__header"><h3 class="shlz-modal__title">Basic Modal</h3><button class="shlz-modal__close" aria-label="Close">×</button></header><div class="shlz-modal__body"><div class="shlz-modal__source-slot"></div></div><footer class="shlz-modal__footer"><button class="shlz-button shlz-button--sm">Cancel</button><button class="shlz-button shlz-button--primary shlz-button--sm">Done</button></footer></div>${compactModal("info", "This is some info")}${compactModal("success", "Some task has completed!")}${compactModal("warning", "This is a warning message")}${compactModal("error", "This is an error message")}</div>`,
  drawer: `<div class="shlz-static-backdrop shlz-static-backdrop--drawer"><div class="shlz-drawer__surface"><header class="shlz-drawer__header"><h3 class="shlz-drawer__title">Drawer Title</h3><button class="shlz-drawer__close" aria-label="Close">×</button></header><div class="shlz-drawer__body"><div class="shlz-drawer__source-slot"></div></div><footer class="shlz-drawer__footer"><button class="shlz-button">Назад</button><button class="shlz-button shlz-button--primary">Сохранить</button></footer></div></div>`,
};

export const fidelityMarkup = [
  { id: "button", title: "Button", sources: ["button"], fidelity: "HIGH" },
  { id: "input", title: "Input", sources: ["input"], fidelity: "MEDIUM" },
  {
    id: "textarea",
    title: "Textarea",
    sources: ["textarea"],
    fidelity: "HIGH",
  },
  {
    id: "checkbox",
    title: "Checkbox",
    sources: ["checkbox"],
    fidelity: "HIGH",
  },
  { id: "radio", title: "Radio", sources: ["radio"], fidelity: "HIGH" },
  { id: "switch", title: "Switch", sources: ["switch"], fidelity: "HIGH" },
  {
    id: "status",
    title: "Status / Badge",
    sources: ["status", "badge"],
    fidelity: "HIGH",
  },
  {
    id: "dropdown",
    title: "Dropdown",
    sources: ["dropdown"],
    fidelity: "MEDIUM",
    deviations:
      "Highlighted source row semantics are UNKNOWN; fixture exposes the visual state without naming it hover/selected/focus.",
  },
  { id: "popover", title: "Popover", sources: ["popover"], fidelity: "HIGH" },
  {
    id: "tooltip",
    title: "Tooltip",
    sources: ["tooltip"],
    fidelity: "HIGH",
    deviations:
      "Outlined source typography differs from browser text; all eight source placements remain simultaneously visible.",
  },
  { id: "tabs", title: "Tabs", sources: ["tabs"], fidelity: "MEDIUM" },
  {
    id: "pagination",
    title: "Pagination",
    sources: ["pagination", "pagination-compact", "pagination-wide"],
    fidelity: "HIGH",
  },
  { id: "tag", title: "Tag", sources: ["tag"], fidelity: "MEDIUM" },
  { id: "segment", title: "Segment", sources: ["segment"], fidelity: "HIGH" },
  {
    id: "notification",
    title: "Notification",
    sources: ["notification"],
    fidelity: "HIGH",
    deviations:
      "Countdown and loading are static source-confirmed visuals; lifecycle remains UNKNOWN.",
  },
  {
    id: "modal",
    title: "Modal",
    sources: ["modal"],
    fidelity: "HIGH",
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>. Backdrop is a DECISION.",
  },
  {
    id: "drawer",
    title: "Drawer",
    sources: ["drawer"],
    fidelity: "HIGH",
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>.",
  },
]
  .map((entry) => unit({ ...entry, implementation: implementations[entry.id] }))
  .join("");
