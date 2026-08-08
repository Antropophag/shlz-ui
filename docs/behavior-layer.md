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
geometry without changing the progressive-enhancement contract. It delegates
clipping, flip/shift and update observation to an internal positioning engine;
SHLZ continues to own state, DOM events, focus and public attributes. The two
controllers share only one proven behavior helper: outside-pointer detection.

Popover does not expose one fixed ARIA role and does not trap focus. It can hold
ordinary supplementary content or consumer-labelled non-modal dialog content.
Tooltip remains a separate future behavior even though it may reuse the same
coordinate infrastructure.

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
    enhancePopovers,
  } from "/vendor/@shlz/behaviors/dist/browser.js";
  enhanceDropdowns();
  enhancePopovers();
</script>
```

The consumer controls loading strategy and CSP-compatible asset URLs. There is
no bundler-specific runtime.

## Web Components verdict after Popover

No new requirement justifies Custom Elements. Explicit initialization and
`destroy()` cover lifecycle; native attributes cover state synchronization;
consumer DOM remains the content owner; ordinary events and methods cover the
contract; no form association or encapsulated rendering is needed. Framework
adapters can initialize and destroy controllers directly. Web Components remain
a component-specific future experiment only if a concrete lifecycle, form or
DOM-ownership problem appears.
