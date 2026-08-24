## Context

See `proposal.md` for motivation and `specs/harness/spec-driven-tdd/spec.md` for behavior. The existing harness already owns immutable execution baselines, requirements revisions, packet claims, isolated worker runtime identity, contract digests, change-specific failure-invariant proof, review state, and delivery checks. It lacks a first-class acceptance-test contract between requirements readiness and implementation claims.

The design must preserve the harness as a deep module: callers declare a compact lifecycle contract and use CLI transitions; filesystem hashing, Git worktree execution, symmetry checks, evidence freshness, and state-machine enforcement stay behind that interface.

## Goals / Non-Goals

**Goals:**

- Make independent acceptance-test design and meaningful immutable-baseline RED machine-verifiable before production implementation begins.
- Make RED/GREEN symmetric, deterministic, requirement-grounded, and tamper-evident.
- Compose with existing requirements, worker, review, failure-invariant, and delivery state without a parallel source of truth.
- Permit precise re-entry after requirements changes and explicit inapplicability where enforced TDD would be dishonest or unsafe.

**Non-Goals:**

- Infer executable assertions from Markdown or judge semantic oracle quality solely from keywords.
- Force the heavy lifecycle onto direct changes, documentation-only work, subjective visual exploration, destructive/external workflows, or changes whose baseline is already green.
- Freeze implementation-supporting unit tests or forbid ordinary developer TDD.
- Replace independent Spec/Standards review or change-specific failure-path proof.

## Decisions

### Add one TDD contract to the execution plan and one state machine to execution state

Plans opt in with a versioned `specDrivenTdd` object containing slices. Each slice names current-change scenario identities, the seam, acceptance command, acceptance/test/fixture surfaces, production surface, implementation packet, test-design packet, deterministic controls, repeat count, and applicability. `createPlan` validates disjoint surfaces, packet dependencies, guarded execution modes, and scenario coverage.

Execution state stores only lifecycle evidence: `pending-test-design → designed → red-proven → implementing → green-proven`, plus invalidation metadata. Digests bind the normalized slice contract, OpenSpec scenarios, requirements revision, baseline, acceptance files, fixture files, controls, and worker runtime identities.

Alternative: introduce a separate TDD state file. Rejected because atomic packet claims, pause/resume, and delivery could observe inconsistent snapshots.

### Use dedicated public CLI transitions

Add commands for `tdd-design-record`, `tdd-red`, and `tdd-green` (names may be normalized during implementation while preserving these roles). Design recording validates the adapter-bound test-design worker handoff. RED creates a small detached worktree under the user's home-directory worktree area, verifies its HEAD equals the execution baseline, runs the declared command repeatedly with the same normalized environment, records bounded stdout/stderr signatures, and removes/prunes the worktree after verifying it has no changes. GREEN runs the identical contract at the current head.

`ready`, `claim`, `worker-run`, `complete`, review completion, and `delivery-check` consult the same state. Failed transitions write no authorization state.

Alternative: rely on handoff prose and CI ordering. Rejected because neither proves the tested revision, same oracle, nor atomic readiness.

### Treat acceptance tests as an immutable contract between RED and GREEN

The test-design handoff provides a manifest with exact file paths, scenario mapping, command argv (not shell text), fixture paths, deterministic environment allowlist, expected normalized failure signature, oracle source classification, and test-design inputs. The harness resolves real paths inside the repository and hashes file bytes. Implementation briefs expose the manifest and evidence but exclude authorization to modify acceptance/fixture surfaces.

At GREEN, every digest is recomputed. Any drift invalidates the lifecycle and sends the slice back to independent test design. Implementation-supporting tests live outside the frozen acceptance surface.

Alternative: allow acceptance edits with reviewer approval. Rejected because it creates a quiet tuning path; a legitimate requirements/test correction is requirements/test-design re-entry and must reproduce RED.

### Prove oracle symmetry and determinism structurally and behaviorally

Both revisions use one manifest-generated execution request; callers cannot supply separate baseline/candidate commands. The runner records argv, environment digest, file digests, fixture digest, normalization rules, timeout, and repeat count. RED requires repeated identical non-zero outcomes and a declared signature mapped to at least one changed scenario. GREEN requires zero outcomes from that same request.

