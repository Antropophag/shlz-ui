# Planner Schedule

Planner Schedule is a framework-neutral, bounded week-by-time composition. It works with plain HTML, server-rendered PHP, Vue templates, and other renderers without a JavaScript rendering runtime.

Consumers own day and time labels, locale, timezone, work-calendar policy, event identity and ordering, placement indices, overlap lanes, state text, loading and errors, permissions, filtering, recurrence, persistence, rerendering, and every event action. The library owns the visual tracks, duration and lane geometry, source-backed paint, current-time and unavailable presentation, contained scrolling, sticky context, and the Planner detail layout.

## Interface

Create one labelled `.shlz-planner-schedule` region. Its scrollable viewport contains a canvas with ordered day headings, a visible time scale, decorative day surfaces, and one semantic event list. Set `--shlz-planner-day-count` and `--shlz-planner-slot-count` on the root.

Each event is authored once as a list item. Provide `--shlz-planner-day`, `--shlz-planner-start`, and `--shlz-planner-end`; overlapping events additionally provide zero-based `--shlz-planner-lane` and the shared `--shlz-planner-lane-count`. These normalized values are presentation inputs, not dates. The event control still supplies its complete day, start, end, status, and label through visible text and accessible relationships.

Supported event tones are `accent`, `success`, and `neutral`. `data-state="completed|canceled"` is presentation-only; consumers provide corresponding visible or assistive status text. Day surfaces accept `data-shlz-planner-state="past|today|future"`. Use `data-shlz-planner-unavailable` only with a visible or assistive reason.

The optional current-time line uses `--shlz-planner-now` and `--shlz-planner-now-day`, plus consumer-authored visible time text. Planner Schedule never reads the clock or parses dates.

## Event details

Compose event buttons with the existing Popover interface. Render the panel outside `.shlz-planner-schedule__viewport` so overflow containment does not clip it. `.shlz-planner-detail` and its row/label/participants helpers lay out optional consumer fields; none is required. Popover continues to own open/close, Escape, outside-pointer dismissal, positioning, focus restoration, idempotence, and destruction.

The Popover body remains ordinary consumer markup, so applications may compose existing Avatar, Button, Textarea, File Row, or Document Row primitives for participants, comments, attachments, and actions. Planner Schedule does not alter those component contracts or require any of them.

## Bounds and unsupported behavior

The schedule is non-virtualized and intended for a bounded week-like view. The shipped evidence covers 1–7 days, up to 24 labelled slots, 60 simultaneous events, two overlap lanes, a 320 px viewport, and 200% text. Override `--shlz-planner-day-width`, `--shlz-planner-time-width`, `--shlz-planner-header-height`, `--shlz-planner-slot-height`, and `--shlz-planner-max-block-size` at the composition seam when needed.

Date calculation, timezone conversion, recurrence, conflict detection, drag/drop, resizing, selection, editing, authorization, data loading, persistence, virtualization, application navigation, profiles, mini-calendars, filters, and statistics are unsupported and consumer-owned.
