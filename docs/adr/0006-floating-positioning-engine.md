# ADR 0006: External engine for floating positioning

Status: accepted.

## Context

A single preferred side and offset require little code. The Popover acceptance
criteria also require viewport collision handling, flipping, shifting, overflow
ancestor scroll, resize, element geometry changes and arrow coordinates.
Correctly combining these concerns across clipping and containing blocks is a
positioning engine, not component behavior.

The dependency-free experiment therefore stopped at the intended boundary:
SHLZ reads the public placement and offset, then applies returned coordinates.
It does not implement overflow ancestor discovery, clipping calculations,
middleware ordering or observation infrastructure.

## Decision

Use `@floating-ui/dom` as an internal implementation dependency of
`@shlz/behaviors`. Popover composes `computePosition`, `offset`, `flip`, `shift`,
`arrow` and `autoUpdate`. The dependency is ESM, framework-independent,
accessibility-neutral, side-effect free at initialization, and exposes granular
imports. Its official documentation explicitly covers clipping-aware flip and
shift plus resize/scroll/layout-shift updates:

- <https://floating-ui.com/docs/computeposition>
- <https://floating-ui.com/docs/autoupdate>

The SHLZ HTML attributes and `PopoverController` remain the only public
component API. Consumers do not configure middleware or depend on Floating UI
types. The generated `dist/browser.js` bundles the engine for direct browser
ESM consumption; the current complete behavior bundle is 32.37 kB / 9.85 kB
gzip. Package-aware consumers retain normal ESM exports and tree shaking.

## Complexity boundary

SHLZ owns:

- parsing its twelve supported placements and non-negative offset;
- open/close state, dismissal, focus restoration and lifecycle;
- choosing fixed positioning and 8 px collision padding;
- applying coordinates, final placement and optional arrow coordinates.

The engine owns:

- overflow and clipping geometry;
- flip and shift calculations;
- scroll/resize/layout-shift observation;
- offset-parent and transformed-ancestor coordinate details.

SHLZ will not reproduce those internals. Portal/DOM relocation, nested floating
trees and modal focus management are not part of this decision.

## Alternatives

A dependency-free implementation was rejected because meeting the stated
collision and update contract would reproduce a partial Popper/Floating UI.
CSS Anchor Positioning was not selected as the sole engine because this
iteration requires one dependable compatibility contract and imperative
reposition/destroy behavior; it can be reevaluated as the browser support
baseline evolves.

## Consequences

- Floating positioning is robust without making the behavior package a
  positioning framework.
- The browser bundle cost is measurable and covered by package/export tests.
- Dropdown keeps its simpler CSS placement and does not acquire the dependency
  in its public contract.
- A future Tooltip may reuse the positioning infrastructure while retaining a
  separate trigger, timing and accessibility controller.
