## 1. Contract and Acceptance Harness

- [ ] 1.1 Add a machine-checked map from every prior harness OpenSpec scenario identity to `preserved`, `revised`, or `retired-with-reason`, and verify no scenario is unmapped.
- [ ] 1.2 Add focused acceptance cases for every receipt-workflow guarantee, including candidate/contract drift and correct-versus-known-bad discrimination, and verify the new suite is RED against the PR #41 baseline.

## 2. Receipt Interface

- [ ] 2.1 Implement the shared immutable receipt envelope and the route, requirements, baseline, contract, conformance, and delivery commands; verify fail-closed identity and digest cases pass.
- [ ] 2.2 Implement candidate-bound TDD, validation-reuse, independent review, and failure-proof receipts; verify stale, incomplete, asymmetric, and non-discriminating evidence is rejected.
- [ ] 2.3 Implement `run-isolated` with an ephemeral resolved-source manifest, dependency receipt validation, pre-launch byte-budget enforcement, runtime identity, complete-result checks, retry-safe immutable output, and honest telemetry summary; verify no subprocess launches for invalid or over-budget inputs.

## 3. Deletion-First Migration

- [ ] 3.1 Replace the CLI with 10–14 canonical receipt commands and delete packet, capsule, mutable TDD/review, retrospective efficiency, and obsolete telemetry runtime paths; verify removed commands are absent from help and focused tests pass.
- [ ] 3.2 Remove completed `docs/exec-plans/active/` history, raw telemetry/logs, retry artifacts, retrospective evaluation data, and full historical fixtures while retaining only compact executable fixtures; verify delivery tests have no historical-state dependency.

## 4. Canonical Workflow and Cost

- [ ] 4.1 Rewrite harness workflow/config/package documentation around the single receipt chain, remove every deleted-command reference, and verify documentation/CLI consistency tests pass.
- [ ] 4.2 Measure public commands, runtime LOC, focused test LOC, durable episode artifact count, total negative LOC, and focused execution cost; record deviations from target ranges with evidence and verify the acceptance thresholds are met or explicitly blocked.

## 5. Validation and Delivery

- [ ] 5.1 Run focused and repository validation, independent Standards and Spec review plus required discriminating failure proof, remediate findings, run route conformance and delivery checks, then push and open a separate unmerged pull request.
