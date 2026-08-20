# Segment

## Status

`Executable / Production radio-group example`. The public contract is value selection, not navigation, tabs or a toggle-button state machine.

## Purpose

Segment is a compact single-choice control for a short visible option set. Native same-name radios own selection, keyboard behavior and form data inside the source-backed segmented shell.

## Use when

- Exactly one value must be selected from a short set.
- Side-by-side visibility helps users compare the available values.
- The group has a concise stable label and fits without an invented overflow behavior.

## Avoid when

- For switching document panels or navigation use Tabs/links.
- For a long or space-constrained list use Select.
- For commands use Buttons; for multi-selection use Checkbox.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<fieldset class="shlz-segment">
  <legend class="shlz-visually-hidden">Период</legend>
  <label class="shlz-segment__option">
    <input
      class="shlz-segment__input"
      type="radio"
      name="period"
      value="day"
      checked
    />
    <span class="shlz-segment__label">День</span>
  </label>
  <label class="shlz-segment__option">
    <input
      class="shlz-segment__input"
      type="radio"
      name="period"
      value="week"
    />
    <span class="shlz-segment__label">Неделя</span>
  </label>
</fieldset>
```

## Public HTML contract

| Contract     | Supported value                                             |
| ------------ | ----------------------------------------------------------- |
| Group        | Native `fieldset.shlz-segment`                              |
| Group name   | Native `legend.shlz-visually-hidden` inside the fixed shell |
| Option       | `label.shlz-segment__option`                                |
| State owner  | Native `input.shlz-segment__input[type="radio"]`            |
| Visual label | `.shlz-segment__label` immediately following its input      |
| Grouping     | Same non-empty `name`, unique `value` per option            |
| Sizes        | Medium default; `.shlz-segment--sm`; `.shlz-segment--lg`    |
| Behavior     | Native radio behavior; no SHLZ initialization               |

The adjacent-sibling structure is required because CSS derives selected, focus and disabled visuals from the native input state.

## Variants and states

- Group heights: Small 26px, Medium 33px and Large 41px.
- Item minimum heights: 18px, 25px and 33px respectively, plus the 4px shell inset.
- Source-backed text-only and leading-icon compositions. Icons are decorative when adjacent text already names the option.
- Native checked, unchecked, disabled and focus-visible states.
- Selected+disabled is absent from source and not claimed as a source-backed combination.
- Group and option widths are content-driven; source specimen widths are not equal-width tokens.

## Accessibility and keyboard

- Native `legend.shlz-visually-hidden` provides the group name inside the fixed shell. If the interface also needs a visible question/title, render it as surrounding consumer content associated by context; current Segment CSS does not lay out a visible legend inside the shell.
- Same-name radios own mutual exclusion and form submission.
- Arrow keys move selection within the group; Space selects the focused option.
- Keep DOM order aligned with visual order and give every option a stable unique `value`.
- The visually hidden native inputs retain focus; CSS projects focus-visible onto their adjacent labels.

## Composition

Segment composes in forms, compact filters and view/value selectors where radio semantics are correct. Navigation, panel ownership, persistence and responsive placement remain consumer responsibilities.

## Limitations

- Not a Tabs/navigation or command control.
- No multi-selection, deselect-all or behavior controller.
- No selected+disabled source variant.
- Equal-width distribution, wrapping, horizontal scrolling and responsive fallback are not defined.

## Traceability

| Layer                | Location                                       |
| -------------------- | ---------------------------------------------- |
| Authoritative source | `shlz-design-source/raw/svg/Segment.svg`       |
| Source specification | `docs/components/segment-source.md`            |
| Provenance           | `packages/tokens/provenance.json`              |
| Tokens               | `packages/tokens/tokens.json`                  |
| Styles               | `packages/styles/components/segment.css`       |
| Standalone bundle    | `packages/styles/dist/shlz.css`                |
| Showcase             | `apps/showcase/src/main.js#segment-demo`       |
| Snippet tests        | `tools/tests/component-documentation.test.mjs` |
| Source tests         | `tools/tests/segment-source.test.mjs`          |
| Bundle tests         | `tools/tests/components.test.mjs`              |
| Browser tests        | `tools/playwright/fidelity.spec.js`            |

## Source interpretation

- `FACT`: Segmented-Group `424:36756` and Segmented-Item `424:36728` sizes/variants, including source widths and absent selected+disabled.
- `DECISION`: native radio fieldset, class API, focus-visible projection and content-driven production width.
- `UNKNOWN/CONSUMER-OWNED`: responsive overflow/fallback, persistence and non-value-selection use cases.
