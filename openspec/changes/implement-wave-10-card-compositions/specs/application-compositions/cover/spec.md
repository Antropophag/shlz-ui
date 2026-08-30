## ADDED Requirements

### Requirement: Cover is a static structured composition

The styles package SHALL expose a `.shlz-cover` composition with eyebrow, title, description, and metadata regions. The source-ratio specimen SHALL use an 874 by 400 aspect ratio and a white source surface while retaining real text rather than outlined source paths.

#### Scenario: Cover is read by assistive technology

- **WHEN** a consumer renders the documented semantic heading and supporting content
- **THEN** the content follows DOM reading order and the root introduces no interaction role

### Requirement: Cover supports bounded responsive content

The fluid cover SHALL fit its container down to 320 pixels, wrap structured text, and replace the fixed aspect ratio with content-driven height when the source ratio cannot contain the content.

#### Scenario: Cover is rendered in a narrow container

- **WHEN** available width is below the documented source-ratio range
- **THEN** all text remains visible without horizontal overflow and the cover grows in block size
