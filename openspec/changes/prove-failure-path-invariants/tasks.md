## 1. Executable Contract

- [x] 1.1 Add failure-path proof validation to the existing review state and CLI, verified by focused harness tests for applicable, non-applicable, degraded, and non-discriminating cases.
- [x] 1.2 Add the PR #32 pre-remediation regression fixture and verify it detects stranded launching, impossible fallback completion, retry-state loss, stream/process failure, event ordering, and unbound persisted completion evidence.

## 2. Proportionate Workflow

- [x] 2.1 Update execution/review guidance to explain guarantees, common-mode independence, capability degradation, and external diversity triggers; verify direct S examples remain unchanged.
- [x] 2.2 Dogfood the proof on this harness change, run strict OpenSpec and harness validation, independently review the fixed diff, and create an unmerged PR.
