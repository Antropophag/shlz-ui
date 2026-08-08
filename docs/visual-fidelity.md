# Visual fidelity methodology

The showcase separates three review surfaces:

1. **Source Spec Data** is readable HTML for literal source tokens. It is not a reconstruction of a Figma sheet.
2. **Component Implementation** is the production SHLZ markup, CSS and optional behavior.
3. **Visual Fidelity** places an SVG-derived source reference beside a production implementation fixture. Textual evidence alone is not a fidelity comparison.

## Source references

`tools/source-references.mjs` reads SVGs from the read-only `shlz-design-source/raw/svg/` directory and writes references to `apps/showcase/generated/source-references/`. Generation changes only the root SVG dimensions and `viewBox`; source geometry remains byte-for-byte embedded from the raw file. `npm run generate` recreates the directory deterministically.

Every manifest entry records:

- the raw source file;
- its complete original `viewBox`;
- the raw-file SHA-256;
- each generated crop `viewBox`;
- the crop method and a human-readable reason.

The current references are component-sheet crops: they omit the title/index area and retain the complete component matrix width. A crop is an evidence presentation boundary, not a semantic claim about variants.

Tiling is permitted only as a fallback for navigating a large sheet. A tile never means “one variant” or “one component”. If identifiable geometry crosses a proposed tile boundary, the review reference must instead use an expanded or dedicated crop. Component- or variant-specific crops are preferred whenever their bounds can be established reliably from source evidence. The generator currently avoids tiling entirely rather than risk truncating a variant.

## Static visual states

Closed interactive components cannot be reviewed from triggers alone. Fidelity fixtures therefore keep Dropdown menus, Popovers, Tooltips, Modal and Drawer surfaces visibly open. These fixtures reuse production classes, CSS, tokens and DOM structure; showcase CSS controls only fixture layout and forced visibility. Interactive behavior examples remain separate in the Implementation section.

Static state presentation does not promote unknown behavior to fact. For example, a highlighted Dropdown row can reproduce confirmed pixels while its meaning remains `UNKNOWN`; Notification countdown and loading visuals do not imply an auto-dismiss lifecycle.

## Review and automation

Playwright has two distinct purposes:

- regression screenshots compare the implementation with its previous baseline;
- fidelity screenshots capture source and implementation together for human inspection.

A stable screenshot proves reproducibility, not source fidelity. Pixel diff may be used diagnostically, but it is not a similarity score or the sole acceptance criterion. Expected differences include outlined Figma text versus browser-rendered system-sans text. Reviewers should record visible deviations before a dedicated alignment pass changes component styling.
