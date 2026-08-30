# Wave 10 card compositions implementation

- Implementation baseline: `2ead5a0d45379d643d369297f45dbe1c7722a49c` on `feature/implement-wave-10-card-components`.
- Pull request: #56, targeting `main`.
- Raw authority hashes remain locked by `tools/tests/wave10-card-compositions-source-census.test.mjs`.
- `shlz-design-source/` remains read-only and unchanged.

## Implemented contracts

Wave 10 now exposes three independent, framework-agnostic CSS compositions rather than a generic Card abstraction:

- Card with action: semantic content, optional decorative visual and a nested native Button or Link; source-size `314×230` plus a fluid variant.
- Report card: eyebrow, title, value, metadata, optional native Link and trailing decoration; white and muted source materials at `314×230` plus a fluid variant.
- Cover: semantic eyebrow, title, description and metadata; source-size `874×400` plus a content-growing fluid variant.

The source SVGs establish geometry and paint, but not literal copy, application data, navigation, loading, responsive behavior, or a shared Card API. Those boundaries remain explicit repository decisions in the component documentation.

## Repository census

The executable inventory contains exactly eight roots: two Card with action fixtures, three Report card fixtures, one live Data Workspace Report card consumer, and two Cover fixtures. All roots are classified in independent component manifests. There are no inert diagnostics, legacy/native substitutes, or local alternatives for these three compositions.

The presentational roots own no keyboard or event controller. Interactive semantics remain with nested native Button and Link primitives. The Data Workspace summary is the real-consumer proof for Report card; Card with action and Cover intentionally claim no application lifecycle.

## Evidence

Focused Chromium coverage checks the repository occurrence census, non-interactive roots, source-size geometry, white/muted report materials, component-local screenshots, narrow long-content containment, and the Data Workspace consumer. Seven component-local Chromium snapshots are tracked beside the focused specification and were inspected at source and narrow widths.

Local validation passed with these exact results:

- Node test suite: 175/175 passed.
- Full Playwright suite: 260/260 passed across Chromium, Firefox, and WebKit.
- Focused Wave 10 Chromium suite: 4/4 passed.
- Lint, production build, SVG/token/icon validation, package packing, and strict OpenSpec validation passed.
- The authoritative Wave 10 SVG hashes passed, and `shlz-design-source/` had no diff.

The only build observation is the repository's pre-existing large-chunk warning; it is not introduced or worsened by these CSS compositions. Independent review, CI, route conformance, delivery receipt, and unresolved review-thread state are recorded at delivery time. The component manifests remain the machine-readable completion evidence for each independent component.
