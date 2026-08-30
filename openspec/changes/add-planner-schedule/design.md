## Context

See `proposal.md` and `specs/data-display/planner-schedule/spec.md`. The repository now ships Calendar Grid for row-by-date matrices and Popover for generic floating details, but Planner remains a source-only application composition. `Planner.svg` is the primary component-sheet authority; `Планировщик для сотрудника.svg` supplies full-screen composition evidence. The user-provided screenshots identify those exact frames but do not override raw SVG authority.

## Goals / Non-Goals

**Goals:**

- Create a deep Planner Schedule module whose interface is semantic consumer-authored markup plus a small set of normalized CSS placement values.
- Hide schedule tracks, duration geometry, overlap-lane sizing, sticky layering, overflow containment, state paint, and current-time rendering behind that interface.
- Reuse the existing Popover module for detail lifecycle and positioning instead of introducing planner-specific floating behavior.
- Support plain HTML/PHP, server-rendered applications, Vue templates, and future adapters without a JavaScript rendering runtime.
- Make each source, semantic, runtime, accessibility, visual, consumer, and stress claim executable through the component gate.

**Non-Goals:**

- A scheduling engine, calendar/date library, recurrence system, timezone policy, availability solver, conflict detector, virtualizer, drag/drop, resize, record editor, fetch layer, or persistence store.
- Application navigation, employee profile, mini-calendar, filter/status sidebar, statistics page, permissions, or business vocabulary.
- Replacing or widening Calendar Grid, Popover, Date Picker, Avatar, Button, Textarea, or file primitive interfaces.
- A framework adapter in this change.

## Decisions

### 1. Use semantic day regions with an independent visual schedule plane

The external seam is a labelled Planner Schedule region containing ordered day headers, a visible time scale, and one semantic event list per day. Events carry complete text/time context in markup. A CSS visual plane aligns those same event controls to shared day and slot tracks through normalized custom properties.

Alternative: a native table with one row per slot and `rowspan` events. Rejected because overlapping lanes and arbitrary duration blocks make the authored table structure mirror layout internals and complicate responsive behavior.

Alternative: ARIA `grid` with managed arrow-key navigation. Rejected because the source does not establish spreadsheet interaction and adding a composite widget would create a larger keyboard interface than native buttons and links require.

### 2. Keep placement declarative and normalized

Consumers provide zero-based day/start/end indices and optional lane/lane-count values through documented CSS custom properties. The implementation translates these normalized values into grid placement and proportional sizing. Visible and assistive day/time text remains authoritative; numeric placement is presentation input only.

Alternative: accept timestamps and calculate positions in JavaScript. Rejected because timezone, locale, slot rounding, workday bounds, and conflict policy are consumer-owned and would require a date engine.

Alternative: expose pixel coordinates. Rejected because it leaks source geometry and prevents responsive track changes.

### 3. Compose existing Popover rather than add a Planner controller

Event controls use the existing `data-shlz-popover-trigger` relationship. Planner adds only detail-layout classes inside the Popover body. Open/close state, outside dismissal, Escape, focus restoration, collision handling, idempotence, and destruction remain owned by Popover.

Alternative: add `PlannerScheduleController` that proxies Popover. Rejected by the deletion test: deleting the proxy would not redistribute meaningful complexity and would create a shallow interface.

Alternative: make detail panels modal dialogs. Rejected because the source shows non-modal anchored surfaces and ordinary supplementary interaction.

### 4. Separate source facts from repository decisions

`Planner.svg` locks meeting-card tones, durations, hover states, empty/unavailable cells, event-detail compositions, employee identity fragments, current-time lines, and status examples. Full-screen employee designs support weekly composition, sticky-looking day/time context, and unavailable weekends. Semantic regions, normalized placement, overflow limits, Popover reuse, keyboard behavior, responsive minimums, and performance bounds are repository decisions unless directly recoverable from raw SVG.

Application-specific labels, people, addresses, filters, statuses, actions, and shell geometry remain fixture data or excluded evidence; they never become variants or tokens.

### 5. Use contained native scrolling and bounded rendering

One planner wrapper owns both overflow axes. Day context sticks on the block axis and the time scale sticks on the inline axis; the corner receives explicit stacking. CSS custom properties expose only useful composition dimensions: day width, slot height, slot count, and maximum block size. The public contract documents representative bounds rather than virtualization.

Alternative: synchronized JavaScript scrollers or canvas rendering. Rejected because native overflow preserves accessibility and selection while the approved scope is bounded.

### 6. Layer evidence by claim type

Source tests lock raw SVG hashes and explicitly classified observations. Structural tests cover exports, selectors, semantic fixture requirements, and the absence of app-shell vocabulary in the module. Browser tests prove event/Popover interaction, focus restoration, temporal descriptions, consumer actions, computed duration/lane/sticky/overflow geometry, narrow/text-scale behavior, and a bounded dense performance case. Focused snapshots cover default/hover/focus, completed/canceled, unavailable, current-time, overlap, and detail states.

## Risks / Trade-offs

- [CSS custom properties can diverge from visible time text] → Require complete visible/assistive intervals, document placement as presentation-only, and test fixture consistency through a source-contract oracle.
- [Two parallel semantic and visual structures could duplicate events] → Render each event once; semantic day lists are the positioned plane, with CSS changing layout but not DOM ownership.
- [Sticky positioning varies across containment modes] → Constrain supported markup, assert computed geometry in the browser harness, and document ordinary-flow degradation.
- [Dense schedules can create layout cost] → Publish bounded day/slot/event limits and run one representative performance smoke; defer virtualization to a separately specified module.
- [Source text contrast in completed/canceled states may be weak] → Measure active text-bearing states, record any source-backed deviation, and never silently recolor authority.
- [Popover panels may be clipped by transformed ancestors] → Preserve the existing Popover document-placement guidance and do not add planner-specific portalling.

## Migration Plan

This is additive. Add Planner Schedule styles, fixtures, documentation, and audit evidence without changing existing Calendar Grid or Popover markup and exports. Existing consumers require no migration. Rollback removes the new style export and Planner occurrences while leaving source material and existing primitive modules untouched. Any discovery requiring date computation, managed grid navigation, mutation workflows, virtualization, or source changes returns to requirements/OpenSpec before implementation continues.
