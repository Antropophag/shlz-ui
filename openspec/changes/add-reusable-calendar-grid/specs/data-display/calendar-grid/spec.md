## Purpose

Defines a framework-neutral operational calendar grid for comparing generic row categories across dated columns while preserving semantic structure, dense source-backed presentation, accessible interaction, and consumer ownership of domain data and actions.

## ADDED Requirements

### Requirement: Calendar grid semantic structure

The calendar grid SHALL expose its dated matrix as a native table with an accessible name, a row-header column, date column headers, and body cells whose row and column relationships remain available to assistive technology. The public contract SHALL accept consumer-authored labels and content without requiring application profile, tab, filter, statistics, or business-status markup. Visual position alone MUST NOT be the only means of identifying a cell's row or date.

#### Scenario: Plain HTML consumer renders a grid

- **WHEN** a server-rendered or plain HTML consumer supplies the documented calendar-grid table structure
- **THEN** the grid renders without a framework runtime and exposes an accessible table name, row headers, and date column headers

#### Scenario: Application shell is omitted

- **WHEN** a consumer uses the reusable calendar grid
- **THEN** no employee profile, page title, navigation tabs, statistics view, status filter, or application routing is required by the grid interface

#### Scenario: Invalid enhanced structure fails clearly

- **WHEN** progressive enhancement is requested for markup missing a required root, row control relationship, or globally unique relationship identifier
- **THEN** enhancement fails with a descriptive error rather than silently producing an incoherent interaction

### Requirement: Date columns and temporal presentation

The calendar grid SHALL support consumer-provided date columns with visible primary and secondary labels, optional month or period grouping, and explicit `past`, `today`, `future`, and `unavailable` presentation states. The library SHALL style these states without calculating the current date, locale, week boundary, timezone, work calendar, holiday, or availability. Unavailable columns SHALL remain identifiable without relying only on hatch paint or color.

#### Scenario: Consumer marks the current date

- **WHEN** a consumer identifies one date column as `today`
- **THEN** the corresponding header and cells receive the documented today treatment while retaining their semantic headers

#### Scenario: Weekend or unavailable date is shown

- **WHEN** a consumer marks a date column unavailable and provides its accessible reason
- **THEN** the column receives the source-backed unavailable treatment and assistive technology can identify that reason

#### Scenario: Locale and timezone stay consumer-owned

- **WHEN** a consumer formats dates in its selected locale and timezone
- **THEN** the grid displays those labels unchanged and performs no independent date parsing or temporal classification

### Requirement: Rows, cells, items, and density states

The calendar grid SHALL support consumer-defined row labels, optional row descriptions, empty cells, count-only cells, cells containing one or more generic items, and cells whose item list is visually limited behind an overflow summary. Items SHALL accept consumer text and a documented visual tone without embedding business identifiers or status names in the public contract. Counts and overflow summaries MUST remain consistent with the rendered or consumer-declared item total.

#### Scenario: Generic items are rendered

- **WHEN** a consumer places labeled items with supported tones into a cell
- **THEN** the grid presents the labels in the corresponding date and row without assigning business meaning to the tone

#### Scenario: Dense cell uses an overflow summary

- **WHEN** a cell contains more items than the consumer chooses to show initially
- **THEN** the visible subset and accessible overflow control communicate the remaining count without losing the cell's row/date context

#### Scenario: Long and empty content remain coherent

- **WHEN** row labels, item labels, counts, or cells contain long localized or empty content
- **THEN** text remains readable, empty state is not conveyed by a misleading count, and controls remain operable without overlapping adjacent cells

### Requirement: Progressive row and cell disclosure

The optional calendar-grid controller SHALL enhance consumer-authored native buttons for row and dense-cell disclosure. It SHALL synchronize `aria-expanded`, the controlled content's visibility, and emitted bubbling change notifications. Row and cell disclosure MUST be independently controllable, keyboard operable through native button behavior, idempotently enhanceable, and cleanly destroyable. The controller SHALL NOT fetch data, mutate application records, navigate, select dates, choose filters, or infer which rows or cells should begin expanded.

