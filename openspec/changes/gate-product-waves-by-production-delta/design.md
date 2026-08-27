## Context

See `proposal.md` for the incident. The current harness already concentrates semantic routing in `route()` and binds its digest through requirements, baseline, conformance, and delivery receipts. The roadmap currently authorizes bounded implementation from a short Wave N request and defines completion in terms of merged audit dispositions, which allowed PR #43 to look like product-roadmap progress despite an explicitly zero-runtime scope.

## Goals / Non-Goals

**Goals:**

- Put the new distinction at the existing route-receipt seam.
- Fail before baseline and expensive validation/review when a product wave has no production delta.
- Preserve cheap audit/discovery work without letting it advance product state.
- Keep historical PR #43 data compact and executable as a regression oracle.

**Non-Goals:**

- Add a packet scheduler, roadmap database, or new receipt command.
- Reopen or rewrite PR #43's audit evidence.
- Define the production contract for Cards, Upload, Messaging, History, or Planner.
- Start Wave 11 or any subsequent wave.

## Decisions

### Add one optional typed wave block to route assessments

`route()` will accept an optional `wave` object with a positive integer `number` and exactly one of two inputs. A structured `expectedProductionDelta` has a closed production kind plus non-empty description and derives `workKind: product`, `executionPath: product`, and `roadmapAdvance: true`. An `evidenceKind` of `source-only`, `discovery`, or `audit` derives `executionPath: bounded-evidence` and `roadmapAdvance: false`. The mutually exclusive inputs remove the caller-controlled product label that could otherwise relabel evidence work.

This keeps ordinary route inputs backward compatible and gives every downstream receipt the classification through the existing route digest. A new command or parallel roadmap state was rejected because it would duplicate the receipt chain and increase caller knowledge.

### Reject contradictory evidence inputs at the seam

An evidence kind with a claimed production delta is rejected rather than silently upgraded or discarded. A missing/empty delta without an evidence kind is also rejected. Bounded evidence carries explicit test-first and independent-review risk flags; either can restore its corresponding receipt obligation, while marked failure invariants always require proof. This makes caller mistakes visible and preserves risk-derived safeguards without making wave numbering expensive.

### Enforce the heavy boundary in baseline

Route classification is observable immediately; baseline is the first execution-provenance receipt and the fail-closed boundary before candidate work and expensive evidence. Baseline will reassert the product-delta invariant even though route construction already validates it, protecting callers that attempt to supply forged or stale receipt-shaped data through the normal verifier.

### Use PR #43 as a data fixture, not copied implementation

A small JSON fixture will record only incident facts needed by the public harness interfaces: Wave 10, audit/source-only nature, no expected production delta, verified audit disposition, zero production/runtime consumers, the historical multi-session/packet execution shape, and PR identity. Tests will assert bounded classification, no roadmap advancement, absence of production-outcome proof, and rejection of isolated execution. It will not import PR #43's full manifests, SVGs, or historical plan receipts.

### Derive delivery proof from executed candidate evidence

A validation request that claims a production outcome must supply the roadmap-eligible route receipt, exactly match its expected delta, and identify non-empty outcome evidence within its hashed input closure. Only after the validation command passes does the harness derive `productionOutcomeProof` from the route digest, expected delta, candidate head, target, argv, closure digest, evidence paths, and command result. Delivery accepts roadmap advancement only when that derived proof matches the route delta and current candidate. Repeating `productionDelta` in a validation request is not proof, and a bounded-evidence route cannot mint production-outcome proof.

This keeps candidate/runtime binding at the existing validation receipt seam. A new roadmap receipt or semantic inspection engine was rejected as duplicate architecture; the executable command and declared evidence closure remain responsible for proving the domain-specific outcome.

### Make bounded execution an enforced inline boundary

All numbered product and bounded-evidence waves use the OpenSpec receipt chain. `run-isolated` must receive the route receipt as a dependency and rejects a route classified as `bounded-evidence`; ordinary non-wave isolated execution remains available. Bounded work therefore stays in one inline execution episode and cannot enter the isolated worker seam that represents fresh multi-session/packet execution.

## Risks / Trade-offs

- [“Production delta” becomes vague prose] → Require a non-empty explicit statement and derive proof only after a candidate-bound validation command passes over explicit outcome evidence.
- [Legacy Wave N callers omit the new block] → Only explicitly numbered product-wave workflows are required to supply it; ordinary non-wave route inputs remain compatible, while roadmap guidance makes the trigger mandatory for numbered work.
- [Audit evidence is mistaken for discarded work] → Preserve audit manifests and inventory dispositions, but state explicitly that they are evidence outcomes rather than product progress.

## Migration Plan

Add the new contract and regression test first, implement the route classification, then update roadmap and agent-facing pointers. Existing receipts remain readable because the wave block is optional for non-wave work. Rollback removes the optional classification and restores the prior roadmap language; no product or design-source data migrates.
