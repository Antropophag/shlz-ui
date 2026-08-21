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
- `diagnosticOccurrenceCount`, the observed inert diagnostic-root census for
  Wave 4 and later census-enabled manifests (earlier verified manifests retain
  their versioned contract until separately re-audited);
- `occurrences`, `supportedSizes`, `supportedStates`, and `contentStress`;
- `sourceClaims`, `browserTests`, `visualSnapshots`, and all evidence levels;
- `interactionEvidence.types.staticVisual`, `.realInteractionVisual`, and
  `.runtimeBehavior`, plus `materialStates`, `browserTest`, and
  `manualStateWalk` for every interactive family.

`behavior`, `docs`, `acceptedDeviations`, `findings`, and `knownLimitations` are
optional when they do not apply. Absence must use an empty array or `null` where
the contract allows it. A completed manifest uses `pass: <specific claim>` or
`not-applicable: <specific reason>`; bare `applicable`, generic `pass`, empty
reasons, and automatic passes for unsupported states are invalid. Evidence is
not marked as passed merely because a test file exists.

Each applicable interaction evidence claim is a concrete `pass:` statement;
non-interactive families use a concrete `not-applicable:` reason for real
interaction visual and runtime behavior. Static fake
states and screenshots belong only to `staticVisual`. A
`realInteractionVisual` claim names real browser interaction and is backed by
the one focused executable spec recorded in `browserTest`; it must cover all
declared `materialStates`. Non-interactive families declare an empty material
state ledger instead of inventing a default interaction state. Event,
navigation, focus movement, selection, and
controller claims belong to `runtimeBehavior` and do not prove computed paint.
The manual state walk records the surfaces actually inspected; it supplements
but cannot replace executable evidence.

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

The guard compares discovered executable IDs with the manifest set, rejects
missing and duplicate IDs, and rejects unclassified legacy/native roots. It
also compares inert diagnostic roots with their recorded census, so a new
diagnostic occurrence requires explicit reclassification. It never uses an
absolute executable count: adding a legitimate consumer requires a stable ID
and manifest classification rather than changing a threshold.
