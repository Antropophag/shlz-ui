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

Dropdown is the first validation case. It proves that a server-rendered trigger
and menu can gain composite-widget keyboard behavior without Vue or a Web
Component. The plain HTML fixture and Playwright suite exercise the distributed
CSS and behavior package together.

## Distribution

`@shlz/behaviors` exports ESM JavaScript and declarations from `dist/`. A plain
HTML/PHP consumer may serve the files directly:

```html
<link rel="stylesheet" href="/vendor/@shlz/styles/dist/shlz.css" />
<script type="module">
  import { enhanceDropdowns } from "/vendor/@shlz/behaviors/dist/index.js";
  enhanceDropdowns();
</script>
```

The consumer controls loading strategy and CSP-compatible asset URLs. There is
no bundler-specific runtime.
