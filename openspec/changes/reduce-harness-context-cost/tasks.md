## 1. Reproduction and contract

- [x] 1.1 Add the representative PR #36 replay fixture with honest 188K provenance, all six contributor classes, invariant obligations, state transitions, and a minimum reduction threshold; probe contributors independently, compare candidate architectures, and record sourced-versus-modeled metric limitations.

- [x] 1.2 Select the least complex candidate that meets the replay threshold without weakening obligations; update the OpenSpec spec/design with the evidence-backed mechanism and verify strict validation before production implementation.

## 2. Context-cost module

- [x] 2.1 Implement only the selected context-cost mechanism behind one small harness interface; verify focused unit cases cover the contributor behavior and deterministic replay results established by Task 1.2.
- [x] 2.2 Implement fail-closed obligation/state/finding equivalence and improvement verdicts; verify missing evidence and below-threshold reductions fail even when candidate inputs are smaller.

## 3. Integration and evidence

- [x] 3.1 Add the additive harness CLI and phase-local operator documentation; run the PR #36 replay twice and record a deterministic report showing a material reduction without runtime-token inference or new infrastructure.
- [ ] 3.2 Run focused and repository validation, strict OpenSpec validation, route conformance, and independent Standards/Spec review; resolve in-scope findings and open a separate unmerged PR with baseline, replay deltas, checks, limitations, and review state.
