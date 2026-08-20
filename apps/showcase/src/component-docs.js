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

const checkboxMarkup = `<label class="shlz-choice">
  <input class="shlz-checkbox" type="checkbox" name="notifications" value="yes" />
  <span>Получать уведомления</span>
</label>`;

const radioMarkup = `<fieldset>
  <legend>Режим</legend>
  <label class="shlz-choice">
    <input class="shlz-radio" type="radio" name="mode" value="standard" checked />
    <span>Стандартный</span>
  </label>
  <label class="shlz-choice">
    <input class="shlz-radio" type="radio" name="mode" value="advanced" />
    <span>Расширенный</span>
  </label>
</fieldset>`;

const switchMarkup = `<label class="shlz-switch">
  <input class="shlz-switch__input" type="checkbox" role="switch" name="alerts" value="enabled" />
  <span>Уведомления</span>
</label>`;

const switchBehavior = `const control = document.querySelector('[name="alerts"]');

if (control instanceof HTMLInputElement) {
  control.addEventListener("change", () => {
    // Persist control.checked in application code.
  });
}`;

const statusMarkup = `<span class="shlz-status shlz-status--green">Выполнено</span>`;

const badgeMarkup = `<span class="shlz-badge">
  12<span class="shlz-visually-hidden"> непрочитанных уведомлений</span>
</span>`;

const tagMarkup = `<span class="shlz-tag shlz-tag--outlined">По гарантии</span>`;

const personTagMarkup = `<span class="shlz-tag shlz-person-tag">
  <img class="shlz-tag__avatar" src="/assets/icons/user.svg" alt="" />
  Анна Петрова
</span>`;

const closablePersonTagMarkup = `<span class="shlz-tag shlz-person-tag" data-person-tag>
  <img class="shlz-tag__avatar" src="/assets/icons/user.svg" alt="" />
  Анна Петрова
  <button class="shlz-tag__remove" type="button" aria-label="Удалить Анну Петрову">
    <img class="shlz-tag__icon" src="/assets/icons/close-remove.svg" alt="" />
  </button>
</span>`;

const personTagBehavior = `const removeButton = document.querySelector(
  "[data-person-tag] .shlz-tag__remove",
);

removeButton?.addEventListener("click", () => {
  // For a stateful app, update its source state and re-render instead.
  removeButton.closest("[data-person-tag]")?.remove();
});`;

const segmentMarkup = `<fieldset class="shlz-segment">
  <legend class="shlz-visually-hidden">Период</legend>
  <label class="shlz-segment__option">
    <input class="shlz-segment__input" type="radio" name="period" value="day" checked />
    <span class="shlz-segment__label">День</span>
  </label>
  <label class="shlz-segment__option">
    <input class="shlz-segment__input" type="radio" name="period" value="week" />
    <span class="shlz-segment__label">Неделя</span>
  </label>
</fieldset>`;

const linkMarkup = `<a class="shlz-link" href="/requests/42">Открыть заявку</a>`;

const avatarMarkup = `<span class="shlz-avatar shlz-avatar--32" role="img" aria-label="Анна Петрова">
  АП
</span>`;

