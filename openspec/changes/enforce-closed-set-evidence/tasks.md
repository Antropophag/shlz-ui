## 1. Exhaustive Evidence Contract

- [x] 1.1 Add focused RED tests at the public conformance, validation, and delivery seams for declaration normalization, exhaustive partitioning, malformed/extra/overlapping entries, stale declarations, multiple sets, and no-impact compatibility; verify the new assertions fail on the baseline harness.
- [x] 1.2 Implement generic closed-set declaration and evidence validation behind the existing receipt interfaces; verify focused harness tests pass without a new public command.

## 2. Regression and Guidance

- [x] 2.1 Add an executable PR #45 regression fixture that rejects Golos Text evidence covering only 400 of 400/500/600/700 and accepts complete or explicitly justified coverage; verify it exercises the public receipt chain.
- [x] 2.2 Document changed finite-set discovery, evidence-path coverage, combination identity, and exclusion review responsibilities; verify agent-facing guidance agrees with CLI behavior.

## 3. Validation and Delivery

- [x] 3.1 Run strict OpenSpec, focused harness, aggregate repository, formatting, and target-diff checks; record exact results and limitations.
- [ ] 3.2 Run independent Standards and Spec reviews, resolve every blocking finding, run route conformance and delivery guards, then push and open a separate PR targeting `main` while leaving it unmerged.
