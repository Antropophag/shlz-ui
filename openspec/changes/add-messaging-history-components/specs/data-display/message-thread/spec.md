## Purpose

Defines a framework-neutral semantic thread for presenting consumer-owned messages, authors, timestamps, content, attachments, and metadata without owning messaging infrastructure.

## ADDED Requirements

### Requirement: Semantic thread and message structure

Message Thread SHALL expose an accessible ordered or unordered message list whose items preserve author, timestamp, body, attachment, and metadata relationships without requiring an application shell.

#### Scenario: Plain HTML renders a thread

- **WHEN** a plain HTML or server-rendered consumer supplies documented thread markup
- **THEN** messages remain readable in source order with identifiable authors and timestamps without JavaScript

#### Scenario: Application shell is omitted

- **WHEN** a consumer renders the thread
- **THEN** navigation, filters, profile panels, synchronization, and compose controls are not required by its interface

### Requirement: Message content and presentation states

Message items SHALL support incoming and outgoing alignment, consumer-authored body content, optional author/avatar, timestamp, metadata, attachment composition, grouped adjacency, and empty or loading-safe presentation. Direction and color MUST NOT be the only means of conveying authorship or state.

#### Scenario: Long localized content

- **WHEN** a message contains long localized text, links, unbroken content, or several attachments
- **THEN** content remains readable and contained without covering adjacent messages or causing page-level horizontal overflow

#### Scenario: Optional content is absent

- **WHEN** a message omits an avatar, attachments, or metadata
- **THEN** its remaining semantic content stays coherent without empty decorative placeholders

### Requirement: Native consumer actions

Message Thread SHALL permit consumer-authored links and buttons while adding no send, edit, delete, retry, reaction, delivery, read-state, or navigation behavior.

#### Scenario: Consumer handles an action

- **WHEN** a message contains a consumer-authored action
- **THEN** native activation and consumer logic determine the result without a library event controller

### Requirement: Responsive reading order

Message Thread SHALL preserve DOM reading order, visible focus, text scaling, and content reachability from narrow containers through supported desktop widths.

#### Scenario: Narrow container

- **WHEN** the thread is rendered in a narrow container with enlarged text
- **THEN** messages reflow within the container and all controls and attachments remain reachable

### Requirement: Consumer ownership

Consumers SHALL own message identity, ordering, author identity, sanitization, localization, delivery/read semantics, pagination, synchronization, persistence, moderation, attachment lifecycle, announcements, and rerendering.

#### Scenario: Consumer rerenders messages

- **WHEN** a consumer replaces or appends message markup
- **THEN** the thread requires no undocumented library state to present the new content

### Requirement: Message Thread audit acceptance

Message Thread SHALL remain below `VERIFIED` until every occurrence is classified and source, structural, runtime-semantic, accessibility, focused visual, consumer, and responsive/content-stress evidence independently passes.

#### Scenario: Unclassified occurrence blocks verification

- **WHEN** a repository or built-DOM census finds an unclassified Message Thread occurrence
- **THEN** the occurrence guard fails and the module cannot be marked `VERIFIED`
