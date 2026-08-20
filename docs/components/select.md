# Select

## Status

`Executable / Production single-select`. Search, multiselect and
status-chip examples in source/fidelity matrices are `Source diagnostic` or
`Unsupported`; they are not hidden production modes.

## Purpose

Select lets a user choose one value from a predefined list. The SHLZ trigger,
chevron and listbox reproduce the source visual language; a named hidden input
owns form submission and the framework-agnostic controller owns interaction.

## Use when

- A form needs one value from a predefined set.
- Options fit a compact picker better than a short visible Radio group.
- The opened option surface must retain SHLZ visual fidelity.

## Avoid when

- For commands or contextual actions use Dropdown menu.
- For a small, always-visible mutually exclusive set prefer Radio when comparing
  choices matters.
- Do not use this contract for searchable select, multiselect, status chips or
  remote loading.

## Dependencies and setup

Required:

- `@shlz/styles/shlz.css`;
- `@shlz/behaviors/select`.

Call `enhanceSelects()` after rendering and destroy returned controllers during
the application teardown lifecycle.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<div class="shlz-field shlz-field--select shlz-select-root" data-shlz-select>
  <span class="shlz-field__label" id="request-type-label">Тип заявки</span>
  <button
    class="shlz-field__control shlz-select__trigger"
    type="button"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded="false"
    aria-controls="request-type-options"
    aria-labelledby="request-type-label request-type-value"
  >
    <span id="request-type-value" data-shlz-select-value>Выберите тип</span>
    <svg class="shlz-select__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5 12 15.5 19 8.5" />
    </svg>
  </button>
  <div
    class="shlz-select__listbox"
    id="request-type-options"
    role="listbox"
    aria-labelledby="request-type-label"
    hidden
  >
    <button
      class="shlz-select__option"
      type="button"
      role="option"
      aria-selected="false"
      data-value="incident"
    >
      Инцидент
    </button>
    <button
      class="shlz-select__option"
      type="button"
      role="option"
      aria-selected="false"
      data-value="request"
    >
      Запрос
    </button>
  </div>
  <input type="hidden" name="requestType" value="" />
</div>
```

```js
import { enhanceSelects } from "@shlz/behaviors/select";

const controllers = enhanceSelects();

// Connect this function to your page/application teardown lifecycle.
function destroySelects() {
  for (const controller of controllers) controller.destroy();
}
```

## Public HTML/API contract

| Contract    | Supported value                                                   |
| ----------- | ----------------------------------------------------------------- |
| Root        | `.shlz-field.shlz-field--select`                                  |
| Value owner | Named hidden input inside `[data-shlz-select]`                    |
| Label       | Visible label referenced by trigger and listbox                   |
| Indicator   | Source chevron; decorative and hidden from the accessibility tree |
| Events      | One bubbling `input` and `change` event from the hidden input     |
| Popup       | `.shlz-select__listbox` with `.shlz-select__option` children      |
| JavaScript  | `enhanceSelects()` / `SelectController.destroy()`                 |

The application owns option data, validation, dependent fields, persistence and
event handling.

## Variants and states

- Supported sizes: default large 40px and `.shlz-field--medium` 32px.
- Supported value states: placeholder/empty and selected value.
- The placeholder is the trigger's initial visible value; selecting an option
  replaces it and updates the named hidden input.
- Native disabled state is supported.
- Error styling may be composed through `aria-invalid="true"` or
  `.shlz-field--error`; the application owns message text and its ARIA
  relationship.
- Open, option highlight, selection and focus restoration are controller-owned.
- Read-only and typeahead are not part of the current contract.

## Keyboard behavior

Enter, Space, Arrow Up and Arrow Down open the listbox. Arrow keys plus Home/End
move through enabled options. Enter or Space selects. Escape closes and restores
trigger focus; Tab closes without trapping focus.

## Accessibility

- Reference the same visible label from the trigger and listbox.
- Keep the named hidden input as the form-value and event owner.
- Decorative arrow content must stay out of the accessibility tree.
- Connect validation/help text with ARIA attributes in application code.
- Do not remove listbox/option roles or the controller's focus lifecycle.

## Composition

Select composes inside Field, forms, Modal and Drawer. Dropdown menu is a separate
command family. Search, async data and dependent-field policy belong to the
application until separate reusable contracts are approved.

The Showcase Data Workspace demonstrates the same reusable Select trigger,
listbox and behavior inside a bounded application-owned status filter. It is
ServiceDesk-inspired validation, not evidence that the delivered application
uses the same option count or data.

## Limitations

- Single-select only.
- The component requires JavaScript enhancement.
- No search, multiselect, status-chip, async-loading or virtualization API.
- No read-only semantic state exists in the current Select contract.
- Source matrices for unsupported variants are collapsed diagnostics, not
  copyable production examples or controls that imply shipped behavior.

## Traceability

| Layer                       | Location                                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authoritative component set | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Dropdown` (`36:1106`)                                                                          |
| Source sheet                | `shlz-design-source/raw/svg/Select.svg`                                                                                                                                 |
| Source specification        | `docs/components/form-controls-source-spec.md`                                                                                                                          |
| Provenance                  | `packages/tokens/provenance.json`                                                                                                                                       |
| Tokens                      | `packages/tokens/tokens.json`                                                                                                                                           |
| Field styles                | `packages/styles/components/field.css`                                                                                                                                  |
| Behavior exports            | `packages/behaviors/src/select.ts`, `@shlz/behaviors/select`                                                                                                            |
| Showcase                    | `apps/showcase/src/fidelity.js#select-demo`                                                                                                                             |
| Consumer validation         | `apps/showcase/src/consumer-workspace.js`                                                                                                                               |
| Source tests                | `tools/tests/form-controls-source.test.mjs`                                                                                                                             |
| Browser/layout tests        | `tools/playwright/primitives.spec.js`, `tools/playwright/review.spec.js`, `tools/playwright/select-closed-shell.spec.js`, `tools/playwright/consumer-workspace.spec.js` |

## Source interpretation

- `FACT`: closed-field geometry and all 52 structured variants of the Figma
  Component Set named `Dropdown`.
- `DECISION`: compose the source-backed Select trigger with the source-backed
  option-menu surface as the executable single-select contract.
- `UNKNOWN/UNSUPPORTED`: search, multiselect, async and status runtime products.
