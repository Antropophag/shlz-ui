# ADR 0007: Native dialog is the modal overlay foundation

- Status: accepted
- Date: 2026-08-08

## Context

Modal and Drawer need modal focus containment, background inertness, Escape,
top-layer rendering, focus return and backdrop presentation. Implementing these
with generic divs would require a focus trap, inert management and a stacking
system. `Modal.svg` and `Drawer.svg` establish visual surfaces but do not define
those behaviors.

The Drawer source is an isolated 420×900 rounded specimen. It does not prove an
edge, placement set, modality or non-modal use case. The current reusable
contract nevertheless needs one bounded model rather than several speculative
ones.

## Decision

Use native `<dialog>` opened with `showModal()` for Modal and for the first,
right-side modal Drawer. Keep separate public component names and CSS geometry;
share only a small internal native-dialog lifecycle function after both
controllers demonstrate identical trigger, close, return-focus and backdrop
handling.

The browser owns modal state, top-layer placement, sequential-focus containment,
background inertness, Escape/cancel and `<form method="dialog">`. SHLZ does not
implement a focus trap, inert polyfill, document scroll lock, z-index registry
or global overlay manager. Backdrop pointer dismissal is opt-in and requires
both pointer down and pointer up outside the component surface.

Only right-side modal Drawer is supported. Other placements and non-modal
drawers need new evidence and a separate contract review.

## Verification

Chromium tests verify native modal matching, keyboard containment, Escape,
background blocking, initial `autofocus`, return focus, native dialog forms,
backdrop policy, overflow, narrow viewport and teardown. Dropdown, Tooltip and
Popover inside Modal render in the top layer and consume the first Escape while
the parent dialog stays open.

## Consequences

- The overlay behavior remains small, progressive and framework-independent.
- Consumers must target browsers with the native dialog APIs used by the
  supported browser policy; no legacy polyfill is bundled.
- `autofocus` is the explicit consumer mechanism for initial focus.
- Modal and Drawer share lifecycle code but do not become variants of a generic
  public Overlay component.
- Web Components provide no benefit for the observed lifecycle or DOM ownership
  requirements and remain unnecessary.
