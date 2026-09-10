## Purpose

Provide an optional Vue interface to the existing SHLZ native Button without introducing framework dependencies into the shared design-system core.

## ADDED Requirements

### Requirement: Optional package consumption

The private packable `@shlz/vue` package SHALL export typed `ShlzButton` through ESM, support Vue >=3.5.0 <3.6.0 as a peer, and require the consumer to load `@shlz/styles/shlz.css`. Core packages MUST remain usable without Vue. This slice MUST NOT participate in registry publication.

#### Scenario: Isolated consumer

- **WHEN** a separate project installs the packed adapter with compatible Vue and styles
- **THEN** its TypeScript consumer resolves the exported Button and its Node process can import and server-render it without browser globals

### Requirement: Native Button interface

`ShlzButton` SHALL render one native button with default slot content, native attributes and native listeners forwarded to that element. Its props SHALL be `variant` (neutral default, primary, text), `size` (md default, sm, xs), `iconOnly` (false default), `type` (button default, submit, reset), and `disabled` (false default). These map to the existing CSS contract with 40/32/26px sizes; icon-only is supported at md/sm only. The public prop type MUST reject iconOnly=true with size=xs. Runtime JavaScript inputs combining these values SHALL render the supported sm icon-only Button, including during SSR and reactive updates; xs and icon-only classes MUST NOT appear together. Consumer class/style and accessible-name attributes SHALL be preserved. The component SHALL expose a typed `element` reference to its native button after mount. Loading, navigation, model state and generated IDs are outside the supported interface.

#### Scenario: Reactive presentation and attributes

- **WHEN** a parent changes supported props, attrs or slot content
- **THEN** the same native button reflects those values and retains the SHLZ base class alongside consumer classes

#### Scenario: Unsupported icon-only size

- **WHEN** a JavaScript consumer supplies iconOnly=true with size=xs, initially or during a reactive update
- **THEN** the Button uses the 32px sm icon-only presentation without the xs modifier
- **AND** the corresponding literal prop combination is rejected by the exported TypeScript contract

#### Scenario: Native activation and disabled

- **WHEN** an enabled Button is clicked or activated through Enter or Space
- **THEN** the consumer receives one native click per activation
- **AND** a disabled Button does not activate and is excluded from sequential keyboard focus

#### Scenario: Form ownership

- **WHEN** the default Button is activated inside a form
- **THEN** it does not submit the form
- **AND** explicit submit/reset buttons retain native form behavior including name/value and external form association

### Requirement: SSR and hydration

The adapter SHALL render without browser globals or shared mutable request state. Hydration of matching server/client inputs SHALL preserve server DOM and attach working native interaction without mismatch warnings. Repeated mount/unmount SHALL not duplicate consumer events.

#### Scenario: Matching hydration

- **WHEN** a server-rendered Button is hydrated with matching props and content
- **THEN** its original DOM node is retained, no hydration mismatch is reported and activation updates application-owned state once

#### Scenario: Separate renders and remount

- **WHEN** independent server renders use different labels and a browser consumer remounts a Button repeatedly
- **THEN** each server result contains only its own content and each browser activation dispatches once to the current consumer

### Requirement: Source-backed component evidence

The Vue Button SHALL use the existing source-backed CSS and pass applicable Button completion evidence with independently classified Vue occurrences. Other components MUST NOT inherit its completion status.

#### Scenario: Visual and consumer verification

- **WHEN** the supported mode/size matrix and real default, hover, active, focus-visible and disabled states are exercised with icon and long-label content
- **THEN** computed geometry/paint matches the existing source-backed contract, accessible names and native semantics are preserved, and narrow content remains bounded
- **AND** a Vue consumer demonstrates application-owned state and lifecycle
