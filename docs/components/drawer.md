# Drawer

## Purpose

Drawer is an edge-oriented overlay surface for longer supplementary tasks. The
source must be interpreted independently from Modal even if both later share
native dialog lifecycle helpers.

## Evidence matrix

| Class    | Observation | Evidence / consequence |
| -------- | ----------- | ---------------------- |
| FACT | One 420×900 white surface is represented | Raw `Drawer.svg` surface and clip geometry |
| FACT | The specimen has 16 px corners and no visible border or shadow filter | Raw `rx="16"`; no surface stroke and no filter definitions |
| FACT | The composition contains a 64 px header, 764 px body and 72 px footer | Three contiguous 420 px-wide raw rectangles |
| FACT | Header and body content begin 24 px from the inline edge | x=104 content relative to x=80 surface |
| FACT | The header includes a 32×32 circular muted close control, 24 px from the right edge | Raw x=444 control inside x=80–500 surface |
| FACT | The footer contains two equal 180×40 pill actions with a 12 px gap and 24 px side insets | Raw action rectangles at x=104 and x=296 |
| FACT | The body shows a 372×32 outlined content placeholder 24 px from both inline edges | Raw fill/stroke rectangles at x=104/y=568 |
| DERIVED | Header/body/footer are stable visual regions for the represented long-form composition | Their rectangles exactly partition the surface height |
| DERIVED | Width 420, radius 16, 24 px padding, 12 px gap, 32/40 px controls and foundation colors agree with existing tokens | Comparison with the canonical token set |
| DECISION | The production Drawer in this iteration is modal and uses native `<dialog>.showModal()` | Source alone does not define modality; task-oriented overlay semantics need inert background and focus containment |
| DECISION | Only right placement is exposed initially | A single placement is sufficient for an edge drawer; source does not prove all four directions |
| DECISION | Backdrop dismissal is opt-in with `data-shlz-drawer-backdrop-close` | Conservative policy shared with Modal without claiming Figma evidence |
| UNKNOWN | Which viewport edge the source specimen attaches to | It is centered on a component-sheet canvas with four rounded corners |
| UNKNOWN | Backdrop, shadow, Escape, focus, dismissal and scroll-lock behavior | None can be recovered from the static isolated specimen |
| UNKNOWN | Non-modal Drawer semantics and use cases | No surrounding application context or alternate state is shown |
| UNKNOWN | Responsive width and fixed/sticky region behavior during overflow | Only the 420×900 static composition is shown |

## Planned HTML contract

```html
<button type="button" data-shlz-drawer-trigger="example-drawer">
  Open
</button>

<dialog
  id="example-drawer"
  class="shlz-drawer shlz-drawer--right"
  data-shlz-drawer
  aria-labelledby="example-drawer-title"
>
  <div class="shlz-drawer__surface">
    <header class="shlz-drawer__header">
      <h2 id="example-drawer-title" class="shlz-drawer__title">Title</h2>
      <button type="button" class="shlz-drawer__close" data-shlz-drawer-close aria-label="Close">×</button>
    </header>
    <div class="shlz-drawer__body">Content</div>
    <footer class="shlz-drawer__footer">Actions</footer>
  </div>
</dialog>
```

This first evidence-backed contract deliberately does not expose left, top,
bottom or non-modal variants.
