## Context

See `proposal.md`. `Dashboard.svg` is the primary visual authority, while `docs/component-audits/reporting-dashboard-source-ledger.json` and the completed reporting foundation explain current ownership. The SVG is a 4366×6357 component sheet containing a matrix of chart-widget specimens; it outlines text and demonstrates graphical arrangements but does not encode a reusable data schema, DOM semantics, accessible-name relationships, keyboard rules, or consumer data lifecycle. The existing Chart Widget intentionally owns only the outer presentational surface and plot slot.

The accepted product decisions close those semantic gaps. This design must preserve the repository layering: tokens → framework-neutral styles/primitives → interactive web layer → optional adapters → application composition.

## Goals / Non-Goals

**Goals:**

- Introduce one small public data contract with identity stable across data replacement, legend visibility, localization, and focus reconciliation.
- Separate a pure chart model/layout seam from DOM rendering and interaction so plain HTML, PHP, and optional adapters share behavior.
- Reproduce only source-supported Bar/legend/tooltip presentation and explicitly classify every non-source behavior.
- Make the semantic table a first-class representation of the same visible model, not a separately maintained fallback.
- Reuse Chart Widget and existing control/popover styles without transferring their lifecycle ownership into the chart.

**Non-Goals:**

- A general visualization grammar or dependency on a chart framework.
- Additional chart types, negative or missing values, stacking, scale configuration, animation, zooming, export, streaming, or data transforms.
- Filter, period, query, localization, business-formatting, persistence, or analytics ownership.
- A Vue-first API or a change to the existing Chart Widget contract.

## Source Matrix

| Concern | Direct source fact | Derived pattern | Product/repository decision | Implementation consequence |
| --- | --- | --- | --- | --- |
| Authority | `shlz-design-source/raw/svg/Dashboard.svg`, SHA-256 `1cfca3af5e0ad0e0a25bff436a3b4031fda03de9880f3d110b491283bfec10a8` | Existing ledger isolates `chart-bars` and `chart-period` as unresolved future-chart regions | Raw SVG overrides all derived evidence | Source-integrity checks lock the exact source hash; no file under `shlz-design-source/` changes |
| Host surface | Repeated 1304×515, radius-16 white surfaces appear 29 times | Specimens are chart variations within one repeated Chart Widget geometry | Chart Widget remains the host and Bar Chart fills its plot region | Do not duplicate widget padding, headings, outer controls, or empty-state ownership |
| Chart model | Specimens depict vertical bars arranged along a shared baseline; several SHLZ series colors recur | Repeated adjacent colored bars support a grouped vertical Bar interpretation | Support grouped vertical bars only, with one through four series | Layout engine creates ordered category groups and visible-series bars on one scale |
| Axes and values | Static plot lines, marks, and outlined labels are visible | Their recurrence supports axes/grid/label presentation but not literal copy or numeric semantics | Values are finite and non-negative; consumer supplies display-ready labels | Do not recover outlined strings or infer domain formatting from geometry |
| Tooltip/popover | The sheet includes a chart popover/overlay treatment | It is visual evidence for datum detail presentation | Tooltip content is category + series + value and is equivalent for hover/focus | Reuse existing popover presentation where compatible; chart owns datum anchoring and lifecycle |
| Legend | Repeated colored series keys and labels appear in chart specimens | Color/label pairs establish association, not interaction | Legend items are native toggle buttons; at least one series remains visible | Visibility is keyed by `series.id`, reflected in plot and table, and announced through a neutral event |
| Filters/periods | Segment-like period and filter/dropdown controls appear above plots | Placement shows composition, not data-query semantics | All filter and period controls and data preparation are consumer-owned | Public chart input contains prepared data only; no control composition is required by the chart |
| Keyboard/focus | Static SVG contains no focus order, focus ring lifecycle, or key behavior | None | Roving bar focus; arrows traverse category/series axes; Home/End traverse categories | Interactive web controller manages focus by composite datum identity and prevents handled keys from scrolling the page |
| Accessible alternative | Static SVG does not establish a table or equivalent data representation | None | Adjacent expandable semantic table mirrors visible data | Plot and table derive from one validated model and cannot drift independently |
| Responsive behavior | Source specimens are wide fixed canvases | Existing Chart Widget contract supports fluid and narrow containment, but source does not define chart reflow | Preserve a minimum plot width and use local horizontal overflow | Title, legend, and disclosure stay outside plot scroller; focused marks scroll locally into view |
| Content stress | Outlined source labels do not establish localization length | Multiple specimens show varying mark geometry but not arbitrary labels/counts | Full accessible labels are mandatory; visual shortening may not erase names | Tests cover repeated labels, long localized labels/values, many categories, zero values, and narrow containers |

## Decisions

### Use a normalized rectangular public model

The input boundary will normalize categories and series into ordered records keyed by stable strings; each datum is addressed by `(categoryId, seriesId)`. The supported input is rectangular and complete, with finite non-negative numbers.

This avoids identity bugs caused by array indices and keeps the plot, tooltip, legend, table, and update reconciliation on one model. Accepting sparse or negative data was rejected because neither behavior nor visual treatment is established by source, and both would add scale, baseline, table, and navigation states outside this contract.

### Split pure model/layout from DOM interaction

A framework-neutral model validates input, calculates visible series, scale domain, grouped geometry, and focus neighbors without reading the DOM. A small web controller binds that output to semantic markup, native controls, pointer/focus behavior, local scrolling, notifications, and teardown. CSS owns paint and source-backed state styling.