#### Scenario: Row is collapsed and expanded

- **WHEN** a user activates a row disclosure button
- **THEN** only that row's controlled calendar content changes visibility, `aria-expanded` matches the result, and a bubbling grid disclosure event identifies the affected row and state

#### Scenario: Dense cell is disclosed

- **WHEN** a user activates a cell overflow control
- **THEN** the remaining items in that cell become available without changing unrelated rows or cells and focus remains on a connected operable control

#### Scenario: Enhancement is repeated or destroyed

- **WHEN** enhancement is requested twice for the same root and later destroyed
- **THEN** callers receive the existing live controller, duplicate listeners are not installed, and destruction removes library listeners without deleting consumer markup or data

### Requirement: Two-axis overflow and sticky context

The grid SHALL fit its container, preserve a usable row-header and date-header context while its matrix scrolls, and support both horizontal and vertical overflow without causing horizontal page overflow. Sticky presentation SHALL degrade to ordinary table flow where platform or containment constraints prevent sticking. The public contract SHALL NOT promise virtualization or an unbounded number of simultaneously rendered cells.

#### Scenario: Narrow container scrolls the matrix

- **WHEN** the available inline size cannot contain all supplied dates
- **THEN** overflow is contained by the calendar grid, the page does not gain horizontal overflow, and row/date context remains perceivable while the matrix scrolls

#### Scenario: Tall grid preserves context

- **WHEN** the grid body exceeds its configured viewport height
- **THEN** vertical scrolling remains inside the grid and the date-header context remains available without covering focusable content

#### Scenario: Text scaling does not trap content

- **WHEN** browser text is enlarged and the grid is used at a narrow supported viewport
- **THEN** controls and labels remain reachable through ordinary two-axis scrolling with no clipped focus indicator or keyboard trap

### Requirement: Consumer ownership and event contract

Consumers SHALL own row/date/item identity, ordering, date calculations, domain tones, data loading, errors, permissions, record actions, filtering, selection, persistence, and rerendering. The grid SHALL emit only documented disclosure notifications and MUST NOT expose private DOM geometry or source-screen business vocabulary as interface requirements. Consumer rerenders SHALL be able to preserve disclosure state explicitly rather than depending on undocumented internal state.

#### Scenario: Consumer handles an item action

- **WHEN** an item contains a consumer-authored link or button
- **THEN** native activation and the consumer's handler determine the result while the grid adds no navigation or mutation behavior

#### Scenario: Consumer rerenders data

- **WHEN** a consumer replaces rows or date cells after loading new data
- **THEN** it can destroy and re-enhance the grid or update documented disclosure state without depending on private implementation details

### Requirement: Calendar grid audit acceptance

Calendar Grid SHALL remain `INVENTORIED` or move to `FINDINGS` until its manifest classifies every repository occurrence and independently passes source integrity, structural contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content-stress evidence. Static SVGs and forced visual states MUST NOT substitute for real disclosure behavior, keyboard operation, computed sticky/overflow geometry, or consumer-owned rerendering evidence.

#### Scenario: Unclassified occurrence blocks verification

- **WHEN** repository or built-DOM census finds calendar-grid markup, an executable fixture, consumer, diagnostic, or legacy substitute absent from the manifest
- **THEN** the occurrence guard fails and Calendar Grid cannot be marked `VERIFIED`

#### Scenario: Complete evidence permits verification

- **WHEN** source traceability, supported states, semantic relationships, real disclosure, events, focus behavior, two-axis overflow, sticky context, long/empty content, text scaling, plain-HTML use, and a real application consumer pass without a blocking finding
- **THEN** Calendar Grid may move to `VERIFIED` with exact observed counts, supported limits, and consumer-owned responsibilities recorded

