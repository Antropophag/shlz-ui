# ADR 0005: Progressive enhancement before Custom Elements

Status: accepted.

## Decision

Use native HTML plus CSS and explicitly initialized framework-agnostic DOM
controllers as the first universal interactive layer. Controllers live in
`@shlz/behaviors`, enhance existing server-rendered markup, and expose teardown.
They do not render markup or register Custom Elements.

Dropdown is the representative validation: native buttons and ARIA state remain
the public contract, while a small controller supplies menu navigation,
dismissal and focus restoration. Browser regression tests validate it through
the same package exports used by consumers.

## Why not a Web Component now

Dropdown does not require encapsulated rendering, element upgrade semantics,
form association, or a shadow boundary. A Custom Element would add SSR upgrade,
styling and lifecycle constraints without removing the need for an accessible
HTML contract. Therefore a Web Component is not justified for Dropdown and is
not the default universal layer.

Web Components remain an option for a future component only when research and a
working controller show a concrete benefit—such as a complex reusable lifecycle
or form-associated behavior—that outweighs integration costs. That decision is
made per component, not for the library wholesale.

## Consequences

- Plain HTML and PHP/Yii can consume the same markup, CSS and ESM controller.
- Vue or another adapter can manage controller lifecycle without owning behavior.
- JavaScript-disabled markup must fail conservatively; Dropdown menus begin
  hidden and commands should remain reachable elsewhere when they are critical.
- Application code still owns command effects and business state.
