## 1. Evaluation baseline

- [x] 1.1 Add a deterministic representative-change evaluation fixture and report covering runtime cost, cached/uncached input, output, packets, phases, sessions, retries, source-envelope bytes, relevance availability, and evidence limitations; verify the checked-in result reproduces from current completed telemetry.
- [x] 1.2 Add focused regression tests proving per-packet/per-session attribution and honest unavailable metrics before changing launch behavior.

## 2. Context envelope

- [x] 2.1 Add the optional positive guarded-packet initial-context byte budget with backward-compatible plan validation; verify legacy plans remain valid and malformed budgets fail.
- [x] 2.2 Enforce the budget against the complete resolved phase-capsule `readNow` set before worker launch, report largest contributors, and verify over-budget launches fail without dropping any declared coverage while in-budget launches remain unchanged.

## 3. Integration and delivery

- [x] 3.1 Extend worker telemetry and summary output with cached/uncached input, output, packet/session/phase/attempt breakdowns, fan-out, and handoff/read proxies; verify old telemetry stays readable and representative summaries are deterministic.
- [ ] 3.2 Document the measured findings and packet-authoring contract, run focused/full harness and docs checks plus strict OpenSpec validation, then complete independent Standards/Spec review and delivery guards before opening an unmerged PR.
