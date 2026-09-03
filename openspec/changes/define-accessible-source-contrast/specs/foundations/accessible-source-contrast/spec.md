## Purpose

Defines the production-text contrast contract and provenance required when source-faithful paint is not sufficiently legible for an active SHLZ UI surface.

## ADDED Requirements

### Requirement: Active production text contrast

SHLZ UI SHALL render active normal-size production text at a contrast ratio of at least 4.5:1 against its effective background and active large text at least 3:1, using the WCAG 2.2 relative-luminance calculation. This contract SHALL include labels, instructions, secondary copy, and placeholder text that communicates an expected input; inactive or disabled text MAY remain below the threshold only when it is unavailable for interaction and is reported separately.

#### Scenario: Active Field guidance is rendered

- **WHEN** a supported Field-family label or placeholder is visible on any supported active background
- **THEN** its effective computed foreground and background meet the applicable text contrast threshold

#### Scenario: Compact Modal secondary copy is rendered

- **WHEN** compact Info, Success, Warning, or Error Modal secondary copy is visible
- **THEN** its effective computed foreground and surface background meet the applicable text contrast threshold

#### Scenario: Disabled text is evaluated

- **WHEN** the same text belongs to a disabled or otherwise inactive control
- **THEN** evidence records its measured treatment separately without using the WCAG inactive-component exception to waive any active state

### Requirement: Explicit accessible source override

When authoritative source paint fails the active production-text threshold, the library SHALL preserve that source value as a source fact and SHALL apply a named semantic accessible-text decision at the shared token seam. Documentation and evidence MUST distinguish the source fact from the repository decision, and `shlz-design-source/` MUST remain unchanged.

#### Scenario: Source paint is below threshold

- **WHEN** an authoritative SVG assigns active text a color below the applicable contrast threshold
- **THEN** the production component uses the documented semantic accessible-text value while provenance retains the original source color and reason for divergence

#### Scenario: Multiple families need the same override

- **WHEN** Field guidance and Modal secondary copy require the same accessible role
- **THEN** consumers receive the correction through the shared semantic token contract without component-specific public configuration

### Requirement: Backward-compatible adoption

The contrast correction SHALL preserve existing public class names, DOM semantics, behavior interfaces, events, geometry, content ownership, and consumer integration contracts. Consumers MAY override semantic tokens through the existing custom-property mechanism, but the distributed defaults MUST satisfy the active contrast contract on every library-supported background.

#### Scenario: Existing consumer upgrades styles

- **WHEN** an existing plain HTML or application consumer adopts the updated distribution without changing markup or JavaScript
- **THEN** its affected active text receives accessible default paint and its existing interaction behavior remains unchanged

#### Scenario: Consumer overrides a semantic token

- **WHEN** a consumer supplies a custom value for an accessible-text semantic token
- **THEN** the normal CSS custom-property cascade applies and the consumer owns proving contrast for its resulting background combinations

### Requirement: Closed affected-surface evidence

The change SHALL inventory every repository occurrence of the affected Field-family text and compact Modal copy, exercise representative real consumers, and bind passing computed contrast evidence to all supported active background/state combinations before closing issues #13 and #25. Existing unrelated contrast findings MUST retain an explicit disposition rather than being silently declared resolved.

#### Scenario: Completion evidence is evaluated

- **WHEN** the contrast policy implementation is proposed as complete
- **THEN** source integrity, structural token/contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content-stress evidence each pass or carry a justified not-applicable result with no unresolved scope-local finding

#### Scenario: Status paint remains outside the correction

- **WHEN** the existing Status source-paint P3 finding is encountered during the census
- **THEN** it remains separately documented unless executable evidence proves that the current change's active production-text policy and approved scope require its correction
