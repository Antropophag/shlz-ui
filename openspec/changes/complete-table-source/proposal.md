## Why

Table currently exposes a partial cell foundation: generic icons replace the source sorter/filter, editable and empty cells lack their full state contract, and source table compositions are not represented. The user requests the complete table-related transfer, beyond the header.

## What Changes

- Establish source-accounted coverage for all 49 Table Cell variants, three Sorter and three Filter states, every composition in Table.svg, and related Pagination composition.
- Complete framework-neutral table presentation for header groups, cell hover/pressed/editing, blank/filled content, priority/icon actions, checkbox/switch/button/status/dropdown composition, and horizontal overflow.
- Provide working native-control examples for sorting, header filtering, row selection, editing and popup choices; application data operations remain consumer-owned.
- Replace misleading static controls, add focused browser/state/source coverage, and update developer documentation and audit manifests.

## Capabilities

### New Capabilities

- `table-source-completeness`: Source-backed table presentation, complete cell/composition coverage and consumer integration.

### Modified Capabilities

None. Existing nested-component contracts remain authoritative.

## Impact

Affects table CSS, table-related Showcase surfaces, Data Workspace, source evidence, tests and documentation. Adds compatible CSS parts and examples; no framework dependency, data engine or breaking removal. Existing Select, Dropdown, Checkbox, Switch, Status, Button, Empty State and Pagination are composed, not reimplemented. All original SVGs remain read-only. Virtualization, resizing, sticky/mobile-card modes, remote APIs and business-specific application screens are outside this source-transfer task because no such reusable behavior is established by these sources. Risks are popup clipping, misleading variant claims and cross-component visual deviations; each requires explicit evidence and disposition.
