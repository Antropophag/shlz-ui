## Purpose

Keep the audited rounded controls faithful to their source geometry while preserving readable localized content, inherited typography profiles, native behavior, and isolation from Showcase scaffolding.

## ADDED Requirements

### Requirement: Source-backed Switch paint

Switch SHALL retain Medium 38×20/16px thumb and Small 24×14/11.2px thumb geometry, checked travel, native checkbox semantics, and disabled/focus behavior. The painted Small thumb SHALL be vertically centered in its painted track, including fractional layout positions, rather than only having nominally centered CSS dimensions.

#### Scenario: Small thumb at fractional coordinates

- **WHEN** the Small Switch is on or off, enabled or disabled, at integer or quarter-pixel vertical positions with device pixel ratios 1 and 2
- **THEN** track and thumb retain their source sizes and their painted vertical centers differ by at most 0.25 CSS px, using a contrast-aware alpha comparison for disabled paint

#### Scenario: Native activation is preserved

- **WHEN** an enabled Switch is clicked or activated with Space and then disabled
- **THEN** native checked state and events still operate, focus remains visible, and disabled activation does not change its state

### Requirement: Diagnostic Field text placement

Source-only Field/Select diagnostics SHALL retain their diagnostic classification and render centered text in the supported shell sizes. Medium chips SHALL not inherit a line box taller than their shell; plain diagnostic placeholders SHALL be centered like the source value rows. No new runtime multiselect, chip removal, or Medium Advanced Input capability is introduced.

#### Scenario: Medium chips and placeholder rows

- **WHEN** existing 27px/23px chips and 40px/32px placeholder diagnostics render in either typography profile
- **THEN** text line centers remain within 1 CSS px of their own shell center, without the medium-only 2px drop or the placeholder's 6.5–10.5px upward displacement

#### Scenario: Advanced textual actions

- **WHEN** the existing Large Advanced Input source examples render their two textual actions
- **THEN** each action occupies the source 82×27px shell, uses the active SHLZ font family with explicit component text metrics, and is not constrained by the circular clear action's flex basis

### Requirement: Independent compact tab geometry

Compact Tabs SHALL not inherit the underline tablist's 61px minimum height. Pill tabs SHALL retain 40px source shells and Boxed tabs 39px source shells for single-line source-equivalent content. Longer text SHALL remain contained without clipping. Native tab behavior, state paints, and underline geometry SHALL remain intact.

#### Scenario: Compact variants beside underline tabs

- **WHEN** underline, pill, and boxed tab families render in the same Showcase and in a plain HTML composition
- **THEN** their short-label heights are respectively 61px, 40px, and 39px, and the compact families do not stretch to the underline height

### Requirement: Showcase does not override Badge geometry or typography

Showcase labels and matrix columns SHALL not override Badge's own size, font, or intrinsic placement. Single-count Small Badge SHALL remain 16×16px; multi-count Small and Medium source-equivalent Badge SHALL retain 29×16px and 35×23px minimum shells with 12px and 14px type respectively.

#### Scenario: Color headers do not resize examples

- **WHEN** the three color columns display single and multiple Small counts and Medium counts
- **THEN** header text lengths do not stretch the Badge roots and the Medium text retains 14px in all three columns

### Requirement: Notification content containment

Notification SHALL keep short single-line content vertically centered, including narrow viewports. Long messages and actions SHALL reflow without painting text outside their pill, overlapping other controls, or hiding content. Source short-content geometry remains 384×58px with source-backed action minima; consumer-owned message content and behavior remain unchanged.

#### Scenario: Narrow short notification

- **WHEN** a single-line notification is rendered at 320px or 390px viewport width
- **THEN** its 18px content block remains centered within the 58px shell instead of sitting 11px above center

#### Scenario: Long action at intermediate widths

- **WHEN** actions contain "Отменить" or "Запустить синхронизацию снова" at 320px, 390px, 768px, or 1440px in either profile
- **THEN** visible text remains inside the action shell, remains fully readable through natural reflow, and the action does not overlap the message or close control

### Requirement: Localized composition labels remain contained

Empty State and History SHALL treat source widths as short-content geometry rather than allowing localized text to overflow a fixed-height pill. Source-equivalent short labels SHALL remain on one line where the surrounding available space permits; longer content SHALL reflow within its own growing shell.

#### Scenario: Empty State upload action

- **WHEN** Customize Empty State displays "Загрузить файл" with either profile at the supported viewport widths
- **THEN** the label remains inside its button, the short action preserves its 32px source height, and no glyph protrudes above or below the shell

#### Scenario: Source History labels

- **WHEN** the source-layout History examples display "Новое", "Замена деталей", and "По гарантии"
- **THEN** those short labels remain single-line in 30px-high shells and do not force a neighboring tag to 36px; the source's separate 35px new-status shell remains 35px

### Requirement: Text buttons follow the typography profile

Text-bearing Advanced Input actions and Comment Feed context/suggestion buttons SHALL use the active SHLZ font family with component-owned metrics. Switching profiles SHALL not leave those words rendered with the browser's Arial default. Icon-only native controls SHALL not acquire unrelated typography changes solely because their unused computed font is Arial.

#### Scenario: Both profile selections reach text buttons

- **WHEN** the Showcase or a scoped plain HTML consumer switches between Golos Text and Fira Sans
- **THEN** the four Advanced action labels and Comment Feed context/suggestion text use the selected family and remain contained in their controls

### Requirement: Proportionate visual and consumer regression evidence

Each affected family SHALL retain an independent occurrence inventory and evidence disposition. Tests SHALL exercise the public rendered HTML seams and relevant consumers at 320/390/768/1440px, with both shipped profiles, focused source comparisons, applicable native states, and representative long content. A centered text line alone SHALL NOT prove painted thumb centering or exact glyph fidelity.

#### Scenario: Completion of the thirteen audited groups

- **WHEN** the implementation is proposed for review
- **THEN** regressions independently reject the known-bad behavior and accept the candidate for all thirteen audit groups, source references remain unchanged, affected component manifests record observed counts and limits, and no unrelated component receives an inferred completion status
