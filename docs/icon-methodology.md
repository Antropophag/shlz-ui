# Icon methodology

`packages/icons/normalized/manifest.json` and its normalized SVG files are the only production input for icons. They are generated from two read-only authoritative Figma exports: `shlz-design-source/raw/svg/UI Kit – Basic elements/icons/` and `shlz-design-source/raw/svg/Icons.svg`; raw remains the authority.

`tools/generate.mjs` copies normalized SVG bytes without a second paint or geometry transform. The normalized layer has already classified monochrome icons (`currentColor`) and semantic/multicolor icons (preserved paints). Production emits individual SVGs, logical manifest records with variants, a sprite, runtime name lists and TypeScript name unions.

The framework-agnostic `.shlz-icon` host gives standalone monochrome icons the
semantic `text-primary` foreground observed in the authoritative interface
exports. Component-owned slots set `color: inherit`, and custom consumers can
use `.shlz-icon--inherit`, so Button, field, menu, feedback and other component
states remain the source of their icon foreground. Preserved-paint assets stay
external images and are not recolored by this contract.

The production manifest contains 244 canonical logical icons and 250 emitted variants. The original 119 canonical icons and 125 variants remain an immutable compatibility subset. Categories come directly from the normalized manifest. Compatibility aliases are explicit in `packages/icons/compatibility-aliases.json`; they point to emitted normalized variants and are never counted as canonical icons.

## Icons.svg sheet normalization

`tools/normalize-icons-sheet.mjs` runs after Basic Elements normalization. The historical manifest is used only to recover candidate grouping, category, semantic-name confidence and crop localization. Each selected `path` or `rect` is matched uniquely back to byte geometry in the authoritative raw sheet before it can be emitted; derived SVG geometry is never copied into production.

The sheet census contains 125 candidates (104 core and 21 file-type) referencing 302 unique primitives. A frozen independent census digest detects changes to the derivative grouping ledger, while each referenced primitive is uniquely matched back to raw `Icons.svg`. Every candidate has one explicit disposition in `packages/icons/normalized/icons-sheet-analysis.json`: 62 new canonical glyphs and 63 qualified name/geometry collisions. Potential compatibility targets are deduplicated only when topology, viewBox, and paint policy all match; none currently pass all three checks. The two historically colliding calendars are independently emitted as `calendar-sidebar` (`path41`) and `calendar-interface` (`path83`, `path80`, `path82`, `path81`).

Recovered labels are not promoted beyond their evidence. Each sheet-derived manifest record keeps its source IDs and semantic-name confidence; non-equivalent collisions never replace existing geometry.

## Migration boundary

The former pipeline (`shlz-design-source/assets/icon-manifest.json` and `shlz-design-source/assets/{icons,file-types}`) is retained as historical derived evidence. Normalization reads its manifest and crop transforms only as candidate-localization metadata, then proves every primitive against raw `Icons.svg`. `@shlz/icons` production generation still reads only `packages/icons/normalized/`. No fuzzy name mapping is performed.

Coverage analysis found 46 source/geometry-confirmed old-to-new mappings. Forty-two renamed public names are retained as explicit aliases. Same-name confirmed mappings need no alias. Seventy-nine old emitted records remain conservative breaking candidates because a correspondence was not sufficiently evidenced.

Known collisions are deliberately not aliased:

- old editor `align-left` corresponds visually to canonical `align-left-editor`, while the normalized corpus already owns `align-left` for another glyph;
- old file-type `file` corresponds to `file-generic`, while normalized canonical `file` is an editor glyph;
- misleading or uncertain pairs such as `sort → icon-20-uncertain`, `flag-outline → flagq-uncertain` and `menu → list` remain migration issues rather than silent substitutions.

The old recovered calendar collision is resolved additively: neither candidate replaces an existing glyph, and both raw geometries are public under category-qualified names.

## Consumer contract

- `canonicalIconNames` contains only normalized logical names.
- `compatibilityAliases` exposes migration metadata separately.
- `iconNames` is the compatibility union.
- `resolveIconName()` resolves an old alias to its canonical logical name.
- Alias individual SVGs and sprite symbols contain the target normalized SVG geometry, never the legacy asset.
