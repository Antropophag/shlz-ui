## Purpose

Defines source-traceable, framework-neutral presentation contracts for assembling SHLZ reporting dashboards without assigning application data, chart, editing, or persistence behavior to the design system.

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

### Requirement: Widget surface preserves semantic ownership
The library SHALL provide a noninteractive widget surface with optional heading, description, metadata, actions, and body regions. Native controls inside a widget SHALL retain their native semantics; the widget root MUST NOT acquire implicit click, selection, drag, resize, or navigation behavior.

#### Scenario: Widget with an action
- **WHEN** a consumer includes a native button or link in the widget action region
- **THEN** only that control owns activation and the widget remains a semantic content container

#### Scenario: Widget content stress
- **WHEN** a widget contains a long localized heading, metadata, and body content
- **THEN** supported content remains readable and contained in both wide and narrow layouts

### Requirement: Metric card represents only supported source content
The library SHALL provide a metric-card composition for a label, primary value, optional supporting text, and only those surface variants proven by authoritative dashboard or report-card evidence. Units, comparisons, trends, and status meaning MUST remain consumer content unless separately specified.

#### Scenario: Basic metric
- **WHEN** a consumer supplies a label and primary value
- **THEN** the metric card renders both roles using the declared source-backed or explicitly documented typographic and geometric contract

#### Scenario: Optional supporting content
- **WHEN** supporting text or a native details link is included
- **THEN** the optional content remains subordinate to the value and does not make the entire card interactive

#### Scenario: Unsupported trend visualization
- **WHEN** a consumer needs a sparkline, trend arrow, comparison algorithm, or semantic positive/negative state
- **THEN** the metric-card contract does not infer or provide that behavior as part of this capability

### Requirement: Reporting composition reuses existing primitives
The dashboard foundation SHALL compose existing Button, Link, Field, Select, Date Picker, Table, Pagination, Status, Badge, Empty State, Modal, Notification, and Report Card contracts where applicable. It MUST NOT redefine their states, behavior, or accessibility contracts.

#### Scenario: Tabular report composition
- **WHEN** a consumer builds a report view from the dashboard foundation and existing data-display primitives
- **THEN** the resulting composition retains the public contracts and ownership boundaries of those primitives

### Requirement: Completion evidence covers source, runtime, and a consumer
Dashboard, Widget, and Metric Card SHALL each have an occurrence census and applicable source-integrity, structural, accessibility, focused-visual, consumer-integration, and responsive/content-stress evidence. Runtime behavior SHALL be marked not applicable only with a component-specific reason.

#### Scenario: Candidate is evaluated for completion
- **WHEN** the implementation is proposed as review-ready
- **THEN** every applicable evidence level, material source state, executable occurrence, limitation, and finding has an explicit disposition for each new family

