## Context

See `proposal.md` for motivation and the delta spec for acceptance behavior. The inventory records this family as composition-only with partial structural/runtime/stress evidence inherited from File Row and Document Row, one Showcase content-state consumer, and gaps at accessibility, focused visual, and consumer integration. The central risk is confusing primitive coverage with evidence for the enclosing source compositions.

## Goals / Non-Goals

**Goals:**

- Establish independent source ledgers for both SVGs and all six named composition variants.
- Build a reproducible repository census that distinguishes enclosing compositions, primitive-only occurrences, and terminology collisions.
- Preserve exact evidence boundaries and make a future higher-level implementation force reclassification.
- Reconcile the family independently without changing Wave 5 primitive status.

**Non-Goals:**

- No new upload component, package export, interaction controller, transport, persistence, form integration, or application data model.
- No inferred drag/drop, selection, progress, retry, preview, removal, responsive, or accessibility behavior.
- No re-certification of File Row, Document Row, icons, typography, or other nested primitives and no design-source mutation.

## Decisions

### 1. Use one family manifest with per-source and per-variant ledgers

One `upload-document-compositions.json` matches the roadmap family, while source facts and primitive boundaries remain attributable to the exact SVG and named variant. Treating all document-shaped frames as one generic Upload component was rejected because the exports include application composition and incidental layout geometry.

### 2. Treat existing rows as dependencies, never occurrence proxies

The census will separately enumerate higher-level roots and known File Row / Document Row surfaces. Existing primitive tests can guard regressions but cannot satisfy the enclosing family evidence levels. Reusing their occurrence counts as Wave 11 counts was rejected because it would combine independent completion statuses.

### 3. Make census evidence structural, bounded, and mutation-sensitive

A focused Node test will scan implementation, export, application, documentation, and test surfaces for source-bound composition signatures, classify known primitive-only surfaces and terminology collisions, and prove a synthetic matching surface fails. An unconstrained grep was rejected because “document,” “file,” “upload,” and “drag” have broad tooling and prose meanings.

### 4. Add runtime or visual evidence only for a real enclosing composition

The current Showcase content-state surface will be inspected and classified by what it actually renders. If it contains only verified row primitives, higher-level runtime, accessibility, focused-visual, consumer, and responsive evidence will be `not-applicable` with precise absence reasons. Rendering raw SVGs in Playwright was rejected because it proves source display rather than a design-system implementation.

### 5. Keep audit and product-wave outcomes separate

The route uses bounded evidence execution with no expected production delta. A `VERIFIED` audit disposition may close the evidence family but MUST NOT claim a production Wave 11 delivery or authorize Wave 12 as product work.

## Risks / Trade-offs

- **A future implementation evades narrow signatures** → Scan all relevant text surfaces with multiple source-bound terms and enforce synthetic mutation coverage.
- **Generic document/upload terminology creates false positives** → Classify paths and structure rather than weakening the family boundary.
- **Outlined SVG text limits literal content claims** → Claim inspectable geometry/paint/group boundaries and label interpretation explicitly.
- **Primitive runtime evidence is mistaken for composition evidence** → Maintain separate occurrence/evidence ledgers and explicit limitations in manifest, inventory, and report.

## Migration Plan

This is an additive audit with no runtime migration. Rollback removes Wave 11 audit artifacts/tests and restores the inventory row; authoritative sources and package/application behavior remain unchanged.
