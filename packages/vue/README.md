# @shlz/vue

Optional SHLZ Vue 3.5 adapter. Private and packable; not published to a registry.

```js
import { ShlzButton } from "@shlz/vue";
import "@shlz/styles/shlz.css";
```

Render inside `.shlz-scope`. `ShlzButton` accepts `variant` (neutral/primary/text), `size` (md/sm/xs), `iconOnly`, `type` (button/submit/reset) and `disabled`. It renders native slot content and forwards native attrs/listeners. Icon-only is supported at md/sm and requires an accessible name. A component ref exposes its native `element`.

Only Button is available. No loading state, model, Nuxt module or publication workflow is included. Matching-input SSR/hydration is supported. Vue and SHLZ styles are peers. See `docs/components/vue.md` in the repository for the consumer contract and evidence.
