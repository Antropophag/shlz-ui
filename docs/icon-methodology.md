# Icon methodology

The package is reproducibly generated from the read-only extracted icon assets and manifest, with `raw/svg/Icons.svg` as authority.

- Core monochrome paints are normalized to `currentColor`.
- File-type icons preserve embedded colors.
- Every manifest item carries category, source IDs, source file, confidence, color mode, and provenance.
- Individual SVGs, a combined sprite, runtime name list, and TypeScript `IconName` union are emitted.
- Similar shapes are retained. No fuzzy visual deduplication is performed.

## Collision audit

The source manifest has 125 entries: 104 core candidates and 21 file types. Two distinct candidates were named `calendar`; the earlier extraction physically retained only the `interface-2` output. Iteration two recovered the other exact path from the sidebar section of `raw/svg/Icons.svg` (`path41`) without changing the source tree.

- `calendar` keeps the retained interface geometry and existing public name.
- `calendar-sidebar-uncertain` contains the distinct recovered geometry.
- `sidebar` is a confirmed source category; a more specific semantic meaning is UNKNOWN.
- Generated provenance records the raw sheet, source id and recovery translation; a regression test requires two distinct geometries.

Exact path repetition data is not used for automatic deletion because it also contains outlined glyphs and incidental repetitions.
