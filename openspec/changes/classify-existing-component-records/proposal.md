## Why

After exact icon provenance was classified, 140 of 195 source records remain
unresolved. That denominator still mixes genuine component gaps with records
that may already be covered by reusable families, nested evidence, or
consumer-owned compositions, so it is not yet a reliable implementation
backlog.

## What Changes

- Establish the exact in-scope census of unresolved component and composition
  records, excluding source-extraction diagnostics and deferred product work.
- Classify a record only when committed implementation, audit, and source-identity
  evidence proves an existing reusable family or an explicit composition
  ownership boundary.
- Preserve ambiguous and merely similar records as `unresolved`, with the
  missing proof stated explicitly.
- Regenerate deterministic record- and variant-level metrics and expose the
  residual reusable-component backlog separately from composition records.
- Preserve all prior branches, plans, and user changes; this change updates
  repository audit/planning artifacts only.

No runtime component, public package API, design token, source SVG, showcase
loading behavior, accessibility policy, or deferred Composer/Card decision is
changed.

## Capabilities

### New Capabilities

- `audit/existing-component-record-classification`: Evidence and reporting
  rules for reconciling unresolved source records with already existing
  reusable components and composition ownership.

### Modified Capabilities

None.

## Impact

- Authored decisions: `docs/component-audits/source-library-coverage-ledger.json`.
- Generated outputs: `docs/component-audits/source-library-coverage.json` and
  `docs/component-audits/source-library-coverage.md`.
- Focused audit tooling/tests may change only where a reusable fail-closed
  invariant or report boundary is missing.
- Runtime packages, exports, consumers, and `shlz-design-source/` remain
  unchanged.
- Main risk is overstating coverage from visual or naming similarity; the
  required fallback is `unresolved`.
