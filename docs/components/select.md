# Select

## Status

`Executable / Production native single-select`. Search, multiselect and
status-chip examples in source/fidelity matrices are `Source diagnostic` or
`Unsupported`; they are not hidden production modes.

## Purpose

Select lets a user choose one value from a predefined list. The native
`<select>` owns the value, form submission, popup and keyboard behavior. SHLZ
styles the closed field shell; it does not currently ship a Select behavior
controller or custom popup.

## Use when

- A form needs one value from a predefined set.
- Options fit a compact browser-native picker better than a short visible Radio
  group.
- Platform-native popup rendering is acceptable for the product.

## Avoid when

- For commands or contextual actions use Dropdown menu.
- For a small, always-visible mutually exclusive set prefer Radio when comparing
  choices matters.
- Do not use this contract for searchable select, multiselect, status chips,
  remote loading or a visually controlled popup.

## Dependencies and setup

Required:

- `@shlz/styles/shlz.css`;
- an arrow asset, normally `@shlz/icons/icons/arrow-down-md.svg`.

No `@shlz/behaviors/select` export exists in the current production package.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<div class="shlz-field shlz-field--select">
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

## Public HTML/API contract

| Contract    | Supported value                                                                     |
| ----------- | ----------------------------------------------------------------------------------- |
| Root        | `.shlz-field.shlz-field--select`                                                    |
| Value owner | Direct `.shlz-field__control > select.shlz-select`                                  |
| Label       | Native `label[for]` associated with the select `id`                                 |
| Indicator   | `.shlz-field__indicator` with decorative content hidden from the accessibility tree |
| Events      | Platform-native `input`/`change` behavior                                           |
| Popup       | Browser-owned; SHLZ does not style or control the opened list                       |
| JavaScript  | None required or exported for Select                                                |

The application owns option data, validation, dependent fields, persistence and
event handling.

## Variants and states

- Supported sizes: default large 40px and `.shlz-field--medium` 32px.
- Supported value states: placeholder/empty and selected value.
- Native disabled state is supported.
- Error styling may be composed through native `aria-invalid="true"` or
  `.shlz-field--error`; the application owns message text and its ARIA
  relationship.
- Focus, opened popup, option highlight, typeahead and disabled-option behavior
  are browser/platform behavior, not a custom SHLZ contract.
- Native `<select>` has no read-only state. Disabled is not a substitute for a
  submitted read-only value.

## Keyboard behavior

Keyboard behavior follows the browser and operating system's native Select
implementation. Do not document a custom Arrow/Home/End/typeahead contract as if
SHLZ owned it. A future custom popup requires a separate behavior API,
accessibility contract and multi-engine tests.

## Accessibility

- Keep a real label connected to the native select.
- Keep the native select as the interactive and form-value owner; do not replace
  it with visual-only text.
- Decorative arrow content must stay out of the accessibility tree.
- Connect validation/help text with native ARIA attributes in application code.
- Browser-native popup and focus semantics remain available without JavaScript.

## Composition

Select composes inside Field, forms, Modal and Drawer. Dropdown menu is a separate
command family. Search, async data and dependent-field policy belong to the
application until separate reusable contracts are approved.

## Limitations

- Native single-select only.
- No SHLZ custom popup or behavior lifecycle.
- Popup visual fidelity is not claimed because the platform renders it.
- No search, multiselect, status-chip, async-loading or virtualization API.
- No read-only semantic state exists for native Select.
- Source matrices for unsupported variants are diagnostics, not copyable
  production examples.

## Traceability

| Layer                       | Location                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Authoritative component set | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Dropdown` (`36:1106`) |
| Source sheet                | `shlz-design-source/raw/svg/Select.svg`                                                        |
| Source specification        | `docs/components/form-controls-source-spec.md`                                                 |
| Provenance                  | `packages/tokens/provenance.json`                                                              |
| Tokens                      | `packages/tokens/tokens.json`                                                                  |
| Field styles                | `packages/styles/components/field.css`                                                         |
| Behavior exports            | `packages/behaviors/package.json` (no Select subpath)                                          |
| Showcase                    | `apps/showcase/src/fidelity.js#select-demo`                                                    |
| Source tests                | `tools/tests/form-controls-source.test.mjs`                                                    |
| Browser/layout tests        | `tools/playwright/primitives.spec.js`, `tools/playwright/review.spec.js`                       |

## Source interpretation

- `FACT`: closed-field geometry and all 52 structured variants of the Figma
  Component Set named `Dropdown`.
- `DECISION`: use a native single-select as the only current executable contract.
- `UNKNOWN/UNSUPPORTED`: custom popup behavior, search, multiselect, async and
  status runtime products.
