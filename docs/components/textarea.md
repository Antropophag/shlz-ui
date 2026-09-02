# Textarea

## Status

`Executable / Production`. Forced hover/focus rows in Showcase are `Visual fixture`; source comparisons are diagnostics, not copyable application state.

## Purpose

Textarea collects plain text expected to span multiple lines. A native `<textarea>` remains the semantic and form-value owner inside the source-backed SHLZ field composition.

## Use when

- A form needs comments, descriptions or another multi-line plain-text value.
- The product has a real length constraint that may justify `maxlength` and a synchronized counter.

## Avoid when

- For a short single-line value use Input.
- For formatted content, mentions or attachments use an approved editor/pattern rather than extending this primitive implicitly.
- Do not add a static character counter that can drift from the native value.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<label class="shlz-field shlz-field--textarea">
  <span class="shlz-field__label">Комментарий</span>
  <span class="shlz-field__control">
    <textarea class="shlz-textarea" name="comment"></textarea>
  </span>
</label>
```

The application owns the value, name, constraints, validation and any counter synchronization.

## Public HTML contract

| Contract      | Supported value                                                             |
| ------------- | --------------------------------------------------------------------------- |
| Root          | Native `label.shlz-field.shlz-field--textarea`                              |
| Visible label | `.shlz-field__label`                                                        |
| Control shell | `.shlz-field__control`                                                      |
| Value owner   | Native `textarea.shlz-textarea`                                             |
| Secondary row | `.shlz-field__secondary`                                                    |
| Error message | `.shlz-field__message`, connected by consumer-owned `aria-describedby`      |
| Counter       | `.shlz-field__counter`; display only, update logic is consumer-owned        |
| Native states | Focus, value, `disabled`, `readonly`, `maxlength` and `aria-invalid="true"` |
| Behavior      | Not applicable; no counter/auto-grow controller is shipped                  |

## Variants and states

- The source confirms a 5 State × 2 Filled × 2 Show Count matrix across 20 variants.
- Production states use native empty/filled, focus, disabled, readonly and `aria-invalid` attributes where applicable.
- Error styling is applied by `aria-invalid="true"`; the consumer renders and connects the message.
- The optional secondary row can display an error message, a counter or both.
- `.shlz-field--visual-hover`, `.shlz-field--visual-focus`, `.shlz-field--error` and `.shlz-field--disabled` are fidelity helpers, not the preferred application state API.

## Accessibility

- Keep the visible label as a native wrapping label or use a valid `for`/`id` association.
- Native keyboard editing, selection, focus, disabled and readonly behavior remain browser-owned.
- For an error, set `aria-invalid="true"` and reference the stable message id with `aria-describedby`.
- `maxlength` provides a native constraint. A visible counter does not by itself announce the constraint or remaining characters.
- If a product requires live remaining-character announcements, it must define and test that behavior separately; the current CSS primitive does not provide it.
- Active labels, guidance, counters, and placeholders use the shared accessible
  production-text roles documented in `docs/accessibility-source-contrast.md`.
  Disabled text remains separately measured under the inactive-component
  exception.

## Composition

Textarea composes inside forms, Modal and Drawer. Rich text, mentions, file attachments, auto-grow behavior and persistence belong to separate product patterns or explicit future contracts.

## Limitations

- No behavior layer for character counting, auto-grow, formatting, async validation or announcements.
- The shell has a fixed 58px visible height and `overflow: hidden`; a browser may expose the native vertical resize handle, but resized content is clipped. Do not rely on resize until a separate layout contract is approved.
- Counter text can become stale unless the consumer updates it from the native value.
- Source fixed width is not a general layout token; containers may size the field through normal layout.

## Traceability

| Layer                       | Location                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Authoritative component set | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, Component Set `Textarea` |
| Source sheet                | `shlz-design-source/raw/svg/Textarea.svg`                                          |
| Source specification        | `docs/components/form-controls-source-spec.md`                                     |
| Provenance                  | `packages/tokens/provenance.json`                                                  |
| Tokens                      | `packages/tokens/tokens.json`                                                      |
| Styles                      | `packages/styles/components/field.css`                                             |
| Standalone bundle           | `packages/styles/dist/shlz.css`                                                    |
| Showcase                    | `apps/showcase/src/fidelity.js#textarea-demo`                                      |
| Snippet tests               | `tools/tests/component-documentation.test.mjs`                                     |
| Source/contract tests       | `tools/tests/form-controls-source.test.mjs`                                        |
| Browser layout smoke        | `tools/playwright/choice-status.spec.js`                                           |

## Source interpretation

- `FACT`: 20 structured source variants with State, Filled and Show Count axes and fixed 395px source geometry.
- `DECISION`: native textarea ownership, class contract and consumer-owned counter/error relationships.
- `UNKNOWN/UNSUPPORTED`: live counter announcements, auto-grow and rich-text behavior.
