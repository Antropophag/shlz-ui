import references from "../generated/source-references/manifest.json";
import { iconHref, iconViewBox } from "@shlz/icons";
import spriteUrl from "@shlz/icons/sprite.svg?url";

const urls = import.meta.glob("../generated/source-references/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});
const urlByFile = Object.fromEntries(
  Object.entries(urls).map(([file, url]) => [file.split("/").pop(), url]),
);
const iconUrls = import.meta.glob(
  "../../../packages/icons/dist/icons/{arrow-down-md,arrow-left-md,arrow-right-md,search,close-remove,close,checkmark,user,filter,sort-asc}.svg",
  { eager: true, query: "?url", import: "default" },
);
const iconUrl = (name) =>
  Object.entries(iconUrls).find(([file]) => file.endsWith(`/${name}.svg`))?.[1];
const icon = (name, className = "") =>
  `<svg class="shlz-icon${className ? ` ${className}` : ""}" viewBox="${iconViewBox(name)}" aria-hidden="true"><use href="${iconHref(spriteUrl, name)}"></use></svg>`;

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

const overlayFidelityUnit = ({
  id,
  title,
  sources,
  implementation,
  fidelity,
  coverage,
  family,
  facts,
  deviations,
}) => `
  <article class="shlz-fidelity-unit" id="fidelity-${id}">
    <h3>${title}</h3>
    <details class="shlz-component-diagnostics" open>
      <summary>Source &amp; fidelity details</summary>
      <div class="shlz-component-diagnostics__content">
        <p><span class="shlz-fidelity-rating shlz-fidelity-rating--${fidelity.toLowerCase()}">${fidelity}</span> <strong>Coverage:</strong> ${coverage}. <strong>Source family:</strong> ${family}.</p>
        <div class="shlz-fidelity-columns">
          <section><h4>Source</h4><div class="shlz-reference-strip">${source(...sources)}</div></section>
          <section><h4>Implementation</h4><div class="shlz-visual-fixture" inert aria-hidden="true">${implementation}</div></section>
        </div>
        <p class="shlz-fidelity-notes"><strong>Source geometry / effects:</strong> ${facts}</p>
        <p class="shlz-fidelity-notes"><strong>Known deviations / UNKNOWN:</strong> ${deviations}</p>
        <details class="shlz-source-inventory"><summary>Complete source inventory</summary><div>${sources
          .map((component) => {
            const entry = references.find(
              (reference) => reference.component === component,
            );
            return `<section><h5>${entry.sourceFile}</h5><ol class="shlz-lossless-list">${entry.references.map((reference) => `<li><code>#${reference.sourceOrder ?? 1}</code> · <code>${reference.sourceNodeId ?? "sheet crop"}</code> · ${reference.rawVariantName ?? reference.kind} · ${reference.sourceWidth ?? "sheet"}×${reference.sourceHeight ?? "crop"}</li>`).join("")}</ol></section>`;
          })
          .join("")}</div></details>
      </div>
    </details>
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
const snackbarProgressPaths = {
  5: "M32 46C41.3888 46 49 38.3888 49 29C49 19.6112 41.3888 12 32 12C22.6112 12 15 19.6112 15 29C15 38.3888 22.6112 46 32 46ZM32 49C43.0457 49 52 40.0457 52 29C52 17.9543 43.0457 9 32 9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49Z",
  4: "M49 29C49 38.3888 41.3888 46 32 46C22.6112 46 15 38.3888 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49C43.0457 49 52 40.0457 52 29C52 26.3477 51.4837 23.8161 50.5462 21.5L47.9109 23C48.6148 24.8658 49 26.8879 49 29Z",
  3: "M44.6402 44.5L42.955 42C39.9963 44.4958 36.1738 46 32 46C22.6112 46 15 38.3888 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 40.0457 20.9543 49 32 49C36.7945 49 41.195 47.3129 44.6402 44.5Z",
  2: "M17.7171 43L20 41.0416C16.9114 37.9636 15 33.705 15 29C15 19.6112 22.6112 12 32 12V9C20.9543 9 12 17.9543 12 29C12 34.4509 14.1806 39.3925 17.7171 43Z",
  1: "M15.294 18L17.7171 19.7767C20.7454 15.0969 26.011 12 32 12V9C25.0179 9 18.8715 12.5778 15.294 18Z",
  0: "M31.2632 9.01332L31.4172 12.0098C31.6106 12.0033 31.8049 12 32 12V9C31.7533 9 31.5077 9.00447 31.2632 9.01332Z",
};
const snackbarCountdown = (number) =>
  `<span class="shlz-notification__source-countdown" data-snackbar-number="${number}"><svg viewBox="0 0 64 58" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="${snackbarProgressPaths[number]}" fill="currentColor"></path></svg><span>${number}</span></span>`;
const paginationItem = (content, state = "") =>
  `<span class="shlz-pagination__item${state ? ` shlz-pagination__item--${state}` : ""}">${content}</span>`;
const segmentGroup = (size = "", icons = false) =>
  `<div class="shlz-segment${size ? ` shlz-segment--${size}` : ""}">${["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map((label, index) => `<span class="shlz-segment__item${size ? ` shlz-segment__item--${size}` : ""}${index === 0 ? " shlz-segment__item--selected" : ""}">${icons ? icon("user", "shlz-segment__icon") : ""}${label}</span>`).join("")}</div>`;
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
const inputField = ({
  size = "large",
  state = "",
  filled = false,
  advanced = false,
  secondary = false,
} = {}) =>
  `<label class="shlz-field${size === "medium" ? " shlz-field--medium" : ""}${state ? ` shlz-field--${state}` : ""}"><span class="shlz-field__label">Label</span><span class="shlz-field__control"><input class="shlz-input" ${state === "disabled" ? "disabled" : ""} ${filled ? 'value="Input"' : 'placeholder="Placeholder"'}>${advanced ? `<button class="shlz-field__action" type="button" tabindex="-1" aria-label="Clear"><img class="shlz-field__icon" src="${iconUrl("close-remove")}" alt=""></button>` : ""}</span>${secondary ? '<span class="shlz-field__advanced-actions"><button class="shlz-field__action" type="button">Action</button><button class="shlz-field__action" type="button">Action</button></span>' : ""}</label>`;
const textareaField = ({ state = "", filled = false, count = false } = {}) =>
  `<label class="shlz-field shlz-field--textarea${state ? ` shlz-field--${state}` : ""}"><span class="shlz-field__label">Label</span><span class="shlz-field__control"><textarea class="shlz-textarea" ${state === "disabled" ? "disabled" : ""} ${state === "error" ? 'aria-invalid="true"' : ""} placeholder="Placeholder">${filled ? "Input text" : ""}</textarea></span>${count || state === "error" ? `<span class="shlz-field__secondary">${state === "error" ? '<span class="shlz-field__message">Error message</span>' : ""}${count ? '<span class="shlz-field__counter">12 / 100</span>' : ""}</span>` : ""}</label>`;
const selectField = ({
  size = "large",
  state = "",
  filled = false,
  search = false,
  multiple = false,
  status = false,
} = {}) =>
  `<label class="shlz-field shlz-field--select${size === "medium" ? " shlz-field--medium" : ""}${state ? ` shlz-field--${state}` : ""}${multiple ? " shlz-field--multiple" : ""}${status ? " shlz-field--status" : ""}"><span class="shlz-field__label">Label</span><span class="shlz-field__control">${multiple ? `${filled ? `<span class="shlz-field__chips"><span class="shlz-field__chip">Option 1${status ? "" : `<button class="shlz-field__chip-remove" type="button" tabindex="-1" aria-label="Remove Option 1"><img class="shlz-field__icon" src="${iconUrl("close-remove")}" alt=""></button>`}</span><span class="shlz-field__chip">${status ? "In progress" : `Option 2<button class="shlz-field__chip-remove" type="button" tabindex="-1" aria-label="Remove Option 2"><img class="shlz-field__icon" src="${iconUrl("close-remove")}" alt=""></button>`}</span></span><span class="shlz-field__indicator"><span class="shlz-field__count">3</span><img class="shlz-field__icon" src="${iconUrl("arrow-down-md")}" alt=""></span>` : `<span class="shlz-select shlz-select--placeholder">Placeholder</span><img class="shlz-field__icon" src="${iconUrl("arrow-down-md")}" alt="">`}` : status ? `${filled ? '<span class="shlz-field__chip">In progress</span>' : '<span class="shlz-select shlz-select--placeholder">Placeholder</span>'}<img class="shlz-field__icon" src="${iconUrl("arrow-down-md")}" alt="">` : search ? `<img class="shlz-field__icon" src="${iconUrl("search")}" alt=""><input class="shlz-input" ${state === "disabled" ? "disabled" : ""} ${filled ? 'value="Search text"' : 'placeholder="Search"'}>` : `<select class="shlz-select" ${state === "disabled" ? "disabled" : ""} aria-label="Label"><option value="" ${filled ? "" : "selected"}>${filled ? "Selected option" : "Placeholder"}</option></select><img class="shlz-field__icon" src="${iconUrl("arrow-down-md")}" alt="">`}</span></label>`;

const formSources = Object.fromEntries(
  ["input", "textarea", "select"].map((component) => [
    component,
    references.find((reference) => reference.component === component),
  ]),
);

const parseInputObservation = (name) =>
  Object.fromEntries(
    name.split(", ").map((part) => {
      const separator = part.indexOf("=");
      return [part.slice(0, separator), part.slice(separator + 1)];
    }),
  );

const fixtureForReference = (component, reference) => {
  const properties =
    reference.variantProperties ??
    parseInputObservation(reference.rawVariantName);
  const state =
    properties.State === "Hover"
      ? "visual-hover"
      : ["Focused", "Typing"].includes(properties.State)
        ? "visual-focus"
        : properties.State === "Disabled"
          ? "disabled"
          : properties.State === "Error"
            ? "error"
            : "";
  const filled = properties.Filled === "True";
  if (component === "input")
    return inputField({
      size: properties.Size?.toLowerCase(),
      state,
      filled,
      advanced: properties.Type === "Advanced" && reference.sourceOrder !== 3,
      secondary: reference.sourceOrder === 3,
    });
  if (component === "textarea")
    return textareaField({
      state,
      filled,
      count: properties["Show Count"] === "True",
    });
  return selectField({
    size: properties.Size?.toLowerCase(),
    state,
    filled,
    search: properties.Search === "True",
    multiple: properties.Multyselect === "True",
    status: properties.Status === "True",
  });
};

const formCoverage = (component, groups) => {
  const reference = formSources[component];
  return `<div class="shlz-form-coverage">${groups
    .map(({ title, select }) => {
      const variants = reference.references.filter(select);
      return `<section><h5>${title}</h5><div class="shlz-form-coverage__grid">${variants
        .map(
          (variant) =>
            `<figure><div inert aria-hidden="true">${fixtureForReference(component, variant)}</div><figcaption>#${variant.sourceOrder} · ${variant.rawVariantName}</figcaption></figure>`,
        )
        .join("")}</div></section>`;
    })
    .join("")}</div>`;
};

const stateMatrix = ({ columns, rows, render }) =>
  `<div class="shlz-api-state-matrix" style="--shlz-state-columns:${columns.length}"><span aria-hidden="true"></span>${columns.map((column) => `<b>${column.label}</b>`).join("")}${rows
    .map(
      (row) =>
        `<strong>${row.label}</strong>${columns.map((column) => `<div inert aria-hidden="true">${render(row, column)}</div>`).join("")}`,
    )
    .join("")}</div>`;

const choiceInput = ({
  kind,
  size = "large",
  state = "",
  labelled = false,
}) => {
  const sizeClass = size === "medium" ? " shlz-checkbox--sm" : "";
  const attributes =
    state === "checked"
      ? " checked"
      : state === "mixed"
        ? " data-shlz-indeterminate"
        : state === "disabled"
          ? " disabled"
          : state === "checked-disabled"
            ? " checked disabled"
            : "";
  const control = `<input class="shlz-${kind}${kind === "checkbox" ? sizeClass : ""}" type="${kind}"${labelled ? "" : ` aria-label="${kind} ${state || "default"}"`}${attributes}>`;
  return labelled
    ? `<label class="shlz-choice">${control}<span>Label</span></label>`
    : control;
};

const switchInput = ({ size = "medium", state = "off", labelled = false }) => {
  const attributes = state.includes("on") ? " checked" : "";
  const disabled = state.includes("disabled") ? " disabled" : "";
  const control = `<input class="shlz-switch__input${size === "small" ? " shlz-switch__input--sm" : ""}" type="checkbox" role="switch"${labelled ? "" : ` aria-label="switch ${state}"`}${attributes}${disabled}>`;
  return labelled
    ? `<label class="shlz-switch">${control}<span>Label</span></label>`
    : control;
};

const sourceSet = (component) =>
  references.find(
    (reference) =>
      reference.component === component && reference.sourceVariantCount,
  );

const sourceVariantImage = (component, order) => {
  const set = sourceSet(component);
  const variant = set.references.find((item) => item.sourceOrder === order);
  return `<figure class="shlz-reference shlz-reference--variant"><img src="${urlByFile[variant.file]}" alt="${variant.rawVariantName}"><figcaption>#${variant.sourceOrder} · <code>${variant.sourceNodeId}</code></figcaption></figure>`;
};

const sourceInventoryDetails = (components) =>
  components
    .map((component) => {
      const set = sourceSet(component);
      return `<section><h5>${set.sourceFile}</h5><ol class="shlz-lossless-list">${set.references.map((variant) => `<li><code>#${variant.sourceOrder}</code> · <code>${variant.sourceNodeId}</code> · ${variant.rawVariantName} · ${variant.sourceWidth}×${variant.sourceHeight}</li>`).join("")}</ol></section>`;
    })
    .join("");

const sourceBackedDiagnostics = ({
  components,
  fidelity,
  coverage,
  comparisons,
  deviations,
  warnings = "None.",
}) =>
  `<details class="shlz-component-diagnostics"><summary>Source &amp; fidelity details</summary><div class="shlz-component-diagnostics__content"><p><span class="shlz-fidelity-rating shlz-fidelity-rating--${fidelity.toLowerCase()}">${fidelity}</span> <strong>Coverage:</strong> ${coverage}</p><div class="shlz-choice-comparisons">${comparisons}</div><p class="shlz-fidelity-notes"><strong>Known deviations:</strong> ${deviations}</p><p class="shlz-fidelity-notes"><strong>Source warnings:</strong> ${warnings}</p><details class="shlz-source-inventory"><summary>Complete source inventory</summary><div>${sourceInventoryDetails(components)}</div></details></div></details>`;

const comparison = (component, order, implementation) =>
  `<div class="shlz-choice-comparison"><section><h5>Source</h5>${sourceVariantImage(component, order)}</section><section><h5>Implementation</h5><div class="shlz-choice-comparison__fixture" inert aria-hidden="true">${implementation}</div></section></div>`;

const status = (label, kind = "") =>
  `<span class="shlz-status${kind ? ` shlz-status--${kind}` : ""}">${label}</span>`;
const badge = (
  label,
  { size = "small", color = "blue", single = false } = {},
) =>
  `<span class="shlz-badge${size === "medium" ? " shlz-badge--lg" : ""}${color === "invert" ? " shlz-badge--invert" : color === "gray" ? " shlz-badge--neutral" : ""}${single ? " shlz-badge--single" : ""}">${label}</span>`;

const checkboxDiagnostics = sourceBackedDiagnostics({
  components: ["checkbox"],
  fidelity: "HIGH",
  coverage: "20/20 variants",
  comparisons:
    comparison("checkbox", 11, choiceInput({ kind: "checkbox" })) +
    comparison(
      "checkbox",
      3,
      choiceInput({ kind: "checkbox", state: "checked" }),
    ) +
    comparison(
      "checkbox",
      13,
      choiceInput({ kind: "checkbox", state: "mixed" }),
    ) +
    comparison(
      "checkbox",
      7,
      choiceInput({ kind: "checkbox", state: "checked-disabled" }),
    ) +
    comparison(
      "checkbox",
      4,
      choiceInput({ kind: "checkbox", size: "medium", state: "checked" }),
    ),
  deviations:
    "Keyboard focus-visible outline is an accessibility DECISION and is absent from the static source.",
  warnings:
    "Indeterminate=True + Checked=False duplicates the unchecked visual; only Checked=True carries the mixed mark. Disabled indeterminate variants are absent.",
});

const radioDiagnostics = sourceBackedDiagnostics({
  components: ["radio"],
  fidelity: "MEDIUM",
  coverage: "8/8 variants",
  comparisons:
    comparison("radio", 4, choiceInput({ kind: "radio" })) +
    comparison("radio", 7, choiceInput({ kind: "radio", state: "checked" })) +
    comparison(
      "radio",
      8,
      choiceInput({ kind: "radio", state: "checked-disabled" }),
    ),
  deviations:
    "Geometry and paints match; fidelity remains MEDIUM because duplicate source names contradict their actual paints and omit structured variantProperties.",
  warnings:
    "Two pairs share the same source name but encode default vs disabled paints. The visual model is reconstructed from geometry/paint, not the broken names.",
});

const switchDiagnostics = sourceBackedDiagnostics({
  components: ["switch"],
  fidelity: "HIGH",
  coverage: "12/12 variants",
  comparisons:
    comparison("switch", 5, switchInput({})) +
    comparison("switch", 1, switchInput({ state: "on" })) +
    comparison("switch", 4, switchInput({ state: "on-disabled" })) +
    comparison("switch", 6, switchInput({ size: "small" })) +
    comparison("switch", 2, switchInput({ size: "small", state: "on" })),
  deviations:
    "Keyboard focus-visible and the 120ms thumb transition are engineering DECISIONs; source contains static states only.",
  warnings:
    "The source axis spells Medium as Meduim. Small has no labelled variants.",
});

const badgeDiagnostics = sourceBackedDiagnostics({
  components: ["badge-count", "badge-dot"],
  fidelity: "HIGH",
  coverage: "14/14 variants",
  comparisons:
    comparison("badge-count", 1, badge("1", { single: true })) +
    comparison("badge-count", 9, badge("12", { color: "gray" })) +
    comparison(
      "badge-count",
      11,
      badge("12", { size: "medium", color: "invert" }),
    ) +
    comparison("badge-dot", 2, '<span class="shlz-badge-dot"></span>'),
  deviations:
    "Browser text uses the documented typography source/stack rather than outlined glyph paths.",
});

const statusDiagnostics = sourceBackedDiagnostics({
  components: ["status-requests", "status-details"],
  fidelity: "HIGH",
  coverage: "15/15 variants across two distinct Component Sets",
  comparisons:
    comparison("status-requests", 1, status("Новая")) +
    comparison("status-requests", 2, status("В работе ОКС", "green")) +
    comparison("status-requests", 8, status("Выполнена", "bright-green")) +
    comparison("status-requests", 9, status("Закрыта", "neutral")),
  deviations:
    "Public classes expose source paint families, not Service Desk-specific status semantics. Browser text differs from outlined SVG glyphs.",
  warnings:
    "Status meaning belongs to consuming products; the two source Component Sets are not merged into one product-specific enum.",
});

const inputStateMatrix = (size) =>
  stateMatrix({
    columns: [
      { label: "Default", state: "" },
      { label: "Hover", state: "visual-hover" },
      { label: "Focused", state: "visual-focus" },
      { label: "Disabled", state: "disabled" },
    ],
    rows: [
      { label: "Empty", filled: false },
      { label: "Filled", filled: true },
    ],
    render: (row, column) =>
      inputField({ size, state: column.state, filled: row.filled }),
  });

const textareaStateMatrix = () =>
  `<div class="shlz-textarea-state-grid">${[
    { label: "Default", state: "" },
    { label: "Hover", state: "visual-hover" },
    { label: "Focused", state: "visual-focus" },
    { label: "Error", state: "error" },
    { label: "Disabled", state: "disabled" },
  ]
    .map(
      ({ label, state }) =>
        `<section><h5>${label}</h5><div><span>Empty</span>${textareaField({ state })}<span>Filled</span>${textareaField({ state, filled: true })}</div></section>`,
    )
    .join("")}</div>`;

const representativePairs = (component, orders) => {
  const reference = formSources[component];
  return `<div class="shlz-form-pairs">${orders
    .map((order) =>
      reference.references.find(({ sourceOrder }) => sourceOrder === order),
    )
    .map(
      (variant) => `<article class="shlz-form-pair">
        <h5>${variant.rawVariantName}</h5>
        <div><figure><span>Source</span><img src="${urlByFile[variant.file]}" alt="Figma source variant: ${variant.rawVariantName}"></figure><figure><span>Implementation</span><div inert aria-hidden="true">${fixtureForReference(component, variant)}</div></figure></div>
      </article>`,
    )
    .join("")}</div>`;
};

const formCoverageGroups = {
  input: [
    {
      title: "Large · Default type",
      select: (item) =>
        item.rawVariantName.includes("Size=Large") &&
        item.rawVariantName.includes("Type=Default"),
    },
    {
      title: "Medium · Default type",
      select: (item) => item.rawVariantName.includes("Size=Medium"),
    },
    {
      title: "Advanced source nodes",
      select: (item) => item.rawVariantName.includes("Type=Advanced"),
    },
  ],
  textarea: [
    {
      title: "Empty · without count",
      select: (item) =>
        item.variantProperties.Filled === "False" &&
        item.variantProperties["Show Count"] === "False",
    },
    {
      title: "Filled · without count",
      select: (item) =>
        item.variantProperties.Filled === "True" &&
        item.variantProperties["Show Count"] === "False",
    },
    {
      title: "Filled · with count",
      select: (item) =>
        item.variantProperties.Filled === "True" &&
        item.variantProperties["Show Count"] === "True",
    },
    {
      title: "Empty · with count",
      select: (item) =>
        item.variantProperties.Filled === "False" &&
        item.variantProperties["Show Count"] === "True",
    },
  ],
  select: [
    {
      title: "Single selection · Large / Medium",
      select: (item) =>
        item.variantProperties.Search === "False" &&
        item.variantProperties.Multyselect === "False" &&
        item.variantProperties.Status === "False",
    },
    {
      title: "Search / typing",
      select: (item) => item.variantProperties.Search === "True",
    },
    {
      title: "Multyselect",
      select: (item) =>
        item.variantProperties.Multyselect === "True" &&
        item.variantProperties.Status === "False",
    },
    {
      title: "Status (single and multyselect)",
      select: (item) => item.variantProperties.Status === "True",
    },
  ],
};

const sourceInventory = (component) => {
  const count = formSources[component].sourceVariantCount;
  return `<p><strong>Source coverage:</strong> ${count}/${count} nodes from <code>${formSources[component].sourceFile}</code>, Component Set <code>${formSources[component].sourceNodeId}</code>.</p>${formCoverage(component, formCoverageGroups[component])}`;
};

const formDiagnostics = ({ component, orders, deviations }) => `
  <details class="shlz-component-diagnostics">
    <summary>Source &amp; fidelity details</summary>
    <div class="shlz-component-diagnostics__content">
      <p><span class="shlz-fidelity-rating shlz-fidelity-rating--medium">MEDIUM</span> <strong>Coverage:</strong> ${formSources[component].sourceVariantCount}/${formSources[component].sourceVariantCount} source nodes. Individual Figma SVG exports and production DOM/CSS are compared at 1:1 CSS-pixel scale.</p>
      ${representativePairs(component, orders)}
      <p class="shlz-fidelity-notes"><strong>Known deviations:</strong> ${deviations}</p>
      <details class="shlz-source-inventory"><summary>Complete source inventory</summary><div>${sourceInventory(component)}</div></details>
    </div>
  </details>`;

const buttonDiagnostics = `
  <details class="shlz-component-diagnostics">
    <summary>Source &amp; fidelity details</summary>
    <div class="shlz-component-diagnostics__content">
      <p><span class="shlz-fidelity-rating">HIGH</span> <strong>Coverage:</strong> complete source sheet matrix. Source and production visual-state fixture are shown side by side.</p>
      <div class="shlz-fidelity-columns"><section><h4>Source reference</h4><div class="shlz-reference-strip">${source("button")}</div></section><section><h4>Implementation</h4><div class="shlz-visual-fixture" inert aria-hidden="true">${buttonMatrix("primary")}${buttonMatrix()}${buttonMatrix("text")}</div></section></div>
      <p class="shlz-fidelity-notes"><strong>Known deviations:</strong> Source fixed specimen widths remain content-owned; mode, size, typography and state paints follow the recovered contract.</p>
      <details class="shlz-source-inventory"><summary>Complete source inventory</summary><div><p><code>Buttons.svg</code> is retained as the lossless source-sheet reference. The generated manifest records its original viewBox, crop viewBox, SHA-256 and crop rationale.</p></div></details>
    </div>
  </details>`;

export const primaryComponentMarkup = `
  <article class="shlz-api-component" id="button-demo">
    <header><h3>Button</h3><p>Запускает действие или подтверждает выбор.</p></header>
    <section><h4>Modes</h4><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Primary</button><button class="shlz-button">Secondary</button><button class="shlz-button shlz-button--text">Text</button></div></section>
    <section><h4>Sizes</h4><div class="shlz-cluster"><button class="shlz-button shlz-button--primary">Large</button><button class="shlz-button shlz-button--primary shlz-button--sm">Medium</button><button class="shlz-button shlz-button--primary shlz-button--xs">Small</button></div></section>
    <section data-shlz-button-source-matrix><h4>Mode × state matrix</h4><div class="shlz-control-matrix"><b>Mode</b><b>Default</b><b>Hover</b><b>Active</b><b>Disabled</b><span>Primary</span><button class="shlz-button shlz-button--primary">Default</button><button class="shlz-button shlz-button--primary shlz-button--visual-hover">Hover</button><button class="shlz-button shlz-button--primary shlz-button--visual-active">Active</button><button class="shlz-button shlz-button--primary" disabled>Disabled</button><span>Secondary</span><button class="shlz-button">Default</button><button class="shlz-button shlz-button--visual-hover">Hover</button><button class="shlz-button shlz-button--visual-active">Active</button><button class="shlz-button" disabled>Disabled</button><span>Text</span><button class="shlz-button shlz-button--text">Default</button><button class="shlz-button shlz-button--text shlz-button--visual-hover">Hover</button><button class="shlz-button shlz-button--text shlz-button--visual-active">Active</button><button class="shlz-button shlz-button--text" disabled>Disabled</button></div><h4>Source-backed sizes and icon combinations</h4><div class="shlz-cluster" data-shlz-button-source-icons><button class="shlz-button shlz-button--primary">${icon("search", "shlz-button__icon")}Label</button><button class="shlz-button">Label${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--sm" data-shlz-button-source-size="medium">Medium</button><button class="shlz-button shlz-button--xs" data-shlz-button-source-size="small">Small</button><button class="shlz-button shlz-button--text shlz-button--icon" aria-label="Text icon large">${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--primary shlz-button--icon" aria-label="Primary icon large">${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--icon shlz-button--sm" aria-label="Secondary icon medium">${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--text shlz-button--icon shlz-button--sm" aria-label="Text icon medium">${icon("search", "shlz-button__icon")}</button></div></section>
    <section><h4>With icon</h4><div class="shlz-cluster" data-shlz-button-icons><button class="shlz-button shlz-button--primary">${icon("search", "shlz-button__icon")}Найти</button><button class="shlz-button shlz-button--primary">Найти${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--primary shlz-button--icon" aria-label="Найти">${icon("search", "shlz-button__icon")}</button><button class="shlz-button shlz-button--primary shlz-button--visual-hover">${icon("search", "shlz-button__icon")}Hover</button><button class="shlz-button shlz-button--primary shlz-button--visual-active">${icon("search", "shlz-button__icon")}Active</button><button class="shlz-button shlz-button--primary" disabled>${icon("search", "shlz-button__icon")}Недоступно</button><button class="shlz-button">${icon("search", "shlz-button__icon")}Neutral</button><button class="shlz-button" disabled>${icon("search", "shlz-button__icon")}Disabled</button></div></section>
    ${buttonDiagnostics}
  </article>
  <article class="shlz-api-component" id="input-demo">
    <header><h3>Input</h3><p>Однострочное поле для ввода коротких текстовых значений.</p></header>
    <div class="shlz-api-size-switch" role="group" aria-label="Input size"><button class="shlz-button shlz-button--primary shlz-button--sm" type="button" data-shlz-input-size="large" aria-pressed="true">Large</button><button class="shlz-button shlz-button--sm" type="button" data-shlz-input-size="medium" aria-pressed="false">Medium</button></div>
    <section><h4>States</h4><div data-shlz-input-size-panel="large">${inputStateMatrix("large")}</div><div data-shlz-input-size-panel="medium" hidden>${inputStateMatrix("medium")}</div></section>
    ${formDiagnostics({
      component: "input",
      orders: [1, 14, 15, 11, 20, 3],
      deviations:
        "Structured properties are broken in source. The product meaning of the second Advanced node is UNKNOWN; Advanced observations remain diagnostics-only.",
    })}
  </article>
  <article class="shlz-api-component" id="textarea-demo">
    <header><h3>Textarea</h3><p>Многострочное поле для ввода развёрнутого текста.</p></header>
    <section><h4>States</h4>${textareaStateMatrix()}</section>
    <section><h4>Counter</h4><div class="shlz-api-example">${textareaField({ filled: true, count: true })}</div></section>
    ${formDiagnostics({
      component: "textarea",
      orders: [1, 6, 8, 9, 10, 17],
      deviations:
        "Native textarea caret and resize affordance differ locally from outlined SVG geometry.",
    })}
  </article>
  <article class="shlz-api-component" id="select-demo">
    <header><h3>Select</h3><p>Выбор одного или нескольких значений; Dropdown остаётся отдельным menu family.</p></header>
    <section><h4>Sizes and types</h4><div class="shlz-component-grid"><div>${selectField({ filled: true })}</div><div>${selectField({ size: "medium", filled: true })}</div><div>${selectField({ search: true })}</div><div>${selectField({ multiple: true, filled: true })}</div><div>${selectField({ status: true, filled: true })}</div><div>${selectField({ state: "disabled" })}</div></div></section>
    ${formDiagnostics({
      component: "select",
      orders: [1, 16, 20, 39, 45, 52],
      deviations:
        "Native single-select semantics are retained inside the source-backed control shell. Dropdown/menu families are documented separately.",
    })}
  </article>
  <article class="shlz-api-component" id="checkbox-demo">
    <header><h3>Checkbox</h3><p>Независимый выбор с native checked, disabled и indeterminate state.</p></header>
    <section><h4>Large</h4>${stateMatrix({
      columns: [
        { label: "Unchecked", state: "" },
        { label: "Checked", state: "checked" },
        { label: "Mixed", state: "mixed" },
        { label: "Disabled", state: "disabled" },
        { label: "Checked disabled", state: "checked-disabled" },
      ],
      rows: [
        { label: "Control", labelled: false },
        { label: "With label", labelled: true },
      ],
      render: (row, column) =>
        choiceInput({
          kind: "checkbox",
          state: column.state,
          labelled: row.labelled,
        }),
    })}</section>
    <section><h4>Medium</h4><div class="shlz-cluster">${choiceInput({ kind: "checkbox", size: "medium" })}${choiceInput({ kind: "checkbox", size: "medium", state: "checked" })}${choiceInput({ kind: "checkbox", size: "medium", state: "mixed" })}${choiceInput({ kind: "checkbox", size: "medium", state: "checked-disabled" })}</div></section>
    ${checkboxDiagnostics}
  </article>
  <article class="shlz-api-component" id="radio-demo">
    <header><h3>Radio</h3><p>Единственный выбор внутри native radio group.</p></header>
    <section><h4>States</h4>${stateMatrix({
      columns: [
        { label: "Default", state: "" },
        { label: "Selected", state: "checked" },
        { label: "Disabled", state: "disabled" },
        { label: "Selected disabled", state: "checked-disabled" },
      ],
      rows: [
        { label: "Control", labelled: false },
        { label: "With label", labelled: true },
      ],
      render: (row, column) =>
        choiceInput({
          kind: "radio",
          state: column.state,
          labelled: row.labelled,
        }),
    })}</section>
    ${radioDiagnostics}
  </article>
  <article class="shlz-api-component" id="switch-demo">
    <header><h3>Switch</h3><p>Мгновенно включает или выключает настройку через checkbox с role=switch.</p></header>
    <section data-shlz-switch-source-matrix><h4>Source size and state matrix</h4>${stateMatrix(
      {
        columns: [
          { label: "Off", state: "off" },
          { label: "On", state: "on" },
          { label: "Off disabled", state: "off-disabled" },
          { label: "On disabled", state: "on-disabled" },
        ],
        rows: [
          { label: "Medium", size: "medium" },
          { label: "Small", size: "small" },
        ],
        render: (row, column) =>
          switchInput({ size: row.size, state: column.state }),
      },
    )}</section>
    <section><h4>With label</h4><div class="shlz-cluster">${switchInput({ state: "on", labelled: true })}${switchInput({ state: "off-disabled", labelled: true })}</div></section>
    ${switchDiagnostics}
  </article>
  <article class="shlz-api-component" id="status-demo">
    <header><h3>Status</h3><p>Визуальная метка состояния; продуктовый смысл задаёт consumer и не кодируется именем класса.</p></header>
    <section><h4>Source paint families</h4><div class="shlz-cluster">${status("Blue")}${status("Green", "green")}${status("Bright green", "bright-green")}${status("Orange", "orange")}${status("Blue pair", "source-blue")}${status("Violet", "purple")}${status("Turquoise", "cyan")}${status("Pink", "pink")}${status("Neutral", "neutral")}</div></section>
    ${statusDiagnostics}
  </article>
  <article class="shlz-api-component" id="badge-demo">
    <header><h3>Badge</h3><p>Компактный счётчик или dot-индикатор; это отдельное семейство, не Status.</p></header>
    <section><h4>Count</h4><div class="shlz-control-matrix shlz-badge-matrix"><b>Size</b><b>Blue</b><b>Blue invert</b><b>Gray</b><span>Small</span>${badge("1", { single: true })}${badge("1", { color: "invert", single: true })}${badge("1", { color: "gray", single: true })}<span>Small · multiple</span>${badge("12")}${badge("12", { color: "invert" })}${badge("12", { color: "gray" })}<span>Medium</span>${badge("12", { size: "medium" })}${badge("12", { size: "medium", color: "invert" })}${badge("12", { size: "medium", color: "gray" })}</div></section>
    <section><h4>Dot</h4><div class="shlz-cluster"><span class="shlz-badge-dot"></span><span class="shlz-badge-dot shlz-badge-dot--neutral"></span></div></section>
    ${badgeDiagnostics}
  </article>`;

const formFidelityUnit = ({ id, title, orders, deviations }) => `
  <article class="shlz-fidelity-unit shlz-fidelity-unit--forms" id="fidelity-${id}">
    <header><h3>${title} — fidelity <span class="shlz-fidelity-rating shlz-fidelity-rating--medium">MEDIUM</span></h3><p>Individual Figma variant SVG and production DOM/CSS are shown at 1:1 CSS-pixel scale.</p></header>
    <div class="shlz-form-comparison">${representativePairs(id, orders)}</div>
    <details class="shlz-source-metadata"><summary>Technical/source metadata</summary><p>${formSources[id].sourceVariantCount}/${formSources[id].sourceVariantCount} source nodes are covered by the Variants matrix in Implementation. References are byte-preserved exports; no HTML redraw is used on the Source side.</p></details>
    <p class="shlz-fidelity-notes"><strong>Known deviations:</strong> ${deviations}</p>
  </article>`;

const implementations = {
  link: `<div class="shlz-cluster"><a class="shlz-link">Link</a><a class="shlz-link shlz-link--visual-hover">Link</a><a class="shlz-link shlz-link--visual-pressed">Link</a><span class="shlz-link shlz-link--disabled">Link</span></div>`,
  avatar: `<div class="shlz-cluster">${[24, 32, 40, 64].flatMap((size) => [`<span class="shlz-avatar shlz-avatar--${size}">U</span>`, `<span class="shlz-avatar shlz-avatar--${size} shlz-avatar--icon">${icon("user", "shlz-avatar__icon")}</span>`]).join("")}</div>`,
  table: `<table class="shlz-table" style="inline-size:440px"><thead class="shlz-table__head"><tr><th class="shlz-table__cell">Name</th><th class="shlz-table__cell"><span class="shlz-table__header-content">State<span class="shlz-table__actions"><button class="shlz-table__affordance">${icon("sort-asc")}</button><button class="shlz-table__affordance" aria-pressed="true">${icon("filter")}</button></span></span></th></tr></thead><tbody><tr><td class="shlz-table__cell">Content</td><td class="shlz-table__cell"><span class="shlz-status">Active</span></td></tr><tr><td class="shlz-table__cell shlz-table__cell--visual-hover"><input class="shlz-table__editor" value="Editing"></td><td class="shlz-table__cell shlz-table__empty">—</td></tr></tbody></table>`,
  button: `<div class="shlz-visual-matrix"><div><p class="shlz-visual-matrix__label">Primary · 26/32/40 · four source rows</p>${buttonMatrix("primary")}</div><div><p class="shlz-visual-matrix__label">Neutral · 26/32/40 · four source rows</p>${buttonMatrix()}</div><div class="shlz-visual-row"><button class="shlz-button shlz-button--primary"><span class="shlz-button__icon">＋</span>Icon + text</button><button class="shlz-button shlz-button--primary shlz-button--icon" aria-label="Icon">＋</button></div></div>`,
  input: `<div class="shlz-form-fidelity-matrix"><b>Source family</b><b>Default</b><b>Hover</b><b>Focused</b><b>Disabled</b><span>Large · empty</span>${inputField()}${inputField({ state: "visual-hover" })}${inputField({ state: "visual-focus" })}${inputField({ state: "disabled" })}<span>Medium · filled</span>${inputField({ size: "medium", filled: true })}${inputField({ size: "medium", state: "visual-hover", filled: true })}${inputField({ size: "medium", state: "visual-focus", filled: true })}${inputField({ size: "medium", state: "disabled", filled: true })}<span>Advanced</span>${inputField({ advanced: true })}${inputField({ advanced: true, state: "visual-hover" })}${inputField({ advanced: true, filled: true, state: "visual-focus" })}${inputField({ secondary: true })}</div>`,
  textarea: `<div class="shlz-form-fidelity-matrix"><b>Filled / count</b><b>Default</b><b>Hover</b><b>Focused</b><b>Error / disabled</b><span>Empty · no count</span>${textareaField()}${textareaField({ state: "visual-hover" })}${textareaField({ state: "visual-focus" })}${textareaField({ state: "error" })}<span>Filled · count</span>${textareaField({ filled: true, count: true })}${textareaField({ state: "visual-hover", filled: true, count: true })}${textareaField({ state: "visual-focus", filled: true, count: true })}${textareaField({ state: "disabled", filled: true, count: true })}</div>`,
  select: `<div class="shlz-form-fidelity-matrix"><b>Source family</b><b>Default</b><b>Hover</b><b>Focused / typing</b><b>Disabled</b><span>Single large</span>${selectField()}${selectField({ state: "visual-hover", filled: true })}${selectField({ state: "visual-focus", filled: true })}${selectField({ state: "disabled" })}<span>Single medium</span>${selectField({ size: "medium", filled: true })}${selectField({ size: "medium", state: "visual-hover" })}${selectField({ size: "medium", state: "visual-focus", search: true })}${selectField({ size: "medium", state: "disabled", filled: true })}<span>Status / multiple</span>${selectField({ status: true, filled: true })}${selectField({ multiple: true, filled: true, state: "visual-hover" })}${selectField({ multiple: true, status: true, filled: true, state: "visual-focus" })}${selectField({ multiple: true, state: "disabled" })}</div>`,
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
        `<span>${label}</span>${paginationItem(icon("arrow-left-md", "shlz-pagination__icon"), state)}${paginationItem(icon("arrow-right-md", "shlz-pagination__icon"), state)}${paginationItem("1", state)}${paginationItem("…", `ellipsis${state ? ` shlz-pagination__item--${state}` : ""}`)}${paginationItem(icon("arrow-right-md", "shlz-pagination__icon"), state)}`,
    )
    .join(
      "",
    )}</div><div><p class="shlz-visual-matrix__label">Group</p><div class="shlz-pagination__group">${paginationItem(icon("arrow-left-md", "shlz-pagination__icon"), "disabled")}${paginationItem("1", "visual-pressed")}${paginationItem("2")}${paginationItem("3")}${paginationItem("…", "ellipsis")}${paginationItem("8")}${paginationItem(icon("arrow-right-md", "shlz-pagination__icon"))}</div></div><div class="shlz-pagination__group"><span class="shlz-pagination__summary">1–20 из 289</span><span class="shlz-pagination__page-size-label">Показывать по:</span>${paginationItem("20", "visual-pressed")}${paginationItem("50")}${paginationItem("80")}</div></div>`,
  tag: `<div class="shlz-visual-matrix"><div class="shlz-visual-row"><span class="shlz-tag">По гарантии</span><span class="shlz-tag shlz-tag--outlined">По гарантии</span></div><div class="shlz-visual-row"><span class="shlz-tag shlz-person-tag">${icon("user", "shlz-tag__avatar")}Александр Васильев</span><span class="shlz-tag shlz-person-tag">${icon("user", "shlz-tag__avatar")}Александр Васильев<button class="shlz-tag__remove" aria-label="Remove">${icon("close-remove", "shlz-tag__icon")}</button></span></div></div>`,
  segment: `<div class="shlz-visual-matrix"><div><p class="shlz-visual-matrix__label">Segmented-Group · text</p><div class="shlz-visual-matrix">${segmentGroup("sm")}${segmentGroup()}${segmentGroup("lg")}</div></div><div><p class="shlz-visual-matrix__label">Segmented-Group · icon slots</p><div class="shlz-visual-matrix">${segmentGroup("sm", true)}${segmentGroup("", true)}${segmentGroup("lg", true)}</div></div><div><p class="shlz-visual-matrix__label">Segmented-Item matrix · state meaning UNKNOWN</p><div class="shlz-segment-item-matrix">${["sm", "", "lg"].flatMap((size) => ["", "disabled", "selected"].map((state) => `<span class="shlz-segment__item${state ? ` shlz-segment__item--${state}` : ""}${size ? ` shlz-segment__item--${size}` : ""}">Daily</span>`)).join("")}</div></div></div>`,
  notification: `<div class="shlz-notification-matrix">${notification("", `<span class="shlz-notification__icon">${icon("checkmark")}</span>`, "Notification Title", `<button class="shlz-notification__close" aria-label="Close">${icon("close")}</button>`)}${notification("shlz-notification--danger", `<span class="shlz-notification__icon">${icon("checkmark")}</span>`, "Notification Title", `<button class="shlz-notification__close" aria-label="Close">${icon("close")}</button>`)}${notification("", `<span class="shlz-notification__icon">${icon("checkmark")}</span>`, "Notification Title", '<button class="shlz-notification__action">Удалить</button>')}${[5, 4, 3, 2, 1, 0].map((n) => notification("", snackbarCountdown(n), "Сообщение отправлено", '<button class="shlz-notification__action">Отменить</button>')).join("")}${notification("", '<span class="shlz-notification__leading-progress" style="--shlz-progress:.72"></span>', "Сообщение отправляется", '<button class="shlz-notification__action">Отменить</button>')}</div>`,
  modal: `<div class="shlz-modal-matrix"><div class="shlz-modal__surface shlz-modal__surface--structured"><header class="shlz-modal__header"><h3 class="shlz-modal__title">Basic Modal</h3><button class="shlz-modal__close" aria-label="Close">×</button></header><div class="shlz-modal__body"><div class="shlz-modal__source-slot"></div></div><footer class="shlz-modal__footer"><button class="shlz-button shlz-button--sm">Cancel</button><button class="shlz-button shlz-button--primary shlz-button--sm">Done</button></footer></div>${compactModal("info", "This is some info")}${compactModal("success", "Some task has completed!")}${compactModal("warning", "This is a warning message")}${compactModal("error", "This is an error message")}</div>`,
  drawer: `<div class="shlz-static-backdrop shlz-static-backdrop--drawer"><div class="shlz-drawer__surface"><header class="shlz-drawer__header"><h3 class="shlz-drawer__title">Drawer Title</h3><button class="shlz-drawer__close" aria-label="Close">×</button></header><div class="shlz-drawer__body"><div class="shlz-drawer__source-slot"></div></div><footer class="shlz-drawer__footer"><button class="shlz-button">Назад</button><button class="shlz-button shlz-button--primary">Сохранить</button></footer></div></div>`,
};

export const fidelityMarkup = [
  {
    id: "link",
    title: "Link",
    sources: ["link"],
    fidelity: "HIGH",
    deviations:
      "Focus ring is an accessibility engineering decision outside the four source states.",
  },
  {
    id: "avatar",
    title: "Avatar",
    sources: ["avatar"],
    fidelity: "HIGH",
    deviations:
      "Image fallback is consumer-provided markup; source defines no broken-image transition.",
  },
  {
    id: "table",
    title: "Table foundation",
    sources: ["table-cell", "table-sorter", "table-filter"],
    fidelity: "HIGH",
    deviations:
      "49 cell variants map to composable semantic cells; 154px open editors are popup compositions, not row-height variants.",
  },
  { id: "button", title: "Button", sources: ["button"], fidelity: "HIGH" },
  {
    id: "input",
    title: "Input",
    sources: ["input"],
    fidelity: "HIGH",
    deviations:
      "Input source has broken structured properties; coverage follows 21 raw nodes without treating parsed names as API-backed axes. Browser Golos Text availability and the exact meaning of the second Advanced node remain UNKNOWN.",
  },
  {
    id: "textarea",
    title: "Textarea",
    sources: ["textarea"],
    fidelity: "MEDIUM",
    deviations:
      "All 20 structured variants map to the production composition; native textarea caret and resize affordance differ locally from outlined SVG geometry.",
  },
  {
    id: "select",
    title: "Select",
    sources: ["select"],
    fidelity: "MEDIUM",
    deviations:
      "The source Component Set is named Dropdown. All 52 structured variants map to six web axes; multiselect chips are reusable DOM, while native select popup behavior is browser-owned and outside the source node.",
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
  {
    id: "popover",
    title: "Popover",
    sources: ["popover-variants"],
    fidelity: "HIGH",
    coverage: "12/12 variants",
    family: "Popover Component Set · Placement axis only",
    facts:
      "236×90 surface; 244×90 or 236×97.071 outer bounds by arrow side; radius 12; exact two-layer 0 4/15 and 0 1/1.5 source shadows.",
  },
  {
    id: "tooltip",
    title: "Tooltip",
    sources: ["tooltip-variants"],
    fidelity: "HIGH",
    coverage: "8/8 variants",
    family: "Tooltip Component Set · Direction axis only",
    facts:
      "100×37 dark surface; 100×51.314 or 114.34×37 outer bounds by arrow side; radius 8; no shadow.",
    deviations:
      "Outlined source typography differs from browser text; all eight source placements remain simultaneously visible.",
  },
  { id: "tabs", title: "Tabs", sources: ["tabs"], fidelity: "HIGH" },
  {
    id: "pagination",
    title: "Pagination",
    sources: ["pagination", "pagination-compact", "pagination-wide"],
    fidelity: "HIGH",
  },
  { id: "tag", title: "Tag", sources: ["tag"], fidelity: "HIGH" },
  { id: "segment", title: "Segment", sources: ["segment"], fidelity: "HIGH" },
  {
    id: "notification",
    title: "Notification",
    sources: ["notification", "snackbar"],
    fidelity: "HIGH",
    deviations:
      "All six countdown frames are static source-confirmed visuals. Duration, step interval, easing, auto-dismiss, pause, reset and callbacks remain UNKNOWN. Loading lifecycle also remains UNKNOWN.",
  },
  {
    id: "modal",
    title: "Modal",
    sources: [
      "modal-basic",
      "modal-info",
      "modal-success",
      "modal-warning",
      "modal-error",
    ],
    fidelity: "HIGH",
    coverage: "5/5 standalone components",
    family:
      "Basic (Legacy), Info, Success, Warning and Error standalone components",
    facts:
      "572×196 structured and 416/417×165 compact surfaces; radius 16; exact two-layer 0 4/30 and 0 1/3 black source shadows.",
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>. Backdrop is a DECISION.",
  },
  {
    id: "drawer",
    title: "Drawer",
    sources: ["drawer-source"],
    fidelity: "HIGH",
    coverage: "1/1 standalone component",
    family: "Sidebar/Drawer standalone component; no source variant axis",
    facts:
      "420×900 surface; 64 header, 764 body and 72 footer; radius 16; no source shadow.",
    deviations:
      "Static fixture exposes production surface DOM/CSS; interactive demo above remains native <dialog>.",
  },
]
  .filter(
    ({ id }) =>
      ![
        "button",
        "input",
        "textarea",
        "checkbox",
        "radio",
        "switch",
        "status",
      ].includes(id),
  )
  .map((entry) => {
    const formOrders = {
      input: [1, 14, 15, 11, 20, 3],
      textarea: [1, 6, 8, 9, 10, 17],
      select: [1, 29, 16, 35, 15, 27, 39, 2, 31],
    };
    return ["tooltip", "popover", "modal", "drawer"].includes(entry.id)
      ? overlayFidelityUnit({
          ...entry,
          implementation: implementations[entry.id],
        })
      : formOrders[entry.id]
        ? formFidelityUnit({ ...entry, orders: formOrders[entry.id] })
        : unit({ ...entry, implementation: implementations[entry.id] });
  })
  .join("");
