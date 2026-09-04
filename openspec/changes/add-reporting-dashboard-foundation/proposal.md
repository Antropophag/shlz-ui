## Why

The design source contains dedicated dashboard and reporting screens, but the public library currently offers only their lower-level controls and a presentational Report Card. Consumers therefore cannot assemble a source-traceable dashboard surface without introducing local layout, widget, and metric-card conventions.

## What Changes

- Add a source-accounted decomposition of `Dashboard.svg`, `Дашборды.svg`, `Редактирование дашборда.svg`, and the report list/create/detail/notification screens, classifying every relevant region as an existing primitive, reusable reporting composition, application-owned behavior, or unresolved source evidence.
- Add framework-neutral Dashboard, Dashboard Section, and Chart Widget presentational contracts whose geometry and paint are limited to repeatable facts observed in the authoritative SVGs.
- Reuse the existing Report Card for report summaries; the source does not establish a separate Metric Card family.
- Add responsive/content-stress rules for the declared grid and widget surfaces without inferring drag, resize, persistence, data fetching, or chart semantics.
- Add Showcase fixtures, one application-owned reporting consumer, focused browser/visual/accessibility evidence, component audit manifests, and source-to-library coverage updates.
- Preserve all existing selectors and package interfaces; this change is additive.
- Intentionally exclude chart rendering, chart data models, dashboard editing, saved layouts, report-query construction, server-side table state, export behavior, and application routing until separately supported by source and product contracts.

## Capabilities

### New Capabilities

- `application-compositions/reporting-dashboard-foundation`: Source-traceable dashboard layout and chart-widget presentation contracts, including their composition, responsive behavior, ownership boundaries, and completion evidence.

### Modified Capabilities

None.

## Impact

- Public styling surface: `@shlz/styles` gains additive dashboard and chart-widget class contracts.
- Showcase and consumer evidence gain source-backed reporting compositions; no framework adapter is introduced.
- Audit and source-transfer artifacts gain an explicit reporting/dashboard screen decomposition and component manifests.
- Existing Table, Pagination, Field, Select, Date Picker, Status, Badge, Button, Link, Empty State, Notification, and Report Card remain dependencies and are not redefined.
- The authoritative files under `shlz-design-source/` remain byte-for-byte unchanged.
- Compatibility risk is limited to accidental selector leakage or an unsupported visual inference; namespaced selectors, isolated fixtures, raw-SVG evidence, and focused visual checks mitigate that risk.
