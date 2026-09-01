## Why

The source-transfer audit still treats 9 extraction errors, 35 warnings, and 47 skipped instances as an undifferentiated coverage limitation. The coverage denominator is now trustworthy enough to classify those diagnostics explicitly before performance work or new component delivery begins.

## What Changes

- Add a complete, machine-readable classification of every committed extraction diagnostic and skipped instance.
- Distinguish extraction defects, source ambiguities, harmless diagnostics, and diagnostics that expose unresolved product work.
- Bind each classification to stable source identity, observed evidence, impact on source-library coverage, and an explicit disposition.
- Generate a human-readable summary and fail closed when indexed diagnostics are missing, duplicated, stale, contradictory, or unsupported.
- Preserve `shlz-design-source/`, runtime packages, component contracts, and existing coverage dispositions unchanged unless the diagnostic evidence proves that a current coverage claim is invalid.
- Exclude source repair, component implementation, showcase optimization, accessibility policy, and speculative inference from this change.

## Capabilities

### New Capabilities

- `audit/source-extraction-diagnostic-classification`: Complete and reproducible classification of extraction errors, warnings, and skipped instances from the committed design-source index.

### Modified Capabilities

None.

## Impact

- Affects audit data and generation/validation tooling under `docs/component-audits/`, `design-source-index/` consumers, and `tools/` tests.
- Adds no public runtime API and no consumer migration.
- Depends on the committed source index and the coverage ledger established by PRs #62–64.
- Primary risks are unstable diagnostic identity, accidental double-counting, unsupported impact claims, and silently treating extraction failure as implementation evidence.
