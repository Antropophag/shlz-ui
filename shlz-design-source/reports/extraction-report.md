# SHLZ design source — exhaustive SVG extraction

## Scope

Processed **68 SVG files** from `svg-source.zip`: **34 component/reference sheets** and **34 screen/reference exports**. No UI implementation decisions are made in this pass.

## What was formalized

- complete source inventory with checksums, dimensions and XML element counts;
- all observed fill/stroke colors with source evidence;
- opacity, fill/stroke opacity, stroke widths, line caps/joins;
- rectangle corner radii and circle radii;
- candidate spacing/dimension scale derived from repeated geometry;
- global rectangle/dimension frequency tables and screen chrome candidates;
- per-component-sheet geometry/style fingerprints;
- per-screen layout metrics;
- filters/gradients by canonical signature;
- embedded raster assets extracted by content hash;
- exact repeated SVG path-data groups for deduplication analysis;
- previously isolated 104 core vector icons and 21 file-type icons included as derivative assets;
- explicit recoverability report for typography.

## Corpus totals

- XML elements: **165,320**
- `<path>` elements: **68,486**
- `<rect>` elements: **57,098**
- `<g>` elements: **6,250**
- `<image>` elements: **112**
- actual `<text>` elements: **40**
- unique observed colors: **79**
- unique rectangle dimension pairs: **1,120**
- repeated exact path groups: **6,662**
- unique embedded raster payloads: **27**

## Important boundary

The export converts text to paths. Therefore font family, font weight, line-height, letter-spacing and semantic text-style names **cannot be reconstructed reliably from SVG alone** unless explicitly present as XML/font attributes. This pass records that absence instead of inventing typography tokens.

Likewise, observed values such as 8, 16, 24 or 32 px are recorded as **geometry-derived candidates**. They are not labeled as original Figma variables without evidence.

## Largest source files

- `Сообщения.svg` — 29.25 MiB, 8,411 elements
- `Список обращений.svg` — 26.55 MiB, 18,219 elements
- `Обращение по гарантийному обслуживанию.svg` — 26.07 MiB, 10,124 elements
- `Планировщик для сотрудника.svg` — 15.40 MiB, 23,772 elements
- `Управление категориями и полями.svg` — 12.84 MiB, 5,740 elements
- `Первичное обращение.svg` — 12.24 MiB, 4,148 elements
- `Календарь и праздники.svg` — 10.19 MiB, 12,890 elements
- `Календарь.svg` — 9.88 MiB, 16,052 elements
- `Комментарии.svg` — 9.74 MiB, 1,969 elements
- `Дашборды.svg` — 9.61 MiB, 5,860 elements

## Most frequent observed colors

- `#F5F5F5` — 37,548 uses (37,547 fill / 1 stroke), 41 source files
- `#FFFFFF` — 25,824 uses (25,625 fill / 199 stroke), 67 source files
- `#D1D8DF` — 23,443 uses (19,351 fill / 4,092 stroke), 46 source files
- `#0B1623` — 16,423 uses (14,413 fill / 2,010 stroke), 67 source files
- `#939CA5` — 8,394 uses (7,023 fill / 1,371 stroke), 57 source files
- `#253D98` — 2,774 uses (2,476 fill / 298 stroke), 67 source files
- `#EEF0F4` — 1,753 uses (1,682 fill / 71 stroke), 51 source files
- `#F4F6F9` — 1,204 uses (1,186 fill / 18 stroke), 32 source files
- `#DFE2F0` — 1,185 uses (1,184 fill / 1 stroke), 31 source files
- `#57965C` — 841 uses (840 fill / 1 stroke), 30 source files
- `#45B64E` — 633 uses (633 fill / 0 stroke), 13 source files
- `#4191B3` — 594 uses (594 fill / 0 stroke), 12 source files
- `#000000` — 557 uses (386 fill / 171 stroke), 28 source files
- `#A942A7` — 553 uses (553 fill / 0 stroke), 18 source files
- `#CC1F1F` — 478 uses (402 fill / 76 stroke), 26 source files
- `#E0E0E0` — 408 uses (35 fill / 373 stroke), 13 source files
- `#F0F0F0` — 343 uses (343 fill / 0 stroke), 8 source files
- `#245B99` — 342 uses (342 fill / 0 stroke), 21 source files
- `#DBDBDB` — 306 uses (0 fill / 306 stroke), 11 source files
- `#D4D4D8` — 302 uses (302 fill / 0 stroke), 11 source files
- `#D47E2E` — 289 uses (289 fill / 0 stroke), 16 source files
- `#FAFAFA` — 249 uses (249 fill / 0 stroke), 8 source files
- `#25983E` — 232 uses (232 fill / 0 stroke), 18 source files
- `#231F23` — 228 uses (17 fill / 211 stroke), 24 source files
- `#8131A7` — 227 uses (227 fill / 0 stroke), 14 source files
- `#3D88DE` — 196 uses (196 fill / 0 stroke), 17 source files
- `#1E1E1E` — 152 uses (152 fill / 0 stroke), 15 source files
- `#DE753D` — 139 uses (139 fill / 0 stroke), 16 source files
- `#18A6C8` — 102 uses (68 fill / 34 stroke), 1 source files
- `#079455` — 93 uses (93 fill / 0 stroke), 11 source files

