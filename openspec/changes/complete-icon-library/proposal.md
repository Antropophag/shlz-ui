## Why

The published icon package and Showcase currently represent only the normalized Basic Elements corpus even though `shlz-design-source/raw/svg/Icons.svg` is also an authoritative icon source. This omits distinct glyphs—including two different calendar icons—and leaves the existing catalog hidden from Showcase navigation.

## What Changes

- Extend the normalized icon pipeline to account for every distinct glyph candidate from `Icons.svg` as well as the existing Basic Elements corpus.
- Preserve all existing canonical names, aliases, files, sprite symbols, and runtime behavior; exact duplicates may share one canonical glyph, while geometry or semantic collisions receive explicit stable names.
- Publish both calendar glyphs as distinct canonical icons, named `calendar-sidebar` and `calendar-interface`.
- Retain source paths, source identifiers, category, geometry, paint policy, and uncertainty in machine-readable provenance so coverage can be audited without modifying the source material.
- Add source-integrity, full-coverage, collision, package-export, sprite, runtime-browser, and focused visual evidence for the expanded corpus.
- Make Icons a first-class Showcase navigation destination with a direct `#icons` target, search discoverability, and a visible complete catalog rather than an unlinked nested disclosure.
- Verify the production build used by GitHub Pages without changing deployment or release semantics.
- Non-goals: editing `shlz-design-source/`, inventing missing semantics, silently replacing existing glyph geometry, changing consumer-owned accessible labels, or redesigning GitHub Pages deployment.

## Capabilities

### New Capabilities

- `foundations/icon-library`: Defines authoritative multi-source icon coverage, compatibility-safe canonicalization, provenance, exports, and Showcase catalog discoverability.

### Modified Capabilities

None.

## Impact

- Affected public package: `@shlz/icons` manifest, individual SVG exports, sprite symbols, runtime name/type unions, and compatibility metadata.
- Affected tooling: icon analysis/normalization and generation tests.
- Affected consumer: Showcase navigation and icon catalog; plain HTML/package consumers receive additive icon names.
- Compatibility: additive only. Existing canonical names and aliases remain valid and retain their current targets and geometry.
- Dependencies: authoritative `Icons.svg`, its source-map/extraction evidence, and the existing Basic Elements normalization contract.
- Risks: semantic misnaming, accidental geometry replacement, false duplicate merging, paint loss, and an incomplete catalog. These require explicit collision policy and executable source-to-production coverage.
