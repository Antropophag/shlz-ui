## Purpose

Complete the reusable Dashboard chart presentation from the authoritative SVG while preserving accessible inspection and consumer-owned data preparation.

## ADDED Requirements

### Requirement: Complete series palette and capacity

The chart SHALL accept one through eight rectangular nonnegative series. Consumers SHALL select any of the nine source colors by a named tone, independently of series position. Existing callers without tones SHALL retain their first four positional colors. Invalid tones and more than eight series SHALL fail before replacing a mounted chart.

#### Scenario: Full source palette

- **WHEN** a consumer selects blue, green, orange, deep-blue, violet, turquoise, pink, bright-green or gray
- **THEN** bars and tooltip/legend keys use the matching Dashboard.svg default color and its source muted paint, including orange #DE753D at 15% and opaque gray #F5F5F5.

#### Scenario: Invalid replacement preserves current chart

- **WHEN** an update or replacement constructor receives invalid data
- **THEN** it rejects the input and the existing chart remains usable with its data, listeners and visibility unchanged.

### Requirement: Source geometry and axes

The chart SHALL expose the source density families at their reference plot dimensions, including 7, approximately 12.33, 21, approximately 62.67, 62.75 and 96 pixel bars. Bars SHALL have rounded top corners and square bottoms. Numeric Y labels, six grid lines, X ticks and sparse labels SHALL remain consistent with quantitative geometry. The default responsive chart SHALL preserve local overflow and accessible full category names. Consumers SHALL be able to supply six formatted numeric-axis labels in maximum-to-zero order paired with a fixed scale maximum; malformed presentation containers or labels SHALL be rejected. Source density with arbitrary category counts SHALL keep each group within its category interval.

#### Scenario: Dense source composition

- **WHEN** the fourteen-period eight-series or twenty-three-period three-series source specimen is rendered
- **THEN** its bar widths and period ticks match the source matrix and only three regular period labels are displayed.

#### Scenario: Quantitative axes

- **WHEN** values use the source 0–10 or 0–100 scales
- **THEN** the six numeric labels and bar heights share that scale, including exact zero-height paint and a separate inspectable zero target.

### Requirement: Whole-period inspection

Hover or keyboard focus SHALL highlight all visible series of the active category, mute other categories, show a vertical guide and active period badge, and disclose the period and every visible series value with matching color markers. Above and below tooltip placements SHALL be supported with an arrow, bounded horizontal placement and accessible full text. Pointer exit, focus departure and Escape SHALL dismiss inspection appropriately. Roving keyboard navigation, legend visibility, data table and stable identity updates SHALL continue working.

#### Scenario: Equivalent grouped disclosure

- **WHEN** a user hovers or focuses any bar in a period
- **THEN** the grouped tooltip exposes the same visible series data and all bars in that period remain opaque.

#### Scenario: Narrow or scrolled chart

- **WHEN** inspection occurs in a narrow locally scrolled plot
- **THEN** the active bar is reachable, the tooltip remains readable within its chart and the page does not gain horizontal overflow.

### Requirement: Discoverable source gallery and consumer

Showcase SHALL expose nine palette variants, the six populated source density compositions, above/below inspection and the illustrated empty state. Executable roots SHALL be classified in the component audit manifest. A reporting consumer SHALL demonstrate explicit status colors and preserve consumer ownership of filtering and period preparation.

#### Scenario: Gallery coverage

- **WHEN** a user opens the dashboard section
- **THEN** palette, width/density and state specimens are labeled and use production chart rendering rather than screenshot substitutes.
