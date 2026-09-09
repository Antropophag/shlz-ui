## Why

The current Bar Chart implements only four colors and series and cannot reproduce Dashboard.svg's bar density, axes, period inspection, or grouped tooltips. Users cannot find or reuse the documented source variants in Showcase.

## What Changes

- Complete the nine-color default/muted palette, support up to eight series, and retain existing data and lifecycle APIs.
- Add explicit semantic color selection with backward-compatible positional defaults; reproduce source density families, top-only rounding, numeric axes and sparse period labels.
- Inspect entire periods with a guide, active axis label, and grouped tooltip above/below its anchor while preserving keyboard and data-table access.
- Demonstrate palette, density, real interaction states and illustrated empty widgets with classified production fixtures.
- Validate source geometry, runtime, accessibility, content stress and a reporting consumer independently.

## Capabilities

### New Capabilities

- `data-display/bar-chart-source-completeness`: Extend the existing unarchived Bar Chart contract with complete source presentation and period inspection.

### Modified Capabilities

None in living specs; the prior Bar Chart contract remains in changes/add-framework-agnostic-bar-chart and is explicitly superseded only for the limits and presentation above.

## Impact

Affects Bar Chart model/controller/styles, reporting Showcase and HTML consumer fixtures, component documentation/audits and focused tests. No new runtime dependencies or framework requirement. Existing four-series callers and CSS color overrides remain supported. Filters, fetching, aggregation, dashboard editing/export and persistence remain consumer-owned; no new chart types. Source exports remain read-only. Dense chart focus and tooltip clipping are principal risks.
