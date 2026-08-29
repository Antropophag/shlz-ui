## Context

See `proposal.md` and `specs/data-display/calendar-grid/spec.md`. The current five-date Showcase table has an August/September `colgroup` row and a date row whose secondary labels read `Past · Friday`, `Today`, `Unavailable · weekend`, `Unavailable · holiday`, and `Future · Tuesday`. The authoritative `Calendar.svg` instead separates `Time` headers from `Date` headers and separates temporal header paint from `Today`, `Day off`, and `Day off / Today` body-cell variants.

## Goals / Non-Goals

**Goals:**

- Restore a native two-level temporal/date header hierarchy without a controller or framework adapter.
- Preserve sticky multi-row headers, horizontal overflow, today-column continuity, and unavailable hatching.
- Make semantic and visual failure observable in one focused RED/GREEN browser seam.

**Non-Goals:**

- Calculate temporal or unavailable state in the library.
- Promote month labels to a required design-system row.
- Change Date Picker or any design-source file.

## Decisions

### 1. Temporal state lives on `scope="colgroup"` headers

The required top row contains Past, Today, and Future cells with consumer-authored spans. The Showcase's five date columns therefore use spans 1/1/3: the weekend and holiday dates are chronologically future even though they are unavailable. Date cells below use `scope="col"`; their visible labels never repeat a temporal group name, while their accessible names retain the applicable unavailable reason such as weekend or holiday.

Alternative: retain state on every date header and visually merge adjacent cells. Rejected because it misstates the native table structure and repeats group names in date accessible names.

### 2. Source primitive facts and repository composition decisions stay separate

Direct source facts: `Time` and `Date` are separate header variants; Past has a white outer surface and muted inner surface inset 1px at the leading edge and 4px elsewhere with 8px trailing corners; Today has a subtle outer surface and a 4px-inset, 8px-rounded accent inner surface; Future has a white outer surface and muted inner surface inset 4px at the leading/block edges, flush at the trailing edge, with 8px leading corners; Date is its own compact bordered header; Today body variants use the subtle fill; Day off variants use diagonal hatch; `Day off / Today` demonstrates that temporal and unavailable paint can coexist.

Derived pattern: today fill continues through every demonstrated body-cell size/content state. Repository decisions: map observed colors/borders to existing tokens; use generated inner surfaces; express contiguous group length with native `colspan`; compose unavailable hatching over today when both occur; use the five-date Showcase's authored chronology to choose 1/1/3 spans. The SVG includes a month-labelled `Time` variant, but does not establish a month band as the mandatory matrix hierarchy, so month/period context remains optional consumer-owned markup.

### 3. The row header spans only required rows

The base Showcase uses two required header rows, so its corner row header keeps `rowspan="2"`. Additional consumer-owned period rows must update their own corner-cell span. Sticky offsets target the temporal row and date row independently so the date row remains directly below the group row during scroll.

### 4. One focused browser test is the RED/GREEN contract

The test first fails on baseline because the native group headers are August/September and temporal words occur in date secondary labels. It asserts roles/scopes/spans and date accessible names, then exact bounding-box adjacency/inset/corner geometry, Today header/body continuity, unavailable independence, sticky behavior, and the focused screenshot. Structural unit tests supplement it; snapshots do not replace runtime assertions.

## Risks / Trade-offs

- [Consumer markup using the short-lived date-header state contract breaks visually] → Document the corrected group-row contract and provide complete Showcase/fixture examples.
- [A hatch layer can hide Today fill when states coexist] → Assert `Day off / Today` composition semantics and preserve both attributes in the public markup seam.
- [Extra month rows can invalidate sticky offsets] → Treat them as explicitly consumer-owned and document that consumers must supply matching row structure/offset customization.
- [Snapshots can accept accidental hierarchy drift] → Require semantic/bounding-box assertions before snapshot acceptance.

## Migration Plan

Consumers move temporal state attributes and labels from individual date headers into contiguous `scope="colgroup"` cells and set exact spans. Date accessible names keep only date/weekday/unavailable reason. Month rows may remain only as an additional row. Rollback restores the prior markup/CSS/tests; there is no data migration.
