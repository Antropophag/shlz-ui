## Purpose

Defines one compact, immutable receipt chain that proves engineering work is correctly routed, specified, implemented, validated, reviewed when necessary, and delivered from the intended Git candidate.

## ADDED Requirements

### Requirement: Routing and requirements fail closed

The harness SHALL produce a route receipt only from a complete closed-set material-signal assessment. Direct routing MUST be rejected when any material signal is true or unknown. Material work MUST NOT produce an execution-baseline receipt until every blocking decision is resolved or delegated, OpenSpec synthesis is valid, and execution authorization is approved or pre-authorized.

#### Scenario: Direct or gated work attempts to bypass readiness

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness,spec,docs -->
<!-- failure-invariant: routing-readiness-cannot-be-bypassed concern=state-machine -->

- **WHEN** a direct assessment contains a true or unknown material signal, or a material assessment has an unresolved decision, missing synthesis, or missing authorization
- **THEN** the harness refuses the next receipt and identifies the unsatisfied gate

### Requirement: Execution baseline is immutable Git provenance

An execution-baseline receipt SHALL bind the repository identity, task branch, default base, upstream, immutable starting commit, and either a current-main start or the verified head of an open pull request. A receipt for another repository, branch, base, upstream, or pull-request head MUST be rejected.

#### Scenario: Baseline identity drifts

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: execution-baseline-drift-is-rejected concern=persistence -->

- **WHEN** execution begins from a dirty, stale, mismatched, default, or differently tracked branch
- **THEN** no execution-baseline receipt is produced

### Requirement: Contract identity is stable and normative

The harness SHALL derive stable scenario identities and a deterministic contract digest from the selected OpenSpec delta's normative content. Scenario order and filesystem enumeration MUST NOT change the digest, while any normative scenario content or identity change MUST change it and invalidate dependent receipts.

#### Scenario: Contract content changes after evidence

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness,spec -->

- **WHEN** a scenario identity or normative WHEN/THEN content changes after contract-bound evidence was produced
- **THEN** TDD, validation, review, failure-proof, conformance, and delivery consumers reject the stale digest

### Requirement: TDD receipt binds RED and GREEN symmetrically

A TDD receipt SHALL prove that the same deterministic acceptance contract rejects the immutable baseline or an explicit known-bad adapter and accepts the candidate head. RED and GREEN MUST share the same contract digest, oracle inputs, repetition policy, and candidate lineage; changing tests or contract between phases MUST fail.

#### Scenario: Weak, tuned, stale, or known-bad implementation

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: tdd-requires-discriminating-red-green concern=subprocess -->

- **WHEN** RED passes, GREEN fails, a known-bad implementation passes, the oracle changes, or either phase is bound to another contract or candidate
- **THEN** the harness refuses the TDD receipt

### Requirement: Validation reuse binds the meaning-changing closure

A validation receipt SHALL bind the candidate head, target, outcome, command, and digest of every configured input capable of changing that target's meaning, including source, tests, oracle/configuration, policy, and applicable dependency inputs. A successful expensive result MAY be reused only when that entire closure is digest-identical.

#### Scenario: Validation input closure drifts

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness -->

- **WHEN** any meaning-changing input or candidate head differs from a prior successful receipt
- **THEN** reuse is rejected and a new validation result is required

### Requirement: Stateful failure proof discriminates good and known-bad behavior

Material state-machine, persistence, and subprocess changes SHALL require a failure-proof receipt derived from every marked current-change failure invariant. The proof MUST bind the contract digest and candidate head and MUST show the candidate passes while a declared known-bad adapter fails each applicable invariant.

#### Scenario: Failure proof is incomplete or non-discriminating

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: failure-proof-covers-current-contract concern=state-machine -->

- **WHEN** a marked invariant is absent, a proof refers to another contract or head, or correct and known-bad behavior receive the same result
- **THEN** review completion and delivery are rejected

### Requirement: Standards and Spec review remain independent

A review receipt for material or review-risky work SHALL contain separate Standards and Spec outcomes from distinct runtime identities, both bound to the same candidate head and contract digest. One axis MUST NOT substitute for, overwrite, or infer the other.

