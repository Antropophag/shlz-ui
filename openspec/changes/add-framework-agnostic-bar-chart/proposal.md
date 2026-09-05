## Why

The existing Dashboard and Chart Widget foundation deliberately leaves chart data, marks, series semantics, interaction, and accessible alternatives unresolved. A reusable Bar Chart cannot be implemented from static `Dashboard.svg` geometry alone, so the product contract and its source-to-decision boundary must be explicit before code is introduced.

## What Changes

- Add a framework-agnostic grouped Bar Chart contract with stable category and series identities, one to four series, finite numeric values, deterministic group ordering, and explicit invalid-data handling.
- Define equivalent pointer-hover and keyboard-focus inspection, roving arrow-key navigation, tooltip lifecycle, and focus preservation across responsive changes and series visibility updates.
- Define an interactive legend whose toggle buttons may hide series while keeping at least one series visible.
- Require an adjacent expandable semantic table presenting the same currently visible dataset and labels as the graphical chart.
- Define responsive and content-stress rules, including a minimum readable plot width and local horizontal overflow at narrow sizes.
- Keep data fetching, aggregation, filtering, period selection, localization policy, and business interpretation consumer-owned; the chart receives prepared display data and display-ready labels.
- Add a source matrix that classifies every adopted visual claim as a direct `Dashboard.svg` fact, a derived pattern, or a repository/product decision.
- Require the full component completion gate before the capability can be described as review-ready or complete.

Non-goals are line, area, stacked, mixed-sign, horizontal, percent-normalized, realtime/streaming, zoomable, editable, or application-query charts; filter and period-control UI; data fetching or aggregation; export; analytics; and Vue-specific foundations.

## Capabilities

### New Capabilities

- `data-display/bar-chart`: Framework-agnostic grouped Bar Chart data, rendering, interaction, legend, accessible-table, responsive, ownership, and evidence contract.

### Modified Capabilities

None.

## Impact

The future apply phase is expected to add a public framework-neutral JavaScript controller/model and CSS/semantic markup contract under `packages/`, documentation and fixtures under `docs/` and `apps/`, and component-specific unit, browser, accessibility, focused-visual, consumer, responsive/content-stress, source-integrity, and occurrence evidence. It will compose the existing Chart Widget surface and existing primitive contracts without changing their behavior. No runtime dependencies, framework adapter, design-source edits, release, deployment, or breaking changes are proposed.

Primary risks are conflating static source appearance with interaction semantics, losing data identity when labels repeat or series are hidden, making the graphic the only accessible representation, and allowing narrow layouts or long localized content to obscure values. The delta spec and source matrix make those boundaries reviewable before implementation.
