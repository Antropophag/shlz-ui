## Purpose

Defines a framework-neutral week-by-time schedule for displaying consumer-owned events with source-backed geometry, accessible day and time context, bounded overflow, and optional detail disclosure through existing primitives.

## ADDED Requirements

### Requirement: Planner schedule semantic context

The Planner Schedule SHALL expose an accessible name, ordered day headings, visible time labels, and a programmatically determinable day, start time, end time, and label for every event. The public contract SHALL accept consumer-authored labels and event content without requiring an employee profile, navigation, mini-calendar, filter panel, business-status vocabulary, or application routing. Visual position or color MUST NOT be the only means of identifying an event's day, time, or meaning.

#### Scenario: Plain HTML consumer renders a schedule

- **WHEN** a server-rendered or plain HTML consumer supplies the documented Planner Schedule structure
- **THEN** the schedule renders without a framework runtime and exposes its schedule name, days, time scale, and each event's day and time interval to assistive technology

#### Scenario: Application shell is omitted

- **WHEN** a consumer uses Planner Schedule
- **THEN** no profile, sidebar, month picker, status filter, statistics view, application route, or data service is required by the module interface

### Requirement: Declarative day and time geometry

The Planner Schedule SHALL accept consumer-provided ordered days, bounded time slots, and explicit event placement values for day, start, end, and optional overlap lane. The library SHALL translate those values into duration-proportional source-backed geometry without parsing dates, comparing timezones, assigning employees, detecting conflicts, or calculating recurrence. Invalid or out-of-range placement SHALL remain a documented unsupported input rather than being silently normalized into a different time.

#### Scenario: Event spans multiple slots

- **WHEN** a consumer supplies an event whose explicit start and end cover multiple schedule slots
- **THEN** its visual block spans the corresponding duration while its full textual interval remains available

#### Scenario: Events overlap

- **WHEN** a consumer assigns two events to documented lanes within the same day and time interval
- **THEN** both events remain visible and operable without overlapping each other's interactive surface

#### Scenario: Date policy stays consumer-owned

- **WHEN** a consumer formats day and time labels for its locale, timezone, and work calendar
- **THEN** Planner Schedule displays those values unchanged and performs no independent date, locale, timezone, recurrence, or availability calculation

### Requirement: Events and visual states

The Planner Schedule SHALL support empty periods and generic event items with visible title, optional time and supporting text, a documented presentation tone, and `default`, `hover`, `focus-visible`, `completed`, and `canceled` presentation states where source-backed. Event labels SHALL remain readable under long localized content, and tone or opacity MUST NOT be the sole indication of completion or cancellation.

#### Scenario: Generic event is presented

- **WHEN** a consumer places a labeled event with a supported tone and explicit time interval
- **THEN** the event appears in the corresponding day and interval without assigning business meaning to the tone

#### Scenario: Completed or canceled event is presented

- **WHEN** a consumer marks an event completed or canceled and provides visible or assistive status text
- **THEN** the source-backed state treatment is applied while the status remains identifiable without color or opacity alone

#### Scenario: Long content is supplied

- **WHEN** event title, time, supporting text, or day labels contain long localized content
- **THEN** content remains readable or intentionally truncated with an accessible full label and does not overlap adjacent event controls

### Requirement: Temporal and unavailable presentation

The Planner Schedule SHALL support consumer-declared `past`, `today`, and `future` day states, unavailable days or periods with an accessible reason, and an optional current-time indicator with consumer-authored visible time text. The library SHALL style these states but MUST NOT determine the current day or time. Unavailable content SHALL remain identifiable without relying only on hatch paint or color.

#### Scenario: Consumer marks today and current time

- **WHEN** a consumer identifies a day as today and provides a current-time position and label
- **THEN** the day and timeline receive the documented treatment while the time remains visible and programmatically available

#### Scenario: Day or period is unavailable

- **WHEN** a consumer marks a day or bounded period unavailable and supplies its reason
- **THEN** the source-backed unavailable treatment appears and assistive technology can identify the reason

### Requirement: Event detail composition

Planner Schedule event controls SHALL compose with the existing Popover interface so consumers can expose event details while preserving the event trigger's expanded state, focus restoration, Escape dismissal, outside-pointer dismissal, and collision-aware positioning. The planner-specific detail markup SHALL support consumer-authored title, description, date/time, location, participants, comments, files, and actions without requiring any field or performing record mutations.

#### Scenario: Event detail opens from a real event

- **WHEN** a user activates an event button connected to a Planner detail Popover
- **THEN** the detail surface opens through the existing Popover behavior, retains the event's schedule context, and closes with the documented Popover keyboard and focus behavior

#### Scenario: Consumer handles a detail action

- **WHEN** a user activates a consumer-authored control inside event details
- **THEN** the consumer determines validation and mutation while Planner Schedule adds no persistence, authorization, or business workflow

### Requirement: Overflow, sticky context, and bounded scale

Planner Schedule SHALL contain horizontal and vertical overflow within its own wrapper, retain useful day and time context while scrolling where the platform supports sticky positioning, and avoid causing horizontal page overflow. Controls and labels SHALL remain reachable at the supported narrow viewport and browser text scaling. The public contract SHALL document a bounded, non-virtualized schedule and SHALL NOT promise an unbounded day, slot, or event count.

#### Scenario: Narrow container scrolls the schedule

- **WHEN** the supplied days cannot fit the available inline size
- **THEN** horizontal overflow remains inside Planner Schedule and the page does not gain horizontal overflow

#### Scenario: Tall schedule preserves context

- **WHEN** the time range exceeds the configured viewport height
- **THEN** vertical overflow remains inside Planner Schedule and day/time context remains perceivable without covering focused controls

#### Scenario: Text is enlarged

- **WHEN** browser text is enlarged at a narrow supported viewport
- **THEN** event controls and labels remain reachable through ordinary scrolling with no clipped focus indicator or keyboard trap

### Requirement: Planner Schedule audit acceptance

Planner Schedule SHALL remain `INVENTORIED` or move to `FINDINGS` until its manifest classifies every repository occurrence and independently passes source integrity, structural contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content-stress evidence. Static SVGs and forced visual states MUST NOT substitute for real Popover interaction, keyboard operation, computed geometry, or consumer-owned action evidence.

#### Scenario: Unclassified occurrence blocks verification

- **WHEN** repository or built-DOM census finds Planner Schedule markup, an executable fixture, consumer, diagnostic, or legacy substitute absent from the manifest
- **THEN** the occurrence guard fails and Planner Schedule cannot be marked `VERIFIED`

#### Scenario: Complete evidence permits verification

- **WHEN** source traceability, semantic context, duration and overlap geometry, event states, current-time and unavailable treatment, real detail interaction, focus behavior, bounded overflow, long/empty content, plain-HTML use, and a real application consumer pass without a blocking finding
- **THEN** Planner Schedule may move to `VERIFIED` with exact observed counts, supported limits, and consumer-owned responsibilities recorded
