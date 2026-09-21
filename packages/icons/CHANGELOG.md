# @shlz/icons

## 0.2.0

### Minor Changes

- ef79e73: Publish the complete source-backed icon corpus, including distinct
  `calendar-sidebar` and `calendar-interface` glyphs, through the existing SVG,
  sprite, runtime, and type surfaces. Existing canonical names, aliases,
  geometry, and paint behavior remain unchanged; consumers do not need to
  migrate.

### Patch Changes

- 45a99e7: Restore transparent fills for outlined icons normalized from `Icons.svg` so
  sprite consumers render their source-backed strokes instead of solid shapes.
- 1864b3c: Preserve authoritative SVG layer order for composite icons so consumers see
  badges and foreground details instead of geometry obscured by later layers.
- b43bf1d: Add private corporate GitLab release metadata and a governed fixed-version release pipeline. Runtime package interfaces are unchanged.

## 0.1.0

- Initial framework-neutral icon package baseline.
