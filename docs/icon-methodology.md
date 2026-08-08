# Icon methodology

The package is reproducibly generated from the read-only extracted icon assets and manifest, with `raw/svg/Icons.svg` as authority.

- Core monochrome paints are normalized to `currentColor`.
- File-type icons preserve embedded colors.
- Every manifest item carries category, source IDs, source file, confidence, color mode, and provenance.
- Individual SVGs, a combined sprite, runtime name list, and TypeScript `IconName` union are emitted.
- Similar shapes are retained. No fuzzy visual deduplication is performed.

## Collision audit

The source manifest has 125 entries: 104 core candidates and 21 file types. Two distinct candidates were named `calendar`; the earlier extraction physically overwrote one output. This iteration assigns the second stable name `calendar-interface-2-uncertain` and records the uncertainty instead of claiming a semantic distinction. Both manifest records remain visible, but the lost derivative geometry cannot be proven distinct without a fresh, non-mutating extraction from `Icons.svg`. That recovery is a priority for iteration two.

Exact path repetition data is not used for automatic deletion because it also contains outlined glyphs and incidental repetitions.
