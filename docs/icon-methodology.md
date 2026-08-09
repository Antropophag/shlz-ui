# Icon methodology

`packages/icons/normalized/manifest.json` and its normalized SVG files are the only production input for Basic Elements icons. They are generated from the read-only Figma export under `shlz-design-source/raw/svg/UI Kit – Basic elements/icons/`; raw remains the authority.

`tools/generate.mjs` copies normalized SVG bytes without a second paint or geometry transform. The normalized layer has already classified monochrome icons (`currentColor`) and semantic/multicolor icons (preserved paints). Production emits individual SVGs, logical manifest records with variants, a sprite, runtime name lists and TypeScript name unions.

The production manifest contains 119 canonical logical icons and 125 emitted variants. Categories come directly from the normalized manifest. Compatibility aliases are explicit in `packages/icons/compatibility-aliases.json`; they point to emitted normalized variants and are never counted as canonical icons.

## Migration boundary

The former pipeline (`shlz-design-source/assets/icon-manifest.json` and `shlz-design-source/assets/{icons,file-types}`) is retained as historical derived evidence, but `@shlz/icons` no longer reads it. No fuzzy name mapping is performed.

Coverage analysis found 46 source/geometry-confirmed old-to-new mappings. Forty-two renamed public names are retained as explicit aliases. Same-name confirmed mappings need no alias. Seventy-nine old emitted records remain conservative breaking candidates because a correspondence was not sufficiently evidenced.

Known collisions are deliberately not aliased:

- old editor `align-left` corresponds visually to canonical `align-left-editor`, while the normalized corpus already owns `align-left` for another glyph;
- old file-type `file` corresponds to `file-generic`, while normalized canonical `file` is an editor glyph;
- misleading or uncertain pairs such as `sort → icon-20-uncertain`, `flag-outline → flagq-uncertain` and `menu → list` remain migration issues rather than silent substitutions.

The old recovered calendar collision is not carried into production because neither old calendar geometry has a confirmed normalized-corpus mapping.

## Consumer contract

- `canonicalIconNames` contains only normalized logical names.
- `compatibilityAliases` exposes migration metadata separately.
- `iconNames` is the compatibility union.
- `resolveIconName()` resolves an old alias to its canonical logical name.
- Alias individual SVGs and sprite symbols contain the target normalized SVG geometry, never the legacy asset.
