# Link

## Purpose

Link is native text navigation with source-backed SHLZ typography and interaction paints. Use it to navigate to another resource, route or section. Use destination-specific text. Use Button instead for an action in the current interface.

## Dependencies

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

No behavior package is required.

## Copyable usage

```html
<a class="shlz-link" href="/requests/42">Открыть заявку</a>
```

Client-side routing may intercept navigation, but should retain the real `href` and native link semantics.

## Public contract

- Element: native `a.shlz-link` with a real `href`.
- States: native hover, active and focus-visible.
- Unavailable destination: `span.shlz-link.shlz-link--disabled`; it is non-interactive text, not a link/control.
- Typography: 16px/21px regular text at content-sized width.

Source defines Default, Hover, Pressed and Disabled for the word “Link”. The `--visual-hover` and `--visual-pressed` helpers only reproduce those states in diagnostics and are not application state API.

## Accessibility

A real anchor preserves keyboard, context-menu and browser link behavior. Link text must identify its destination without depending on surrounding prose. Do not create a focusable or ARIA-disabled “link” without navigation.

## Limitations

Visited, external-link and icon variants are not shipped contracts. Link does not provide application routing or disabled-action behavior. The focus-visible outline is an accessibility engineering decision.

## Traceability

- Authoritative source: `shlz-design-source/raw/svg/Link.svg`
- Evidence map: `docs/evidence-map.md`
- Provenance: `packages/tokens/provenance.json`
- Tokens: `packages/tokens/tokens.json`
- Styles: `packages/styles/components/link.css`
- Showcase: `apps/showcase/src/wave3.js`
- Snippet tests: `tools/tests/component-documentation.test.mjs`
- Source tests: `tools/tests/wave3-source.test.mjs`
- Browser tests: `tools/playwright/components-next.spec.js`
