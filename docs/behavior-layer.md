# Universal behavior layer

`@shlz/behaviors` contains small DOM controllers for interactions that native
HTML does not provide on its own. It depends on neither a framework nor the
styles package and never owns application state or markup rendering.

## Contract

- Server output remains meaningful native HTML before JavaScript loads.
- CSS state follows native/ARIA attributes such as `disabled`, `hidden`,
  `checked`, and `aria-expanded`.
- Enhancement is explicit: a consumer imports and calls an `enhance…` function.
- Controllers may add event listeners, focus management and synchronized ARIA
  state; they do not replace native activation.
- Every controller exposes `destroy()` so framework adapters can map their own
  lifecycle without forking behavior.
- No controller auto-registers globally, renders with `innerHTML`, or registers
  a Custom Element.

Dropdown is the first validation case. Popover extends that proof to floating
geometry without changing the progressive-enhancement contract. Tooltip reuses
the same internal Floating UI adapter while retaining a separate trigger,
timing and accessibility contract. SHLZ continues to own state, DOM events,
focus and public attributes; the positioning dependency remains private.

Popover does not expose one fixed ARIA role and does not trap focus. It can hold
ordinary supplementary content or consumer-labelled non-modal dialog content.
Tooltip is non-interactive, uses `role="tooltip"` and synchronizes
`aria-describedby`; it never inherits Popover dismissal or focus semantics.
Tabs is the other behavior added in this iteration. It provides automatic
activation and roving `tabindex` for an author-provided ARIA tabs structure.
Pagination, Tag, Segment and Notification require no controller: native links,
buttons and radios own their state.

Modal and the first, modal-only Drawer contract are progressive enhancements of
native `<dialog>`. Their controllers call `showModal()`/`close()`, resolve
declarative trigger and close controls, synchronize trigger ARIA state, provide
opt-in backdrop dismissal and restore the invoking focus. The browser owns the
top layer, background inertness, sequential-focus containment, Escape/cancel
and native dialog forms. SHLZ does not install a focus trap, inert polyfill,
document scroll lock, z-index manager or overlay stack.

## Shared internals

- `internal/floating` is used by Popover and Tooltip for placement, offset,
  flip/shift, arrow coordinates and geometry observation.
- `internal/dismissal` remains shared by Dropdown and Popover for outside
  pointer dismissal.
- Tabs currently owns its small roving-tabindex loop. No second identical
  consumer exists, so a generic focus framework was not extracted.
- `internal/native-dialog` is the proven common lifecycle composition for Modal
  and Drawer. It is deliberately a function, not an OverlayController or base
  class, and it delegates modal mechanics to the browser. Each public family
  keeps a private weak ownership registry so repeated enhancement returns one
  controller; destroy clears that owner and all cycle-local state.

## Distribution

`@shlz/behaviors` exports ESM JavaScript and declarations from `dist/`.
Package-aware consumers import the package root or component subpaths. Because
Popover has an internal npm dependency, plain HTML/PHP consumers use the
self-contained browser ESM bundle:

```html
<link rel="stylesheet" href="/vendor/@shlz/styles/dist/shlz.css" />
<script type="module">
  import {
    enhanceDropdowns,
    enhanceDrawers,
    enhanceModals,
    enhancePopovers,
    enhanceTabs,
    enhanceTooltips,
  } from "/vendor/@shlz/behaviors/dist/browser.js";
  enhanceDropdowns();
  enhanceModals();
  enhanceDrawers();
  enhancePopovers();
  enhanceTabs();
  enhanceTooltips();
</script>
```

The consumer controls loading strategy and CSP-compatible asset URLs. There is
no bundler-specific runtime.

## Web Components verdict after native overlays

No new requirement justifies Custom Elements. Explicit initialization and
`destroy()` cover lifecycle; native attributes cover state synchronization;
consumer DOM remains the content owner; ordinary events and methods cover the
contract; no form association or encapsulated rendering is needed. Framework
adapters can initialize and destroy controllers directly. Web Components remain
a component-specific future experiment only if a concrete lifecycle, form or
DOM-ownership problem appears.

Native dialog strengthens this verdict: lifecycle, form submission, focus and
modal state have platform contracts, while author content remains light DOM.
No observed Modal or Drawer requirement needs custom-element encapsulation.