The manifest must classify the independent expected-result source (worked example, standard, design authority, existing public contract, or explicit OpenSpec literal) and attest that the oracle observes behavior at the declared seam. Spec review remains responsible for semantic strength; executable fixtures demonstrate that source/symbol-presence, tautological, retry-masked, asymmetric, and timing-race adapters are rejected. This combines structural guardrails with independent human judgment rather than pretending the harness can infer semantics.

Alternative: compare arbitrary known-bad and known-good scripts. Rejected based on PR #34: asymmetric artifacts can manufacture discrimination. Alternative: run once. Rejected because timing-dependent probes can produce accidental RED.

### Preserve physical and methodological independence

The test-design packet is guarded and must complete under an adapter-issued runtime identity before its dependent implementation packet becomes ready. The test-design brief includes requirements, authorities, seam, and test surface, but no proposed production diff or implementation handoff. The implementation runtime must differ from the test-design runtime. A declaration of test-design inputs is digest-bound and rejects production implementation sources.

Physical separation alone does not prove method independence, so Spec review inspects the expected-result source and oracle method; representative fixtures independently attack weak methods.

Alternative: use one worker with ordered prompts. Rejected because context separation and independent design cannot be attested.

### Re-entry is slice-aware but fail-closed

Requirements pause raises the execution state's required revision as today and invalidates slices whose scenario or dependency digest changed. All implementation packets depending on them return to pending/paused and require a new test-design runtime. The new handoff explicitly classifies prior tests. A slice may be retained only if scenario, authority, dependency, acceptance, fixture, command, and controls digests match; the harness records the old/new revision bridge.

Alternative: invalidate every slice unconditionally. Rejected because it discards valid evidence for unrelated requirement edits. Alternative: retain by test-file digest alone. Rejected because requirements can change while tests remain stale.

### Applicability is an explicit planning decision, not a loophole

Each material behavioral slice is either `enforced` with a complete contract or `inapplicable` with a reason code and evidence. Allowed reasons are bounded to baseline-already-green, no deterministic seam, unsafe/destructive execution, unavailable controlled dependency, or subjective-only acceptance. Spec review verifies the disposition; delivery rejects missing dispositions. Ordinary direct/S work does not acquire this declaration unless it opts in.

Alternative: require a fabricated known-bad mutation for baseline-green changes. Rejected because mutation testing answers oracle sensitivity, not whether the immutable baseline lacks newly required behavior.

### Compose rather than replace failure-invariant and review gates

Acceptance RED/GREEN proves promised behavior; change-specific failure-invariant proof independently proves failure/recovery behavior for marked state-machine, persistence, and subprocess scenarios. Both bind the same OpenSpec and reviewed head. Review initialization includes the TDD evidence digest, contract changes invalidate review proof, and the Spec/Standards axes have explicit responsibilities. Delivery requires completed packets, current requirements, current review, failure proof when applicable, and green TDD slices.

## Risks / Trade-offs

- **[Test-design quality remains partly semantic]** → Require independent expected sources, scenario mapping, adversarial fixtures, and Spec review; do not claim keyword validation proves a strong oracle.
- **[Repeated baseline execution increases cost]** → Apply only to eligible material slices and keep commands focused and bounded.
- **[Worktree cleanup can fail]** → Use explicit home-directory paths, process-exit/finally cleanup, dirty-tree refusal, and `git worktree prune`; retain failure evidence without destructive cleanup.
- **[Strict freezing delays legitimate test corrections]** → Provide explicit test-design re-entry that invalidates old RED rather than silently editing evidence.
- **[Scenario granularity may be poor]** → Reject ungrounded or duplicate mappings and require OpenSpec revision before acceptance design proceeds.
- **[Compatibility with historical plans]** → Treat absent `specDrivenTdd` as legacy/non-enforced; only newly declared enforced plans acquire the gate.

## Migration Plan

1. Add schema validation and pure state transitions with focused contract tests.
2. Add the bounded symmetric runner and CLI adapters with synthetic representative fixtures.
3. Integrate packet readiness/claim/completion, requirements re-entry, review, and delivery.
4. Dogfood the lifecycle against an immutable pre-implementation baseline and a fixture implementation, then run two-axis review and applicable failure-invariant proof.
5. Roll back by reverting the change; historical plan/state files remain readable because the new contract is opt-in.