const avatarImageMarkup = `<span class="shlz-avatar shlz-avatar--40">
  <img class="shlz-avatar__image" src="/assets/avatars/anna.jpg" alt="Анна Петрова" />
</span>`;

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
  checkbox: {
    status: "Executable · Production example",
    purpose:
      "Native independent boolean choice with source-backed checked and mixed visuals.",
    use: [
      "Turn an independent option on or off, or select multiple items in a list.",
      "Use the native indeterminate property only for a real mixed parent/child state.",
    ],
    avoid: [
      "Use Radio for exactly one choice from a visible set and Switch for an immediate setting change.",
      "Do not use indeterminate as a third submitted value; form submission remains checked or unchecked.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "checkbox-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "checkbox-html",
        label: "HTML",
        language: "html",
        code: checkboxMarkup,
      },
    ],
    contract: [
      ["Label", "Native label.shlz-choice wraps the input and visible text."],
      ["Value owner", "Native input.shlz-checkbox[type=checkbox]."],
      ["Sizes", "Default 20px; add .shlz-checkbox--sm for 16px."],
      [
        "States",
        "Native checked, disabled, focus-visible and indeterminate property.",
      ],
      ["Events", "Native input/change events; application owns state."],
    ],
    accessibility:
      "The wrapping label supplies the accessible name and enlarges the hit target. Space toggles the focused native checkbox. Set mixed state through element.indeterminate. Checked submits the configured string value; unchecked submits no entry, so the consumer maps presence/value to its boolean model.",
    limitations:
      "Indeterminate is a DOM property, not a persistent HTML attribute or third form value. Validation messaging, parent/child selection policy and bulk-selection behavior are consumer-owned.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Checkbox.svg"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/choice.css"],
      ["Documentation", "docs/components/checkbox.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/choice-status-source.test.mjs"],
      ["Bundle contract tests", "tools/tests/components.test.mjs"],
      ["Browser tests", "tools/playwright/choice-status.spec.js"],
    ],
  },
  radio: {
    status: "Executable · Production example",
    purpose:
      "Native mutually exclusive choice grouped by a shared name and visible group label.",
    use: [
      "Choose exactly one value from a small set whose options should remain visible for comparison.",
      "Group related radios with fieldset/legend and one shared name.",
    ],
    avoid: [
      "Use Checkbox for independent boolean choices and Select for a long compact option list.",
      "Do not manage mutual exclusion with custom application state instead of the native name group.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "radio-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      { id: "radio-html", label: "HTML", language: "html", code: radioMarkup },
    ],
    contract: [
      ["Group", "Native fieldset with a visible legend."],
      ["Option label", "Native label.shlz-choice wraps each input and text."],
      ["Value owner", "Native input.shlz-radio[type=radio]."],
      ["Grouping", "Every option in one group shares the same non-empty name."],
      ["States", "Native checked, disabled and focus-visible."],
    ],
    accessibility:
      "Fieldset/legend provides the group name; each wrapping label names its option. Arrow keys move within the native same-name group and Space selects the focused option. DOM order should match visual order.",
    limitations:
      "Only each 20px radio option is styled. Fieldset/legend reset and group layout, validation messaging and dynamic option descriptions are consumer-owned; no custom behavior layer is provided.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Radio.svg"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/choice.css"],
      ["Documentation", "docs/components/radio.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/choice-status-source.test.mjs"],
      ["Bundle contract tests", "tools/tests/components.test.mjs"],
      ["Browser tests", "tools/playwright/choice-status.spec.js"],
    ],
  },
  switch: {
    status: "Executable · Production example",
    purpose:
      "Native checkbox exposed as a switch for an on/off setting that takes effect immediately.",
    use: [
      "Turn one setting on or off when the product applies the change immediately.",
      "Use a visible label that names the setting rather than narrating the current state.",
    ],
    avoid: [
      "Use Checkbox when choices are reviewed and submitted together or when mixed state is required.",
      "Do not use Switch for commands, mutually exclusive choices or a setting that cannot be changed immediately.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "switch-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "switch-html",
        label: "HTML",
        language: "html",
        code: switchMarkup,
      },
      {
        id: "switch-js",
        label: "Application integration point",
        language: "js",
        code: switchBehavior,
      },
    ],
    contract: [
      [
        "Label",
        "Native label.shlz-switch wraps the input and visible setting name.",
      ],
      [
        "State owner",
        "Native input.shlz-switch__input[type=checkbox][role=switch].",
      ],
      ["Sizes", "Default Medium 38×20; add .shlz-switch__input--sm for 24×14."],
      ["States", "Native checked, disabled and focus-visible."],
      [
        "Events",
        "Listen to native change; application owns persistence and failure handling.",
      ],
    ],
    accessibility:
      "The wrapping label names the switch; role=switch exposes its checked state as on/off. Space toggles the focused native control. Keep the label stable when state changes and communicate persistence failures separately.",
    limitations:
      "No persistence, loading, optimistic-update or rollback behavior is shipped. Indeterminate is not a Switch state. Checked submits the configured string value and unchecked submits no entry.",
    traceability: [
      [
        "Authoritative component set",
        "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
      ],
      ["Source sheet", "shlz-design-source/raw/svg/Switch.svg"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/choice.css"],
      ["Documentation", "docs/components/switch.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/choice-status-source.test.mjs"],
      ["Browser tests", "tools/playwright/choice-status.spec.js"],
    ],
  },
  status: {
    status: "Executable · Production example",
    purpose:
      "Compact textual label for an application-defined business status.",
    use: [
      "Show a short persistent state label in a table, card or record summary.",
      "Choose a paint modifier through one centrally documented product mapping.",
    ],
    avoid: [
      "Use Badge for a compact count or dot indicator and Notification for transient feedback.",
      "Do not infer or communicate meaning from color alone; modifier names are paint families, not business semantics.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "status-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "status-html",
        label: "HTML",
        language: "html",
        code: statusMarkup,
      },
    ],
    contract: [
      ["Element", "Text-bearing span.shlz-status."],
      [
        "Paint modifiers",
        "--green, --bright-green, --source-blue, --orange, --purple, --cyan, --pink and --neutral.",
      ],
      ["Semantics", "Visible text and consumer context own business meaning."],
      ["Interaction", "None; Status is not a control."],
    ],
    accessibility:
      "Status meaning must be present in text, not color alone. Keep the status in normal reading order. Dynamic changes that require announcement need a consumer-owned live-region pattern; the pill itself has no implicit live semantics.",
    limitations:
      "Modifier names describe source paint families, not approved mappings such as success/warning/error. No icon, dismiss, interactive, live-announcement or transition contract is shipped.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Status.svg"],
      [
        "Source component sets",
        "shlz-design-source/raw/svg/UI Kit – Interface elements.zip",
      ],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/status-badge.css"],
      ["Documentation", "docs/components/status.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/choice-status-source.test.mjs"],
      ["Browser tests", "tools/playwright/choice-status.spec.js"],
    ],
  },
  badge: {
    status: "Executable · Production example",
    purpose:
      "Compact count or dot indicator that supplements a named parent item.",
    use: [
      "Show a short count beside a navigation item, tab, inbox or compact action.",
      "Use a dot only when its meaning is supplied by the surrounding label or adjacent hidden text.",
    ],
    avoid: [
      "Use Status for a textual business state and do not use Badge as the only label of a control.",
      "Do not encode critical meaning only through the dot color or an unexplained number.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "badge-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      { id: "badge-html", label: "HTML", language: "html", code: badgeMarkup },
    ],
    contract: [
      ["Count", "span.shlz-badge with visible consumer-owned text."],
      ["Size", "Default 16px; add .shlz-badge--lg for 23px."],
      ["Paint", ".shlz-badge--invert or .shlz-badge--neutral."],
      [
        "Single glyph",
        "Add .shlz-badge--single for the source-backed compact width.",
      ],
      ["Dot", "span.shlz-badge-dot; optional --neutral paint."],
    ],
    accessibility:
      "Give a count its noun/context through visible or visually hidden text. Decorative dots use aria-hidden=true; meaningful dots need adjacent text available to assistive technology. Badge has no implicit live-region behavior.",
    limitations:
      "No maximum-count, 99+, localization, animation or live-announcement policy is shipped. Text overflow and business meaning are consumer-owned; Badge is not interactive by itself.",
    traceability: [
      [
        "Authoritative component sets",
        "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
      ],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/status-badge.css"],
      ["Documentation", "docs/components/badge.md"],
      ["Showcase", "apps/showcase/src/fidelity.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/choice-status-source.test.mjs"],
      ["Browser tests", "tools/playwright/choice-status.spec.js"],
    ],
  },
  tag: {
    status: "Executable · Production example",
    purpose:
      "Compact non-interactive metadata label in filled or outlined source-backed form.",
    use: [
      "Label an item with short secondary metadata or a category.",
      "Use Person Tag, not generic Tag, when the content represents a person with avatar/removal structure.",
    ],
    avoid: [
      "Use Status for a business state and Badge for a count/dot.",
      "Do not make the presentation span clickable or encode semantic categories through unsupported colors.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "tag-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      { id: "tag-html", label: "HTML", language: "html", code: tagMarkup },
    ],
    contract: [
      ["Element", "Text-bearing span.shlz-tag."],
      ["Variants", "Default filled and .shlz-tag--outlined."],
      [
        "Semantics",
        "Visible text owns meaning; Tag is presentation, not a control.",
      ],
      ["Interaction", "None for generic Tag."],
    ],
    accessibility:
      "Use concise visible text and keep Tag out of the tab order. If a label needs an action, compose a separate correctly named control rather than adding click semantics to the span.",
    limitations:
      "No semantic colors, selection, disabled, removable or interactive generic-Tag contract. Content and category vocabulary are consumer-owned.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Tag.svg"],
      ["Source specification", "docs/components/tag-source.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/tag.css"],
      ["Documentation", "docs/components/tag.md"],
      ["Showcase", "apps/showcase/src/main.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/tag-source.test.mjs"],
      ["Browser tests", "tools/playwright/fidelity.spec.js"],
    ],
  },
  "person-tag": {
    status: "Executable · Production example",
    purpose:
      "Compact person identity label with a decorative avatar and optional removal control.",
    use: [
      "Show a selected or associated person when their visible name remains the primary identity text.",
      "Use the closable source variant only when the consumer implements a real remove action.",
    ],
    avoid: [
      "Do not use Person Tag as authentication identity, a profile link or a generic category label.",
      "Do not render a close icon without a native button, accessible name and application handler.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/icons/icons/user.svg", "Required by this fallback example"],
      [
        "@shlz/icons/icons/close-remove.svg",
        "Required by the closable example",
      ],
      ["@shlz/behaviors", "Not required; removal is consumer-owned"],
    ],
    snippets: [
      {
        id: "person-tag-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "person-tag-html",
        label: "HTML",
        language: "html",
        code: personTagMarkup,
      },
      {
        id: "person-tag-closable-html",
        label: "Optional closable HTML",
        language: "html",
        code: closablePersonTagMarkup,
      },
      {
        id: "person-tag-js",
        label: "Standalone removal integration",
        language: "js",
        code: personTagBehavior,
      },
    ],
    contract: [
      ["Root", "span.shlz-tag.shlz-person-tag."],
      [
        "Avatar",
        "img.shlz-tag__avatar; empty alt when the visible name repeats identity.",
      ],
      ["Name", "Visible text content."],
      [
        "Optional remove",
        "Native button.shlz-tag__remove with a specific accessible name.",
      ],
      [
        "Behavior",
        "No removal controller; consumer handles activation and state.",
      ],
    ],
    accessibility:
      "The visible name identifies the person, so a repeated avatar uses empty alt. A remove button needs type=button and a specific label such as ‘Удалить Анну Петрову’; focus and activation remain native.",
    limitations:
      "No avatar loading/fallback, identity lookup, profile navigation, removal controller, disabled or pending-state behavior is shipped. The example removes standalone DOM; stateful apps must update their source state instead. Consumer-provided images require their own asset/privacy policy.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Tag.svg"],
      ["Source specification", "docs/components/tag-source.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/tag.css"],
      ["Documentation", "docs/components/person-tag.md"],
      ["Showcase", "apps/showcase/src/main.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/tag-source.test.mjs"],
      ["Browser tests", "tools/playwright/fidelity.spec.js"],
    ],
  },
  segment: {
    status: "Executable · Production radio-group example",
    purpose:
      "Compact single-choice control that keeps a small visible option set in one source-backed shell.",
    use: [
      "Choose exactly one value from a short set when compact side-by-side comparison helps.",
      "Use one stable group label, shared radio name and unique value per option.",
    ],
    avoid: [
      "Use Tabs for switching document panels/navigation and Select for a long or space-constrained list.",
      "Do not apply the radio contract to links, commands or multi-selection.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "segment-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "segment-html",
        label: "HTML",
        language: "html",
        code: segmentMarkup,
      },
    ],
    contract: [
      [
        "Group",
        "Native fieldset.shlz-segment with legend.shlz-visually-hidden.",
      ],
      ["Option", "label.shlz-segment__option."],
      [
        "State owner",
        "Native input.shlz-segment__input[type=radio] sharing one name.",
      ],
      ["Visual label", ".shlz-segment__label immediately follows its input."],
      [
        "Sizes",
        "Default Medium 33px; .shlz-segment--sm 26px; .shlz-segment--lg 41px.",
      ],
    ],
    accessibility:
      "A visually hidden legend inside the fixed shell names the group; any visible question belongs outside the fieldset. Native same-name radios own mutual exclusion, form data and Arrow/Space keyboard behavior. Keep DOM and visual order aligned and give every option a unique value.",
    limitations:
      "This contract is value selection, not tabs/navigation or a toggle-button toolbar. Selected+disabled is absent from source. Equal-width distribution, wrapping and responsive overflow policy are consumer-owned.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Segment.svg"],
      ["Source specification", "docs/components/segment-source.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/segment.css"],
      ["Documentation", "docs/components/segment.md"],
      ["Showcase", "apps/showcase/src/main.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/segment-source.test.mjs"],
      ["Bundle tests", "tools/tests/components.test.mjs"],
      ["Browser tests", "tools/playwright/fidelity.spec.js"],
    ],
  },
  link: {
    status: "Executable · Production example",
    purpose:
      "Native text link with source-backed SHLZ typography and interaction paints.",
    use: [
      "Navigate to another resource, route or section.",
      "Use destination-specific link text.",
    ],
    avoid: [
      "Use Button for an action in the current interface.",
      "Do not use diagnostic visual-state classes in application markup.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
    ],
    snippets: [
      {
        id: "link-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      { id: "link-html", label: "HTML", language: "html", code: linkMarkup },
    ],
    contract: [
      ["Element", "Native a.shlz-link with a real href."],
      ["States", "Native hover, active and focus-visible."],
      [
        "Unavailable",
        "span.shlz-link.shlz-link--disabled as non-interactive text.",
      ],
      ["Typography", "16px/21px regular text; content-sized width."],
    ],
    accessibility:
      "Use a real anchor and href for navigation so browser keyboard, context-menu and link semantics remain available. Link text must describe its destination. An unavailable destination is styled non-interactive text, not a focusable or ARIA-disabled anchor.",
    limitations:
      "Visited, external-link and icon variants are not shipped contracts. The --visual-hover and --visual-pressed classes are diagnostic fixtures only. Client routing may intercept a native link but must preserve its href and standard semantics.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Link.svg"],
      ["Evidence map", "docs/evidence-map.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/link.css"],
      ["Documentation", "docs/components/link.md"],
      ["Showcase", "apps/showcase/src/wave3.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/wave3-source.test.mjs"],
      ["Browser tests", "tools/playwright/components-next.spec.js"],
    ],
  },
  avatar: {
    status: "Executable · Production examples",
    purpose:
      "Compact visual identity marker rendered as text, an image or an icon.",
    use: [
      "Identify a person or entity where adjacent context makes its role clear.",
      "Use text initials or the icon fallback when a reliable image is unavailable.",
    ],
    avoid: [
      "Do not make Avatar interactive by itself; use a separately designed link or button composition.",
      "Do not use it as the only source of a person's name or status.",
    ],
    dependencies: [
      ["@shlz/styles/shlz.css", "Required"],
      ["@shlz/behaviors", "Not required"],
      ["Image or icon asset", "Consumer-owned for those content types"],
    ],
    snippets: [
      {
        id: "avatar-css",
        label: "Styles",
        language: "html",
        code: '<link rel="stylesheet" href="/assets/shlz.css" />',
      },
      {
        id: "avatar-text-html",
        label: "Text fallback",
        language: "html",
        code: avatarMarkup,
      },
      {
        id: "avatar-image-html",
        label: "Image",
        language: "html",
        code: avatarImageMarkup,
      },
    ],
    contract: [
      ["Root", ".shlz-avatar with exactly one content representation."],
      ["Sizes", "--24, --32, --40 and --64; default is 32px."],
      ["Image", "img.shlz-avatar__image fills and crops the circle."],
      ["Icon", ".shlz-avatar--icon with img.shlz-avatar__icon."],
      ["Text", "Initials or another short text fallback inside the root."],
    ],
    accessibility:
      'When Avatar is the only naming content, use role="img" with an accessible name on a text/icon root or give its image meaningful alt text. Prefer a decorative Avatar beside the visible full name; then use aria-hidden="true" on a text/icon root or alt="" on an image. Never encode status or identity through the picture alone.',
    limitations:
      "Badge, arbitrary shapes, 48px size, loading and fallback behavior are not shipped. Consumers must replace a failed image with text or icon markup; CSS alone does not provide that lifecycle. Image privacy, authorization and caching are application responsibilities.",
    traceability: [
      ["Authoritative source", "shlz-design-source/raw/svg/Avatar.svg"],
      ["Evidence map", "docs/evidence-map.md"],
      ["Provenance", "packages/tokens/provenance.json"],
      ["Tokens", "packages/tokens/tokens.json"],
      ["Styles", "packages/styles/components/avatar.css"],
      ["Documentation", "docs/components/avatar.md"],
      ["Showcase", "apps/showcase/src/wave3.js"],
      ["Snippet tests", "tools/tests/component-documentation.test.mjs"],
      ["Source tests", "tools/tests/wave3-source.test.mjs"],
      ["Browser tests", "tools/playwright/components-next.spec.js"],
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
