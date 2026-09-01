## Context

See `proposal.md`. The current ledger contains 142 fail-safe `unresolved` records: 110 standalone components and 32 component sets. The repository already has a generated icon manifest with source provenance, component-family audit manifests, composition census reports, and a deterministic coverage generator. These are evidence inputs; none independently authorizes a stronger claim.

## Goals / Non-Goals

**Goals:**

- Turn the initial conservative ledger into a reviewed classification layer using only committed evidence.
- Separate existing implementation, supporting evidence, deliberate ownership exclusions, and genuine reusable gaps.
- Keep every decision reproducible and reviewable at the source-record identity level.

**Non-Goals:**

- Create missing runtime components or broaden existing public APIs.
- Infer behavior, accessibility, or responsive rules from static SVGs.
- Treat a source screen, archive, or nested component as a reusable API by default.
- Change source extraction output or resolve upstream Figma/export defects.

## Decisions

### 1. Classify by evidence cohorts, then retain record-level authored decisions

Records will be reviewed in bounded cohorts: normalized glyphs/file types, nested or legacy evidence surfaces, application-owned compositions, and reusable component candidates. The result remains one authored ledger entry per record; no name-based runtime heuristic is added to generation.

This uses shared evidence patterns without hiding semantic judgment. Automatically classifying by name or archive was rejected because duplicate names and application compositions are common.

### 2. Use normalization provenance as the icon join

Standalone glyphs and file-type variants will join through the committed normalized icon manifest/analysis and generator evidence, not filename similarity. A canonical output path is production evidence; icon source/generation tests and the browser icon catalog provide independent evidence.

Adding a second icon mapping inventory was rejected because it would compete with existing normalization provenance.

### 3. Use component audits to prove ownership boundaries

Existing component and wave manifests will support `evidence-only` and `intentionally-excluded` decisions. An exclusion must name the application/consumer ownership boundary and cite a census or audit that established it. A nested primitive is evidence-only only when its relationship to an audited family is explicit.

Broadly excluding all Interface Elements was rejected: some records may represent reusable primitives and must remain unresolved until separately designed.

### 4. Keep genuine component sets unresolved

Component sets such as Icon Button or Input Number remain unresolved when the library lacks an independent audited family or direct evidence. Existing visual similarity to Button/Input is insufficient. The final report will list these candidates and their variant counts as the next product backlog.

### 5. Strengthen validation only where the classification needs a general invariant

Focused tests will assert exact cohort outcomes, compatible totals, deterministic generation, valid repository evidence, and source immutability. Generator changes are limited to reusable contract enforcement or reporting needed by the spec; record decisions remain data.

### 6. Preserve compatibility and source authority

Only audit artifacts, planning artifacts, and focused audit tooling/tests may change. Runtime packages and package exports remain byte-for-byte outside the episode diff. The source directory is read-only and checked before and after generation.

## Risks / Trade-offs

- [Existing evidence is coarse for some nested records] → Keep those records unresolved instead of generalizing a family-level claim.
- [Large authored ledger diff is difficult to review] → Group decisions by evidence cohort, use deterministic ordering, and generate a compact cohort/backlog report with exact counts.
- [An exclusion could conceal a future reusable primitive] → Exclude only proven application compositions; leave ambiguous primitives unresolved.
- [Icon provenance may not expose every indexed identity directly] → Extend focused provenance validation only if the existing committed analysis contains the identity; otherwise keep the glyph unresolved.
- [Metrics can look better without product progress] → Report disposition movement explicitly and never describe classification as new implementation.

## Migration Plan

1. Add focused failing assertions for evidence cohorts and final backlog reporting.
2. Update authored decisions using existing provenance and audit evidence.
3. Regenerate and validate the matrix, exact totals, source hashes, and unchanged runtime surface.
4. Document the resulting metrics, limitations, and reusable candidates.
5. Rollback restores the previous ledger and generated matrix; no consumer migration is required.
