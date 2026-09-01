## Context

See `proposal.md`. The current matrix accounts for 195 records and 630 variants;
55 records and 467 variants are implemented, leaving 140 records and 163
variants unresolved. The unresolved cohort contains component sets, standalone
records, nested primitives, and domain compositions. Existing audit artifacts
are evidence inputs rather than design authority.

## Goals / Non-Goals

**Goals:**

- Produce a reviewable census of component/composition candidates and deferred
  records before changing any disposition.
- Reuse the existing authored ledger and deterministic generator as the only
  decision and validation seams.
- Separate already existing reusable coverage from established composition
  ownership without shrinking the source denominator.

**Non-Goals:**

- Build or alter runtime components.
- Decide extraction-diagnostic policy, showcase loading, accessibility tradeoffs,
  File Upload, Timeline/Message, Composer, or Card.
- Convert every nested record into a new family or infer contracts from names.

## Decisions

### 1. Freeze the episode census before classifying records

The implementation will derive a checked candidate inventory from the current
140 unresolved records, grouped by exact source archive, node id, kind, and
hierarchy. Every record receives either an in-scope review outcome or a named
defer reason. This makes scope movement visible.

A hand-maintained shortlist without a complete census was rejected because it
could silently omit ambiguous records and improve the headline metric.

### 2. Keep the ledger as the sole authored decision seam

Record-specific judgments remain in
`source-library-coverage-ledger.json`. Generator changes are allowed only for a
general fail-closed invariant or a deterministic report view. No second mapping
file or name-based classifier will be introduced.

This keeps the module deep: callers provide authored decisions while the
generator hides source joins, evidence validation, totals, and rendering.

### 3. Require independent evidence dimensions for implementation

An `implemented` decision needs the canonical family, production path, direct
source/variant evidence, and executable behavior evidence. An audit status or
path existing on disk is insufficient by itself. Variant contracts that exceed
the existing family stay unresolved.

Classifying by normalized terminology was rejected because records such as
Icon button, Input-Number, and domain Table sets may have contracts beyond the
similarly named primitive.

### 4. Treat composition classification as an ownership claim

`evidence-only` records must name the existing family/composition they support.
`intentionally-excluded` records must cite a repository census or audit and name
the consumer/domain ownership boundary. Ambiguous interface records remain
unresolved.

Broadly excluding all Interface Elements was rejected because some may be
future framework-neutral primitives.

### 5. Defer by roadmap boundary, not convenience

Source extraction warnings are preserved but interpreted in step 2. New File
Upload work, shared Timeline/Message modeling, and Composer/Card decisions remain
outside this change. Existing plans are read-only historical evidence until a
later reconciliation explicitly dispositions them.

## Risks / Trade-offs

- [Direct evidence may exist but be scattered] → Cite exact source tests,
  manifests, compositions, and runtime checks; otherwise remain unresolved.
- [A large ledger diff can hide weak claims] → Organize review by evidence
  cohort and emit exact before/after counts plus residual records.
- [An exclusion can conceal a reusable opportunity] → Require an explicit
  ownership boundary and keep ambiguous records unresolved.
- [Later diagnostic work may revise interpretation] → Preserve every diagnostic
  and make this change reversible without touching source or runtime code.

## Migration Plan

1. Capture the complete candidate/deferred census and focused failing checks.
2. Apply record-level decisions cohort by cohort with exact evidence.
3. Regenerate twice and validate paths, families, denominators, source
   immutability, and runtime-surface immutability.
4. Publish exact movement and the residual component backlog.
5. Rollback restores the prior ledger and generated outputs; no consumer
   migration is required.
