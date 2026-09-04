## Purpose

Defines a framework-agnostic grouped vertical Bar Chart whose data identity, inspection behavior, legend visibility, accessible table, responsive containment, and consumer ownership remain consistent across plain HTML, server-rendered applications, and framework adapters.

## ADDED Requirements

### Requirement: Chart data has stable category, series, and datum identity

The Bar Chart SHALL accept an ordered non-empty category collection and an ordered series collection. Every category and series MUST have a stable, consumer-supplied string `id` that is unique within its collection and a non-empty display label. A datum SHALL be identified by the composite `(category.id, series.id)` key rather than by label or array position. Every supported dataset MUST contain exactly one finite, non-negative numeric value for every category/series pair. Duplicate identifiers, missing pairs, non-finite values, negative values, zero categories, or a series count outside one through four MUST be rejected without rendering a misleading partial chart.

#### Scenario: Repeated labels retain distinct identity

- **WHEN** two categories or series have equal display labels but distinct valid identifiers
- **THEN** the chart preserves them as distinct ordered entities and exposes each datum under its composite identity

#### Scenario: Invalid rectangular dataset is rejected

- **WHEN** a dataset contains a duplicate identifier, a missing category/series pair, a non-finite or negative value, no categories, or fewer than one or more than four series
- **THEN** the chart reports a deterministic validation error and does not present a partial plot or partial table as valid data

#### Scenario: Consumer replaces labels without changing identity

- **WHEN** a consumer supplies localized display-ready labels while preserving category and series identifiers
- **THEN** visibility and focus state continue to bind to identifiers rather than previous label text or positions

### Requirement: Bar Chart renders an ordered grouped vertical model

The Bar Chart SHALL render one vertical category group per category in input order and one bar per currently visible series in series order. All bars SHALL share a zero baseline and a common quantitative scale that includes every currently visible value. Zero values MUST remain represented and discoverable. Hiding a series SHALL recompute the common scale from visible series without changing category or series identity.

#### Scenario: Multiple series form a category group

- **WHEN** a valid dataset contains two through four visible series
- **THEN** each category presents adjacent bars in declared series order against one shared scale

#### Scenario: Zero value remains inspectable

- **WHEN** a datum value is zero
- **THEN** its datum identity and value remain available to tooltip, keyboard, and table inspection even if its painted bar has zero height

#### Scenario: Visibility changes scale membership

- **WHEN** a legend action hides a series containing the current maximum value
- **THEN** the plot scale is recalculated from the remaining visible series while category ordering is preserved

### Requirement: Pointer and keyboard expose equivalent datum details

Each visible datum SHALL expose its category label, series label, and display-ready value through the same tooltip content on pointer hover and keyboard focus. Exactly one bar SHALL participate in the plot's sequential Tab order at a time. Arrow Left and Arrow Right SHALL move focus to the previous and next category for the same visible series; Arrow Up and Arrow Down SHALL move within the same category to the previous and next visible series; Home and End SHALL move to the first and last category for the same visible series. Navigation SHALL wrap neither axis. Tooltip content SHALL follow the focused datum, dismiss when focus leaves the plot, and never be the sole source of a datum value.

#### Scenario: Pointer inspects a datum

- **WHEN** a pointer hovers a visible bar
- **THEN** the tooltip identifies that datum's category, series, and value and closes when the pointer leaves unless keyboard focus currently owns another tooltip

#### Scenario: Keyboard traverses categories

- **WHEN** a focused bar receives Arrow Right and a later category exists
- **THEN** focus moves to the same series in the next category, the focused bar is scrolled into the local plot viewport if necessary, and the tooltip updates to that datum

#### Scenario: Keyboard traverses series

- **WHEN** a focused bar receives Arrow Down and a later visible series exists in that category
- **THEN** focus moves to that series' bar in the same category and the tooltip updates to that datum

#### Scenario: Navigation reaches an edge

- **WHEN** an arrow, Home, or End command targets beyond a supported edge
- **THEN** focus remains on the current datum and no page-level scroll is triggered by the handled key

### Requirement: Legend controls visible series without losing a valid chart

The Bar Chart SHALL expose one native toggle button per series in declared order. Each button MUST communicate the series label, visual key, and pressed state. Activating a visible series toggle SHALL hide that series from the plot and accessible table; activating a hidden series toggle SHALL restore it at its declared order. The chart MUST keep at least one series visible and MUST communicate when the final visible series cannot be hidden. A visibility change SHALL produce a framework-neutral change notification containing the ordered visible series identifiers.

#### Scenario: User hides a series

