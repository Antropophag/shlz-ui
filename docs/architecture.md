# Architecture

The dependency direction is `tokens → icons/styles → behaviors → adapters → applications`.

`@shlz/tokens` is the single generated value contract. `@shlz/icons` exposes stable individual assets, a sprite, manifest, and TypeScript names. `@shlz/styles` is a low-impact CSS layer usable from HTML, PHP, and JavaScript. The showcase consumes package exports and is not a design authority.

No runtime framework is in the core. `@shlz/behaviors` provides opt-in progressive-enhancement controllers over native markup; it does not render components or register Custom Elements. No Vue package is created yet because an empty adapter would imply a contract that does not exist. See [ADR 0005](adr/0005-progressive-enhancement-behaviors.md).

The `@shlz/styles` export is a generated standalone `dist/shlz.css`: token variables, foundation, then native component primitives. It contains no package-specifier imports, so a browser can consume the same file through a plain `<link>` in static HTML or PHP/Yii. Split source files remain the review surface and are concatenated reproducibly.

## Compatibility boundaries

- Global effects are limited to descendants of `.shlz-scope`; there is no element reset.
- Typography is a hook (`--shlz-font-family`, `--shlz-line-height`) because the SVG evidence cannot recover it.
- Native controls own their state and accessibility semantics; only components that truly require additional behavior belong in a future web layer.
- Behavior controllers own only DOM synchronization, keyboard navigation and lifecycle teardown; applications own commands and business state.
- Application layouts and workflows stay outside reusable packages.
