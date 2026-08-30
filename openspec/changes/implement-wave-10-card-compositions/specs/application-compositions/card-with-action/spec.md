## ADDED Requirements

### Requirement: Card with action is a narrow presentational composition

The styles package SHALL expose a `.shlz-card-with-action` composition with structured title, description, optional decorative visual, and actions regions. The source specimen SHALL be 314 by 230 pixels with a 16-pixel radius and SHALL accept an existing Button or Link as its nested action without making the card root interactive.

#### Scenario: Consumer supplies an action

- **WHEN** a consumer renders a native link or button in `.shlz-card-with-action__actions`
- **THEN** that nested control alone owns focus, activation, navigation, and disabled semantics

#### Scenario: Exact specimen is requested

- **WHEN** the source-size modifier is used
- **THEN** the composition preserves the 314 by 230 source geometry without clipping its structured content contract

### Requirement: Card content remains usable under bounded stress

The composition SHALL offer a fluid modifier that fits its container down to 240 pixels, permits text wrapping, and grows vertically when localized or enlarged content no longer fits the source height.

#### Scenario: Long content is rendered in a narrow container

- **WHEN** title, description, or action text wraps at a supported narrow width
- **THEN** content remains visible, the nested control remains operable, and no horizontal overflow is introduced by the component
