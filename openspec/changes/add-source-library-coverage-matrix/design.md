## Context

See `proposal.md` and `specs/audit/source-library-coverage/spec.md`. The generated design-source index exposes stable record and variant identities, while the project inventory exposes coarse library families and evidence. Their units differ and current SVG-path overlap is too weak to form a trustworthy join. The source directory is immutable.

## Goals / Non-Goals

**Goals:**

- Make every indexed record and variant auditable from one deterministic artifact.
- Separate human classification decisions from mechanical joins and validation.
- Preserve many-to-many record/family relationships and explicit unresolved work.
- Make corpus metrics reproducible and unit-correct.

**Non-Goals:**

- Inferring runtime behavior, accessibility, or responsive contracts from SVGs.
- Reclassifying application screens as reusable library APIs.
- Declaring all records implemented merely to reach a complete-looking percentage.
- Changing component code, public package APIs, or authoritative source data.
- Resolving extraction errors/skipped instances beyond carrying their diagnostics into coverage evidence; that remains a follow-up capability.

## Decisions

### 1. Use a curated decision ledger plus a generated expanded matrix

An authored JSON ledger will declare mapping decisions using stable source-record identities and optional all-variant coverage plus explicit variant exceptions. A Node generator will join that ledger with `design-source-index/components.json` and `docs/component-audits/project-inventory.json`, resolve paths, expand variants, validate invariants, and write the committed matrix.

This keeps subjective classification reviewable while preventing hand-maintained counts or copied source metadata from drifting. A fully generated name heuristic was rejected because similarly named, nested, duplicate, and application-owned records require semantic decisions. A single 195-row hand-authored output without a generator was rejected because it would duplicate index facts and make drift difficult to distinguish from decisions.

### 2. Bind identities to archive, Figma node ID, kind, and hierarchy

`sourceArchive + figmaNodeId` is the primary lookup key, with kind, name, and hierarchy path retained as assertions. Node IDs alone can collide across archives or future source pages; names alone are not stable or unique. Validation fails if any asserted identity differs from the index.

### 3. Keep four closed dispositions

- `implemented`: a valid inventory family plus concrete production and evidence paths prove a reusable or deliberately application-local implementation.
- `evidence-only`: the source record contributes design/evidence context but has no production implementation claim.
- `intentionally-excluded`: the record is deliberately outside library implementation, with reason, ownership boundary, and evidence.
- `unresolved`: classification or supporting evidence is incomplete.

Exclusions are not counted as implemented. Unresolved is a valid honest state but blocks any exhaustive-transfer claim. `VERIFIED` remains a separate audit dimension copied from referenced families, never an input to the disposition.

### 4. Expand variant coverage in generated output

The ledger may state that all variants inherit the record decision and may override specific variant node IDs. The generated output always contains the expanded indexed variant identities and their effective dispositions. This preserves review ergonomics while ensuring the current 630-variant denominator is explicit and testable.

### 5. Treat evidence as typed repository references

Mappings use arrays for `implementation`, `evidence`, and, where applicable, `exclusionEvidence`. The generator verifies paths exist and rejects source-directory paths as implementation. Family references resolve by exact canonical inventory name and expose that family's independent `implementation_status` and `audit_status` in generated output.

### 6. Generate counts, never author them

The output summary independently aggregates records, variants, and contextual family classifications. Percentages include their unit and denominator. No aggregate called “transfer percentage” is emitted unless its numerator and denominator are both source records or both source variants and the counted dispositions are named explicitly.

### 7. Integrate with existing generation and focused tests

The generator receives a dedicated package script and a focused Node test. Normal `generate` will include the matrix only if doing so does not create a circular dependency with the project inventory; otherwise a dedicated deterministic check runs in `test`. Source hashes before and after generation prove the protected source tree is untouched.

## Risks / Trade-offs

- [Initial classification is large and judgment-heavy] → Seed decisions from exact existing inventory/evidence, retain `unresolved` wherever the proof is insufficient, and make every row reviewable.
- [Record names and node IDs can drift when the source index regenerates] → Bind asserted identity fields and fail closed with precise missing/stale diagnostics.
- [Broad inheritance can hide a variant exception] → Expand all variants in output and require explicit exceptions whenever evidence differs; tests compare exact indexed identities.
- [Evidence paths can exist without proving the claim] → Require typed paths and review the initial ledger against component manifests/source tests; existence is necessary but not alone treated as proof.
- [The matrix can become another competing inventory] → Keep source facts generated from the index, family facts joined from project inventory, and author only the mapping decision seam.
- [A complete 195-row classification may reveal real gaps] → Preserve them as `unresolved`; completion of the matrix means complete accounting, not complete implementation.

## Migration Plan

1. Add and validate the decision ledger and generator against the current index/inventory.
2. Commit the generated matrix and focused documentation/tests.
3. Clarify `VERIFIED` semantics without rewriting historical audit results.
4. Future source-index or inventory changes update the ledger and matrix in the same change; rollback removes the new artifacts and leaves existing runtime/library contracts unchanged.
