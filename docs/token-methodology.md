# Token methodology

`packages/tokens/tokens.json` is the only authored token value source. `tools/generate.mjs` resolves aliases and emits CSS and distributable JSON; TypeScript consumes the same generated JSON. Provenance is maintained separately because confidence is metadata, not a runtime value.

## Canonical scope

- **FACT:** exact recurring paints and 32/40 px control heights verified in raw component sheets.
- **DERIVED:** a conservative 4 px spacing family, repeated corner families, semantic roles inferred from placement, the common surface shadow, and border roles.
- **DECISION:** stable token names, CSS pill radius, and low-impact semantic aliases.
- **UNKNOWN:** font family, weight, line-height, letter-spacing, complete type scale, and authoritative disabled/overlay semantics.

The scale deliberately excludes incidental card widths, canvas dimensions, outlined glyph geometry, 2.5 px calendar-grid fragments, and Figma floating-point artifacts such as `32.0002`.

The shadow maps the repeated filter sequence to CSS: offset-y 1 px, Gaussian deviation 1.5 (CSS blur radius 3 px), and `#253D98` at 5%. Gradients are not canonical because the evidence is mostly screen-specific fades and illustrations.
