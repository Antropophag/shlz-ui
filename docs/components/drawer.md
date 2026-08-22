# Drawer

## Purpose

Drawer is an edge-oriented overlay surface for longer supplementary tasks. The
source must be interpreted independently from Modal even if both later share
native dialog lifecycle helpers.

## Evidence matrix

| Class    | Observation                                                                                                        | Evidence / consequence                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| FACT     | One 420×900 white surface is represented                                                                           | Raw `Drawer.svg` surface and clip geometry                                                                         |
| FACT     | The specimen has 16 px corners and no visible border or shadow filter                                              | Raw `rx="16"`; no surface stroke and no filter definitions                                                         |
| FACT     | The composition contains a 64 px header, 764 px body and 72 px footer                                              | Three contiguous 420 px-wide raw rectangles                                                                        |
| FACT     | Header and body content begin 24 px from the inline edge                                                           | x=104 content relative to x=80 surface                                                                             |
| FACT     | The header includes a 32×32 circular muted close control, 24 px from the right edge                                | Raw x=444 control inside x=80–500 surface                                                                          |
| FACT     | The footer contains two equal 180×40 pill actions with a 12 px gap and 24 px side insets                           | Raw action rectangles at x=104 and x=296                                                                           |
| FACT     | The body shows a 372×32 outlined content placeholder 24 px from both inline edges                                  | Raw fill/stroke rectangles at x=104/y=568                                                                          |
| DERIVED  | Header/body/footer are stable visual regions for the represented long-form composition                             | Their rectangles exactly partition the surface height                                                              |
| DERIVED  | Width 420, radius 16, 24 px padding, 12 px gap, 32/40 px controls and foundation colors agree with existing tokens | Comparison with the canonical token set                                                                            |
| DECISION | The production Drawer in this iteration is modal and uses native `<dialog>.showModal()`                            | Source alone does not define modality; task-oriented overlay semantics need inert background and focus containment |
| DECISION | Only right placement is exposed initially                                                                          | A single placement is sufficient for an edge drawer; source does not prove all four directions                     |
| DECISION | Backdrop dismissal is opt-in with `data-shlz-drawer-backdrop-close`                                                | Conservative policy shared with Modal without claiming Figma evidence                                              |
| UNKNOWN  | Which viewport edge the source specimen attaches to                                                                | It is centered on a component-sheet canvas with four rounded corners                                               |
| UNKNOWN  | Backdrop, shadow, Escape, focus, dismissal and scroll-lock behavior                                                | None can be recovered from the static isolated specimen                                                            |
| UNKNOWN  | Non-modal Drawer semantics and use cases                                                                           | No surrounding application context or alternate state is shown                                                     |
| UNKNOWN  | Responsive width and fixed/sticky region behavior during overflow                                                  | Only the 420×900 static composition is shown                                                                       |

## HTML contract

```html
<button type="button" data-shlz-drawer-trigger="example-drawer">Open</button>

<dialog
  id="example-drawer"
  class="shlz-drawer"
  data-shlz-drawer
  aria-labelledby="example-drawer-title"
>
  <div class="shlz-drawer__surface">
    <header class="shlz-drawer__header">
      <h2 id="example-drawer-title" class="shlz-drawer__title">Title</h2>
      <button
        type="button"
        class="shlz-drawer__close"
        data-shlz-drawer-close
        aria-label="Close"
      >
        ×
      </button>
    </header>
    <div class="shlz-drawer__body">Content</div>
    <footer class="shlz-drawer__footer">Actions</footer>
  </div>
</dialog>
```

The direct `.shlz-drawer__surface` descendant is required. Header and footer are
optional; the body is the independently scrollable region. This first contract
deliberately does not expose left, top, bottom or non-modal variants.

## JavaScript contract

```js
import { enhanceDrawers, DrawerController } from "@shlz/behaviors/drawer";

const [drawer] = enhanceDrawers();
drawer.open();
drawer.close("applied");
drawer.destroy();
```

Matching `button[data-shlz-drawer-trigger]` and descendant
`[data-shlz-drawer-close]` controls use the same small native-dialog lifecycle
composition as Modal. Optional `data-shlz-drawer-backdrop-close` enables
outside-pointer dismissal.

Repeated `enhanceDrawers()` calls retain one private owner per live dialog;
idempotent destroy clears listeners and cycle-local opener, return-value, and
backdrop gesture state without taking ownership of application data.

## Semantic and accessibility model

The implemented Drawer is modal supplementary task UI and therefore uses
native `<dialog>.showModal()`. Right-side placement changes geometry, not
semantics. The consumer supplies `aria-labelledby` or `aria-label`, and may use
`autofocus` for a safe initial target. Escape, focus containment and background
inertness remain browser-owned; the controller restores the invoking trigger
after native close. No `role` is added over native dialog semantics.

## Verified behavior and limitations

Browser tests cover the 420 px right attachment, full-width narrow viewport,
native focus/Escape, explicit and backdrop close, focus return, long body
scrolling and `destroy()`. The document does not receive a custom scroll lock;
the open top-layer dialog blocks background interaction while the drawer body
owns overflow.

Right-edge attachment, zero radii on the attached edge, backdrop appearance and
mobile full-width layout are DECISIONs. The isolated source specimen has four
16 px corners and does not identify an edge. Non-modal drawers and other
placements remain UNKNOWN and unsupported.
Drawer-in-Modal, Modal-in-Drawer, concurrent modal drawers, portals, non-modal
drawers, and left/top/bottom placement remain explicit non-goals.
