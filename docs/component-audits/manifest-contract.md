# Component audit manifest contract

The project inventory is the repository-wide discovery map. A component-specific
manifest is added when a family enters an audit wave and must pass the occurrence
guard before that family can become `VERIFIED`.

## Project inventory

`project-inventory.json` schema version 2 requires every family to record:

- `canonical_name`, `category`, `implementation_status`, and `audit_status`;
- authoritative sources, production implementation, behavior, and docs;
- executable fixtures, live consumers, Data Workspace consumers, inert
  diagnostics, legacy/native implementations, and local alternatives;
- state/size/content `scope`, evidence levels, findings, and limitations;
- dated `measured_counts`, which are observations rather than acceptance limits.

Audit status and implementation status are independent. `INVENTORIED` means
only that the known scope was mapped. It does not approve quality or imply that
a source-only family has a production implementation.

## Component-specific manifest

Required fields:

- `component`, `authoritativeSource`, `referenceSources`, `implementation`;
- `rootSelector`, `legacySelectors`, and `diagnosticBoundaries`;
- `occurrences`, `supportedSizes`, `supportedStates`, and `contentStress`;
- `sourceClaims`, `browserTests`, `visualSnapshots`, and all evidence levels.

`behavior`, `docs`, `acceptedDeviations`, `findings`, and `knownLimitations` are
optional when they do not apply. Absence must use an empty array or `null` where
the contract allows it. An evidence level uses `applicable` while the audit is
in progress, or `not-applicable: <reason>` when the claim genuinely does not
apply. Evidence is not marked as passed merely because a test file exists.

Occurrence kinds are `executable-fixture`, `content-stress-fixture`, and
`live-consumer`. Every executable root receives a unique stable
`data-component-audit-id`; inert source diagnostics remain inside a declared
diagnostic boundary. Legacy/native selectors are permitted only in that boundary
or when explicitly classified by a future contract extension.

Findings require a stable ID, `P0`–`P3` severity, status, description, evidence,
and a tracking reference when the disposition leaves work outside the current
PR. A `FINDINGS` project status is invalid without at least one finding.

## Connecting a component to the guard

1. Add its component manifest and enumerate classified occurrence IDs.
2. Add IDs only to that component's executable fixtures and live consumers.
3. Import `readComponentAuditManifest` and
   `expectClassifiedComponentOccurrences` from
   `tools/playwright/component-audit.js` in its focused Playwright spec.
4. Assert any component-specific diagnostic or legacy expectations after the
   shared guard returns its observed inventory.

The guard compares discovered IDs with the manifest set, rejects missing and
duplicate IDs, and rejects unclassified legacy/native roots. It never compares
against an absolute count, so adding a legitimate consumer requires an explicit
manifest classification rather than changing a threshold.
