const repositoryBase = "https://github.com/Antropophag/shlz-ui/blob/main/";

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const buttonMarkup = `<button class="shlz-button shlz-button--primary" type="button">
  Сохранить
</button>`;

const selectMarkup = `<div class="shlz-field shlz-field--select shlz-selectbox" data-shlz-select>
  <label class="shlz-field__label" for="request-type">Тип заявки</label>
  <span class="shlz-field__control">
    <select class="shlz-select" id="request-type" name="requestType">
      <option value="">Выберите тип</option>
      <option value="incident">Инцидент</option>
      <option value="request">Запрос</option>
    </select>
    <span class="shlz-field__indicator" aria-hidden="true">
      <img class="shlz-field__icon" src="/assets/icons/arrow-down-md.svg" alt="" />
    </span>
  </span>
</div>`;

const selectBehavior = `import { enhanceSelects } from "@shlz/behaviors/select";

const controllers = enhanceSelects();

// Connect this function to your page/application teardown lifecycle.
function destroySelects() {
  for (const controller of controllers) controller.destroy();
}`;

export const componentDocumentation = {
  button: {
    status: "Executable · Production example",
    purpose: "Native action control with source-backed SHLZ modes and sizes.",
    use: [
      "Run, confirm or cancel an action in the current workflow.",
      "Use an icon-only button only when its accessible name is explicit.",
    ],
    avoid: [
      "Do not use Button for navigation; use Link instead.",
      "Do not represent loading with disabled alone: loading is not yet a supported Button contract.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "button-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "button-html",
        label: "HTML",
        language: "html",
        code: buttonMarkup,
      },
    ],
    contract: [
      ["Element", "Native <button>; set type explicitly inside forms."],
      ["Modes", "Default neutral, --primary and --text."],
      ["Sizes", "Default 40px, --sm 32px and --xs 26px."],
      ["Icon-only", "Add --icon and an accessible name."],
      ["States", "Native hover, active, focus-visible and disabled."],
    ],
    accessibility:
      "Native keyboard activation and disabled semantics remain browser-owned. Icon-only controls require aria-label or equivalent visible text.",
    limitations:
      "Loading and read-only are not public Button states. Visual-state helper classes belong to diagnostics and must not be used as application state.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Buttons.svg"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/button.css"],
      ["Documentation", "docs/components/button.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Browser tests", "tools/playwright/primitives.spec.js"],
    ],
  },
  select: {
    status: "Executable · Production single-select",
    purpose:
      "Single-choice field whose native select remains the form owner and no-JavaScript fallback.",
    use: [
      "Choose one value from a predefined list in a form.",
      "Add the optional behavior when consistent popup rendering and keyboard typeahead are required.",
    ],
    avoid: [
      "Do not use Select for commands; use Dropdown menu.",
      "Searchable select, multiselect and status chips are source diagnostics, not supported runtime modes.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/icons/icons/arrow-down-md.svg", "Required by this markup"],
      ["@shlz/behaviors/select", "Optional progressive enhancement"],
    ],
    snippets: [
      {
        id: "select-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "select-html",
        label: "HTML",
        language: "html",
        code: selectMarkup,
      },
      {
        id: "select-js",
        label: "Optional behavior",
        language: "js",
        code: selectBehavior,
      },
    ],
    contract: [
      [
        "Root",
        ".shlz-field.shlz-field--select.shlz-selectbox[data-shlz-select]",
      ],
      ["Value owner", ".shlz-field__control > select.shlz-select"],
      ["Label", "Native label[for] connected to the select id."],
      ["Enhancement", "enhanceSelects(scope?) returns SelectController[]."],
      ["Events", "Selection dispatches bubbling native input and change."],
      [
        "Lifecycle",
        "destroy() removes generated UI and restores native hidden/id state.",
      ],
    ],
    accessibility:
      "Without JavaScript the labeled native select remains usable. Enhancement provides combobox/listbox semantics, disabled options and typeahead. Escape and option commit restore trigger focus; Tab and outside dismissal preserve the user's next focus target.",
    limitations:
      "Only single-select is implemented. There is no readonly state for native select. The enhancer does not yet forward aria-invalid or aria-describedby from the native select to its generated trigger. Search, multiselect and status variants remain unsupported until separate contracts are approved.",
    traceability: [
      [
        "Authoritative component set",
        "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
      ],
      ["Source sheet", "shlz-design-source/raw/svg/Select.svg"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Field styles", "packages/styles/components/field.css"],
      ["Popup styles", "packages/styles/components/select.css"],
      ["Behavior", "packages/behaviors/src/select.ts"],
      ["Documentation", "docs/components/select.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Contract tests", "tools/tests/select-behavior.test.mjs"],
      ["Browser tests", "tools/playwright/primitives.spec.js"],
    ],
  },
};

const list = (items) =>
  `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

const table = (rows, label) => `
  <div class="shlz-table-wrap">
    <table class="shlz-developer-docs__table">
      <caption class="shlz-visually-hidden">${label}</caption>
      <tbody>${rows.map(([name, value]) => `<tr><th scope="row"><code>${escapeHtml(name)}</code></th><td>${escapeHtml(value)}</td></tr>`).join("")}</tbody>
    </table>
  </div>`;

export function renderComponentDocumentation(name) {
  const docs = componentDocumentation[name];
  if (!docs) throw new TypeError(`Unknown component documentation: ${name}`);

  return `
    <details class="shlz-developer-docs" data-component-docs="${name}" open>
      <summary>Developer usage</summary>
      <div class="shlz-developer-docs__body">
        <p><span class="shlz-developer-docs__status">${docs.status}</span> ${docs.purpose}</p>
        <div class="shlz-developer-docs__guidance">
          <section><h4>Use when</h4>${list(docs.use)}</section>
          <section><h4>Avoid when</h4>${list(docs.avoid)}</section>
        </div>
        <section><h4>Dependencies</h4>${table(docs.dependencies, `${name} dependencies`)}</section>
        <section><h4>Copyable usage</h4>
          <p>Serve the exported <code>@shlz/styles/shlz.css</code> file at the URL used below.</p>
          ${docs.snippets.map(({ id, label, language, code }) => `<h5>${label}</h5><pre><code data-shlz-snippet="${id}" data-language="${language}">${escapeHtml(code)}</code></pre>`).join("")}
        </section>
        <section><h4>Public contract</h4>${table(docs.contract, `${name} public contract`)}</section>
        <section><h4>Accessibility</h4><p>${docs.accessibility}</p></section>
        <section><h4>Limitations</h4><p>${docs.limitations}</p></section>
        <section><h4>Traceability</h4><ul class="shlz-developer-docs__links">${docs.traceability.map(([label, path]) => `<li><a href="${repositoryBase}${encodeURI(path)}">${label}</a><code>${path}</code></li>`).join("")}</ul></section>
      </div>
    </details>`;
}
