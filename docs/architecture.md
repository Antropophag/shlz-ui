# Architecture

The dependency direction is `tokens → icons/styles → behaviors → adapters → applications`.

`@shlz/tokens` is the single generated value contract. Its `source.*` layer preserves literal specialized-sheet facts and its `semantic.*` layer contains justified engineering aliases. `@shlz/icons` exposes stable individual assets, a sprite, manifest, and TypeScript names. `@shlz/styles` is a low-impact CSS layer usable from HTML, PHP, and JavaScript. The showcase consumes package exports and is not a design authority; it is organized as Source Spec Data, Component Implementation and actual SVG-derived Visual Fidelity review surfaces. See [the fidelity methodology](visual-fidelity.md).

No runtime framework is in the core. `@shlz/behaviors` provides opt-in progressive-enhancement controllers over native markup; it does not render components or register Custom Elements. Popover uses a framework-independent positioning engine behind the SHLZ contract rather than implementing a partial Popper. No Vue package is created yet because an empty adapter would imply a contract that does not exist. See [ADR 0005](adr/0005-progressive-enhancement-behaviors.md) and [ADR 0006](adr/0006-floating-positioning-engine.md).

Modal and the modal Drawer use native `<dialog>` as their overlay foundation.
The browser supplies top-layer stacking, modal focus behavior and background
inertness; SHLZ adds only declarative triggers, close controls, return focus and
optional backdrop dismissal. No custom focus/inert/scroll/overlay manager is
part of the architecture. Floating UI descendants remain compatible inside the
dialog top layer. See [ADR 0007](adr/0007-native-dialog-overlays.md).

The `@shlz/styles` export is a generated standalone `dist/shlz.css`: token variables, foundation, then native component primitives. It contains no package-specifier imports, so a browser can consume the same file through a plain `<link>` in static HTML or PHP/Yii. Split source files remain the review surface and are concatenated reproducibly.

## Compatibility boundaries

- Global effects are limited to descendants of `.shlz-scope`; there is no element reset.
- [design-decision] Typography uses inherited semantic role tokens and a root/subtree profile. [observed] Golos Text is the source-confirmed default. [design-decision] Fira Sans is an official compatibility profile; the repository does not embed production font binaries, so consumers self-host the chosen family and retain the explicit system-sans fallback.
- Native controls own their state and accessibility semantics; only components that truly require additional behavior belong in a future web layer.
- Behavior controllers own only DOM synchronization, keyboard navigation and lifecycle teardown; applications own commands and business state.
- Floating geometry is an internal dependency boundary. Consumers configure SHLZ placement attributes, not third-party middleware.
- Application layouts and workflows stay outside reusable packages.
- Modal overlay state belongs to the native dialog. Nested non-modal floating
  controllers own their first Escape; no global overlay stack is introduced.
