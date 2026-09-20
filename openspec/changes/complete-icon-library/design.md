## Context

See `proposal.md` for motivation and `specs/foundations/icon-library/spec.md` for the observable contract. The current normalizer walks only the extracted Basic Elements icon directory and emits 119 canonical logical icons. `Icons.svg` is authoritative but monolithic; historical extraction evidence identifies 104 core candidates plus file-type records, including two different candidates that were both written as `core/calendar.svg`. Existing compatibility analysis deliberately avoided unverified substitutions. Showcase consumes the production manifest but wraps the catalog in an unlinked `<details>` after the component section, while its lazy shell navigation has no Icons entry.

The source directory is read-only. Existing package names and geometry are public compatibility surfaces. Recovered semantic labels from historical extraction are evidence with varying confidence, not automatically canonical truth.

## Goals / Non-Goals

**Goals:**

- Use one deterministic normalized corpus as the only production generation input while incorporating both authoritative source families.
- Produce an exhaustive candidate ledger that distinguishes emitted glyphs, exact deduplications, semantic collisions, and uncertain names.
- Keep the extension additive for existing consumers.
- Make catalog navigation work in both the lazy published shell and full Showcase mode.
- Validate geometry, paint, runtime rendering, focused visual fidelity, consumer integration, and built-site discoverability.

**Non-Goals:**

- Editing or regenerating anything under `shlz-design-source/`.
- Treating historical extracted assets as higher authority than `Icons.svg`.
- Guessing application-specific icon meaning or accessible labels.
- Adding a framework-specific icon component.
- Changing GitHub Pages workflows, domains, or release policy.

## Decisions

### 1. Extend normalization; keep generation single-source

The normalization stage will extract and classify `Icons.svg` candidates using the authoritative source plus its source-ID mapping, then merge those records with Basic Elements into `packages/icons/normalized/`. `tools/generate.mjs` will continue to consume only normalized artifacts.

This preserves the existing deep seam—source interpretation before production generation—and avoids teaching package generation about two incompatible source formats. Reading historical derivative SVGs directly was rejected because they contain the calendar overwrite and are lower authority.

### 2. Use an explicit disposition ledger

Every `Icons.svg` candidate will receive a disposition: new canonical glyph, exact duplicate of an existing glyph, or distinct collision requiring a qualified name. Geometry fingerprints may propose exact matches, but deduplication must also preserve viewBox/topology and paint behavior. The analysis output will retain source IDs and the selected disposition.

A name-only or visually approximate match is never enough to alias or deduplicate. This continues the conservative policy in `docs/icon-methodology.md` and makes “all icons” measurable without requiring every source record to become a redundant public name.

### 3. Preserve existing canonical ownership

Existing canonical names, variant names, aliases, files, sprite symbols, geometry hashes, and paint policies remain fixed. New non-equivalent collisions use qualified names derived from source category when the category is reliable (`calendar-sidebar`, `calendar-interface`). When semantics remain weak, the name remains explicitly uncertain.

Replacing old geometry with an `Icons.svg` candidate was rejected because it would be a breaking visual change. Automatically publishing all historical names as aliases was rejected because the existing audit found many unconfirmed mappings.

### 4. Preserve paint after candidate-level classification

Monochrome candidates normalize to `currentColor`; semantic or multicolor candidates preserve source paint. Definitions and scoped references are retained. Candidate extraction and normalization will be covered by element-level geometry/paint checks rather than relying on screenshots alone.

### 5. Make Icons a shell-owned Showcase destination

The shared navigation data gains `['icons', 'Icons']` under Foundations. The catalog section itself owns `id="icons"` and is rendered visibly from the production manifest. It will no longer be nested inside an anonymous disclosure. Lazy navigation will therefore load the documentation module and resolve the normal hash target, while `?full=1#icons` continues to work.

The catalog remains generated from the package manifest rather than a parallel Showcase list. A separate page was rejected because it would duplicate the lazy shell and navigation contracts for a single foundation destination.

### 6. Evidence is layered

- Source integrity: immutable hashes and complete source-ID/candidate accounting.
- Structural contract: stable old records plus exhaustive new manifest/export/sprite/runtime coverage.
- Browser runtime: every canonical symbol resolves to non-empty painted geometry.
- Focused visual: representative old/new, currentColor/preserved-paint, collision, and both-calendar snapshots.
- Consumer integration: plain HTML and Showcase use published package surfaces.
- Published-build contract: production build contains the `#icons` navigation target and catalog count; deployment automation itself is unchanged.

## Risks / Trade-offs

- **[Recovered source labels are not guaranteed Figma component names]** → retain confidence/uncertainty metadata and prefer category-qualified names only where extraction evidence is explicit.
- **[False deduplication could hide a meaningful variant]** → require exact geometry plus compatible viewBox and paint policy; otherwise emit a distinct record.
- **[Expanded sprite and manifest increase package size]** → accept the bounded additive cost for complete authoritative coverage and report before/after artifact sizes.
- **[Monolithic source extraction can be brittle]** → bind candidates to source IDs and immutable source hashes, with failure on missing/duplicate/unaccounted IDs.
- **[Showcase catalog may be large]** → keep one generated catalog grouped by category; avoid duplicating icons in navigation or eagerly introducing a new client-side filtering subsystem.

## Migration Plan

1. Record the current 119 canonical records, 125 variants, aliases, geometry hashes, and paint policies as a compatibility baseline.
2. Add deterministic `Icons.svg` candidate extraction and disposition analysis without changing production output.
3. Generate the merged normalized corpus and update production outputs only after full candidate accounting passes.
4. Update Showcase navigation/catalog and consumer fixtures.
5. Validate source integrity, compatibility, runtime rendering, visual evidence, build output, and package artifact size.
6. Deliver through an unmerged PR. Rollback is a normal revert because the change is additive and does not alter source material or deployment state.
