# Popover

## Purpose

Popover is a non-modal floating container for supplementary content and
controls. `Popover.svg` is the visual authority. The component does not imply
one ARIA role: semantics follow the content. Interactive behavior and
positioning below are repository decisions because a static sheet cannot prove
them.

## Evidence matrix

| Classification | Observation                                                                                                             | Evidence / consequence                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| FACT           | Twelve rendered surfaces are exactly 236×90 px, white, with 12 px corners and no visible border                         | Raw `Popover.svg` surface rectangles                                           |
| FACT           | The sheet represents top, bottom, left and right arrows, each at start, center and end positions                        | Twelve raw groups; arrow coordinates cover four sides and three alignments     |
| FACT           | Arrows are white isosceles triangles with a 14.142×7.071 px axis-aligned envelope                                       | Raw arrow paths use two 7.071 px legs                                          |
| FACT           | A 40 px header region is separated by a 1 px-looking `#0B1623` divider at 10% opacity                                   | Raw header masks end at y=559 and divider paths span y=558–560                 |
| FACT           | Repeated outlined label bounds begin 16 px from the inline edge and 10 px from the block start                          | Twelve `70×19` clip rectangles at surface x+16/y+10                            |
| FACT           | Every surface uses two shadow layers                                                                                    | Raw filters: y=4/blur=15 and y=1/blur=1.5                                      |
| FACT           | Each represented surface contains a header-like text line and a body-like text line                                     | Repeated outlined paths in each surface group                                  |
| DERIVED        | The twelve examples form four placements × three arrow alignments                                                       | Exhaustive repetition of the same surface and content geometry                 |
| DERIVED        | Existing radius 12, surface, divider and shadow foundation values fit Popover without new canonical tokens              | Direct comparison with current token/style provenance                          |
| DECISION       | Public preferred placements are `top`, `bottom`, `left`, and `right`; collision handling may change the final placement | Progressive-enhancement positioning contract                                   |
| DECISION       | Default offset is 8 px and viewport padding is 8 px                                                                     | Trigger geometry and trigger-to-panel distance are absent from the source      |
| DECISION       | Opening leaves focus on the trigger; Escape closes and restores trigger focus; no default focus trap                    | Non-modal accessibility policy                                                 |
| DECISION       | Consumers may opt into a child arrow with `.shlz-popover__arrow`; positioning owns its coordinates                      | Preserves verified geometry without requiring decorative markup                |
| UNKNOWN        | Trigger geometry and source-defined trigger-to-surface distance                                                         | No trigger is represented in `Popover.svg`                                     |
| UNKNOWN        | Whether any represented arrow alignment is tied to a named API placement                                                | Static SVG has no component property names recoverable from outlined labels    |
| UNKNOWN        | Open trigger, dismissal, focus movement and close-control behavior                                                      | Static SVG cannot establish interaction                                        |
| UNKNOWN        | Whether the header/body composition is mandatory or merely one content example                                          | All represented examples share it, but the sheet provides no contract metadata |

## Tooltip evidence boundary

`Tooltip.svg` contains eight dark 100×37 px surfaces with 8 px corners and
arrows on all four sides. Top and bottom are shown with start, center and end
alignment; left and right are shown centered. Its caret clips are
11.3137×5.655 px (horizontal) or 5.655×11.3137 px (vertical), and no Popover
shadow is present. These FACTs support reuse of a coordinate/overflow
infrastructure only. They do not make Tooltip a Popover variant: Tooltip label
semantics, hover/focus triggers, announcement and timing remain separate and
UNKNOWN for now.

## HTML contract

```html
<button
  class="shlz-button"
  type="button"
  aria-expanded="false"
  aria-controls="example-popover"
  data-shlz-popover-trigger="example-popover"
  data-shlz-popover-placement="bottom"
>
  Открыть
</button>
<div class="shlz-popover" id="example-popover" data-shlz-popover hidden>
  <span class="shlz-popover__arrow" aria-hidden="true"></span>
  <div class="shlz-popover__header">Заголовок</div>
  <div class="shlz-popover__body">Содержимое</div>
</div>
```

The trigger must be a native button. Its marker value, `aria-controls`, and the
popover `id` must agree. The arrow and header/body helpers are optional; the
floating container is the stable primitive. `hidden` remains authoritative, so
a consumer can render the surface and control visibility without the
controller.

Supported preferred placements are `top`, `top-start`, `top-end`, `bottom`,
`bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`, `right`,
`right-start`, and `right-end`. Set an optional non-negative pixel distance with
`data-shlz-popover-offset`; invalid values fall back to 8.

```js
import { enhancePopovers } from "@shlz/behaviors";

const controllers = enhancePopovers();
controllers[0].open();
controllers[0].close({ restoreFocus: true });
await controllers[0].updatePosition();
controllers[0].destroy();
```

`open()`, `close()`, `toggle()`, `updatePosition()` and `destroy()` form the
public behavior contract. A descendant marked `data-shlz-popover-close` closes
the surface and restores trigger focus.

## Behavior and positioning

The controller synchronizes `hidden` and `aria-expanded`, closes on Escape or
outside pointer, restores focus for Escape and explicit close controls, and
starts positioning updates only while open. Opening does not move focus. It is
not a focus trap or a modal controller.

`@floating-ui/dom` is an internal engine behind the SHLZ API. Preferred
placement uses an 8 px default offset; `flip` and `shift` retain an 8 px
viewport/clipping boundary. `autoUpdate` responds to overflow-ancestor scroll,
resize, reference/floating element resize and layout shift. Final placement is
reflected in `data-placement` for arrow rendering and diagnostics. See
[ADR 0006](../adr/0006-floating-positioning-engine.md).

The controller does not relocate DOM. If a panel is physically inside an
unavoidable clipping or transformed containing block, consumers can render it
elsewhere in the same document; association is by `id`, not containment. Nested
floating trees and portal ownership remain outside the contract.

## Accessibility

- A simple supplementary container needs no role. Its visible text and native
  descendants keep their ordinary semantics.
- If content is a non-modal dialog, the consumer supplies `role="dialog"`, an
  accessible name and an intentional initial-focus policy. The controller still
  does not trap focus.
- Interactive controls are allowed and remain in document tab order. Put the
  panel after its trigger when relying on natural Tab order.
- The native trigger carries `aria-expanded` and `aria-controls`. Disabled
  triggers do not open.
- Meaningful close controls must be native buttons with accessible names.
- Tooltip semantics must not use this controller. Tooltip naming, hover/focus
  triggers, timing and announcement require a separate contract.

## Limitations and unknowns

Source-defined trigger distance, open/dismiss behavior, focus entry, mandatory
content slots and close-control behavior remain UNKNOWN in Figma. Offset,
collision padding and accessibility behavior are DECISIONs. Typography remains
consumer-owned. Modal behavior, focus trapping, nested popovers and automatic
DOM portalling are deliberately unsupported.
