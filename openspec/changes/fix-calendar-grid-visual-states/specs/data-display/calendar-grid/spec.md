## MODIFIED Requirements

### Requirement: Date columns and temporal presentation

The calendar grid SHALL support consumer-provided date columns with visible primary and secondary labels, optional month or period grouping, and explicit `past`, `today`, `future`, and `unavailable` presentation states. The temporal header treatment SHALL reproduce the authoritative source: past uses a white outer surface and muted inner surface rounded at the trailing corners, today uses a subtle outer surface and fully rounded accent inner surface, and future uses a white outer surface and muted inner surface rounded at the leading corners. The today treatment SHALL also apply the source subtle fill to every corresponding body cell in the column; past and future body cells SHALL retain the base surface because the authoritative source defines no separate body-cell paint for them. Unavailable cells SHALL retain the source hatch treatment across the cell surface. State text color, emphasis, outer and inner backgrounds, inset and corner geometry, borders, and separators SHALL use source-mapped repository tokens, and an invented today top rule MUST NOT replace the source treatment.

The library SHALL style these states without calculating the current date, locale, week boundary, timezone, work calendar, holiday, or availability. Unavailable columns SHALL remain identifiable without relying only on hatch paint or color.

#### Scenario: Consumer marks a past date

- **WHEN** a consumer identifies a date column header and its cells as `past`
- **THEN** the header receives the white outer and trailing-rounded muted inner source treatment while its body cells retain the base surface and ordinary grid separators

#### Scenario: Consumer marks the current date

- **WHEN** a consumer identifies one date column header and its cells as `today`
- **THEN** the header receives the subtle outer and fully rounded accent inner source treatment and every corresponding body cell receives the subtle source fill while retaining semantic headers and ordinary grid separators

#### Scenario: Consumer marks a future date

- **WHEN** a consumer identifies a date column header and its cells as `future`
- **THEN** the header receives the white outer and leading-rounded muted inner source treatment while its body cells retain the base surface and ordinary grid separators

#### Scenario: Weekend or unavailable date is shown

- **WHEN** a consumer marks a date column unavailable and provides its accessible reason
- **THEN** the affected header and body cells receive the source-backed unavailable hatch treatment across their surfaces and assistive technology can identify the reason

#### Scenario: Temporal states have independent executable evidence

- **WHEN** Calendar Grid visual acceptance is evaluated
- **THEN** focused browser assertions independently compare the computed outer and inner backgrounds, foreground, emphasis, inset/corner geometry, borders, and separators of past, today, and future headers against the documented source-backed contract
- **AND** corresponding body cells are independently compared for their documented surface, foreground, emphasis, borders, and separators, preserving past, today, and future coverage without requiring header-only inner geometry

#### Scenario: Locale and timezone stay consumer-owned

- **WHEN** a consumer formats dates in its selected locale and timezone
- **THEN** the grid displays those labels unchanged and performs no independent date parsing or temporal classification
