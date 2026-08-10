# Document Row

Document Row is an additive SHLZ application pattern for sidebars, narrow panels, and fluid document lists. Its composition is informed by the legacy IC document hierarchy, but its implementation uses SHLZ primitives and tokens. It is not source-backed and does not alter or replace File Row.

## Markup contract

```html
<div class="shlz-document-list">
  <div class="shlz-document-row" data-file-type="pdf-default">
    <span class="shlz-document-row__visual" aria-hidden="true">…</span>
    <span class="shlz-document-row__content">
      <a
        class="shlz-document-row__title"
        href="/file"
        title="Full filename.pdf"
      >
        Full filename.pdf
      </a>
      <span class="shlz-document-row__meta">Версия 1 · 17 КБ</span>
      <span class="shlz-document-row__modified">15.07.2026, 13:57</span>
    </span>
    <span class="shlz-document-row__actions">
      <button
        class="shlz-document-row__action"
        type="button"
        aria-label="Скачать Full filename.pdf"
      >
        …
      </button>
    </span>
  </div>
</div>
```

The default composition is metadata-rich. Add `shlz-document-row--compact` and omit `modified` for the two-line compact variant. These are variants of one model, not separate components.

## Layout and behavior

[design-decision] The row is fluid. A 48px visual column contains a canonical SHLZ file-type asset rendered at 44px; the middle column uses `minmax(0, 1fr)`; and the 40px action column is stable. The filename is single-line and truncates, so consumers must provide its full value through `title` or an equivalent tooltip contract. Rows use a separator rather than a card border or radius and are intended to form a continuous list.

[observed] The title reuses the established File Row 15/19.5 Medium signature. Version/size uses the existing 14/18 Regular signature, and the tertiary modification timestamp uses the source-observed 12px/130% Regular signature. Colors, spacing, action sizes, focus rings, and file assets come from existing SHLZ contracts.

[design-decision] The 48/40px column geometry belongs to this SHLZ extension; it is not represented as a recovered Figma fact. Row height is content-driven from the selected line signatures plus token-based padding rather than exposed as a fixed or minimum-height contract.

The public model provides hover and focus-within feedback plus native links/buttons. Use the title as the open target and icon actions for download or preview. It intentionally has no row-level activation or error API; validation remains part of the source-backed File Row contract until reusable document-list error semantics are established.
