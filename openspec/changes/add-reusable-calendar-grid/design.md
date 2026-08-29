## Context

See `proposal.md` and `specs/data-display/calendar-grid/spec.md`. The repository currently has a CSS-only native table foundation and small opt-in behavior controllers, while Calendar remains source-only in `docs/component-audits/date-picker-calendar.json`. The user-supplied SVG set contains a component sheet and full application screens showing a row-by-date operational matrix, disclosure, counts, item chips, unavailable days, sticky-looking headers, and two-axis scrolling. Those screens are additional evidence, not permission to import application identity, status vocabulary, statistics, filtering, data, or routing into the reusable library.

The repository's raw `Calendar.svg` remains the primary in-repository design authority. Claims unique to the supplied screens must be recorded as user-supplied design evidence or repository decisions and must not overwrite or modify `shlz-design-source/`.

## Goals / Non-Goals

**Goals:**

- Create a deep Calendar Grid module whose interface is native semantic markup plus a small optional disclosure controller.
- Hide sticky layering, overflow containment, disclosure synchronization, event construction, and source-backed visual state mechanics behind that interface.
- Allow plain HTML/PHP, server-rendered applications, Vue, and future frameworks to author or rerender the same contract.
- Reuse tokens, table foundations, status-like tones, buttons, popovers, and icons without coupling the grid to their application examples.
- Make every source, runtime, accessibility, visual, consumer, and stress claim independently executable through the component gate.

**Non-Goals:**

- A date picker, scheduler, timeline engine, statistics surface, filter bar, user profile, tabs, or application shell.
- A client-side data store, render engine, fetch layer, virtualizer, date library, timezone or locale engine, recurrence model, drag/drop, rescheduling, range selection, or record editor.
- A Vue adapter in this change; Vue can consume the same markup and controller seam later if a real adapter need emerges.
- Guaranteeing sticky positioning in containment modes where the platform cannot provide it.

## Decisions

### 1. Use native table markup as the external seam

The module interface is a documented `.shlz-calendar-grid` table composition with explicit row/date relationships and state attributes/classes. Consumers retain full control of server rendering and framework reconciliation; CSS owns layout and paint. This keeps the module usable without JavaScript and builds on the existing table foundation.

Alternative: accept a large JavaScript rows-and-columns object and render the DOM. Rejected because it would create a second templating/runtime system, complicate PHP and Vue integration, own rerendering and escaping, and make domain data shapes part of the library interface.

Alternative: ship a custom element. Rejected for this increment because there is no second adapter proving a new seam, and native table semantics plus the established controller pattern already cover the required leverage.

### 2. Add one optional controller for disclosure only

`CalendarGridController` will validate a root, discover native disclosure buttons through explicit data markers and globally unique `aria-controls`, expose small `setRowExpanded` and `setCellExpanded` operations, synchronize hidden/expanded state, emit one typed bubbling disclosure event shape, and support `destroy()`. `enhanceCalendarGrids(scope)` remains idempotent through a `WeakMap`, matching existing behavior modules.

Alternative: separate row and cell controllers. Rejected because both operations share the same invariant and event contract; splitting them would enlarge the caller interface without adding a real adapter seam.

Alternative: include filtering, selection, item actions, and scrolling commands. Rejected because these are consumer-owned or native behaviors and would make the module shallow by mirroring screen controls.

### 3. Keep temporal logic declarative and consumer-owned

Consumers mark date columns and corresponding cells with stable column identities and explicit state values. The library styles `past`, `today`, `future`, and `unavailable` and validates only relationships needed for enhancement. It does not instantiate `Date`, parse labels, or compare timezones.

Alternative: derive state from ISO dates. Rejected because “today,” working days, locale, timezone, and availability are application decisions and would require a new dependency and policy contract.

### 4. Model visual tones as presentation, not business status

Calendar items use a limited documented tone vocabulary mapped to existing design tokens. Consumers supply visible text and business meaning; color is supplementary. The external interface does not contain names such as “Контакт,” “Звонок,” or “Проверить производство.” Source-specific striping, count badges, muted periods, and unavailable-day hatching are implemented as presentation states with accessible text responsibilities.

Alternative: expose every observed row/status as a variant. Rejected because the source screens are application compositions and the repository forbids deriving the design system from one consumer.

### 5. Use contained native scrolling with sticky headers and row labels

One wrapper owns block and inline overflow. Column headers stick on the block axis; row headers stick on the inline axis; the corner cell receives an explicit stacking layer. CSS custom properties expose only materially useful dimensions such as row-header minimum width and grid viewport maximum block size. Arbitrary observed screen widths remain composition geometry rather than tokens or enums.

Alternative: synchronize separate header/body scrollers in JavaScript. Rejected because it duplicates native scrolling, increases accessibility and lifecycle risk, and is unnecessary for the bounded non-virtualized contract.

### 6. Layer evidence by claim type

Source checks trace raw Calendar authority and the supplied SVG hashes without copying them into `shlz-design-source/`. Structural tests cover exports, markup, selectors, and event typing. Focused browser tests separately prove semantic relationships, real disclosure and focus, idempotence/destruction, sticky computed geometry, contained overflow, long/empty content, text scaling, and rerendering. Focused snapshots cover representative expanded/collapsed, temporal, unavailable, and dense states. Showcase is the executable fixture; Data Workspace supplies a real consumer composition; a plain HTML fixture proves package consumption.

Static SVG matrices and forced classes remain `static-visual` evidence only. A real browser flow must create each material interactive state and read the relevant result in that same flow.

### 7. Keep Calendar Grid separate from Date Picker

The existing combined audit family is updated so occurrence and evidence ledgers can distinguish Calendar Grid implementation from source-only Date Picker. Calendar Grid receives an independently reportable manifest/status; Date Picker remains source-only and gains no inferred contract.

Alternative: rename the existing family wholesale to Calendar Grid. Rejected because that would erase the independently authoritative Date-Picker source and falsely imply its completion.

## Risks / Trade-offs

- [Native tables with sticky cells vary across layout/containment combinations] → Constrain supported markup, assert computed geometry in the shipped browser harness, and document ordinary-flow degradation.
- [Large matrices can create excessive DOM and layout cost] → State a bounded non-virtualized contract, add a representative dense performance smoke, and leave virtualization to a separately specified module if a real consumer proves the need.
- [Disclosure can make table semantics confusing] → Keep headers present, hide only explicitly controlled content, preserve native buttons and relationships, and test accessible names and focus after every transition.
- [Consumer rerenders can invalidate controller references] → Validate at construction, expose destruction and idempotent re-enhancement, and avoid retaining domain data or private per-item state.
- [External supplied SVGs may diverge from repository authority] → Record their hashes and classify unique observations as supplemental evidence or repository decisions; raw repository SVGs win conflicts.
- [Dense source paint may fail contrast or text scaling] → Measure active text-bearing states, record source-backed deviations, and never silently recolor authority.

## Migration Plan

This is additive. Add package styles and optional behavior exports, fixtures, documentation, and audits without changing existing table markup or exports. Existing consumers require no migration. Rollback removes the new exports and occurrences while leaving source material untouched. Any implementation discovery that requires virtualization, date computation, a new application contract, or a source change returns to requirements/OpenSpec before code continues.
