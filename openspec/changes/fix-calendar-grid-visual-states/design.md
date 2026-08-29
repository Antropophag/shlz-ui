## Context

See `proposal.md` and `specs/data-display/calendar-grid/spec.md`. The merged Calendar Grid interface already assigns `data-shlz-calendar-grid-state` to both date headers and their body cells, but its paint only gives today an invented blue inset rule, leaves past/future effectively at defaults, and verifies all states only through broad snapshots. `shlz-design-source/raw/svg/Calendar.svg` is the primary authority and remains read-only.

The Calendar SVG component sheet separates a temporal `Time` header primitive from `Calendar Cell` body variants. This distinction is load-bearing: the source visibly differentiates past/today/future in the header, while only today has a dedicated full-cell body fill; unavailable/day-off is separately hatched.

## Goals / Non-Goals

**Goals:**

- Reproduce the source state hierarchy using existing source/semantic tokens.
- Apply selectors precisely enough that sticky header paint and body-column paint remain distinct.
- Add a deterministic red/green browser seam that proves each temporal state independently.
- Preserve the existing native-table and consumer-owned temporal-classification contract.

**Non-Goals:**

- Invent a distinct past or future body fill absent from the source.
- Change date calculation, state values, DOM relationships, behavior controllers, item tones, sticky/overflow behavior, or Date Picker status.
- Modify or regenerate any file under `shlz-design-source/`.

## Decisions

### 1. Map the component-sheet variants literally

Source facts are recorded as follows:

- past `Time`: `#F4F6F9` fill, primary dark text, source separator/border;
- today `Time`: `#EEF0F4` fill with `#245B99` accent text and source separator/border;
- future `Time`: white/base fill, primary dark text, `#D1D8DF` source border;
- today `Calendar Cell`: `#F4F6F9` across every demonstrated body-cell size/content state;
- day-off/unavailable: white/base cell with repeated `#F5F5F5` diagonal hatch and ordinary `#D1D8DF` separators;
- past and future have no separate body-cell variant in the authoritative sheet.

Repeated values and applications above are directly observed source facts. The conclusion that today fill applies to every body cell is a derived pattern from all demonstrated Today body variants. Mapping those colors/borders to existing repository tokens and using header-vs-body selectors is a repository decision. No new visual value or unresolved assumption is introduced.

Alternative: tint entire past and future columns to maximize distinction. Rejected because the source does not define that paint. Alternative: retain the blue today top rule as an extra cue. Rejected because it is not present in the authority and changes the hierarchy.

### 2. Keep one public state attribute and specialize by table role

The current public state vocabulary remains unchanged. CSS distinguishes `thead` state headers from `tbody` state cells, allowing the same consumer-authored state value to drive the source's two different primitive treatments without adding classes or JavaScript.

Alternative: add header-specific variants. Rejected because table role already supplies the required semantic seam and a new public marker would add no expressive power.

### 3. Make focused computed styles the primary regression signal

One focused Playwright case will read each state header and a representative body cell in the same rendered Showcase grid, asserting the exact computed background, foreground, font weight, and border/separator properties relevant to the source. It will also prove that today spans all body rows and that past/future body surfaces intentionally match the base surface. Calendar Grid snapshots remain supplemental visual evidence and are updated only after the computed contract passes.

Alternative: rely on updated snapshots. Rejected because a single image can change without identifying which state contract regressed.

## Risks / Trade-offs

- [A broad state selector could override sticky header paint or unavailable hatching] → Use role-specific selectors and assert both header/body computed styles.
- [Token aliases may compute to source colors but later be repointed] → Document the source mapping and retain source-contract/token tests alongside browser assertions.
- [Past and future body cells remain visually equal] → Preserve this source fact and make their header distinction explicit; do not claim unsupported full-column paint.
- [Snapshot updates could mask unrelated drift] → Regenerate only the two Calendar Grid snapshots and inspect the image diff before acceptance.

## Migration Plan

This is a backward-compatible paint correction. Consumers keep the same markup and state values. Rollback restores the previous Calendar Grid CSS, Showcase evidence, focused assertions, and snapshots; no data or API migration is required.
