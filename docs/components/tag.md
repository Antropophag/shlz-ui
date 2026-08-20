# Tag

## Status

`Executable / Production`. Generic Tag and Person Tag are separate source families; this page covers the non-interactive generic label.

## Purpose

Tag is a compact filled or outlined label for short secondary metadata or a category. Its text owns meaning; the container has no control semantics.

## Use when

- An item needs a short persistent category or metadata label.
- Filled/outlined treatment is sufficient without inventing semantic colors.

## Avoid when

- For a business state use Status; for a count/dot use Badge.
- For a person identity use Person Tag.
- Do not make the presentation span clickable or selectable.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<span class="shlz-tag shlz-tag--outlined">По гарантии</span>
```

## Public HTML contract

| Contract    | Supported value                                  |
| ----------- | ------------------------------------------------ |
| Element     | Text-bearing `span.shlz-tag`                     |
| Variants    | Default filled and `.shlz-tag--outlined`         |
| Semantics   | Visible text owns meaning                        |
| Interaction | None; generic Tag is presentation, not a control |
| Behavior    | Not applicable                                   |

## Variants and states

- Source variants: Filled and Stroke/outlined at 30px height.
- Width is content/composition-driven; the 111px source specimen is not a public width.
- Generic Tag has no hover, pressed, selected, disabled, removable or semantic-color state.
- Avatar and removal belong to the distinct Person Tag family.

## Accessibility

- Use concise visible text and keep Tag out of the tab order.
- Do not rely on filled/outlined treatment to convey a state not present in text/context.
- If a label requires an action, compose a separate correctly named native control rather than adding click semantics to the span.

## Composition

Tag composes in cards, lists, tables and filter summaries. Category vocabulary, truncation policy and wrapping remain consumer-owned.

## Limitations

- No semantic colors, selection, disabled, removal or interaction contract.
- No icon slot in the generic Tag source family.
- No automatic truncation or tooltip behavior.

## Traceability

| Layer                | Location                                       |
| -------------------- | ---------------------------------------------- |
| Authoritative source | `shlz-design-source/raw/svg/Tag.svg`           |
| Source specification | `docs/components/tag-source.md`                |
| Provenance           | `packages/tokens/provenance.json`              |
| Tokens               | `packages/tokens/tokens.json`                  |
| Styles               | `packages/styles/components/tag.css`           |
| Standalone bundle    | `packages/styles/dist/shlz.css`                |
| Showcase             | `apps/showcase/src/main.js#tag-demo`           |
| Snippet tests        | `tools/tests/component-documentation.test.mjs` |
| Source tests         | `tools/tests/tag-source.test.mjs`              |
| Browser tests        | `tools/playwright/fidelity.spec.js`            |

## Source interpretation

- `FACT`: Tag Component Set `785:48349` has 111×30 Filled and Stroke variants.
- `DECISION`: presentation span, class API and content-driven width.
- `UNKNOWN/UNSUPPORTED`: interaction, semantic color mapping, truncation and icons.
