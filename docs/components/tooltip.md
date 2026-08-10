# Tooltip

## Purpose and evidence

Tooltip supplies a short, non-interactive accessible description. `Tooltip.svg`
is the visual authority; interaction timing is an engineering decision.

| Class    | Evidence / contract                                                                           |
| -------- | --------------------------------------------------------------------------------------------- |
| FACT     | Eight 100×37 surfaces use `#0B1623`, radius 8 and no shadow.                                  |
| FACT     | The label sits in the surface with 8px padding.                                               |
| FACT     | Top/bottom have start, center and end carets; left/right are centered.                        |
| FACT     | Labels are Golos Text Regular 15px/130%, -1% letter spacing and white.                        |
| FACT     | Carets are clipped halves of rotated 8×8 squares; visible envelopes are 11.3137×5.655 px.     |
| DERIVED  | The sheet represents four placement sides and three alignments where shown.                   |
| DECISION | Tooltip is `role="tooltip"`, non-interactive, and linked with `aria-describedby`.             |
| DECISION | Hover/focus opens after 400 ms; leave/blur closes after 100 ms. Both delays are configurable. |
| UNKNOWN  | Figma activation, timing, offset and announcement policy.                                     |

## Contract

```html
<button data-shlz-tooltip-trigger="save-tip">Сохранить</button>
<span
  id="save-tip"
  class="shlz-tooltip"
  role="tooltip"
  data-shlz-tooltip
  hidden
>
  Сохранить
  <span class="shlz-tooltip__arrow" aria-hidden="true"></span>
</span>
```

Use `data-shlz-tooltip-placement` and optional non-negative
`data-shlz-tooltip-open-delay`, `data-shlz-tooltip-close-delay`, and
`data-shlz-tooltip-offset` on the trigger. The controller exposes `open()`,
`close()`, `updatePosition()` and `destroy()`.

The surface never receives focus and must not contain controls. Pointer
entering the surface cancels a pending close only to bridge the visual gap; it
does not make the tooltip interactive. Escape closes immediately. Touch-only
activation and rich content are outside this contract.
