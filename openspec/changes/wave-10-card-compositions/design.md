## Context

See `proposal.md` for motivation. The inventory records Card compositions as source-only with three authoritative SVGs and zero known implementation, fixture, consumer, diagnostic, substitute, or alternative surfaces. Unlike Wave 9, there is no runtime composition to reconcile; the principal engineering risk is either inventing a component from static frames or accepting absence without a reproducible census.

## Goals / Non-Goals

**Goals:**

- Establish separate source ledgers for Card with button, Reports card, and Cover while keeping one inventory-family disposition.
- Prove repository-wide absence with stable structural signatures and mutation-sensitive tests.
- Represent every evidence level honestly, including precise `not-applicable` reasons for runtime-only levels.
- Make future introduction of a real Card composition force explicit classification and contract reconsideration.

**Non-Goals:**

- No reusable Card primitive, package export, runtime fixture, Showcase gallery, consumer, or application data model.
- No click, link, loading, media, responsive, accessibility, or lifecycle semantics inferred from static artwork.
- No re-certification of Button, icon, typography, or other verified nested primitives and no design-source mutation.

## Decisions

### 1. Verify a source-only absence disposition

The family remains `implementation_status: source-only` while its audit status may become `VERIFIED`. This keeps implementation and evidence status independent. Adding a decorative implementation solely to make browser evidence applicable was rejected because it would manufacture a public/runtime contract unsupported by the sources.

### 2. Use one manifest with three independent source ledgers

One `card-compositions.json` matches the roadmap family, but source claims and represented variants remain attributable to their exact SVG. Combining the exports into one generic visual grammar was rejected because shared geometry can be incidental Figma composition rather than a reusable token or API.

### 3. Make absence structural and semantic

A focused Node test will scan implementation, application, documentation, test, and export surfaces for bounded card/cover signatures and classify known terminology collisions such as the Showcase icon inventory. It will also verify a synthetic matching surface is rejected. A simple grep count was rejected because generic words such as “card” and HTML classes unrelated to the source family create false positives.

### 4. Lock source integrity and critical facts without snapshotting runtime

The focused test will bind the three hashes and source-critical sheet/shape facts that support the manifest ledger. Browser and visual snapshots are explicitly not applicable because no executable root exists. Rendering the raw SVG itself in Playwright was rejected: it proves the source file can display, not that a component implementation exists.

### 5. Preserve exact evidence boundaries

The manifest will use empty occurrence, interaction, browser-test, and snapshot ledgers. Source integrity and structural contract pass; runtime, accessibility, focused visual, consumer, responsive/content stress, and interaction types receive concrete source-only `not-applicable` explanations. This prevents a green structural test from being presented as runtime evidence.

## Risks / Trade-offs

- **A future implementation could evade a narrow signature scan** → Scan all relevant repository text surfaces with multiple source-bound semantic signatures and keep the inventory/manual census explicit; new audit files also undergo schema and diff review.
- **Generic “card” terminology creates false positives** → Classify unrelated icon-card and prose occurrences by path and purpose rather than weakening the family boundary.
- **SVG paths outline text and obscure literal content** → Claim only directly inspectable geometry/paint/image facts and label higher-level interpretation as derived or unknown.
- **A verified absence can be misunderstood as production readiness** → Keep `implementation_status: source-only`, state limitations in manifest/inventory/report, and prohibit any reusable API claim.

## Migration Plan

This is an additive audit with no runtime migration. Rollback removes the Wave 10 audit artifacts/tests and restores the inventory row; the authoritative source and all package/application behavior remain unchanged.
