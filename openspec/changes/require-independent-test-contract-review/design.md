## Context

See `proposal.md` for motivation and `specs/harness/independent-test-contract-review/spec.md` for behavior. The current `specDrivenTdd` module already owns plan validation, guarded designer identity, a frozen design handoff, same-oracle control/decoy discrimination, baseline RED, implementation authorization, GREEN, requirements re-entry, final review binding, and delivery. Its lifecycle currently moves directly from `designed` to `red-proven`.

The design must keep that module deep: callers declare one review packet and submit one review handoff, while identity binding, state transitions, invalidation, and downstream composition remain behind the harness interface.

## Goals / Non-Goals

**Goals:**

- Insert a meaningful independent decision between frozen test design and RED/production authorization.
- Make reviewer separation, completeness, freshness, and prohibited context machine-verifiable.
- Give the human/agent reviewer a bounded semantic checklist without pretending the harness can infer correctness.
- Reuse the existing execution state and review/delivery bindings rather than create parallel approval state.

**Non-Goals:**

- Add voting, configurable quorum, or a general approval engine.
- Duplicate the final Standards/Spec code review.
- Replace oracle discrimination with prose attestations.
- Make legacy plans unreadable or retrofit historical completed state.

## Decisions

### Extend each enforced slice with one guarded review packet

Newly synthesized enforced slices declare `testReviewPacket`. Plan validation requires it to be distinct from test-design and implementation packets, guarded, dependent on the test-design packet, and an ancestor of the implementation packet. This uses the existing worker runtime attestation rather than inventing reviewer identities.

Alternative: accept any caller-supplied reviewer id. Rejected because a string does not prove physical separation or completion of a bounded review packet.

### Insert `pending-test-review` and `test-reviewed` states

`recordTddDesign` ends at `pending-test-review`. A new public `tdd-review-record` transition accepts either `approved` or `changes-requested`. Approval moves to `test-reviewed`; rejection records bounded findings and resets the slice to `pending-test-design`, so correction uses the existing design entry point. `tdd-red` accepts only `test-reviewed`; downstream RED/GREEN state names remain unchanged.

Alternative: keep status `designed` and attach an optional approval object. Rejected because readiness checks could accidentally treat missing approval as designed/ready and because fail-closed transitions are clearer as an explicit state.

### Bind a small exhaustive checklist, not a quality score

Approval contains five fixed dimensions: scenario/authority correctness, behavioral seam observation, wrong-behavior discrimination, fixture/control independence, and production-context exclusion. Each dimension is `pass` and carries non-empty evidence refs; scenario evidence covers the exact scenario set. Findings are structured only for `changes-requested` and cannot coexist with approval.

The harness checks shape, coverage, digest identity, worker/input independence, and the effective context assembled by the public worker path. Review packet context sources, allowed implementation surface, dependency handoffs, and worker-brief phase input are rejected when they expose a production surface or implementation-worker handoff; approval rechecks the durable plan/state facts so a manually completed or stale path cannot bypass brief-time enforcement. It does not score prose, parse tests for meaning, or accept coverage percentage as authorization. Semantic judgment remains with the reviewer and is challenged later by Spec review.

Alternative: require a numeric confidence threshold or static heuristics. Rejected because both can create false machine authority over requirement interpretation.

### Freeze approval to the existing design identity

The review handoff repeats the existing TDD identity fields plus `designDigest`; the harness compares them with the frozen design and records `reviewDigest`. RED must match both design identity and approved review identity. Requirements re-entry uses the existing affected/retained classification: affected resets to test design; retained evidence is valid only when its retention identity and review digest are unchanged.

Alternative: bind only acceptance-file bytes. Rejected because authorities, scenario mapping, fixtures, controls, or oracle challenge can change without changing the acceptance file.

### Keep pre-implementation and final review method-independent

The pre-implementation review packet receives synthesized requirements, authorities, seam, frozen test design, and test/fixture surfaces, but excludes proposed production code and implementation handoffs. This exclusion is enforced against the packet's resolved context sources, dependency handoffs, and immutable worker brief as well as the review handoff's declared inputs. Its question is “can this contract safely authorize implementation?” Final Spec review sees the candidate diff and asks “does the implementation and evidence satisfy the spec?” Standards review continues to inspect repository discipline and deterministic execution.

Final review/delivery binding gains the current test-contract approval digest through the existing TDD review binding. No third final-review axis is added.

Alternative: defer all test-contract judgment to final Spec review. Rejected because production code would already have been authorized and shaped by a flawed contract.

### Prove the lifecycle with a focused known-bad scenario

Extend the existing harness fixtures with one scenario that produces a valid design handoff, then attempts approval with incomplete scenario evidence and with a reviewer/runtime violation. Both must fail before RED; complete approval from the guarded review worker must unlock the unchanged RED path. This tests the public CLI and pure transition seam without building another production subsystem.

## Risks / Trade-offs

- **[Checklist approval becomes ceremony]** → Require scenario-specific evidence, physical separation, exact digest binding, and a known-bad fixture; preserve final Spec review as a backstop.
- **[A reviewer and designer share the same mistaken interpretation]** → Require authoritative refs and wrong-behavior discrimination, while explicitly retaining requirements re-entry and final Spec review. No single reviewer can mathematically prove semantics.
- **[Lifecycle adds cost]** → Scope it only to enforced spec-driven TDD slices; ordinary TDD and inapplicable slices remain unchanged.
- **[Legacy plan ambiguity]** → Require the review packet only for a new `specDrivenTdd` version while continuing to read version 1 plans/states under their existing lifecycle.
- **[Rejection loses useful diagnostics]** → Persist bounded findings/invalidation metadata while removing any approval capability.

## Migration Plan

1. Add version-compatible plan validation and pure review transitions with focused tests.
2. Add the CLI transition and integrate RED, worker readiness, re-entry, review binding, and delivery.
3. Add the representative known-bad scenario and update agent-facing lifecycle documentation.
4. Validate the change against its immutable baseline, run change-specific failure proof and independent Standards/Spec reviews, then open an unmerged PR.

Rollback is a revert: historical version 1 plans remain readable and no external data migration is required.
