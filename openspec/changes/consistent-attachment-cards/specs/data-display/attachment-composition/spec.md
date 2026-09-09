## Purpose

Give Composer and File Upload attachments the compact, recognizable file-card presentation established by the source-backed Comment Feed composition.

## ADDED Requirements

### Requirement: Consistent compact attachment presentation

Composer and File Upload SHALL present existing and newly selected attachments as compact cards matching the current Comment Feed file-card hierarchy: source-derived file-type visual, filename, secondary metadata and existing actions. Cards SHALL use a preferred width of 229 CSS pixels, shrink to available width and wrap without growing to fill spare row space. This width is a repository composition decision matching the approved comparison surface.

#### Scenario: Named populated examples
- **WHEN** the user views «Комментарий к заявке» or File Upload's Populated composition
- **THEN** each PDF displays the existing PDF SVG icon, its unchanged filename and existing metadata in the compact file-card layout, without a paper emoji

#### Scenario: Narrow container and long content
- **WHEN** attachments with long localized or unbroken filenames are rendered in a container narrower than the preferred card width
- **THEN** cards fit within the container, truncate overflowing filename text visually while retaining the full text in the document, and keep icons and existing actions visible

#### Scenario: Multiple attachments
- **WHEN** multiple attachments cannot fit side by side
- **THEN** the cards wrap to subsequent rows while retaining compact widths

### Requirement: Consumer behavior and file identity are preserved

The visual change SHALL preserve consumer ownership of selection, removal, metadata and links. Existing disabled, read-only and error behavior SHALL remain intact. File visuals SHALL be decorative; filenames SHALL remain text rather than executable markup. Unsupported file extensions SHALL use the existing generic file SVG rather than a misleading known-type icon.

#### Scenario: Dynamic selection
- **WHEN** the File Upload consumer renders newly selected files
- **THEN** those files use the same compact presentation as its static populated example and retain the existing selection and removal flow

#### Scenario: Unknown file and hostile filename
- **WHEN** a selected filename has an unknown extension or contains markup characters
- **THEN** it is shown as literal text with the generic file SVG and does not execute markup

#### Scenario: Existing controls
- **WHEN** a card has a removal control or a consumer-supplied link
- **THEN** it retains its accessible name, keyboard operation and focus visibility without gaining a new upload or download operation

#### Scenario: Unaffected comparison surface
- **WHEN** the Comment Feed and standalone File Row examples are viewed after this change
- **THEN** their existing appearance and behavior are preserved
