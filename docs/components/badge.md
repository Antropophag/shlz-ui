# Badge

## Status

`Executable / Production`. Count and dot are separate source families and remain non-interactive indicators.

## Purpose

Badge supplements a named parent item with a compact count or dot. It does not replace the parent label and does not define business meaning by itself.

## Use when

- A navigation item, tab, inbox or action needs a short contextual count.
- A compact dot is sufficient and its meaning is available in surrounding text.

## Avoid when

- For a textual business state use Status.
- Do not make Badge the only accessible name of a control.
- Do not encode critical information only with a dot color or unexplained number.

## Dependencies and setup

`@shlz/styles/shlz.css` is required. No behavior package is needed.

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

## Minimal executable example

```html
<span class="shlz-badge">
  12<span class="shlz-visually-hidden"> непрочитанных уведомлений</span>
</span>
```

The visually hidden noun makes the otherwise ambiguous count understandable to assistive technology without changing source-backed geometry.

## Public HTML contract

| Contract     | Supported value                                             |
| ------------ | ----------------------------------------------------------- |
| Count        | `span.shlz-badge` with consumer-owned visible text          |
| Size         | Default 16px; `.shlz-badge--lg` gives 23px                  |
| Paint        | Default blue, `.shlz-badge--invert`, `.shlz-badge--neutral` |
| Single glyph | `.shlz-badge--single` gives the source-backed compact width |
| Dot          | `span.shlz-badge-dot`; optional `.shlz-badge-dot--neutral`  |
| Interaction  | None; Badge is not a control                                |

For a decorative dot:

```html
<span class="shlz-badge-dot" aria-hidden="true"></span>
```

If the dot carries meaning, include adjacent visible or `.shlz-visually-hidden` text in its parent instead of relying on color.

## Variants and states

- Count sizes: 16px default and 23px large.
- Count paints: blue, inverted blue and neutral outline.
- Single-glyph width variants exist at both sizes.
- Dot paints: blue and neutral.
- Badge has no hover, focus, selected, disabled or dismissible state.

## Accessibility

- Give counts a noun/context through visible or visually hidden text.
- Hide a purely decorative dot with `aria-hidden="true"`.
- Meaningful dots need adjacent text available to assistive technology; color alone is insufficient.
- Badge has no implicit live-region semantics. The application owns announcement policy for changing counts.
- Keep interactive semantics on the containing button/link/tab, not on Badge itself.

## Composition

Badge composes inside navigation links, tabs, buttons and list items. The parent component owns its accessible name, interaction and hit target. The application owns count formatting and localization.

## Limitations

- No maximum-count, truncation or `99+` policy.
- No localization, animation or live-announcement behavior.
- No interaction or dismiss contract.
- Arbitrarily long content is not a supported use; the consumer must format counts before rendering.

## Traceability

| Layer                        | Location                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Authoritative component sets | `shlz-design-source/raw/svg/UI Kit – Basic elements.zip`, `Badge-Count` and `Badge-Dot` |
| Provenance                   | `packages/tokens/provenance.json`                                                       |
| Tokens                       | `packages/tokens/tokens.json`                                                           |
| Styles                       | `packages/styles/components/status-badge.css`                                           |
| Standalone bundle            | `packages/styles/dist/shlz.css`                                                         |
| Showcase                     | `apps/showcase/src/fidelity.js#badge-demo`                                              |
| Snippet tests                | `tools/tests/component-documentation.test.mjs`                                          |
| Source tests                 | `tools/tests/choice-status-source.test.mjs`                                             |
| Browser tests                | `tools/playwright/choice-status.spec.js`                                                |

## Source interpretation

- `FACT`: Badge-Count source sizes/paint families and Badge-Dot source variants.
- `DECISION`: CSS modifier names, visually hidden context guidance and non-interactive ownership.
- `UNKNOWN/CONSUMER-OWNED`: count cap/formatting, business meaning, localization and announcement policy.
