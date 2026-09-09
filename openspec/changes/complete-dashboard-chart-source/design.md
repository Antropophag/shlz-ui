## Context

See proposal.md. Dashboard.svg and its hash-verified matrix are visual authority. The existing data-display/bar-chart contract is in an unarchived change. This extension supersedes its four-series limit and single-datum presentation while retaining lifecycle, identity, keyboard, legend and table contracts.

## Goals / Non-Goals

**Goals:** Complete source presentation with a small framework-neutral model/rendering seam and exact fixture geometry.

**Non-Goals:** Dashboard editing, new chart types, filter business semantics, source modification or global design-token expansion.

## Decisions

- Add optional named series tone; keep existing positional CSS slots 1–4 and extend slots 5–8. Explicit tones remain stable under reorder. Chart-specific paint uses verified source values, including exceptional muted orange/gray, rather than assigning status meaning from arbitrary IDs.
- Isolate quantitative layout and validated presentation options in the chart model. Source-density presets encode component-specific measurements; do not promote observed widths to global tokens. Default mode remains a responsive, locally scrollable chart; reference specimens use a 1212×300 plot with source counts, widths and sparse ticks. Add optional scale maximum and tooltip placement with validation.
- Expose a decorative `createBarChartSwatch(tone, muted)` DOM factory, sharing the clipped mark primitive with the renderer so palette geometry cannot drift into showcase-only CSS.
- Retain SVG rectangles for compatibility with existing focus and zero-target semantics; use clipping to keep bottom corners square. Use one category inspection state shared by pointer/focus, SVG guide/badge and grouped tooltip. Tooltip positioning is chart-local and recomputed on scrolling/resizing; no portal or floating dependency.
- Reuse the existing Basic Empty State illustration for widget empty presentation after checking source evidence. Keep widget presentation separate from chart data validation.
- Work inline in two sequential implementation sections: model/renderer and gallery/evidence. They share contracts and do not warrant parallel execution packets. Independent Standards/Spec review follows the code-review skill.

## Risks / Trade-offs

- Dense 7px bars are small pointer targets → preserve keyboard inspection and semantic table; validate zoom/narrow overflow.
- Source geometry cannot establish arbitrary data layout → document default layout as repository decision and exact source presets as component-specific contracts.
- Tooltip labels and eight rows can exceed source heights → permit content growth, wrap text and test both placements without clipping.
- Existing tests encode four-series restrictions → replace these assertions with eight-series coverage and nine-series rejection, preserving other regressions.

## Migration Plan

Existing calls need no changes. Reporting fixtures opt into explicit tones. Existing first-four color overrides remain valid. Rollback is the scoped PR revert; no persistence or data migration exists. Validation includes model oracles, browser interaction/axe, exact source geometry, focused screenshots, consumer update/teardown and occurrence census.
