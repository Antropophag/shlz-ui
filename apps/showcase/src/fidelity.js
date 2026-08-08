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
  deviations = "Typography uses the documented system-sans DECISION.",
}) => `
  <article class="shlz-fidelity-unit" id="fidelity-${id}">
    <h3>${title} — fidelity</h3>
    <div class="shlz-fidelity-columns">
      <section><h4>Source reference</h4><div class="shlz-reference-strip">${source(...sources)}</div></section>
      <section><h4>Implementation</h4><div class="shlz-visual-fixture" inert aria-hidden="true">${implementation}</div></section>
    </div>
    <p class="shlz-fidelity-notes"><strong>Known deviations:</strong> ${deviations}</p>
  </article>`;

const dropdownMenu = (wide = false) =>
  `<div class="shlz-dropdown"><div class="shlz-dropdown__menu${wide ? " shlz-dropdown__menu--wide" : ""}"><button class="shlz-dropdown__item"><span class="shlz-dropdown__icon">□</span>1st menu item</button><button class="shlz-dropdown__item shlz-visual-state"><span class="shlz-dropdown__icon">□</span>2nd menu item</button><button class="shlz-dropdown__item" disabled><span class="shlz-dropdown__icon">□</span>Disabled</button><hr class="shlz-dropdown__separator"><button class="shlz-dropdown__item">Action</button></div></div>`;
const tooltip = (placement) =>
  `<div class="shlz-tooltip shlz-static-tooltip" role="tooltip" data-static-placement="${placement}">prompt text<span class="shlz-tooltip__arrow"></span></div>`;
const popover = (placement, align = "center") =>
  `<div class="shlz-popover shlz-static-popover" data-static-placement="${placement}" data-static-align="${align}"><div class="shlz-popover__header">Заголовок</div><div class="shlz-popover__body">Текст Popover</div><span class="shlz-popover__arrow"></span></div>`;
const notification = (kind, trailing) =>
  `<div class="shlz-notification ${kind}"><span class="shlz-notification__icon">✓</span><div class="shlz-notification__content"><p class="shlz-notification__title">Notification Title</p></div>${trailing}</div>`;

