# Avatar

## Purpose

Avatar is a compact visual identity marker rendered as text, an image or an icon. Use it where adjacent context makes the person or entity clear. It must not be the only source of a person's name or status. Avatar is presentation, not an interactive control.

## Dependencies

```html
<link rel="stylesheet" href="/assets/shlz.css" />
```

No behavior package is required. Image and icon assets are consumer-owned.

## Copyable usage

Text fallback:

```html
<span class="shlz-avatar shlz-avatar--32" role="img" aria-label="Анна Петрова">
  АП
</span>
```

Image when the Avatar is the only naming content:

```html
<span class="shlz-avatar shlz-avatar--40">
  <img
    class="shlz-avatar__image"
    src="/assets/avatars/anna.jpg"
    alt="Анна Петрова"
  />
</span>
```

Prefer placing Avatar beside a visible full name. In that composition use `aria-hidden="true"` on a text/icon root or `alt=""` on image content to avoid repetition.

## Public contract

- Root: `.shlz-avatar` with exactly one content representation.
- Sizes: `--24`, `--32`, `--40` and `--64`; default is 32px.
- Image: `img.shlz-avatar__image` fills and crops the circle.
- Icon: `.shlz-avatar--icon` with `img.shlz-avatar__icon`.
- Text: initials or another short fallback inside the root.

All 12 source variants are circle × four sizes × image/text/icon. Badge, arbitrary shape and 48px are intentionally absent.

## Accessibility

When Avatar is the only naming content, use `role="img"` and an accessible name on a text/icon root or give its image meaningful alt text. Prefer a decorative Avatar beside the visible full name. Never encode identity or status through the picture alone.

## Limitations

A clickable Avatar needs a separately designed link or button composition. Loading and automatic fallback behavior are not shipped. Consumers must replace a failed image with text or icon markup; CSS alone does not own that lifecycle. Image privacy, authorization and caching are application responsibilities.

## Traceability

- Authoritative source: `shlz-design-source/raw/svg/Avatar.svg`
- Evidence map: `docs/evidence-map.md`
- Provenance: `packages/tokens/provenance.json`
- Tokens: `packages/tokens/tokens.json`
- Styles: `packages/styles/components/avatar.css`
- Showcase: `apps/showcase/src/wave3.js`
- Snippet tests: `tools/tests/component-documentation.test.mjs`
- Source tests: `tools/tests/wave3-source.test.mjs`
- Browser tests: `tools/playwright/components-next.spec.js`
