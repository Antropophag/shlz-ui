# Typography profiles

[design-decision] SHLZ UI has one component system and two supported typography profiles:

- [observed] **Golos Text** is the default and the authoritative profile for Figma/source fidelity.
- [design-decision] **Fira Sans** is the supported alternative for denser corporate interfaces.

[design-decision] No attribute is required for existing consumers. This preserves the original behavior:

```html
<body class="shlz-scope">
  <!-- Golos Text profile -->
</body>
```

[design-decision] Enable Fira centrally on the document or on any subtree inside `.shlz-scope`:

```html
<body class="shlz-scope" data-shlz-font="fira">
  …
</body>

<section class="shlz-scope" data-shlz-font="fira">…</section>
```

[design-decision] An explicit `data-shlz-font="golos"` is also supported. A nested profile overrides its
ancestor because the profile is an inherited custom-property contract. Components do
not contain font-specific branches or classes.

## Font delivery

[design-decision] The production CSS intentionally contains no CDN request and no embedded font binary.
Consumers must self-host the selected families under the exact names `Golos Text` and
`Fira Sans`. The component library uses regular 400, medium 500 and semibold 600. The
showcase additionally uses 700 in its documentation chrome and bundles Fira Sans from
the OFL-1.1 licensed `@fontsource/fira-sans` development dependency so visual and layout
tests are deterministic. This showcase dependency is not a runtime dependency of
`@shlz/styles`.

[design-decision] Use `font-display: swap` (or the consumer's established loading policy), serve WOFF2
locally, and include Cyrillic and Latin coverage. Both stacks end in explicit system-sans
fallbacks for resilient rendering.

## Geometry contract

[design-decision] Profiles may differ in family and, if evidence later requires it, semantic size, weight,
line-height or tracking variables. They do not define control heights, padding, radii,
icon sizes, gaps or layout. Current Golos and Fira profiles intentionally share all
typographic metrics; compatibility tests prove the common component geometry and guard
clipping, overflow, wrapping and ellipsis behavior.
