## Purpose

Defines source-traceable, framework-neutral layout and widget presentation contracts for assembling SHLZ reporting dashboards without assigning application data, chart rendering, editing, or persistence behavior to the design system.

## ADDED Requirements

### Requirement: Reporting source decomposition is complete and conservative
The repository SHALL account for every material region of the authoritative dashboard and reporting screens as an existing library family, a new reporting composition, application-owned behavior, or unresolved evidence. A screen occurrence MUST NOT be promoted to a reusable contract solely because it appears in an exported SVG.

#### Scenario: Screen region maps to an existing family
- **WHEN** a dashboard or report region matches an existing audited family with direct source evidence
- **THEN** the decomposition identifies that family and does not create a competing reporting-specific primitive

#### Scenario: Source does not establish semantics
- **WHEN** outlined text or static geometry does not establish data meaning, interaction, or lifecycle
- **THEN** the decomposition records the limitation and leaves that concern unresolved or application-owned

### Requirement: Dashboard layout is framework-neutral and source-traceable
The library SHALL provide additive presentational contracts for a dashboard root, named sections, and a responsive grid. Every fixed visual value MUST be traceable to repeated authoritative source evidence or explicitly classified as a repository decision.

#### Scenario: Wide dashboard composition
- **WHEN** a consumer places supported widgets in the dashboard grid at a wide container size
- **THEN** the grid preserves the declared source-backed spacing, alignment, and widget surface relationships

#### Scenario: Narrow dashboard composition
- **WHEN** the dashboard is rendered below its supported multi-column width
- **THEN** widgets reflow without horizontal clipping, overlap, or loss of meaningful content

### Requirement: Chart widget surface preserves semantic ownership
The library SHALL provide a noninteractive chart-widget surface with optional heading, controls, actions, plot, empty-state, and supporting-description regions. Native controls inside a widget SHALL retain their native semantics; the widget root MUST NOT acquire implicit click, selection, drag, resize, navigation, or chart-data behavior.

#### Scenario: Widget with an action
- **WHEN** a consumer includes a native button or link in the widget action region
- **THEN** only that control owns activation and the widget remains a semantic content container

#### Scenario: Widget content stress
- **WHEN** a widget contains a long localized heading, controls, and plot or empty-state content
- **THEN** supported content remains readable and contained in both wide and narrow layouts

#### Scenario: Chart rendering remains unresolved
- **WHEN** a consumer supplies chart data to the widget plot region
- **THEN** the widget provides only the source-backed container and does not infer marks, axes, legends, series semantics, interaction, or an accessible data alternative

### Requirement: Reporting composition reuses existing primitives
The dashboard foundation SHALL compose existing Button, Link, Field, Select, Date Picker, Table, Pagination, Status, Badge, Empty State, Modal, Notification, and Report Card contracts where applicable. It MUST NOT redefine their states, behavior, or accessibility contracts.

#### Scenario: Tabular report composition
- **WHEN** a consumer builds a report view from the dashboard foundation and existing data-display primitives
- **THEN** the resulting composition retains the public contracts and ownership boundaries of those primitives

### Requirement: Completion evidence covers source, runtime, and a consumer
Dashboard and Chart Widget SHALL each have an occurrence census and applicable source-integrity, structural, accessibility, focused-visual, consumer-integration, and responsive/content-stress evidence. Runtime behavior SHALL be marked not applicable only with a component-specific reason.

#### Scenario: Candidate is evaluated for completion
- **WHEN** the implementation is proposed as review-ready
- **THEN** every applicable evidence level, material source state, executable occurrence, limitation, and finding has an explicit disposition for each new family
