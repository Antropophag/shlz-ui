## Why

Vue consumers currently assemble SHLZ native markup manually. Issue #92 requests an optional adapter delivered in bounded sessions; the first vertical slice proves package consumption and SSR with the existing Button contract.

## What Changes

- Add a private, packable `@shlz/vue` workspace exporting a typed `ShlzButton`, using Vue 3.5 as a peer and shared SHLZ styles.
- Prove server rendering, browser hydration and native event/form semantics through a small Vue consumer.
- Document the first supported interface and update Button occurrence/evidence records.
- Keep other components as independent follow-up sessions under #92. No Nuxt module, registry publication, new styles or behavior-controller integration in this slice.

## Capabilities

### New Capabilities

- `adapters/vue-button`: optional Vue package, native Button interface, SSR and consumer verification.

### Modified Capabilities

None. Existing HTML/CSS Button behavior remains unchanged.

## Impact

New package and test consumer, root build/development dependencies, focused tests, docs and audit manifest. Vue remains outside core dependencies. The private package is intentionally outside current release policy; publication requires a separate decision. Main risks are duplicate events, native attribute forwarding and SSR mismatch. Source material remains read-only.