Direct framework component implementation was rejected because PHP/plain-HTML consumers are first-class. A third-party chart runtime is not justified: the bounded grouped-bar contract is small, while a dependency would introduce its own DOM, accessibility, and styling semantics.

### Render graphical marks as an SVG view with DOM-owned controls

SVG provides deterministic geometry and scalable source-backed marks. The plot has an accessible name and exposes its bar targets to the controller, while legend toggles and table disclosure remain native HTML buttons and the alternative remains a native table. The chart title/description relationship is supplied through public markup hooks rather than inferred text.

Canvas was rejected because it would require a parallel hit-testing and accessibility tree. Making every bar a Tab stop was rejected because category count would make sequential navigation unusable; one roving target keeps Tab order bounded.

### Keep one canonical visible-data projection

Legend state produces an ordered visible-series projection used by scale/layout, focus navigation, tooltip lookup, and table columns. A toggle cannot remove the final visible series. On data replacement, series visibility is retained for surviving IDs; new IDs start visible; if none of the previous visible IDs survive, all valid incoming series start visible. Focus is retained by composite ID when possible, otherwise reconciled to the same category and nearest visible series, then to the first datum.

Keeping hidden columns in the accessible table was rejected because the accepted contract defines the table as the alternative to the currently visible graphic. Resetting all state on every update was rejected because stable IDs explicitly exist to preserve user context.

### Define tooltip ownership deterministically

Pointer hover displays the hovered datum when focus is outside the plot. Keyboard focus owns tooltip content whenever focus is inside the plot; incidental pointer movement does not replace it. Leaving the relevant pointer target closes a pointer-owned tooltip; leaving the plot closes a focus-owned tooltip. The tooltip is descriptive and noninteractive.

This prevents competing pointer/focus sources. Interactive tooltip content was rejected because all actions belong in the legend or adjacent controls and would add a second focus lifecycle.

### Preserve group readability with local overflow

The layout computes a content width from category count, visible-series count, minimum bar width, and gaps, bounded below by a documented plot minimum. The viewport may grow fluidly; if it cannot, a labelled plot wrapper scrolls horizontally. Keyboard movement calls local `scrollIntoView` behavior without changing page-level scroll axes. Full names remain in accessible markup even where visual axis labels are shortened.

Shrinking bars and labels without a lower bound was rejected because it makes dense charts illegible. Responsive transposition to horizontal bars was rejected because it would introduce a different chart model not supported by the proposal.

### Keep consumer controls outside the capability

The chart accepts prepared data plus display labels and emits only chart-local visibility notifications. Period and filter controls, fetching, aggregation, sorting policy, locale selection, number formatting, and empty/error/loading decisions remain in the consumer. A consumer with zero categories composes the existing Chart Widget empty region instead of constructing a Bar Chart.

## Public Interface Shape

The apply phase will refine names against existing package conventions while preserving this contract shape:

```js
{
  categories: [{ id, label }],
  series: [{
    id,
    label,
    values: [{ categoryId, value, displayValue }]
  }]
}
```

`label` and `displayValue` are display-ready strings supplied by the consumer; `value` alone drives geometry. Initialization accepts a root plus valid data and returns update/destroy operations. Visibility changes dispatch a namespaced DOM event whose detail contains ordered visible series IDs. Exact exported names are an apply-stage compatibility choice and must not alter the specified behavior.

## Evidence Strategy

Implementation begins with a component manifest and repository-wide occurrence census. Pure tests cover validation, composite identity, ordering, scale, visibility projection, focus-neighbor lookup, data replacement, and zero values. Browser tests create real hover, focus, arrow/Home/End navigation, legend toggle/last-series refusal, open-table synchronization, update reconciliation, teardown, and local-scroll behavior. Accessibility checks verify names, button pressed state, table headers, bounded Tab order, focus visibility, and keyboard equivalence. Focused visual evidence compares the source-backed bar/legend/tooltip states, while responsive/content-stress evidence covers one through four series, many categories, duplicate/long labels, long values, and narrow containers. At least one real reporting consumer composes consumer-owned period/filter controls around the chart without transferring their ownership.

## Risks / Trade-offs

- [A bespoke SVG renderer can grow into a chart framework] → Keep the supported model closed and reject unsupported modes at validation.
- [Horizontal overflow can hide later categories] → Label the scroll region, preserve local focus reveal, and keep the full semantic table outside it.
- [Legend state can desynchronize plot and table] → Derive both from one immutable visible-series projection and test every toggle transition.
- [Color alone can encode series] → Pair every color key with text and expose category/series/value names on each inspected datum.
- [Four series may become cramped with long labels] → Preserve minimum bar/group geometry and overflow rather than compressing below the documented floor.
- [Source fidelity can conflict with accessibility] → Record source-backed deviations explicitly; do not silently recolor or claim accessibility from static visuals.
- [Consumer-preformatted strings may not match numeric values] → Treat numeric `value` as geometry authority and display strings as consumer-owned presentation; document that consistency is the consumer's responsibility.

## Migration Plan

This is additive. Implement behind new exports and styles, add fixtures and one consumer, pass the component gate, and publish only through the repository's normal unmerged-PR delivery. Rollback removes the new exports, behavior, styles, docs, fixtures, and audit records without changing Chart Widget or consumer data services.
