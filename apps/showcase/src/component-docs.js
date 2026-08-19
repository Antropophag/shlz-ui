const repositoryBase = "https://github.com/Antropophag/shlz-ui/blob/main/";

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const buttonMarkup = `<button class="shlz-button shlz-button--primary" type="button">
  Сохранить
</button>`;

const inputMarkup = `<label class="shlz-field">
  <span class="shlz-field__label">Название</span>
  <span class="shlz-field__control">
    <input class="shlz-input" type="text" name="title" placeholder="Введите название" />
  </span>
</label>`;

const textareaMarkup = `<label class="shlz-field shlz-field--textarea">
  <span class="shlz-field__label">Комментарий</span>
  <span class="shlz-field__control">
    <textarea class="shlz-textarea" name="comment"></textarea>
  </span>
</label>`;

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
  input: {
    status: "Executable · Production example",
    purpose:
      "Labeled single-line native input inside the source-backed SHLZ field composition.",
    use: [
      "Collect a short value whose meaning is expressed by a persistent visible label.",
      "Use the native input type and attributes that match the data being collected.",
    ],
    avoid: [
      "Use Textarea for multi-line content and Select/Radio for predefined choices.",
      "Do not use visual-state helpers or the source-only Advanced specimens as application API.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "input-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "input-html",
        label: "HTML",
        language: "html",
        code: inputMarkup,
      },
    ],
    contract: [
      ["Root", "Native label.shlz-field."],
      ["Control shell", ".shlz-field__control."],
      [
        "Value owner",
        "Native input.shlz-input; consumer owns type, name and validation.",
      ],
      [
        "Secondary row",
        ".shlz-field__secondary contains an optional .shlz-field__message.",
      ],
      ["Size", "Default 40px; add .shlz-field--medium for 32px."],
      ["States", "Native focus, disabled, readonly and aria-invalid."],
    ],
    accessibility:
      "The wrapping native label names the input. Browser focus, editing, disabled and readonly behavior remain native. Connect validation/help text with aria-describedby and use aria-invalid only when invalid.",
    limitations:
      "No masking, formatting, clear-button behavior or async-validation API is shipped. Advanced source nodes remain diagnostic because their product meaning is unresolved.",
    traceability: [
      [
        "Authoritative component set",
        "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
      ],
      ["Source specification", "docs/components/form-controls-source-spec.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/field.css"],
      ["Documentation", "docs/components/input.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Source tests", "tools/tests/form-controls-source.test.mjs"],
      ["Browser layout smoke", "tools/playwright/choice-status.spec.js"],
    ],
  },
  textarea: {
    status: "Executable · Production example",
    purpose:
      "Labeled native multi-line input using the source-backed Textarea field geometry.",
    use: [
      "Collect comments, descriptions or other content expected to span multiple lines.",
      "Use maxlength and a counter only when the product has a real length constraint.",
    ],
    avoid: [
      "Use Input for short single-line values and a rich-text editor for formatted content.",
      "Do not render a static counter that is not synchronized with the native value.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "textarea-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "textarea-html",
        label: "HTML",
        language: "html",
        code: textareaMarkup,
      },
    ],
    contract: [
      ["Root", "Native label.shlz-field.shlz-field--textarea."],
      [
        "Value owner",
        "Native textarea.shlz-textarea; consumer owns name and validation.",
      ],
      [
        "Secondary row",
        ".shlz-field__secondary may contain message and counter.",
      ],
      [
        "Error",
        "Set aria-invalid on textarea and connect message with aria-describedby.",
      ],
      [
        "States",
        "Native focus, disabled, readonly and value; source-backed error styling.",
      ],
    ],
    accessibility:
      "The wrapping native label names the textarea. Native editing, focus, disabled and readonly behavior remain browser-owned. Error/help text needs a stable id referenced by aria-describedby; counters do not replace an accessible constraint.",
    limitations:
      "The design system styles but does not update counters, auto-grow content, enforce business limits or announce remaining characters. The current fixed-height shell clips native vertical resizing, so resize is not a supported layout contract.",
    traceability: [
      [
        "Authoritative component set",
        "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
      ],
      ["Source sheet", "shlz-design-source/raw/svg/Textarea.svg"],
      ["Source specification", "docs/components/form-controls-source-spec.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/field.css"],
      ["Documentation", "docs/components/textarea.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Source tests", "tools/tests/form-controls-source.test.mjs"],
      ["Browser layout smoke", "tools/playwright/choice-status.spec.js"],
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
