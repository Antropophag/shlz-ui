## Why

The engineering harness has accumulated overlapping packet, capsule, TDD, review, telemetry, and historical-state machinery whose mutable orchestration costs more to operate and verify than the delivery guarantees require. This change replaces that breadth with a small receipt-producing interface while preserving each fail-closed guarantee as an executable contract.

## What Changes

- **BREAKING** Replace the current packet lifecycle, capsule acknowledgement, revision-specific evaluation, and duplicated TDD/review commands with 10–14 receipt-oriented commands.
- Make OpenSpec the normative contract source, Git the code-provenance source, tests the correctness source, and immutable content-addressed receipts the only harness evidence exchanged between stages.
- Keep ordinary S/M execution inline; move optional L/XL isolation behind `run-isolated(manifest) -> result receipt` with runtime identity, dependency, result, and byte-budget checks.
- Replace committed context capsules and ledgers with an ephemeral resolved-source manifest generated immediately before isolated launch.
- Remove completed operational history, retry artifacts, raw telemetry/logs, retrospective efficiency machinery, and full historical fixtures; retain only compact synthetic fixtures needed by executable acceptance cases.
- Collapse contract derivation, RED/GREEN evidence, validation reuse, independent review, failure-path proof, route conformance, and delivery into candidate- and digest-bound receipts.
- Rewrite the workflow documentation around one canonical receipt chain and remove references to deleted commands.

## Capabilities

### New Capabilities

- `harness/receipt-workflow`: The canonical fail-closed route-to-delivery receipt interface, including optional isolated execution and compact evidence retention.

### Modified Capabilities

None. Existing harness deltas are pre-living-spec change history; their applicable normative behavior is deliberately mapped into the new receipt-workflow capability rather than silently edited or discarded.

## Impact

The change affects `tools/harness.mjs`, harness modules and tests, `package.json`, harness/OpenSpec workflow documentation, and operational/fixture directories. It intentionally removes public harness commands and checked-in operational formats; compatibility is behavioral for the listed guarantees, not command- or state-file compatibility. It does not change UI packages, design-source material, publishing, deployment, permissions, or GitHub merge ownership. The main risk is deleting an old path that carried a unique guard, mitigated by an explicit scenario map and focused known-good/known-bad acceptance cases before removal.