#### Scenario: Review identity, axis, or candidate is incomplete

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** an axis is missing, both axes share an identity, an outcome is incomplete, or either axis reviews another candidate or contract
- **THEN** no passing review receipt is produced

### Requirement: Isolated execution is optional and receipt based

Normal S/M execution SHALL require no packet graph, claim lifecycle, capsule ledger, worker launch, or committed mutable state. When L/XL work deliberately uses isolation, one `run-isolated` manifest SHALL resolve dependencies and source context immediately before launch and return one immutable result receipt containing runtime-issued identity, complete outcome, report digest, dependency receipt digests, and launch identity.

#### Scenario: Isolated result is missing runtime proof or dependencies

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: isolated-result-is-complete concern=subprocess -->

- **WHEN** an isolated launch is unavailable, fails, lacks runtime-issued identity or a complete report, or references missing or stale dependency receipts
- **THEN** the result fails closed without manufacturing completion and can be retried from the unchanged manifest

### Requirement: Explicit source byte budgets block before launch

An isolated manifest with a positive context byte budget SHALL resolve every declared source without omission immediately before launch, calculate a deterministic source-manifest digest and byte total, and reject an over-budget launch with contributor totals. The harness MUST NOT truncate, rank away, summarize, or silently drop declared sources.

#### Scenario: Complete source manifest exceeds budget

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: context-budget-blocks-before-launch concern=subprocess -->

- **WHEN** the complete resolved source set exceeds the declared byte budget
- **THEN** the worker is not launched and the result reports the total, limit, and contributors

### Requirement: Telemetry is compact and honest

Telemetry summaries SHALL report runtime metrics only when supplied by a trusted runtime result. Missing token or active-context metrics MUST remain `unavailable` and MUST NOT be inferred from byte totals, file counts, command volume, or other proxies. Raw logs and telemetry SHALL remain local or CI artifacts rather than durable Git evidence.

#### Scenario: Runtime metrics are absent

<!-- implementation-semantics: material-behavior -->
<!-- validation-impact: harness,docs -->

- **WHEN** an isolated result does not contain a runtime-issued metric
- **THEN** the compact summary reports that metric as unavailable and labels any repository-controlled observations separately

### Requirement: Route conformance binds declared and actual episode surfaces

A route-conformance receipt SHALL derive the actual episode diff from the execution baseline and compare it with the complete declared changed-file surface and closed-set material signals. Missing files, unexpected files, or newly discovered material/unknown signals MUST reject conformance or require OpenSpec re-entry.

#### Scenario: Implementation drifts from declared surface

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->

- **WHEN** the episode diff and discovered surface differ or a direct episode discovers material impact
- **THEN** route conformance fails before delivery

### Requirement: Delivery evidence is repository and candidate bound

A delivery receipt SHALL query and bind the actual repository, task branch, upstream, target branch, open pull request, local candidate head, remote head, and pull-request head. It MUST require route, requirements when material, baseline, contract/TDD when obligated, required validation, review/failure proof when applicable, and route-conformance receipts for that same candidate.

#### Scenario: Delivery evidence belongs to another candidate or repository

<!-- implementation-semantics: material-state -->
<!-- validation-impact: harness -->
<!-- failure-invariant: delivery-requires-coherent-receipt-chain concern=persistence -->

- **WHEN** any required receipt is missing, stale, digest-incoherent, or bound to another repository, branch, pull request, or candidate head
- **THEN** delivery fails before an acceptance receipt is produced

### Requirement: Durable repository artifacts stay minimal

The canonical material workflow SHALL require no more than eight durable compact artifacts per episode, excluding OpenSpec planning artifacts and ordinary source/tests. Completed operational history, retry briefs, capsules, ledgers, mutable packet state, raw logs, and raw telemetry MUST NOT be inputs to delivery validation. Executable harness tests SHALL use minimal synthetic fixtures rather than full historical active directories.

#### Scenario: Historical state is absent

<!-- implementation-semantics: absence-only -->
<!-- validation-impact: harness,docs -->

- **WHEN** normal material delivery is validated after completed operational directories and raw telemetry are removed
- **THEN** the canonical receipt chain remains executable using at most eight compact episode artifacts
