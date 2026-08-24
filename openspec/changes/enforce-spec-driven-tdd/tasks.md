## 1. Contract and RED tests

- [x] 1.1 Add failing harness contract tests for eligibility, disjoint surfaces, scenario grounding, lifecycle state, and legacy-plan compatibility; verify the focused tests fail on the immutable baseline for the declared missing behavior.
- [x] 1.2 Add failing public-CLI fixtures for independent test-design evidence, symmetric repeated RED, weak/asymmetric oracle rejection, nondeterministic probe rejection, and post-RED tamper invalidation; verify each known-bad adapter fails its intended invariant with a stable signature.

## 2. Core lifecycle

- [x] 2.1 Implement versioned plan validation and execution-state transitions for test design, RED, implementation authorization, GREEN, and inapplicability; verify the contract tests from 1.1 pass without weakening them.
- [x] 2.2 Implement test-design handoff validation, runtime-identity separation, scenario/authority mapping, and immutable acceptance/fixture/control digests; verify implementation readiness remains blocked for stale, overlapping, leaked, or same-runtime evidence.
- [x] 2.3 Implement the bounded symmetric acceptance runner and CLI transitions using one argv/environment/oracle request for baseline and candidate; verify repeated deterministic RED and unchanged-contract GREEN pass while asymmetric, tautological, timing-dependent, and tampered fixtures fail.

## 3. Workflow composition

- [x] 3.1 Integrate TDD readiness with worker claim/run/complete and requirements pause/resume, including slice-aware revision invalidation and explicit retained-evidence bridges; verify no transition can bypass a newer requirements revision.
- [x] 3.2 Bind TDD evidence into review initialization/completion, change-specific failure-invariant proof, route/delivery checks, and candidate-head freshness; verify every stale or missing evidence case fails closed.
- [x] 3.3 Update adaptive execution, validation, and operational schema documentation with eligibility boundaries, independent worker context, RED/GREEN commands, re-entry, review ownership, and cleanup guarantees; verify agent-facing docs and OpenSpec integration checks pass.

## 4. Representative evidence and delivery

- [x] 4.1 Run representative fixtures through the public harness seam, including one successful end-to-end red-to-green flow and every specified known-bad/inapplicable/re-entry case; record exact deterministic outcomes and run focused plus aggregate harness/OpenSpec validation.
- [x] 4.2 Perform fixed-baseline Standards and Spec reviews with applicable executable failure-invariant proof, remediate and re-review findings without changing acceptance evidence silently, run delivery guards, push the task branch, and open a separate PR targeting `main` without merging it.
- [ ] 4.3 Resolve the verified CodeRabbit findings on PR #35 with regression coverage for fail-closed review, execution, re-entry, oracle, worktree, and known-bad evidence behavior; rerun fixed-head validation and review before updating the existing unmerged PR.