- **WHEN** a user activates a pressed legend toggle while at least two series are visible
- **THEN** that series becomes unpressed, its bars and table column are removed, and the visibility-change notification contains the remaining ordered identifiers

#### Scenario: User attempts to hide the final series

- **WHEN** a user activates the only pressed legend toggle
- **THEN** the series remains visible and the control communicates that at least one series is required

#### Scenario: Focused series becomes hidden

- **WHEN** a legend action hides the series that owned the last focused datum
- **THEN** the plot's roving focus target moves deterministically to the same category in the nearest visible series before the user next enters the plot

### Requirement: An adjacent semantic table provides the same visible data

The Bar Chart SHALL include a natively operable disclosure adjacent to the graphic that expands and collapses a semantic table. The table SHALL use category labels as row headers, visible series labels as column headers, and the same display-ready values exposed by the plot and tooltip. The disclosure MUST remain reachable independently of the graphic, and hiding or restoring a series MUST update the table consistently without changing its expanded state.

#### Scenario: User expands the accessible table

- **WHEN** the table disclosure is activated
- **THEN** a semantic table becomes available with one row per category and one data column per visible series in declared order

#### Scenario: Series visibility updates an open table

- **WHEN** a user hides a series while the table is expanded
- **THEN** the corresponding column is removed from the table and the disclosure remains expanded and focused appropriately

#### Scenario: Graphic rendering is unavailable

- **WHEN** graphical marks cannot be rendered but valid chart data remains available
- **THEN** the chart title, legend state, table disclosure, and complete semantic table data remain usable

### Requirement: Responsive layouts preserve readable data and local containment

The plot SHALL retain a documented minimum inline size needed for readable groups and labels. When its container is narrower, overflow MUST be confined to a labelled local horizontal scroll region; the legend, title, and table disclosure MUST remain outside that scrolling surface and fit the container. Focus navigation SHALL reveal the focused datum inside the plot viewport without moving unrelated page content. Long labels and localized values MUST retain complete accessible names even when visual shortening is required.

#### Scenario: Narrow container activates plot scrolling

- **WHEN** available inline size is below the plot minimum
- **THEN** only the plot becomes horizontally scrollable while controls and disclosure remain contained without page-level horizontal overflow

#### Scenario: Category count causes content stress

- **WHEN** the ordered categories require more width than the visible plot viewport
- **THEN** group ordering and minimum readable group geometry are preserved through local overflow rather than overlapping or silently dropping categories

#### Scenario: Labels are long or localized

- **WHEN** a category, series, value, or control label exceeds its visual allocation
- **THEN** layout remains operable and the full label remains available to accessibility APIs and datum inspection

### Requirement: Filters, periods, and business data remain consumer-owned

The Bar Chart SHALL consume already prepared categories, series, numeric values, and display-ready labels. It MUST NOT fetch, filter, aggregate, group by period, format domain values, own filter or period controls, interpret business meaning, or mutate consumer query state. External controls MAY replace the input dataset; replacement SHALL reconcile visibility and focus by stable identifiers and fall back deterministically when a previous identifier no longer exists.

#### Scenario: External period control replaces data

- **WHEN** a consumer-owned period control supplies a new valid prepared dataset
- **THEN** the chart renders that dataset and retains visible-series and focus identity only for identifiers still present

#### Scenario: External filter yields no categories

- **WHEN** consumer-owned filtering produces no chartable categories
- **THEN** the consumer composes the Chart Widget empty state instead of passing an invalid empty dataset to the Bar Chart

#### Scenario: Chart does not mutate filter state

- **WHEN** a user inspects data, changes legend visibility, or expands the table
- **THEN** no consumer filter, period, query, fetching, or aggregation state is changed by the chart

### Requirement: Implementation remains framework-agnostic and independently evidenced

The capability SHALL work through plain semantic HTML, CSS, and a framework-neutral interactive web layer. Framework adapters MUST remain optional consumers of the same public behavior. Before the component is described as complete or review-ready, its audit manifest SHALL classify every repository occurrence and record applicable source-integrity, structural-contract, runtime-browser, accessibility, focused-visual, consumer-integration, and responsive/content-stress evidence, including one real consumer composition and the material hover, focus, keyboard, legend, table, and narrow states.

#### Scenario: Plain HTML consumer uses the chart

- **WHEN** a non-framework consumer initializes valid Bar Chart markup and data
- **THEN** it receives the same rendering, interaction, events, accessibility, and teardown contract as any optional adapter

#### Scenario: Completion is evaluated

- **WHEN** the Bar Chart is proposed as review-ready
- **THEN** the component-specific manifest contains an occurrence census, source matrix linkage, all applicable evidence levels, exact limitations and findings, and executable coverage for every declared material state
