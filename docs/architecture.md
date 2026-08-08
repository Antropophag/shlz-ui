# Architecture

The dependency direction is `tokens → icons/styles → future interactive web layer → adapters → applications`.

`@shlz/tokens` is the single generated value contract. `@shlz/icons` exposes stable individual assets, a sprite, manifest, and TypeScript names. `@shlz/styles` is a low-impact CSS layer usable from HTML, PHP, and JavaScript. The showcase consumes package exports and is not a design authority.

No runtime framework is in the core. No Vue package is created yet because an empty adapter would imply a contract that does not exist. See [ADR 0003](adr/0003-universal-interactive-layer.md).

## Compatibility boundaries

- Global effects are limited to descendants of `.shlz-scope`; there is no element reset.
- Typography is a hook (`--shlz-font-family`, `--shlz-line-height`) because the SVG evidence cannot recover it.
- Interactive components will own accessibility and state machines in the web layer; adapters should forward rather than reimplement them.
- Application layouts and workflows stay outside reusable packages.
