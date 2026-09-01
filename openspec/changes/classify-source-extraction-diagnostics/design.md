## Context

See `proposal.md` for motivation. The committed source issue index reports aggregate totals and occurrence data, while the coverage matrix currently carries diagnostic payloads but no authored decision seam for their meaning. The design source is read-only, and generated indexes are evidence rather than authority.

## Goals / Non-Goals

**Goals:**

- Establish one stable identity and one authored decision for every committed extraction occurrence.
- Validate classifications independently of generated summaries and fail closed on drift.
- Make coverage impact explicit without conflating extraction quality with implementation status.
- Keep generated data reviewable through a compact authored ledger and human summary.

**Non-Goals:**

- Repair source exports or extraction tooling.
- Reinterpret component behavior from static SVGs.
- Implement components, change public APIs, or advance later roadmap steps.
- Reclassify existing source-library dispositions unless current evidence is proven invalid.

## Decisions

### Use an authored ledger joined to committed index occurrences

The decision seam will be a compact JSON ledger under `docs/component-audits/`. Generation will derive canonical occurrences from committed index artifacts and join each occurrence to exactly one ledger entry.

Stable identity will use source archive, diagnostic kind, scope, node identity, field/category, and occurrence-specific context. The generator will own identity serialization so authored data cannot silently choose a weaker key.

Alternative: annotate `design-source-index/source-issues.json` directly. Rejected because the index is derived extraction output and should not mix observed facts with repository decisions.

### Model disposition and coverage impact independently

Disposition will describe why the diagnostic exists: extraction defect, source ambiguity, harmless diagnostic, or product-gap evidence. A separate closed field will state whether it has no coverage effect, limits a conclusion, or invalidates a current claim. Evidence and rationale are mandatory according to the selected combination.

Alternative: one combined status enum. Rejected because it couples two independent questions and encourages “non-blocking” to be read as “implemented.”

### Generate both machine and human views from one validated model

The generated JSON will contain occurrence-level records and reconciled totals. A generated Markdown report will summarize cohorts, impacts, and remaining limitations. Both outputs will sort by canonical identity and contain no timestamps or environment-specific paths.

Alternative: hand-author Markdown only. Rejected because completeness, identity drift, and contradiction checks would not be enforceable.

### Bind claims to repository-confined evidence

Evidence references must resolve inside the repository, must not point into `shlz-design-source/` as implementation, and must match the claim type. Existing audit manifests, source indexes, coverage artifacts, tests, and authoritative raw SVG observations may provide evidence, but none independently proves runtime implementation.

### Use contract tests rather than product TDD

This is a bounded audit wave with no product behavior delta. Focused tests will exercise complete generation plus known-bad ledgers for missing, duplicate, stale, contradictory, unknown, and escaping claims. Full repository validation will prove integration and protected-path neutrality.

## Risks / Trade-offs

- [Occurrence identity can change when extraction is regenerated] → Bind all identity fields and fail closed, requiring deliberate ledger review.
- [Many related warnings may create repetitive ledger entries] → Allow cohort metadata only as a review aid; retain occurrence-level authored accountability.
- [A diagnostic may support multiple interpretations] → Require the least assertive supported impact and keep ambiguity explicit.
- [Generated totals may appear to supersede coverage totals] → Report diagnostic counts separately and state that classification does not advance product implementation.

## Migration Plan

Add the ledger, generator, outputs, and focused validation without changing existing runtime or source artifacts. Regenerate deterministically, run repository validation, and compare protected paths to the implementation baseline. Rollback consists of reverting the audit-only change; no consumer migration is required.
