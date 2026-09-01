## Why

The initial source-to-library matrix accounts for the complete corpus but deliberately leaves 142 of 195 source records unresolved. Many of those records are already represented by the normalized icon library, existing audited families, or application-owned compositions, so the unresolved count is not yet a trustworthy product backlog.

## What Changes

- Classify every currently unresolved source record whose disposition can be proven from existing repository implementation and evidence.
- Bind already normalized standalone glyphs and file-type variants to the Icons family without creating new icon assets.
- Record evidence-only or intentionally excluded dispositions for nested, legacy, decorative, and application-owned source records when existing repository evidence proves that boundary.
- Preserve `unresolved` for genuine reusable component gaps or any record whose stronger disposition cannot be supported.
- Generate and report the resulting record- and variant-level metrics, including an explicit remaining product-gap list.
- Classify the source diagnostics associated with affected records; do not modify or regenerate the authoritative source.

No runtime component, public package API, design token, source SVG, or application behavior changes in this work.

## Capabilities

### New Capabilities

- `audit/source-coverage-classification`: Evidence rules and observable outputs for resolving source-record dispositions without manufacturing implementation claims.

### Modified Capabilities

None.

## Impact

- Authored coverage decisions: `docs/component-audits/source-library-coverage-ledger.json`.
- Generated coverage matrix and report: `docs/component-audits/source-library-coverage.json` and `docs/component-audits/source-library-coverage.md`.
- Focused generator/contract tests may be extended where classification exposes an unsupported invariant.
- Existing runtime packages and consumer contracts remain unchanged.
- The change depends on the source index, project inventory, icon manifest, component audit manifests, and existing executable evidence. Path existence alone is not treated as sufficient proof.
- Main risk: over-classifying similarly named or nested source records. The safe fallback remains `unresolved`.
