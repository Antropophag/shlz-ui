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

## Alignment status

The 1:1 alignment pass uses `HIGH`, `MEDIUM`, and `LOW` as review outcomes. `HIGH` requires complete source-confirmed visual coverage and materially matching geometry; passing a browser test is not sufficient. The rating is rendered in every showcase fidelity unit.

| Component      | Before | Current | Current evidence boundary                                                                                                                                               |
| -------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button         | LOW    | HIGH    | Primary and neutral, 26/32/40 px, default/hover/active/disabled, icon slots                                                                                             |
| Input          | LOW    | MEDIUM  | Input-like 32/40 px evidence comes from Select/Input Number/textarea sheets; a dedicated text-input source matrix remains unavailable                                   |
| Textarea       | MEDIUM | HIGH    | Source geometry and default/hover/focus/error/disabled/readonly visuals                                                                                                 |
| Checkbox       | MEDIUM | HIGH    | 16/20 px, unchecked/checked/indeterminate/disabled visuals                                                                                                              |
| Radio          | MEDIUM | HIGH    | Default/selected/disabled/selected-disabled visuals                                                                                                                     |
| Switch         | MEDIUM | HIGH    | Authoritative Component Set: 24×14 and 38×20; off/on/disabled visuals                                                                                                   |
| Status / Badge | MEDIUM | HIGH    | All confirmed color families and both badge sizes                                                                                                                       |
| Dropdown       | LOW    | MEDIUM  | 200/216 px families, 2–8 rows, icon/check/search/status/separator and unknown highlighted visual; heterogeneous lower-sheet compositions remain semantically unresolved |
| Popover        | MEDIUM | HIGH    | Twelve 236×90 placement/alignment specimens                                                                                                                             |
| Tooltip        | HIGH   | HIGH    | Eight 100×37 placement specimens; retained as the control component                                                                                                     |
| Tabs           | LOW    | MEDIUM  | Underline, pill and boxed forms are visible; mapping of several source color rows to public states remains UNKNOWN                                                      |
| Pagination     | LOW    | HIGH    | Prev/Next/Number/Ellipsis/Last matrices, Group and page-size controls                                                                                                   |
| Tag            | LOW    | MEDIUM  | Neutral, outlined, avatar and removable geometry; browser fixture substitutes initials for the source embedded portrait                                                 |
| Segment        | LOW    | HIGH    | All three group sizes, text/icon families and the 3×3 item visual matrix                                                                                                |
| Notification   | LOW    | HIGH    | Eleven 384×58 normal/error/action/countdown/loading compositions                                                                                                        |
| Modal          | LOW    | HIGH    | 572×196 structured and four 416×165 compact variants                                                                                                                    |
| Drawer         | LOW    | HIGH    | 420×900 surface, 64/764/72 regions, 32 px placeholder and 180×40 footer actions                                                                                         |

The remaining `MEDIUM` ratings are deliberate and visible: Input lacks an authoritative dedicated sheet; Dropdown contains heterogeneous source compositions whose common public contract is not fully recoverable; Tabs state names are not recoverable from outlined text; Tag's embedded portrait is not reproduced by a generic production avatar fixture. There are currently no `LOW` components.

## Visual-only source states

Classes containing `--visual-` hold a source-confirmed appearance in a static fidelity matrix. They do not define runtime semantics. Native pseudo-classes and attributes remain the production behavior contract. Notification countdown/loading, Dropdown highlight, Segment item rows and compact Modal meanings remain explicitly non-runtime or `UNKNOWN` where static SVG cannot establish behavior.

No canonical source or semantic tokens changed during this pass. Exact component geometry remains component-local when it is not a system token.
