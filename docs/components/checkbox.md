# Checkbox

## Status

`Executable / Production`. Showcase includes source diagnostics for the full visual matrix; checked, disabled and mixed runtime state remains native.

## Purpose

Checkbox represents an independent boolean choice or membership in a multi-selection. It keeps a native `<input type="checkbox">` as the semantic and form-data owner; consumers map its presence/string value to their boolean model.

## Use when

- A user can turn one independent option on or off.
- Multiple items may be selected from a set.
- A parent selection genuinely needs a visual mixed state derived from child selections.

## Avoid when

- For exactly one choice from a visible set use Radio.
- For an immediate on/off setting use Switch only when the product interaction follows switch semantics.
- Do not model indeterminate as a third submitted value.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<label class="shlz-choice">
  <input
    class="shlz-checkbox"
    type="checkbox"
    name="notifications"
    value="yes"
  />
  <span>Получать уведомления</span>
</label>
```

## Public HTML contract

| Contract    | Supported value                                                    |
| ----------- | ------------------------------------------------------------------ |
| Label       | Native `label.shlz-choice` wrapping input and visible text         |
| Value owner | Native `input.shlz-checkbox[type="checkbox"]`                      |
| Form data   | Checked submits its string `value`; unchecked submits no entry     |
| Sizes       | Default 20px; `.shlz-checkbox--sm` gives 16px                      |
| States      | Native `checked`, `disabled`, `:focus-visible` and `indeterminate` |
| Events      | Native `input` and `change`; application owns state                |
| Behavior    | Not applicable                                                     |

`indeterminate` is a DOM property, not an HTML attribute:

```js
const checkbox = document.querySelector("#select-all");
checkbox.indeterminate = true;
```

Setting `indeterminate` changes the exposed mixed state and visual mark; it does not create a third submitted value or change `checked` automatically. With the example above, checked submits `notifications=yes`; unchecked submits no `notifications` entry.

## Variants and states

- Source-backed sizes: 20px and 16px (`.shlz-checkbox--sm`).
- Native unchecked, checked, disabled and checked-disabled states.
- Native `indeterminate` and disabled-indeterminate combinations.
- Focus visibility is a repository accessibility decision because static source does not prove keyboard behavior.
- Exact hover mapping remains unknown; no forced hover class is public API.

## Accessibility

- The wrapping native label supplies the accessible name and expands the pointer target.
- Space toggles a focused native checkbox.
- Set mixed state through `element.indeterminate`; keep `checked` synchronized with whether the form should include the configured string value.
- Disabled checkboxes do not submit a value. Do not disable a required choice merely to display it as read-only.
- For a related set, add an appropriate group label; use `fieldset`/`legend` when the choices share one question.

## Composition

Checkbox composes in forms, filter groups, tables and bulk-selection patterns. Selection policy, parent/child aggregation, validation messages and application data are consumer responsibilities.

## Limitations

- No third-value data model for indeterminate.
- No parent/child selection controller or bulk-selection behavior.
- No validation-message composition is defined by this primitive.
- Label typography is inherited from the consumer context; the source does not establish it as part of Checkbox geometry.

## Traceability

| Layer                  | Location                                       |
| ---------------------- | ---------------------------------------------- |
| Authoritative source   | `shlz-design-source/raw/svg/Checkbox.svg`      |
| Provenance             | `packages/tokens/provenance.json`              |
| Tokens                 | `packages/tokens/tokens.json`                  |
| Styles                 | `packages/styles/components/choice.css`        |
| Standalone bundle      | `packages/styles/dist/shlz.css`                |
| Showcase               | `apps/showcase/src/fidelity.js#checkbox-demo`  |
| Snippet tests          | `tools/tests/component-documentation.test.mjs` |
| Source contract tests  | `tools/tests/choice-status-source.test.mjs`    |
| Bundle contract tests  | `tools/tests/components.test.mjs`              |
| Browser/geometry tests | `tools/playwright/choice-status.spec.js`       |

## Source interpretation

- `FACT`: 16/20px frames, 4/6px radii, source strokes/fills and checked/mixed marks.
- `DERIVED`: brand-light and neutral rows represent disabled treatments.
- `DECISION`: native state ownership, CSS-drawn mark, class API and focus-visible outline.
- `UNKNOWN`: exact hover mapping and label typography.
