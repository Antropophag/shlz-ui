## Why

Calendar Grid currently embeds `Past`, `Today`, and `Future` inside individual date labels and uses a month band as the only semantic `colgroup` row. That reverses the authoritative `Calendar.svg` hierarchy, where temporal states are standalone grouped headers above separate date headers, and prevents the table from exposing the intended grouping to people and assistive technology.

## What Changes

- Replace the mandatory month band with a semantic temporal group-header row: `Past`, `Today`, and `Future`, each spanning its contiguous date columns.
- Keep date/day labels in a separate `scope="col"` row and keep unavailable/day-off independent from temporal membership.
- Apply the source-backed temporal header surfaces to group headers and retain the source-backed Today body-column and unavailable hatch treatments.
- Preserve month/period grouping only as an optional consumer-owned additional row that cannot replace the required temporal row.
- Add a RED/GREEN browser regression for table semantics and visual geometry, focused screenshots, component-gate evidence, and independent review.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `data-display/calendar-grid`: Correct the header-row hierarchy, temporal group semantics and geometry, unavailable relationship, and executable evidence contract.

## Impact

This is a breaking markup-contract correction for Calendar Grid consumers that adopted the recently merged date-header state attributes: temporal state moves to standalone `scope="colgroup"` cells with explicit `colspan`. Calendar Grid framework-agnostic CSS, Showcase markup, plain-HTML fixture, tests, snapshots, documentation, and audit evidence change. Date Picker, behavior controllers, dependencies, application-specific date logic, and `shlz-design-source/` do not change.
