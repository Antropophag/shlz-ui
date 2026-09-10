## Context

See proposal.md. Table currently has one CSS module, a mixed Showcase table, one typography stress table, an inert fidelity diagnostic and a Data Workspace consumer. Table Cell.svg is primary; ZIP variants help recover names and local geometry. Table.svg contains nine consumer compositions. Pagination already has a standalone native-link contract.

## Goals / Non-Goals

**Goals:** finish the entire source-backed table presentation and make its reusable parts and state ownership explicit. Preserve framework-neutral HTML/CSS; keep data mutation in Showcase consumer code.

**Non-Goals:** invent a datagrid engine, redesign nested components, copy existing application code, or infer pagination/remote-data algorithms from static SVGs.

## Decisions

- Add dedicated sorter/filter SVG parts using source paths and CSS state selectors. Reusing general-purpose up/filter icons loses two-tone state and funnel geometry. Keep generic affordance compatibility.
- Add source-backed header grouping, editable-cell and icon-action styles, priority marks, actual hover/active/focus state selectors and narrowly scoped diagnostic helpers. No global token promotion for incidental cell widths.
- Reuse existing Select/Dropdown controllers and native input controls for table choices. Their floating implementation avoids clipping; Table only styles the embedded trigger. Consumer code owns text commits, sort/filter data, row additions and selection. Do not add a duplicate table state machine.
- Build a source coverage matrix with stable per-variant identities, a cell gallery and nine compact source-derived compositions. A composition is evidence of reuse, not a new public component. Any source-only layout artifact receives an explicit disposition rather than a fictitious runtime assertion.
- Extend the existing real Data Workspace sort/header filter integration. Provide a separate bounded editing fixture for cell choices, switches and icon actions. Pagination stays independently tested and linked, with native navigation integration demonstrated alongside a table.
- Decompose into source/cell evidence, domain compositions, and core/consumer integration; independent writing uses disjoint files. Root owns CSS, shared wiring and manifests. Independent Standards and Spec reviews follow integration. This is one coherent table transfer PR despite multiple evidence surfaces.
- Validation uses source facts plus real browser states, not snapshots alone. Declare the finite cell, sorter, filter and composition sets and bind per-member executable evidence. Source-wide raw screenshots are reference inspection only.

## Risks / Trade-offs

- Popup clipping → reuse floating existing components and test narrow edges.
- Shared audit occurrence growth → add stable IDs and update affected nested-component manifests, without claiming unrelated new component completion.
- Source and accessible semantic-token paint can differ → record exact source facts and applicable shared-contract deviations rather than silently recoloring or hiding them.
- Visual fixture expansion can increase initial Showcase cost → keep detailed matrices in the full table surface and avoid dependencies in the public core.

## Migration Plan

Additive classes/parts preserve existing table consumers. Migrate all repository table occurrences to the correct relevant parts; document HTML examples for external HTML/PHP/framework consumers. Revert this task branch if required; no persisted data or deployment migration occurs.
