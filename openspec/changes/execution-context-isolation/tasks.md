## 1. Isolation Contract and Regression Baseline

- [x] 1.1 Add S/M/L and Wave 8 XL fixtures that reproduce advisory-only claims, guarded-mode selection, and explicit fallback behavior; verify focused harness tests fail on the pre-change implementation and preserve the observed Wave 8 baseline.
- [x] 1.2 Extend plan and execution-state validation with enforceable isolation policy, runtime execution identity, brief/dependency/baseline/revision digests, and legacy compatibility; verify arbitrary session labels cannot satisfy guarded claims.

## 2. Fresh Worker Adapter and Lifecycle

- [x] 2.1 Implement a capability probe and minimal `codex exec --json` adapter that launches a bounded fresh worker, captures supported runtime identity/status/usage evidence, and fails closed when physical isolation cannot be attested; verify with deterministic fake-runtime tests.
- [x] 2.2 Implement bounded immutable worker briefs and transactional launch/claim/complete behavior across dependencies, failure, partial completion, retry, stale handoff, replan, and requirements pause/resume; verify lifecycle tests cover every recovery branch.

## 3. Telemetry and Operator Integration

- [x] 3.1 Extend telemetry summaries with physical boundaries, peak active context, repeated/unique reads, rediscovery proxies, handoff bytes, and context relevance while keeping unavailable runtime observations explicit; verify summary tests distinguish labels from runtime proof.
- [x] 3.2 Update repo-local commands and execution documentation for root → worker → handoff → dependent worker → independent review, including S/M/L/XL selection and bounded-episode separation; verify CLI smoke tests and documentation checks pass.

## 4. Dogfood, Validation, Review, and Delivery

- [x] 4.1 Dogfood a physically fresh read-only Codex worker against the Wave 8 fixture when runtime capability permits, record runtime-issued identity/usage evidence and before/after telemetry, or record the exact unsupported capability; verify the evidence is machine-readable and non-simulated.
- [ ] 4.2 Run OpenSpec validation, route conformance, focused/full repository checks, and independent Standards/Spec review; resolve scope-local findings, push the task branch, open an unmerged PR to `main`, and verify delivery-check passes.
