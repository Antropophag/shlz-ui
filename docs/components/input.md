# Input

## Status

`Executable / Production`. Showcase state matrices also contain `Visual fixture` helpers; the duplicated Advanced source nodes remain `Source diagnostic`, not application API.

## Purpose

Input collects a short, single-line value. The public composition keeps a persistent visible label and a native `<input>` as the semantic and form-value owner.

## Use when

- A form needs a short value such as a title, identifier, email or search phrase.
- The application can select the appropriate native `type`, autocomplete and validation attributes.
- A persistent visible label is needed independently of placeholder content.

## Avoid when

- For multi-line content use Textarea.
- For a predefined choice use Select or Radio.
- Do not treat placeholder text as the only label.
- Do not copy `.shlz-field--visual-hover` or `.shlz-field--visual-focus` into application state.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<label class="shlz-field">
  <span class="shlz-field__label">Название</span>
  <span class="shlz-field__control">
    <input
      class="shlz-input"
      type="text"
      name="title"
      placeholder="Введите название"
    />
  </span>
</label>
```

The wrapping native label provides the accessible name. The application owns `type`, `name`, `value`, `autocomplete`, constraints and validation.

## Public HTML contract

| Contract      | Supported value                                                        |
| ------------- | ---------------------------------------------------------------------- |
| Root          | Native `label.shlz-field`                                              |
| Visible label | `.shlz-field__label`                                                   |
| Control shell | `.shlz-field__control`                                                 |
| Value owner   | Native `input.shlz-input`                                              |
| Size          | Default 40px; `.shlz-field--medium` gives a 32px control               |
| Secondary row | `.shlz-field__secondary` after the control shell                       |
| Error         | Native `aria-invalid="true"`; message inside the secondary row         |
| Native states | Focus, value, `disabled`, `readonly` and input-type validation         |
| Behavior      | Not applicable; application owns value updates and business validation |

The standalone `.shlz-input` compatibility style exists, but the full field composition is the documented production path because it supplies the source-backed label/control relationship.

## Variants and states

- Supported sizes: default large 40px and `.shlz-field--medium` 32px.
- Native empty/filled, focus, disabled and readonly states are supported.
- `aria-invalid="true"` on the input applies error styling to its field shell.
- `.shlz-field--visual-hover`, `.shlz-field--visual-focus`, `.shlz-field--error` and `.shlz-field--disabled` exist for static fidelity fixtures. Applications should prefer native attributes and pseudo-states.
- Source properties for Input are broken. All 21 source nodes are retained, but the repository does not claim parsed Size/State/Filled/Type axes.
- The meaning and behavior of the duplicated Advanced source nodes is unresolved and unsupported.

## Accessibility

- Keep the visible label as a native wrapping label or use a valid `for`/`id` association.
- Select the correct native input `type`; it affects keyboard, autofill and browser semantics.
- Use `disabled` only when the field must be unavailable. Use `readonly` when its value should remain focusable and submit with the form.
- For an error, set `aria-invalid="true"`, give the message a stable id and reference it with `aria-describedby`.
- Placeholder text is a hint, not an accessible-name substitute.

The library does not make screen-reader conformance claims beyond these native relationships; supported AT evidence is governed by the repository acceptance baseline.

## Composition

Input composes inside forms, Modal, Drawer, toolbars and data-workspace filters. Prefix/trailing icons and clear actions require the application to preserve an unambiguous accessible name and implement action behavior; no clear-button controller is shipped.

## Limitations

- No masking, formatting, clear-button, async-validation or suggestion API.
- No approved contract for the source Advanced specimens.
- Validation text and its announcement relationship are consumer-owned.
- Source fixed specimen width is not a general layout token; containers may size the field through normal layout.

## Traceability

| Layer                           | Location                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Authoritative component set     | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Input`          |
| Source specification            | `docs/components/form-controls-source-spec.md`                                           |
| Provenance                      | `packages/tokens/provenance.json`                                                        |
| Tokens                          | `packages/tokens/tokens.json`                                                            |
| Styles                          | `packages/styles/components/field.css`                                                   |
| Standalone bundle               | `packages/styles/dist/shlz.css`                                                          |
| Showcase                        | `apps/showcase/src/fidelity.js#input-demo`                                               |
| Snippet tests                   | `tools/tests/component-documentation.test.mjs`                                           |
| Source/contract tests           | `tools/tests/form-controls-source.test.mjs`                                              |
| Browser layout/navigation smoke | `tools/playwright/choice-status.spec.js`, `tools/playwright/showcase-navigation.spec.js` |

## Source interpretation

- `FACT`: all 21 Input source nodes, their complete geometry and their Figma node ids.
- `DECISION`: native input ownership, class contract, focus-visible behavior and consumer-owned validation.
- `UNKNOWN/UNSUPPORTED`: parsed Input property axes and product behavior of Advanced specimens.
