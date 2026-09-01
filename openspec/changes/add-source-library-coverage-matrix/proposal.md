## Why

The repository currently compares 195 indexed source records and 630 variants with 50 coarser library families through prose and shared SVG paths, so it has no honest transfer denominator and `VERIFIED` can be mistaken for implementation completion. A machine-readable record-to-family matrix is needed before further component expansion so every source record has an explicit, reviewable disposition.

## What Changes

- Add a generated source-transfer matrix that accounts for every record in `design-source-index/components.json` and links it to one or more library families.
- Require each mapping to declare whether the record is implemented, represented only by evidence/fixtures, intentionally excluded, or still unresolved, with concrete implementation, evidence, or exclusion references as applicable.
- Record variant coverage beneath each source record so a family-level mapping cannot hide unclassified source variants.
- Generate deterministic corpus metrics only from compatible source-record and source-variant units; never infer transfer completion from family counts or `audit_status` alone.
- Add fail-closed validation for missing records, stale identities, duplicate/conflicting dispositions, invalid family references, unsupported evidence, and exclusions without reasons.
- Clarify audit documentation so `VERIFIED` means the declared audit evidence passed, while implementation and transfer dispositions remain independent.
- Keep `shlz-design-source/` read-only and preserve existing component/public runtime contracts.

## Capabilities

### New Capabilities

- `audit/source-library-coverage`: Defines the deterministic machine-readable mapping, dispositions, validation, and coverage metrics from indexed source records to library families.

### Modified Capabilities

None.

## Impact

The change affects audit tooling, generated audit data under `docs/component-audits/`, source-index and component-audit tests, and documentation of audit status semantics. It does not add UI components, modify package APIs or runtime behavior, promote application screens into reusable families, alter authoritative source files, or claim visual/behavioral completeness that the evidence cannot prove. The principal risks are silently collapsing many-to-many mappings, counting variants and records as equivalent units, and allowing an exclusion label to conceal unresolved transfer work; strict identities and validation address those risks.
