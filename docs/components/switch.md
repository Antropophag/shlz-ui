# Switch

## Status

`Executable / Production`. Showcase source matrices demonstrate both supported sizes and native on/off/disabled states.

## Purpose

Switch turns one setting on or off when the product applies that change immediately. A native checkbox remains the state/form-data owner and `role="switch"` exposes on/off semantics.

## Use when

- One setting can be enabled or disabled independently.
- The change takes effect immediately instead of waiting for a form submit action.
- A stable visible label can name the setting itself.

## Avoid when

- For choices reviewed and submitted together use Checkbox.
- Use Checkbox when indeterminate/mixed state is needed.
- For mutually exclusive values use Radio or Select.
- Do not use Switch for a command or a setting that cannot be changed immediately.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<label class="shlz-switch">
  <input
    class="shlz-switch__input"
    type="checkbox"
    role="switch"
    name="alerts"
    value="enabled"
  />
  <span>Уведомления</span>
</label>
```

Listen to the native event and apply product persistence deliberately:

```js
const control = document.querySelector('[name="alerts"]');

if (control instanceof HTMLInputElement) {
  control.addEventListener("change", () => {
    // Persist control.checked in application code.
  });
}
```

The design system supplies no persistence lifecycle; this listener only shows the native integration point.

## Public HTML contract

| Contract    | Supported value                                                            |
| ----------- | -------------------------------------------------------------------------- |
| Label       | Native `label.shlz-switch` wrapping input and visible setting name         |
| State owner | Native `input.shlz-switch__input[type="checkbox"][role="switch"]`          |
| Sizes       | Default Medium 38×20; `.shlz-switch__input--sm` gives Small 24×14          |
| States      | Native off/on (`checked`), `disabled` and `:focus-visible`                 |
| Events      | Native `input`/`change`; application owns persistence and failure handling |
| Form data   | Checked submits its string `value`; unchecked submits no entry             |
| Behavior    | No SHLZ behavior initialization                                            |

The source spells the 38×20 size `Meduim`; the public documentation uses Medium while preserving the source spelling in evidence.

## Variants and states

- Medium 38×20 and Small 24×14 tracks.
- Native off, on, disabled-off and disabled-on states.
- The root opacity used for disabled variants is source-backed.
- The thumb transition is CSS-only and removed under `prefers-reduced-motion: reduce`.
- A 52×30 rectangle in the legacy sheet is mask/clip geometry, not a public Switch size.
- Indeterminate, loading and error are not supported Switch states.

## Accessibility and keyboard

- The wrapping native label supplies the accessible name and expands the pointer target.
- `role="switch"` exposes native `checked` as on/off state. Keep the label text stable; do not change it from “Enable…” to “Disable…” after toggling.
- Space toggles the focused native control; focus-visible outline is provided.
- Disabled Switch cannot be focused or changed and is omitted from form submission.
- Persistence failure, rollback and status announcements are application concerns and must not leave the visible/native checked state misleading.

## Composition

Switch composes in settings rows and preference panels. Description/help text, persistence status, permissions and error recovery belong to the containing pattern/application.

## Limitations

- No persistence, optimistic-update, loading, rollback or error API.
- No indeterminate/mixed contract.
- No standalone description/error-message composition.
- Checked form submission is a string value, not a boolean; unchecked submits no field.

## Traceability

| Layer                  | Location                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- |
| Authoritative set      | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Switch` |
| Source sheet           | `shlz-design-source/raw/svg/Switch.svg`                                          |
| Provenance             | `packages/tokens/provenance.json`                                                |
| Tokens                 | `packages/tokens/tokens.json`                                                    |
| Styles                 | `packages/styles/components/choice.css`                                          |
| Standalone bundle      | `packages/styles/dist/shlz.css`                                                  |
| Showcase               | `apps/showcase/src/fidelity.js#switch-demo`                                      |
| Snippet tests          | `tools/tests/component-documentation.test.mjs`                                   |
| Source contract tests  | `tools/tests/choice-status-source.test.mjs`                                      |
| Browser/geometry tests | `tools/playwright/choice-status.spec.js`                                         |

## Source interpretation

- `FACT`: Component Set `48:1166` contains 24×14 and 38×20 tracks, white thumbs, brand on/neutral off and disabled opacity.
- `DERIVED`: repeated on/off rows support two sizes and disabled treatments.
- `DECISION`: native checkbox with `role="switch"`, stable label, CSS motion, focus outline and reduced-motion override.
- `UNKNOWN/CONSUMER-OWNED`: persistence timing, async failure, rollback and status announcements.
