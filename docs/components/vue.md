# Vue adapter

`@shlz/vue` is an optional, private, packable workspace. This first slice exports only `ShlzButton`; the remaining adapters are tracked in [issue #92](https://github.com/Antropophag/shlz-ui/issues/92). It is not published to a registry. It supports Vue >=3.5.0 <3.6.0, verified with 3.5.42. No Nuxt module, auto-import integration or independent Nuxt verification is included.

## Consumer setup

Install the packed `@shlz/vue`, `@shlz/styles` and its `@shlz/tokens` dependency with compatible Vue. The adapter exports ESM JavaScript and declarations; no consumer SFC compilation of library files is necessary.

```vue
<script setup lang="ts">
import { ShlzButton } from "@shlz/vue";
import "@shlz/styles/shlz.css";
</script>

<template>
  <section class="shlz-scope">
    <ShlzButton variant="primary" @click="save">Save</ShlzButton>
  </section>
</template>
```

The application supplies `save`, fonts and business state. See [Button](button.md) for the source-backed appearance and unsupported states. Native HTML/PHP consumers continue to load the standalone CSS without Vue.

## ShlzButton

| Prop     | Values                          | Default |
| -------- | ------------------------------- | ------- |
| variant  | neutral, primary, text          | neutral |
| size     | md (40px), sm (32px), xs (26px) | md      |
| iconOnly | boolean; supported with md/sm   | false   |
| type     | button, submit, reset           | button  |
| disabled | boolean                         | false   |

The default slot supplies text and optional icons. Use `.shlz-button__icon` on an icon child and provide an accessible name for icon-only buttons. Invalid values are unsupported. The public prop type rejects icon-only xs; JavaScript inputs that bypass types are normalized to sm (32px), consistently during SSR and reactive updates. No loading, link-button or v-model interface is supplied.

Native attributes (`name`, `value`, `form`, `aria-*`, `data-*`, etc.), consumer classes/styles and listeners fall through to the single native button. `@click` receives the native event once. Parent changes update props, attrs and slot content. Native disabled and keyboard semantics remain browser-owned. The default type intentionally prevents accidental form submission; set `type="submit"` or `type="reset"` explicitly.

A component ref exposes `element` after mount. Type the ref as `ButtonHandle | null`; `handle?.element?.focus()` accesses the native button. The ref becomes null when the component is removed. No other imperative component API is promised.

## SSR and evidence

Import and render with `createSSRApp` and `vue/server-renderer`; load CSS in the application browser entry. Use matching server/client props and slot content for hydration. This stateless Button uses no browser globals during rendering and generates no IDs. SSR compatibility here applies only to this exported component.

The small consumer in `apps/vue-consumer/` is an executable form/lifecycle example. Run `npm run generate && npm run build:packages && node apps/vue-consumer/server.mjs`, then visit localhost port 4175. This is a local development/test server, not deployment infrastructure.

`npm run test:vue` verifies packed consumption, TypeScript, independent server renders, hydration DOM identity, native events/forms, reactive state, mount/unmount, source paints, sizes and narrow content. Vue occurrences have a separate `docs/component-audits/vue-button.json` so existing Showcase census expectations remain scoped to their own surfaces. The parent Button manifest links that evidence; neither manifest certifies another component.
