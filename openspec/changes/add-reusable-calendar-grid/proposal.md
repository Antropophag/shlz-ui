## Why

SHLZ UI has authoritative calendar and date-picker source material but no reusable calendar grid implementation. The supplied full-screen calendar designs establish a dense operational grid pattern that should be available to plain HTML, PHP, Vue, and future consumers without importing application-specific profile, navigation, status names, or statistics-page behavior.

## What Changes

- Add a framework-neutral reusable calendar grid module for row-by-date operational data.
- Define generic row, column/date, cell summary, item, collapsed/expanded, today, past/future, unavailable-day, empty, overflow, and loading-safe presentation contracts.
- Preserve the supplied designs' sticky row/date context, dense cell layout, status-colored items, count badges, day-off treatment, and two-axis overflow behavior where source-backed.
- Keep application tabs, employee identity, business status vocabulary, statistics views, filters, date-range selection, data fetching, authorization, routing, and domain actions consumer-owned.
- Add a deep, data-driven interface at a framework-neutral seam rather than exposing internal cell-by-cell DOM construction to callers.
- Add source traceability, documentation, executable Showcase and plain-HTML fixtures, a component audit manifest, occurrence guards, browser behavior/accessibility tests, responsive and content-stress coverage, and focused visual evidence.
- Do not modify any file under `shlz-design-source/`.

## Capabilities

### New Capabilities

- `data-display/calendar-grid`: Framework-neutral calendar grid structure, data interface, visual states, interaction ownership, accessibility, overflow behavior, and audit acceptance.

### Modified Capabilities

None.

## Impact

Implementation is expected to add calendar-grid styles under `packages/styles`, progressive-enhancement behavior under `packages/behaviors` only where the public contract requires it, exports and package builds, component documentation, Showcase and plain-HTML consumers, source/structural tests, focused Playwright coverage and snapshots, plus `docs/component-audits/date-picker-calendar.json` and project inventory updates. No framework adapter, date picker, scheduling engine, persistence, network dependency, or application page shell is introduced. Primary risks are making the interface as complex as the rendered grid, confusing visual source evidence with business semantics, and shipping a visually dense table without coherent keyboard and screen-reader behavior.

