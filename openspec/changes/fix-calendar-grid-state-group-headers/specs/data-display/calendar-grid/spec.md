## MODIFIED Requirements

### Requirement: Date columns and temporal presentation

The calendar grid SHALL expose temporal state in a standalone group-header row above a separate date-header row. Each contiguous `past`, `today`, or `future` group SHALL be represented by a native column-group header whose span exactly equals the number of date columns in that group; each date SHALL remain a separate native column header with its own date and weekday accessible name. Temporal group names MUST NOT be embedded as secondary labels of individual dates.

The temporal group-header treatment SHALL reproduce the authoritative source: past uses a white outer surface and muted inner surface rounded at the trailing corners, today uses a subtle outer surface and fully rounded accent inner surface, and future uses a white outer surface and muted inner surface rounded at the leading corners. Today treatment SHALL also apply the source subtle fill to every corresponding body cell. Unavailable/day-off SHALL be an independent state of a specific date column: it SHALL retain the source hatch treatment and an accessible reason without changing that column's temporal group membership. State text, surfaces, inset and corner geometry, borders, and separators SHALL use source-mapped repository tokens.

The library SHALL style consumer-authored states without calculating the current date, locale, timezone, work calendar, holiday, or availability. A consumer MAY add a month or period grouping row as additional context, but it MUST NOT replace or obscure the required temporal group row.

#### Scenario: Showcase matrix exposes exact temporal groups

- **WHEN** the five-date Showcase matrix contains one past date, one current date, and three future dates including two unavailable dates
- **THEN** its first required header row exposes `Past` with `colspan="1"`, `Today` with `colspan="1"`, and `Future` with `colspan="3"`, all as native column-group headers
- **AND** its next header row exposes five independent date column headers whose accessible names contain their dates and weekdays but not the temporal group names

#### Scenario: Unavailable future dates retain both meanings

- **WHEN** a future date is unavailable because it is a weekend or holiday
- **THEN** its date header and body cells remain associated with the Future column group while exposing the unavailable reason and hatch treatment

#### Scenario: Today group and body column retain source geometry

- **WHEN** one date is identified as today
- **THEN** the Today group header receives the subtle outer and fully rounded inset accent surface
- **AND** every corresponding body cell receives the subtle source fill while ordinary separators and semantic header relationships remain intact

#### Scenario: Month grouping is additional consumer context

- **WHEN** a consumer needs month or period context
- **THEN** it may provide an additional column-group row with spans matching its date columns
- **AND** the required Past, Today, and Future group row remains present and distinct

#### Scenario: Temporal grouping has executable evidence

- **WHEN** Calendar Grid acceptance is evaluated
- **THEN** focused browser assertions verify native table scope and exact spans, separate accessible date headers, group inset/corner/border geometry, unavailable independence, and Today body-column paint
- **AND** a component-focused screenshot visibly includes the standalone Past, Today, and Future row

#### Scenario: Locale and timezone stay consumer-owned

- **WHEN** a consumer formats dates and temporal membership in its selected locale and timezone
- **THEN** the grid displays that authored content unchanged and performs no independent parsing or classification
