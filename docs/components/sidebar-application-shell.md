# Sidebar / Application Shell source ledger

This ledger covers the application-owned Showcase composition. It does not
define a reusable Sidebar, Header, router, authorization model, or responsive
shell API. `Sidebar.svg` and `Header.svg` are immutable authority; the Showcase
is only a consumer and implementation candidate.

## Immutable source baseline

| Source                                   | SHA-256                                                            | Root geometry                      |
| ---------------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| `shlz-design-source/raw/svg/Sidebar.svg` | `92ec7b5992b3f05548f5bb937f856746c4abbd27c675bff3ea37e8ddbdfc96a0` | 914×1604; `viewBox="0 0 914 1604"` |
| `shlz-design-source/raw/svg/Header.svg`  | `8af415f1b5a499d89b189372837c4a6c584b05471753688550187832ca672392` | 1528×724; `viewBox="0 0 1528 724"` |

The focused source test locks both byte hashes and source-critical geometry.

## Sidebar facts and state ledger

| Class               | Claim                                                                                                                                      | Evidence                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| source-fact         | The closed composition is a 72×1000 `#0B1623` rectangle at (421,500).                                                                      | Exact raw `rect` attributes.                           |
| source-fact         | The opened composition is a 301×1000 `#0B1623` rectangle at (100,500).                                                                     | Exact raw `rect` attributes.                           |
| source-fact         | Both compositions contain a 32×32 raster-backed mark at y=532.                                                                             | Exact raw `rect`/pattern attributes.                   |
| source-fact         | The closed composition has 48px-wide dividers at y=584 and y=1003, and a 44×44, radius-8 highlighted item at (435,647).                    | Exact raw `rect` attributes.                           |
| source-fact         | The opened composition has 275px-wide dividers at y=584 and y=1131, and a 275×48, radius-8 highlighted item at (113,1144).                 | Exact raw `rect` attributes.                           |
| source-fact         | A separate 300×251 `#0B1623` panel contains a 254×44 and a 44×44 radius-8 highlighted item.                                                | Exact raw `rect` attributes at x=533.5/553.            |
| derived-pattern     | `#0B1623` is the repeated sidebar surface paint; white at 10% opacity is the repeated divider/highlight paint.                             | Repetition across the exact rectangles above.          |
| repository-decision | “opened”, “closed”, “active”, and “default” are the audit names used to exercise the visibly represented compositions and item treatments. | OpenSpec contract; the SVG has no behavioral metadata. |
| unknown             | The export does not establish toggle behavior, persistence, routing, authorization, breakpoint behavior, animation, or focus semantics.    | No such semantics are encoded in the raw SVG.          |

The SVG contains 109 paths and 18 rectangles. Those path coordinates and
screen-placement rectangles remain component/sheet geometry, not automatically
promoted tokens. The repeated source paints observed in the file are
`#D1D8DF`, white, `#0B1623`, and `#253D98`.

## Header facts and state ledger

| Class               | Claim                                                                                                                                           | Evidence                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| source-fact         | The export sheet is 1528×724, partitioned into white 1528×400 and 1528×324 regions.                                                             | Exact root and raw `rect` attributes.                                                  |
| source-fact         | Two raster-backed circular avatar instances are 48×48 with radius 24, at (1173,504) and (80,596).                                               | Exact raw `rect`/pattern attributes.                                                   |
| source-fact         | The vector paint set includes `#0B1623`, white, `#253D98`, and `#939CA5`; the file contains eight paths and five rectangles.                    | Raw element and attribute census.                                                      |
| repository-decision | “default”, “hover”, “typing”, and “filled” are separate material-state names required by the approved audit contract.                           | OpenSpec contract; later runtime evidence must bind each name to a real control state. |
| unknown             | Flattened paths do not by themselves prove native input semantics, event ownership, placeholder behavior, accessible naming, or focus behavior. | No DOM/behavior metadata exists in the SVG.                                            |
| unknown             | The source does not establish a universal narrow-header or mobile-drawer contract.                                                              | Only represented sheet compositions are authoritative.                                 |

Typography visible in the export is outlined into paths, so font family,
weight, line height, and editable text values cannot be claimed from SVG text
nodes. Any later typography claim needs separate direct evidence and must remain
classified; this ledger deliberately does not infer it from path geometry.

## Baseline occurrence census

Measured on baseline commit `27f7b49aa407afd9c41e0f32f6eedc14320fcb16`:

- one executable/live Showcase shell in `apps/showcase/src/main.js`, bounded by
  `.shlz-docs-shell` and `.shlz-docs-sidebar`;
- one application-local style implementation in
  `apps/showcase/src/showcase.css`;
- one bounded header substitute, `.shlz-hero`, inside the same live consumer;
- zero executable fixtures, content-stress fixtures, Data Workspace consumers,
  inert diagnostics, legacy/native shell substitutes, or package exports.

The manifest reserves `sidebar-application-shell-showcase` as the stable audit
ID. The current source predates that attribute; adding it belongs to the later
application-composition packet. Until then, the focused census deliberately
keys the one live occurrence by its bounded shell/sidebar signature, checks the
built bundle for the same one-to-one signature, and rejects additional source
or built-DOM signatures. This is a temporary, explicit limitation rather than
runtime evidence.
