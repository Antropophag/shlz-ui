# Radio

## Status

`Executable / Production`. The Showcase state matrix is executable native markup plus source diagnostics; no behavior layer is required.

## Purpose

Radio lets a user select exactly one value from a small visible set. Native same-name radio inputs own mutual exclusion, keyboard interaction and form submission.

## Use when

- One and only one option should be chosen from a short list.
- Keeping all options visible helps comparison.
- The group can have a concise visible question or legend.

## Avoid when

- For independent booleans use Checkbox.
- For a long option list or constrained space use Select.
- Do not emulate grouping with click handlers or unrelated `name` values.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<fieldset>
  <legend>Режим</legend>
  <label class="shlz-choice">
    <input
      class="shlz-radio"
      type="radio"
      name="mode"
      value="standard"
      checked
    />
    <span>Стандартный</span>
  </label>
  <label class="shlz-choice">
    <input class="shlz-radio" type="radio" name="mode" value="advanced" />
    <span>Расширенный</span>
  </label>
</fieldset>
```

## Public HTML contract

| Contract     | Supported value                                         |
| ------------ | ------------------------------------------------------- |
| Group        | Native `fieldset` with a visible `legend`               |
| Option label | Native `label.shlz-choice` wrapping each input and text |
| Value owner  | Native `input.shlz-radio[type="radio"]`                 |
| Grouping     | Same non-empty `name` for every option in one group     |
| Value        | Unique consumer-owned `value` for each option           |
| States       | Native `checked`, `disabled` and `:focus-visible`       |
| Behavior     | Native radio grouping; no SHLZ behavior initialization  |

The package styles each `.shlz-choice` option and `.shlz-radio` control. It does not reset the browser fieldset border/padding or define group/legend layout; applications own that surrounding composition.

## Variants and states

- One 20px CSS control represents the observed 18.5px geometry plus its 1.5px source stroke.
- Native unselected, selected, disabled and selected-disabled states are styled.
- Focus-visible outline is a repository accessibility decision.
- Hover and validation visuals are not established public Radio states.

## Accessibility and keyboard

- `fieldset`/`legend` supplies the group name; each wrapping label supplies its option name.
- Use one shared non-empty `name`. The browser then maintains mutual exclusion and form submission.
- Arrow keys move selection within the native same-name group; Space selects the focused option.
- Keep DOM order aligned with visual order and provide a stable `value` for every option.
- A group normally starts with a selected value when the workflow has a safe meaningful default; otherwise leave all unchecked until the user decides.

## Composition

Radio composes in forms, settings and filter groups. Conditional content, validation messaging, persistence and default-selection policy remain consumer-owned.

## Limitations

- Only the 20px source-backed radio geometry is shipped.
- No custom behavior, validation-message API or dynamic option-description contract.
- Fieldset/legend reset, group spacing and label typography remain consumer-owned and outside the source-proven primitive.
- Exact hover semantics remain unknown.

## Traceability

| Layer                  | Location                                       |
| ---------------------- | ---------------------------------------------- |
| Authoritative source   | `shlz-design-source/raw/svg/Radio.svg`         |
| Provenance             | `packages/tokens/provenance.json`              |
| Tokens                 | `packages/tokens/tokens.json`                  |
| Styles                 | `packages/styles/components/choice.css`        |
| Standalone bundle      | `packages/styles/dist/shlz.css`                |
| Showcase               | `apps/showcase/src/fidelity.js#radio-demo`     |
| Snippet tests          | `tools/tests/component-documentation.test.mjs` |
| Source contract tests  | `tools/tests/choice-status-source.test.mjs`    |
| Bundle contract tests  | `tools/tests/components.test.mjs`              |
| Browser/geometry tests | `tools/playwright/choice-status.spec.js`       |

## Source interpretation

- `FACT`: repeated 18.5×18.5 circular paths, 1.5px strokes and selected inner marks.
- `DERIVED`: neutral and brand-light rows represent disabled variants.
- `DECISION`: native `name` grouping, 20px CSS box, class API and focus-visible outline.
- `UNKNOWN`: exact hover semantics, validation visuals and label typography.
