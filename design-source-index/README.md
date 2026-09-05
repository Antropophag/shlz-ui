# SHLZ design source index

This directory is a generated, read-only index **of** the design corpus. It is not a replacement for the corpus and contains no frontend implementation.

## Authority

Original Figma exports under `shlz-design-source/raw/svg/` are the primary source of truth. The two ZIP archives are read directly by the generator and are never unpacked into or rewritten under `shlz-design-source/`. Other extraction files are derived evidence. Existing portals are not design authorities.

## Recovered coverage

- 69 component sets, 126 standalone components and 630 variants from both UI Kit pages.
- 40 explicitly named colors, 9 explicit spacing values and 5 human-verified corner-radius values.
- 36 merged factual typography signatures from 2193 Figma TEXT nodes; 18 opaque referenced text-style IDs are cataloged.
- 119 normalized logical icons; 97 support `currentColor`, while 22 preserve semantic or multicolor paints.
- 34 large reference sheets (24 classified as Service Desk references).

## Reliability

Use `foundations.json#canonical` for literal foundation facts. Values observed only in component geometry are under `observed` and must not be promoted to tokens without additional evidence. Component records preserve Figma node IDs, hierarchy paths, dimensions, variant properties, warnings and archive paths.

Typography is now read directly from Figma Plugin API exports rather than inferred from outlined SVG glyphs. Golos Text is supported as the primary product family by concrete Interface elements paths, while documentation, embedded assets, foreign/legacy families and local outliers remain separate observations. Not all 29 Basic or 19 Interface signatures are production typography: covers, specification-page headings, file glyph labels and imported component fonts are retained but classified outside product candidates. No semantic names such as `body-sm` or `heading-lg` are invented.

No specialized named effects specification was found, so SVG filters remain observed evidence. Static SVGs do not establish interaction behavior.

## Known limitations

The extraction reports 9 errors, 35 warnings and 47 skipped instances. All nine errors concern invisible `Spacing` variant SVG exports; their variant metadata and the full `Spacing.svg` remain available. Repeated names are reported as ambiguity, never automatically merged.

Before this corpus can safely drive a portal transfer, typography observations still need an explicit future engineering mapping, named effects need an authoritative source specification, ambiguous duplicate names need design-owner review, and runtime/accessibility/responsive contracts must be engineered separately from the static exports. Large Service Desk screens are useful validation references, but they are not promoted to component or token authority.

## Regeneration

Run:

```sh
node tools/generate-design-source-index.mjs
```

The command reads ZIP entries through the repository's JavaScript reader after `npm ci` and writes only to `design-source-index/`; no system `unzip` utility is required.
