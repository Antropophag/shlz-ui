## Why

SHLZ UI now has a reusable row-by-date Calendar Grid, but the authoritative Planner sources also define a different operational pattern: a week-by-time schedule with duration-based event placement, unavailable periods, a current-time indicator, and event details. Consumers currently have no framework-neutral way to reproduce that pattern without rebuilding its layout and accessibility behavior.

## What Changes

- Add a framework-neutral Planner Schedule module for bounded day-by-time schedules.
- Define semantic day and time context, duration-based event geometry, overlapping-event lanes, temporal and unavailable states, empty periods, and contained two-axis overflow.
- Add a small optional controller for event-detail disclosure, active-event synchronization, typed notifications, idempotent enhancement, and destruction.
- Provide a reusable event-detail popover composition using existing Popover, Avatar, Button, Textarea, and file primitives without owning application records or mutations.
- Add source traceability, public documentation, plain-HTML and Showcase fixtures, one Data Workspace consumer, component-audit inventory, occurrence guards, and focused runtime/accessibility/visual evidence.
- Keep the existing Calendar Grid interface backward compatible and reuse its presentation vocabulary only where the two source contracts genuinely coincide.
- Do not modify any file under `shlz-design-source/`.
- Exclude application navigation, employee profile, mini-calendar, filters, statistics, data loading, permissions, date arithmetic, timezone/recurrence policy, drag-and-drop, resizing, persistence, and record editing.

## Capabilities

### New Capabilities

- `data-display/planner-schedule`: Framework-neutral week-by-time schedule structure, source-backed event presentation, optional detail disclosure, accessibility, overflow behavior, and audit acceptance.

### Modified Capabilities

None.

## Impact

Implementation is expected to add planner styles under `packages/styles`, optional behavior under `packages/behaviors`, package exports and generated bundles, documentation and fixtures, Showcase and Data Workspace compositions, component-audit records, structural tests, and focused Playwright coverage. No framework adapter, calendar/date engine, scheduling backend, application shell, or mutation workflow is introduced. Primary risks are encoding geometry as a shallow caller interface, presenting a visually positioned schedule without adequate semantic context, and conflating static source popovers with application-owned editing behavior.
