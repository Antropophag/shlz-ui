# File Row

## Purpose

File Row presents one file identity with optional metadata, a primary open/view target, and independent trailing actions. It is a framework-agnostic HTML/CSS composition.

Use it in document lists, attachments, and history entries. Do not use it as an uploader, previewer, file manager, version manager, or workflow document component.

## Markup contract

```html
<div class="shlz-file-row">
  <span class="shlz-file-row__visual" aria-hidden="true">…</span>
  <span class="shlz-file-row__content">
    <a class="shlz-file-row__primary" href="/file" title="Full filename.pdf">
      Full filename.pdf
    </a>
    <span class="shlz-file-row__meta">PDF · 2.4 MB</span>
  </span>
  <span class="shlz-file-row__actions">
    <button
      class="shlz-file-row__action"
      type="button"
      aria-label="Download Full filename.pdf"
    >
      …
    </button>
  </span>
</div>
```

`visual`, `meta`, and `actions` are optional. Use `shlz-file-row__title` instead of an anchor for a read-only row. The contract has no disabled row state because source evidence does not establish one; disable individual native actions when needed.

Source-backed interaction states use the ordinary root hover state. For validation, set `aria-invalid="true"`, include `shlz-file-row__message`, and associate that message with the relevant control or row context using `aria-describedby`. The error composition preserves the 55px bordered body and adds the source-observed message below it.

## States and composition

The filename is single-line and truncates. Supply the full name through visible context or `title`; an explicit accessible name remains required if the rendered label is shortened. Consumers choose a canonical file-type or generic file icon. Trailing actions compose native links or buttons.

## Accessibility

The primary target is the filename, not the row. This prevents nested interactive controls and accidental row activation. Every icon-only action needs an accessible name containing both action and file context. Preserve native keyboard behavior and do not add click delegation to the root. Decorative icons use empty alternative text or `aria-hidden="true"`.

## Source basis

Geometry derives from `Document` (230/240×55px examples, radius 12, 38px visual, 10px leading inset, 12px visual/content gap), including Default, Hover, Editing and Error states. `Description Files` confirms filename/action states, and `History content / Type=Document` confirms wider composition. Width remains consumer-owned. Metadata and independent multiple actions are reusable consumer-driven composition; business document fields are intentionally excluded.
