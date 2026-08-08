# Popover

## Purpose

Popover is a non-modal floating container for supplementary content and
controls. `Popover.svg` is the visual authority. The component does not imply
one ARIA role: semantics follow the content. Interactive behavior and
positioning below are repository decisions because a static sheet cannot prove
them.

## Evidence matrix

| Classification | Observation | Evidence / consequence |
| --- | --- | --- |
| FACT | Twelve rendered surfaces are exactly 236×90 px, white, with 12 px corners and no visible border | Raw `Popover.svg` surface rectangles |
| FACT | The sheet represents top, bottom, left and right arrows, each at start, center and end positions | Twelve raw groups; arrow coordinates cover four sides and three alignments |
| FACT | Arrows are white isosceles triangles with a 14.142×7.071 px axis-aligned envelope | Raw arrow paths use two 7.071 px legs |
| FACT | A 40 px header region is separated by a 1 px-looking `#0B1623` divider at 10% opacity | Raw header masks end at y=559 and divider paths span y=558–560 |
| FACT | Repeated outlined label bounds begin 16 px from the inline edge and 10 px from the block start | Twelve `70×19` clip rectangles at surface x+16/y+10 |
| FACT | Every surface uses two shadow layers | Raw filters: y=4/blur=15 and y=1/blur=1.5 |
| FACT | Each represented surface contains a header-like text line and a body-like text line | Repeated outlined paths in each surface group |
| DERIVED | The twelve examples form four placements × three arrow alignments | Exhaustive repetition of the same surface and content geometry |
| DERIVED | Existing radius 12, surface, divider and shadow foundation values fit Popover without new canonical tokens | Direct comparison with current token/style provenance |
| DECISION | Public preferred placements are `top`, `bottom`, `left`, and `right`; collision handling may change the final placement | Progressive-enhancement positioning contract |
| DECISION | Default offset is 8 px and viewport padding is 8 px | Trigger geometry and trigger-to-panel distance are absent from the source |
| DECISION | Opening leaves focus on the trigger; Escape closes and restores trigger focus; no default focus trap | Non-modal accessibility policy |
| DECISION | Consumers may opt into a child arrow with `.shlz-popover__arrow`; positioning owns its coordinates | Preserves verified geometry without requiring decorative markup |
| UNKNOWN | Trigger geometry and source-defined trigger-to-surface distance | No trigger is represented in `Popover.svg` |
| UNKNOWN | Whether any represented arrow alignment is tied to a named API placement | Static SVG has no component property names recoverable from outlined labels |
| UNKNOWN | Open trigger, dismissal, focus movement and close-control behavior | Static SVG cannot establish interaction |
| UNKNOWN | Whether the header/body composition is mandatory or merely one content example | All represented examples share it, but the sheet provides no contract metadata |

## Tooltip evidence boundary

`Tooltip.svg` contains eight dark 100×37 px surfaces with 8 px corners and
arrows on all four sides. Top and bottom are shown with start, center and end
alignment; left and right are shown centered. Its caret clips are
11.3137×5.655 px (horizontal) or 5.655×11.3137 px (vertical), and no Popover
shadow is present. These FACTs support reuse of a coordinate/overflow
infrastructure only. They do not make Tooltip a Popover variant: Tooltip label
semantics, hover/focus triggers, announcement and timing remain separate and
UNKNOWN for now.

## Contract status

The HTML, behavior, accessibility and positioning contracts will be finalized
after the positioning experiment. This evidence record intentionally precedes
the public API.

