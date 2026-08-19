# Select

## Status

`Executable / Production single-select`. Search, multiselect and status-chip examples in source/fidelity matrices are `Source diagnostic` or `Unsupported`; they are not hidden modes of the production controller.

## Purpose

Select lets a user choose one value from a predefined list. The native `<select>` remains the form-value owner and no-JavaScript fallback; optional progressive enhancement replaces only its visible browser chrome.

## Use when

- A form needs one value from a predefined set.
- Options are more appropriately scanned after opening a compact control than displayed as a short Radio group.
- Consistent popup rendering and prefix typeahead justify loading the optional behavior.

## Avoid when

- For commands or contextual actions use Dropdown menu.
- For a small, always-visible mutually exclusive set prefer Radio when the workflow benefits from comparing all choices.
- Do not use this contract for searchable select, multiselect, tags/status chips or remote option loading.

## Dependencies and setup

Required:

- `@shlz/styles/shlz.css`;
- an arrow asset, normally `@shlz/icons/icons/arrow-down-md.svg`.

Optional:

- `@shlz/behaviors/select` for the custom combobox/listbox popup.

Serve/copy the exported CSS and icon files as application assets:

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<div class="shlz-field shlz-field--select shlz-selectbox" data-shlz-select>
  <label class="shlz-field__label" for="request-type">Тип заявки</label>
  <span class="shlz-field__control">
    <select class="shlz-select" id="request-type" name="requestType">
      <option value="">Выберите тип</option>
      <option value="incident">Инцидент</option>
      <option value="request">Запрос</option>
    </select>
    <span class="shlz-field__indicator" aria-hidden="true">
      <img
        class="shlz-field__icon"
        src="/assets/icons/arrow-down-md.svg"
        alt=""
      />
    </span>
  </span>
</div>
```

Without JavaScript this remains a labeled native select.

```js
import { enhanceSelects } from "@shlz/behaviors/select";

const controllers = enhanceSelects();

// Connect this function to your page/application teardown lifecycle.
function destroySelects() {
  for (const controller of controllers) controller.destroy();
}
```

## Public HTML/API contract

| Contract         | Supported value                                                                   |
| ---------------- | --------------------------------------------------------------------------------- |
| Root             | `.shlz-field.shlz-field--select.shlz-selectbox[data-shlz-select]`                 |
| Value owner      | Direct `.shlz-field__control > select.shlz-select`                                |
| Label            | Native `label[for]` associated with the select `id`                               |
| Indicator        | `.shlz-field__indicator`, decorative content hidden from accessibility tree       |
| Initialization   | `enhanceSelects(scope?: ParentNode): SelectController[]`                          |
| Controller state | `root`, `nativeSelect`, generated `trigger`, generated `listbox`, `expanded`      |
| Methods          | `open()`, `close({ restoreFocus? })`, `destroy()`                                 |
| Events           | Committing an option dispatches bubbling native `input` and `change`              |
| External updates | Native `input`, `change` and form `reset` resynchronize generated UI              |
| Lifecycle        | `destroy()` removes generated nodes/listeners and restores native hidden/id state |

The application owns option data, validation, business state and event handling. The controller owns only DOM synchronization, keyboard interaction and teardown.

## Variants and states

- Supported sizes: default large 40px and `.shlz-field--medium` 32px.
- Supported value states: placeholder/empty and selected value.
- Supported runtime states: closed, open, focus-visible, disabled select, disabled option and selected option.
- Error styling may be composed through native `aria-invalid="true"` or `.shlz-field--error`; the application owns validation text and announcement relationship.
- Native `<select>` has no read-only state. Use disabled only when the value must be unavailable, not as a read-only substitute.
- Searchable, multiselect and status variants visible in the Figma Component Set remain unsupported runtime products.

## Keyboard behavior

| Key                   | Behavior                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Arrow Down / Arrow Up | When closed, open on the selected option; while open, move and wrap among enabled options |
| Home / End            | Open and move to first/last enabled option                                                |
| Printable text        | Prefix typeahead using option text                                                        |
| Enter / Space         | Open, or commit the active option when open                                               |
| Escape                | Close and restore trigger focus                                                           |
| Tab                   | Close without trapping focus                                                              |

Pointer selection and outside dismissal are supported. Hovering a disabled option does not move the active option.

## Accessibility

- No-JS fallback keeps a real label and native select semantics.
- Enhancement creates a button with combobox semantics and a controlled listbox with option selected/disabled states.
- `aria-expanded`, `aria-controls`, `aria-activedescendant` and `aria-selected` are synchronized by the controller.
- Clicking the visible label focuses the enabled generated combobox; after `destroy()` native label behavior is restored.
- The popup does not trap focus; form submission/reset remains native.
- Application validation may connect error/help text to the native field for the no-JS fallback. The current enhancer does not forward `aria-invalid` or `aria-describedby` to its generated trigger, so an enhanced validation announcement is not yet a supported contract.

## Composition

Select composes inside Field, forms, Modal and Drawer. Dropdown menu is a separate command family. The application owns filtering of remote data, dependent fields and persistence.

## Limitations

- Single-select only.
- No search, multiselect, status-chip, async-loading or virtualization contract.
- No read-only semantic state exists for native select.
- `aria-invalid` and `aria-describedby` are not forwarded from the native select to the generated trigger.
- Popup runtime semantics and reuse of the source-backed menu surface are repository decisions because static Figma does not establish keyboard behavior.

## Traceability

| Layer                       | Location                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Authoritative component set | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Dropdown` (`36:1106`) |
| Source sheet                | `shlz-design-source/raw/svg/Select.svg`                                                        |
| Source specification        | `docs/components/form-controls-source-spec.md`                                                 |
| Provenance                  | `packages/tokens/provenance.json`                                                              |
| Tokens                      | `packages/tokens/tokens.json`                                                                  |
| Field styles                | `packages/styles/components/field.css`                                                         |
| Popup styles                | `packages/styles/components/select.css`                                                        |
| Behavior                    | `packages/behaviors/src/select.ts`                                                             |
| Standalone/browser exports  | `packages/styles/package.json`, `packages/behaviors/package.json`                              |
| Showcase                    | `apps/showcase/src/fidelity.js#select-demo`                                                    |
| Contract tests              | `tools/tests/form-controls-source.test.mjs`, `tools/tests/select-behavior.test.mjs`            |
| Browser tests               | `tools/playwright/primitives.spec.js`, `tools/playwright/consumer-workspace.spec.js`           |

## Source interpretation

- `FACT`: closed-field geometry and all 52 structured variants of the Figma Component Set named `Dropdown`.
- `DECISION`: single-select progressive enhancement, ARIA combobox/listbox behavior, focus lifecycle and popup geometry reuse.
- `UNKNOWN/UNSUPPORTED`: searchable, multiselect, async and status runtime products.