const implementations = {
  button: `<div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Сохранить</button><button class="shlz-button">Отмена</button><button class="shlz-button shlz-button--primary shlz-button--sm">Small</button><button class="shlz-button shlz-button--icon" aria-label="Icon">+</button></div>`,
  input: `<div class="shlz-stack"><label class="shlz-field"><span class="shlz-field__label">Label</span><input class="shlz-input" placeholder="Placeholder"></label><input class="shlz-input" value="Filled"><input class="shlz-input" aria-invalid="true" value="Error"></div>`,
  textarea: `<div class="shlz-stack"><textarea class="shlz-textarea" placeholder="Placeholder"></textarea><textarea class="shlz-textarea">Filled textarea value</textarea></div>`,
  checkbox: `<div class="shlz-cluster"><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox">Default</label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" checked>Checked</label><label class="shlz-choice"><input class="shlz-checkbox" type="checkbox" disabled>Disabled</label></div>`,
  radio: `<div class="shlz-cluster"><label class="shlz-choice"><input class="shlz-radio" type="radio" name="f-radio">Default</label><label class="shlz-choice"><input class="shlz-radio" type="radio" name="f-radio" checked>Selected</label><label class="shlz-choice"><input class="shlz-radio" type="radio" disabled>Disabled</label></div>`,
  switch: `<div class="shlz-cluster"><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch">Off</label><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch" checked>On</label><label class="shlz-switch"><input class="shlz-switch__input" type="checkbox" role="switch" disabled>Disabled</label></div>`,
  status: `<div class="shlz-cluster"><span class="shlz-status">Blue</span><span class="shlz-status shlz-status--green">Green</span><span class="shlz-status shlz-status--orange">Orange</span><span class="shlz-status shlz-status--purple">Violet</span><span class="shlz-badge">12</span><span class="shlz-badge shlz-badge--lg">100</span></div>`,
  dropdown: `<div class="shlz-static-floating-row">${dropdownMenu()}${dropdownMenu(true)}</div><p>Highlighted-looking row is labelled visual state; hover/selection/focus meaning is UNKNOWN.</p>`,
  tooltip: `<div class="shlz-tooltip-matrix">${["top-start", "top", "top-end", "left", "right", "bottom-start", "bottom", "bottom-end"].map(tooltip).join("")}</div>`,
  popover: `<div class="shlz-popover-matrix">${["top", "bottom", "left", "right"].flatMap((placement) => ["start", "center", "end"].map((align) => popover(placement, align))).join("")}</div>`,
  tabs: `<div class="shlz-tabs"><div class="shlz-tabs__list" role="tablist"><button class="shlz-tabs__tab" role="tab" aria-selected="true">Active</button><button class="shlz-tabs__tab" role="tab" aria-selected="false">Default</button><button class="shlz-tabs__tab" role="tab" disabled>Disabled</button></div></div>`,
  pagination: `<nav class="shlz-pagination" aria-label="Fidelity pagination"><ul class="shlz-pagination__list"><li><span class="shlz-pagination__item shlz-pagination__item--disabled">‹</span></li><li><a class="shlz-pagination__item" href="#fidelity-pagination">1</a></li><li><a class="shlz-pagination__item" aria-current="page" href="#fidelity-pagination">2</a></li><li><span class="shlz-pagination__item shlz-pagination__item--ellipsis">…</span></li><li><a class="shlz-pagination__item" href="#fidelity-pagination">12</a></li></ul></nav>`,
  tag: `<div class="shlz-cluster"><span class="shlz-tag">Tag</span><span class="shlz-tag shlz-tag--outlined">Outlined</span><span class="shlz-tag">Removable<button class="shlz-tag__remove" aria-label="Remove">×</button></span></div>`,
  segment: `<fieldset class="shlz-segment"><legend class="shlz-visually-hidden">View</legend><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="f-segment" checked><span class="shlz-segment__label">Список</span></label><label class="shlz-segment__option"><input class="shlz-segment__input" type="radio" name="f-segment"><span class="shlz-segment__label">Карточки</span></label></fieldset>`,
  notification: `<div class="shlz-stack">${notification("", '<button class="shlz-notification__close" aria-label="Close">×</button>')}${notification("shlz-notification--danger", '<button class="shlz-notification__close" aria-label="Close">×</button>')}${notification("", '<button class="shlz-notification__action">Удалить</button>')}${[5, 4, 3, 2, 1, 0].map((n) => notification("", `<span class="shlz-notification__countdown" style="--shlz-progress:${n / 5}">${n}</span>`)).join("")}${notification("", '<span class="shlz-notification__countdown shlz-notification__countdown--loading" aria-label="Loading"></span>')}</div>`,
  modal: `<div class="shlz-static-backdrop"><div class="shlz-modal__surface"><header class="shlz-modal__header"><h3 class="shlz-modal__title">Заголовок</h3><button class="shlz-modal__close" aria-label="Close">×</button></header><div class="shlz-modal__body">Modal body source-comparison fixture.</div><footer class="shlz-modal__footer"><button class="shlz-button">Отмена</button><button class="shlz-button shlz-button--primary">Сохранить</button></footer></div></div>`,
  drawer: `<div class="shlz-static-backdrop shlz-static-backdrop--drawer"><div class="shlz-drawer__surface"><header class="shlz-drawer__header"><h3 class="shlz-drawer__title">Заголовок</h3><button class="shlz-drawer__close" aria-label="Close">×</button></header><div class="shlz-drawer__body">Drawer body source-comparison fixture.</div><footer class="shlz-drawer__footer"><button class="shlz-button">Отмена</button><button class="shlz-button shlz-button--primary">Применить</button></footer></div></div>`,
};

export const fidelityMarkup = [
  { id: "button", title: "Button", sources: ["button"] },
  { id: "input", title: "Input", sources: ["input"] },
  { id: "textarea", title: "Textarea", sources: ["textarea"] },
  { id: "checkbox", title: "Checkbox", sources: ["checkbox"] },
  { id: "radio", title: "Radio", sources: ["radio"] },
  { id: "switch", title: "Switch", sources: ["switch"] },
  { id: "status", title: "Status / Badge", sources: ["status", "badge"] },
  {
    id: "dropdown",
    title: "Dropdown",
    sources: ["dropdown"],
    deviations:
      "Highlighted source row semantics are UNKNOWN; fixture exposes the visual state without naming it hover/selected/focus.",
  },
  { id: "popover", title: "Popover", sources: ["popover"] },
  {
    id: "tooltip",
    title: "Tooltip",
    sources: ["tooltip"],
    deviations:
      "Outlined source typography differs from browser text; all eight source placements remain simultaneously visible.",
  },
  { id: "tabs", title: "Tabs", sources: ["tabs"] },
  {
    id: "pagination",
    title: "Pagination",
    sources: ["pagination", "pagination-compact", "pagination-wide"],
  },
  { id: "tag", title: "Tag", sources: ["tag"] },
  { id: "segment", title: "Segment", sources: ["segment"] },
  {
    id: "notification",
    title: "Notification",
    sources: ["notification"],
    deviations:
      "Countdown and loading are static source-confirmed visuals; lifecycle remains UNKNOWN.",
  },
  {
    id: "modal",
    title: "Modal",
    sources: ["modal"],
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>. Backdrop is a DECISION.",
  },
  {
    id: "drawer",
    title: "Drawer",
    sources: ["drawer"],
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>.",
  },
]
  .map((entry) => unit({ ...entry, implementation: implementations[entry.id] }))
  .join("");