## Strongest small-dimension / spacing candidates

- `2.5px` — 36,614 rectangle width/height observations
- `40px` — 3,129 rectangle width/height observations
- `20px` — 2,804 rectangle width/height observations
- `32px` — 2,217 rectangle width/height observations
- `39px` — 1,954 rectangle width/height observations
- `18.5px` — 1,924 rectangle width/height observations
- `2px` — 1,153 rectangle width/height observations
- `48px` — 1,051 rectangle width/height observations
- `30px` — 1,038 rectangle width/height observations
- `16px` — 948 rectangle width/height observations
- `21.5px` — 935 rectangle width/height observations
- `24px` — 877 rectangle width/height observations
- `32.0002px` — 876 rectangle width/height observations
- `38px` — 735 rectangle width/height observations
- `11.9643px` — 595 rectangle width/height observations
- `24.0002px` — 556 rectangle width/height observations
- `50px` — 516 rectangle width/height observations
- `4px` — 412 rectangle width/height observations
- `7px` — 384 rectangle width/height observations
- `10px` — 383 rectangle width/height observations
- `40.0002px` — 324 rectangle width/height observations
- `1px` — 294 rectangle width/height observations
- `25px` — 291 rectangle width/height observations
- `54px` — 275 rectangle width/height observations
- `1.5px` — 262 rectangle width/height observations
- `44px` — 261 rectangle width/height observations
- `14.25px` — 250 rectangle width/height observations
- `27px` — 229 rectangle width/height observations
- `22.5px` — 202 rectangle width/height observations
- `22px` — 195 rectangle width/height observations

## Files to use next

- `tokens/*.json` — raw design primitives with evidence.
- `components/component-sheet-fingerprints.json` — dimensions/styles by component sheet.
- `layouts/screen-layout-metrics.json` — screen-level repeated geometry.
- `duplicates/repeated-paths.json` — exact vector repetitions, requiring semantic filtering.
- `inventory/source-inventory.json` — authoritative source map.
- `source-map/summary.json` — machine-readable extraction summary and limitations.

## What remains non-formalizable from these SVGs alone

1. Original Figma layer/component/variant names when not encoded in SVG.
2. Reliable typography family/weight/text-style tokens because text is outlined.
3. Interaction semantics such as hover/focus/keyboard behavior unless represented as separate visual examples.
4. Whether two visually similar repeated structures are intentionally one design-system component or merely coincidental reuse.
5. Original Auto Layout constraints/resizing rules; only rendered geometry is available.

Those boundaries are intentional: the extraction does not turn guesses into facts.

## Additional exhaustive indexes

The package also includes:

- `tokens/text-elements-observed.json` — every surviving real `<text>` node (40 total) and its available font attributes;
- `tokens/gradients-observed.json` — every gradient with stops and geometry;
- `tokens/filter-definitions.json` — every SVG filter and primitive effect chain;
- `source-map/use-references.json` — every `<use>` reference;
- `source-map/xml-ids.json` — every source XML id, preserving traceability back to Figma export fragments;
- `geometry/repeated-numeric-values.json` — cross-file geometry values after 0.01 px normalization;
- `assets/icon-extraction-collisions.json` — collision audit for the earlier semantic icon extraction.

### Icon extraction correction

The previous manifest contains **125 semantic entries**: 104 core icon candidates and 21 file-type icons. However, two different core candidates were both named `calendar.svg`, so the physical derivative folder contains **103 unique core SVG files**. This package explicitly records that collision instead of silently counting the overwritten file as two assets. The two source candidates must receive distinct final names during the semantic normalization pass.
