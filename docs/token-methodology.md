# Token methodology

`packages/tokens/tokens.json` is the only authored token value source. `tools/generate.mjs` resolves aliases and emits CSS, JSON and TypeScript-compatible output. Provenance remains separate because confidence is metadata, not a runtime value.

## Authority and layers

Specialized Figma specification sheets outrank statistical inference from generic screens. The runtime model has exactly two authored layers:

1. `source.*` — **FACT**: literal Figma grouping, naming and values. `Colors.svg` therefore remains `Dark Blue`, `Blue`, `Gray`, `White`, `Background`, and the source-spelled `Aditional`; it is not rewritten as brand/neutral scales.
2. `semantic.*` — **DERIVED** or **DECISION** aliases. Color roles reference `source.color.*`; they never duplicate literal paints.

## Exact source scales

- Spacing (**FACT**, `Spacing.svg`): `4, 8, 16, 24, 32, 40, 48, 56, 64px`.
- Corner radius (**FACT**, human-verified corner-radius specification): `Min 8px`, `Regular 12px`, `Medium 16px`, `Large 48px`, `Max 100px`.

The previous `12px` and `20px` spacing steps were derived from generic geometry and are not source tokens. The previous `6px` radius is used only where a component sheet explicitly contains that geometry. `999px` was an engineering pill technique, not a Figma value; source `Max 100px` replaces it.

## Exact source palette

The spelling and grouping below are preserved from `Colors.svg`, including `Aditional`.

| Figma group | Literal source entries                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dark Blue   | `Dark blue #0B1623`; `Dark blue 50%`; `Dark blue 25%`; `Dark blue 10%`                                                                                                                                                                                                                                                                                             |
| Blue        | `Blue 300 #162773`; `Blue 200 #253D98`; `Blue 200 15%`; `Blue 100 #DFE2F0`; `Blue 50 #EEF0F4`                                                                                                                                                                                                                                                                      |
| Gray        | `Gray 200 #939CA5`; `Gray 100 #D1D8DF`; `Gray 75 #E0E0E0`; `Gray 50 #F5F5F5`                                                                                                                                                                                                                                                                                       |
| White       | `White #FFFFFF`; `White 15%`; `White 10%`                                                                                                                                                                                                                                                                                                                          |
| Background  | `Primary #F4F6F9`; `Filter #EEF0F4`; `Secondary #DFE2F0`                                                                                                                                                                                                                                                                                                           |
| Aditional   | `Red 100 #CC1F1F`; `Red 100 15%`; `Red 50 #FBD5D5`; `Bright green #25983E`; `Bright green 15%`; `Green #57965C`; `Green 15%`; `Brown #9B7E46`; `Brown 15%`; `Orange #D47E2E`; `Orange 15%`; `Blue #245B99`; `Blue 15%`; `Bright blue #3D88DE`; `Bright blue 15%`; `Turquoise #4191B3`; `Turquoise 15%`; `Violet #8131A7`; `Violet 15%`; `Pink #A942A7`; `Pink 15%` |

Opacity-labelled entries are stored as explicit `rgb(... / n%)` source values, not as independently inferred opacity tokens.

Component sizes such as 26/32/40px button heights, 12px internal padding, 6px checkbox/segment corners and component shadows remain local facts with provenance comments. They are not promoted merely because CSS needs them.

## Typography

The exact family, weight and type scale remain **UNKNOWN** because most Figma text is outlined. Browser-default serif is not acceptable. `semantic.font.family` is an explicit **DECISION**:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

The scoped foundation and showcase both consume this alias. A future verified font source may replace the decision without changing component contracts.

## Exclusions

Incidental card widths, canvas dimensions, outlined glyph geometry, floating-point export artifacts, screen-layout measurements and isolated effects are not canonical tokens. Shadows remain component-specific until a specialized source or repeated semantic pattern proves a shared system token.
