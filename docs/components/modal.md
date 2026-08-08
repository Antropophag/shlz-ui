# Modal

## Purpose

Modal blocks interaction with the page while the user reviews content or makes
a bounded decision. `Modal.svg` is the visual authority. The native `<dialog>`
contract, focus lifecycle, Escape handling and backdrop policy are engineering
decisions because a static SVG cannot establish interaction.

## Evidence matrix

| Class    | Observation | Evidence / consequence |
| -------- | ----------- | ---------------------- |
| FACT | The sheet contains one 572×196 surface and four 416/417×165 surfaces | Raw surface rectangles in `Modal.svg` |
| FACT | Every surface is white with a 16 px radius and no visible border | Raw `fill="white"`, `rx="16"`; no surface stroke |
| FACT | Every surface uses two black shadow layers: y=4/blur=30 at 8% and y=1/blur=3 at 5% | Five raw SVG filter definitions |
| FACT | The 572 px composition has 24 px inline padding, a 56 px header, a 32 px close control, a body region and a 60 px footer | Surface and child coordinates at x=80–652/y=480–676 |
| FACT | Compact compositions use 32 px outer padding, a 22 px leading icon region, 16 px icon-to-copy gap and 24 px bottom action spacing | Repeated clips at x=112/150 and buttons at y=805 relative to y=696 surface |
| FACT | Actions are 32 px high pills; represented secondary and primary examples are 70 and 59 px wide | Repeated action rectangles with `rx="16"` |
| FACT | The large example contains title, close, body/content and footer/action regions; compact examples contain icon/copy/actions | Repeated outlined paths and clip regions in the raw groups |
| DERIVED | 572 px is a structured/content modal and 416 px is a compact confirmation/status composition | Repeated geometry and slot arrangement; outlined text prevents recovering source variant labels |
| DERIVED | Radius 16, spacing 16/24/32, surface colors and 32 px actions agree with current canonical tokens | Comparison with `packages/tokens/tokens.json` |
| DECISION | Native modal `<dialog>` opened with `showModal()` is the semantic and platform foundation | Uses the top layer, modal focus containment and background inertness without a custom trap |
| DECISION | Header, body and footer helpers are optional; accessible naming remains mandatory | Both source compositions differ, so one rigid slot structure is not justified |
| DECISION | Backdrop dismissal is opt-in with `data-shlz-modal-backdrop-close` | Figma does not define dismissal; conservative default avoids accidental data loss |
| DECISION | `autofocus` is the consumer-controlled initial-focus mechanism; the controller does not choose a destructive action | Native platform mechanism with no speculative focus-selection API |
| UNKNOWN | Backdrop color/opacity and whether clicking it dismisses | The sheet renders isolated component specimens, not an open page overlay |
| UNKNOWN | Escape, initial focus, return focus, focus containment and form submission behavior | Static SVG cannot prove behavior |
| UNKNOWN | Responsive width, minimum/maximum height and long-content scrolling | Only fixed specimens are shown |
| UNKNOWN | Semantic meaning and names of the four compact visual variants | Text is outlined and no variant metadata is embedded |

## Planned HTML contract

```html
<button type="button" data-shlz-modal-trigger="example-modal">
  Open
</button>

<dialog
  id="example-modal"
  class="shlz-modal"
  data-shlz-modal
  aria-labelledby="example-modal-title"
>
  <div class="shlz-modal__surface">
    <header class="shlz-modal__header">
      <h2 id="example-modal-title" class="shlz-modal__title">Title</h2>
      <button type="button" class="shlz-modal__close" data-shlz-modal-close aria-label="Close">×</button>
    </header>
    <div class="shlz-modal__body">Content</div>
    <footer class="shlz-modal__footer">Actions</footer>
  </div>
</dialog>
```

The final behavior, accessibility and limitation sections will be completed
with the verified implementation. This evidence record intentionally precedes
the public API implementation.
