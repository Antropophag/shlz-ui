## Context

See `proposal.md`. The current library already supplies most controls needed by tabular reports and a source-backed Report Card, but it has no dashboard layout or chart-widget surface. Direct inspection established that `Dashboard.svg` is a chart component sheet and `Дашборды.svg` is a product composition of chart widgets; the report screens reuse report cards rather than establishing a distinct Metric Card family. Their text is outlined, so geometry and paint are more recoverable than literal labels or domain semantics.

## Goals / Non-Goals

**Goals:**

- Establish a reproducible screen-region ledger before promoting visual patterns.
- Add the smallest reusable presentational layer that supports source-faithful report/dashboard assembly.
- Preserve framework neutrality, native semantics, and the ownership of existing components.
- Make exact source facts, derived repetition, repository decisions, and unresolved assumptions independently reviewable.

**Non-Goals:**

- Select or wrap a charting library.
- Define report queries, aggregation, dashboard persistence, routing, authorization, fetching, or live updates.
- Implement drag, drop, resize, rearrangement, or an editing state machine.
- Turn every source screen region into a public component or re-certify existing families.

## Decisions

### 1. Decompose screens before writing production CSS

An authored reporting/dashboard source ledger will identify source file, bounded region identity, observed geometry/paint, repetition, proposed ownership, canonical family edge, and evidence. Production selectors may be introduced only for patterns whose ledger entries establish a reusable boundary.

Starting from class names inferred from screenshots was rejected because outlined text and large composite frames hide semantic ownership. Treating the source screens as only visual references was also rejected because it would leave completeness immeasurable.

### 2. Use two additive composition levels

The public layer has two levels: Dashboard arranges sections and Chart Widget provides the source-backed container for controls, plot content, and empty state. Report summaries continue to use the existing Report Card.

A generic universal Card abstraction was rejected: current Card with Action, Report Card, Cover, and Chart Widget have different source and semantic boundaries.

### 3. Keep layout in CSS and behavior with consumers

Dashboard layout uses CSS grid with namespaced modifiers/custom properties only where the supported source matrix needs consumer-selected spans. No JavaScript controller is added. Reflow is a repository decision constrained by source spacing and component minimum widths, because static wide screens do not establish a complete responsive algorithm.

A JS layout engine was rejected because this slice has no ordering, persistence, collision, or resizing behavior.

### 4. Prefer semantic HTML contracts

Documentation and fixtures use `main`/`section`/`article`, headings, and native controls. Dashboard and Chart Widget roots remain noninteractive, while Report Card remains the existing report-summary family. Any whole-card navigation must use an explicit future contract rather than click handlers on the container.

### 5. Keep chart rendering inside the widget boundary unresolved

The ledger records plot areas, legends, axes, and graphical marks when observed. This change implements their repeated outer widget geometry but does not emit chart-rendering APIs or decorative approximations. A later chart capability must resolve data/series semantics, responsive rules, interaction, accessible alternatives, and the Bar/Popover/Period visual families in `Dashboard.svg`.

### 6. Complete each new family independently

Dashboard and Chart Widget receive separate audit manifests, stable occurrence IDs, focused fixtures, a real reporting consumer, and browser evidence. Computed-style assertions protect source-critical geometry and paint; component-local screenshots protect composition; controlled mutations demonstrate that the oracles detect material drift.

## Risks / Trade-offs

- [Screen SVGs contain outlined text and weak semantic metadata] → Promote only geometry/paint and explicitly supported content slots; keep wording, data meaning, and lifecycle consumer-owned.
- [Responsive behavior is not fully present in static source] → Classify reflow as a repository decision and avoid breakpoint or span APIs beyond demonstrated need.
- [Report cards could be mistaken for a second metric family] → Reuse the existing Report Card and record that no separate Metric Card contract was observed.
- [Dashboard selectors could become an application shell] → Exclude navigation/header/sidebar and keep the root limited to report content layout.
- [A visual chart placeholder could be mistaken for chart support] → Do not publish one; record chart regions as unresolved follow-up scope.
- [Large screen snapshots can hide local drift] → Use bounded component fixtures, exact computed geometry, and mutation-sensitive checks.

## Migration Plan

1. Add source decomposition and failing structural/evidence contracts without changing production packages.
2. Add namespaced styles and semantic fixtures for the three declared families.
3. Add the reporting consumer and focused runtime/visual/responsive evidence.
4. Reconcile manifests, project inventory, source coverage, documentation, and generated distribution.
5. Rollback removes only additive selectors, fixtures, and audit records; existing consumers require no migration.
