## Purpose

Defines complete, provenance-preserving publication of authoritative SHLZ icon sources and a directly discoverable catalog for consumers.

## ADDED Requirements

### Requirement: Complete authoritative-source coverage

The icon library SHALL account for every distinct icon candidate in `shlz-design-source/raw/svg/Icons.svg` and every existing normalized Basic Elements source icon. Each candidate MUST resolve either to an emitted canonical glyph or to an explicitly recorded exact-geometry deduplication, without changing files under `shlz-design-source/`.

#### Scenario: Every source candidate is accounted for

- **WHEN** the icon corpus is analyzed and generated
- **THEN** an executable coverage check maps every authoritative source candidate to a canonical emitted glyph or a documented exact duplicate
- **AND** no candidate is silently omitted

#### Scenario: Source material remains immutable

- **WHEN** the expanded icon library is generated
- **THEN** hashes of the authoritative source files remain unchanged

### Requirement: Compatibility-safe canonicalization

The icon library SHALL preserve the existing canonical names, compatibility aliases, emitted geometry, and paint behavior. A newly incorporated candidate that differs from an existing glyph but collides by name or semantics MUST receive a distinct stable canonical name rather than replacing or silently aliasing the existing glyph.

#### Scenario: Existing consumers retain their glyphs

- **WHEN** a consumer resolves any canonical name or compatibility alias that existed before this change
- **THEN** it resolves to the same glyph geometry and paint policy as before the change

#### Scenario: Exact duplicate is consolidated

- **WHEN** an `Icons.svg` candidate is exactly geometry-equivalent to an existing canonical glyph
- **THEN** the candidate is recorded as provenance for that canonical glyph rather than emitted as an indistinguishable additional canonical icon

#### Scenario: Non-equivalent name collision is retained

- **WHEN** two source candidates share a recovered semantic name but have different geometry
- **THEN** both remain addressable through distinct explicit canonical names

### Requirement: Both calendar glyphs are public

The icon library SHALL publish the two distinct calendar candidates recovered from `Icons.svg` as `calendar-sidebar` and `calendar-interface`.

#### Scenario: Consumer requests either calendar

- **WHEN** a consumer resolves `calendar-sidebar` or `calendar-interface` through the manifest, individual SVG export, or sprite API
- **THEN** the requested name resolves to its corresponding non-empty source-derived geometry
- **AND** the two names do not resolve to the same geometry

### Requirement: Auditable icon provenance

Every canonical icon SHALL expose enough machine-readable provenance to identify its authoritative source path and source identity. Records derived from `Icons.svg` MUST retain recovered source IDs, and uncertain semantic names MUST remain explicitly marked rather than presented as verified facts.

#### Scenario: Consumer audits an Icons.svg glyph

- **WHEN** a manifest record includes geometry from `Icons.svg`
- **THEN** its provenance identifies `Icons.svg` and the source IDs used for extraction

#### Scenario: Semantics are uncertain

- **WHEN** the source evidence does not establish a reliable semantic name
- **THEN** the canonical name or manifest metadata explicitly communicates that uncertainty

### Requirement: Framework-neutral distribution

Every newly canonical icon SHALL be available through the same framework-neutral surfaces as existing icons: the package manifest, individual SVG export, sprite symbol, runtime name lists, name resolution helpers, and TypeScript name union. Monochrome and preserved-paint behavior MUST follow the established package contract.

#### Scenario: Plain consumer uses a new icon

- **WHEN** a plain HTML, PHP, JavaScript, or framework consumer selects a newly canonical icon
- **THEN** it can use the published individual SVG or sprite symbol without a framework adapter

#### Scenario: Paint policy is preserved

- **WHEN** an authoritative candidate is monochrome or uses semantic/multicolor paint
- **THEN** its emitted form respectively follows `currentColor` or preserves the required source paints without geometry loss

### Requirement: Discoverable complete Showcase catalog

Showcase SHALL expose Icons as a first-class navigation item with a stable `#icons` destination. Loading that destination SHALL render the complete canonical production manifest in a visible catalog, and Showcase search SHALL make the destination discoverable without requiring users to know hidden disclosure text.

#### Scenario: User opens the Icons navigation item

- **WHEN** the user activates Icons in the Showcase navigation or opens the page with `#icons`
- **THEN** component documentation loads if needed
- **AND** focus/navigation reaches a visible catalog representing every canonical manifest entry

#### Scenario: User searches for Icons

- **WHEN** the user enters `icons` in the Showcase navigation search
- **THEN** the Icons destination remains visible as a matching result

#### Scenario: Published Showcase build is generated

- **WHEN** the production Showcase build used by GitHub Pages is created
- **THEN** the built navigation contains the Icons destination
- **AND** the built catalog count matches the generated production manifest

### Requirement: Consumer-owned icon semantics

The icon package SHALL provide geometry and paint but SHALL NOT assign accessible meaning that depends on consumer context. Consumers remain responsible for accessible names or decorative treatment.

#### Scenario: Same glyph is used for different actions

- **WHEN** consumers use one icon for different contextual meanings
- **THEN** the package does not force a single accessible label
- **AND** each consumer can provide its own semantic treatment
