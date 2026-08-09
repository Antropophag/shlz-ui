# Foundation reconciliation

This document records the narrow reconciliation after the first source-driven
component migration wave. It does not define a redesigned token taxonomy.

## Typography

### Source facts

Two direct Figma Plugin API exports are independently available:

| Page                        | Text nodes | Unique signatures | Referenced styles | Mixed nodes |
| --------------------------- | ---------: | ----------------: | ----------------: | ----------: |
| UI Kit – Basic elements     |      1,480 |                29 |                14 |           0 |
| UI Kit – Interface elements |        713 |                19 |                11 |          15 |

Across the pages there are 36 merged signatures and 12 cross-page signatures.
Golos Text accounts for 2,119 observations in Regular, Medium and SemiBold.
Concrete product candidates use sizes 12, 14, 15, 16, 20, 24, 28 and 32px;
line height is usually 130%, with confirmed 12/18, 14/20 and 16/20px
exceptions; tracking is usually -1%, with confirmed 0% and -1.5% patterns.
These values are **FACT**, but their classification as product candidates is a
source-context derivation rather than a Figma token taxonomy.

### Production model

The only global typography primitive is the family stack:

`"Golos Text", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Selecting Golos Text is source-backed. Ordering the fallback stack is a
**DECISION**. No distributable font files, font package, `@font-face`, or other
font delivery declaration exists in this repository, so the library does not
claim to provide the font. A consumer that legally provides Golos Text gets the
source family; other consumers get an explicit system sans fallback.

There is deliberately no Display/H1/H2/Body/Caption scale. Production
components retain only their component-supported metrics (for example form
controls use 14/18px). Authoritative semantic typography names are **UNKNOWN**.

### Legacy and ambiguous evidence

- Roboto, Suisse Intl and SF Pro Display are **LEGACY** foreign/older artifacts.
- Inter is **LEGACY** for production-model purposes and belongs to embedded
  asset typography.
- UI Kit covers and specification headings are documentation/showcase evidence,
  not product primitives.
- One local override is retained in diagnostics as an outlier.
- Mixed text segments are factual inventory, but do not establish global tokens.

The exhaustive classified evidence remains in
`design-source-index/typography.json`.

## Component geometry

These are family-local **FACTS**, not a universal `sm/md/lg` control scale:

| Family   | Confirmed geometry                           |
| -------- | -------------------------------------------- |
| Button   | 26 / 32 / 40px heights                       |
| Input    | Large 40px radius 20; Medium 32px radius 16  |
| Textarea | approximately 58px source examples; radius 8 |
| Select   | Large 40px radius 20; Medium 32px radius 16  |
| Checkbox | 20px radius 6; 16px radius 4                 |
| Radio    | 20px circular control                        |
| Switch   | Medium 38×20; Small 24×14                    |
| Status   | 30px height; radius 15                       |
| Badge    | 16 / 23px heights, with count and dot forms  |

The existing semantic 32/40px helper aliases are an **ENGINEERING DECISION**
with active consumers. They remain for compatibility, but no longer represent
the foundation documentation as a universal scale.

## Corner radius

`Min 8`, `Regular 12`, `Medium 16`, `Large 48`, and `Max 100px` are literal,
human-verified source labels and values: **FACT**. Mapping them to components is
not implied by those names. Reusing them in production CSS is an engineering
aliasing **DECISION**. Component-local 4, 6, 15 and 20px radii remain literal
component facts and are not promoted into the named source set. `Max 100px` is
used as a robust pill implementation where the represented component is a pill;
that consumer mapping is a **DECISION**.

## Semantic aliases

Figma supplies literal paints, not the repository's role taxonomy. Therefore
`surface.*`, `text.*`, `border.default`, `action.primary`, `status.success`, and
`status.danger` are all **ENGINEERING DECISIONS**. Their targets are literal
source-color **FACTS**. The aliases remain because production component CSS
uses them; no new aliases were introduced in this pass.

## Colors and spacing

No contradiction was found. The 40 literal colors preserve source names,
grouping, spelling and alpha composition. Spacing remains the explicit
4/8/16/24/32/40/48/56/64px source set. Component-local gaps such as 12px remain
local geometry and are not promoted.

## Unknowns

- Authoritative semantic typography style names and mappings.
- A repository-owned, legally distributable Golos Text delivery mechanism.
- Whether all product-candidate typography signatures should be public
  primitives rather than local component metrics.
- A universal size relation between different component families.
