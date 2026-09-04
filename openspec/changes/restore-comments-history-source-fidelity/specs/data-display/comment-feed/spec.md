## Purpose

Defines a framework-neutral presentation contract for the source-observed SHLZ case-comment stream without conflating comments with direct messages or owning comment data and mutations.

## ADDED Requirements

### Requirement: Comment Feed uses the authoritative Comments source

Comment Feed SHALL derive its visual contract from `shlz-design-source/raw/svg/Комментарии.svg`. It MUST NOT use `Messages.svg`, the existing Message Thread implementation, an existing application, or broad visual convention as substitute authority. Source-observed geometry, spacing, typography, colors, avatar treatment, file cards, attachment summary, mention treatment, and composer shell SHALL be recorded against named source frames before implementation.

#### Scenario: Source and implementation disagree

- **WHEN** existing CSS, a snapshot, derived extraction data, or a design preference conflicts with the original Comments SVG
- **THEN** the original SVG determines the desktop visual contract and the conflicting evidence is recorded as a finding rather than normalized

#### Scenario: Source does not define behavior

- **WHEN** the SVG depicts a control or state without establishing its runtime behavior
- **THEN** the component exposes only the source-backed presentation and native semantics while the unsupported behavior remains consumer-owned or explicitly unknown

### Requirement: Comments remain one readable discussion stream

Comment Feed SHALL present comments in consumer-supplied DOM order as one left-aligned stream. Each comment SHALL preserve the visible relationship among optional avatar, author, relative or absolute date label, body, mention content, attachments, and attachment summary/actions. It MUST NOT require incoming/outgoing chat polarity, speech bubbles, or delivery/read metadata to distinguish comments.

#### Scenario: Plain HTML renders source-backed comments

- **WHEN** a plain HTML or server-rendered consumer supplies documented Comment Feed markup
- **THEN** every comment remains readable in order with its author, date, text, mentions, and attachments identifiable without JavaScript

#### Scenario: Comment includes several files

- **WHEN** a comment contains multiple consumer-supplied file items
- **THEN** the files use the existing source-backed file-card primitives where applicable and the visible count, total size, and native download action remain associated with that comment

#### Scenario: Comment mentions another person

- **WHEN** consumer-authored content identifies a mentioned participant
- **THEN** the mention remains visibly distinct as shown by the source while preserving ordinary readable text and not introducing library-owned identity lookup

### Requirement: Composer shell is presentation-only

Comment Feed SHALL support the source-observed empty and populated composer shell, attachment affordance, and submit-control presentation using native form semantics. The library MUST NOT own editor commands, validation policy, comment submission, uploads, mention lookup, network state, or persistence unless a separate approved behavior contract adds them.

#### Scenario: Consumer wires comment submission

- **WHEN** a consumer composes the documented native controls and handles their events
- **THEN** the source-backed shell presents the supplied empty, populated, focus, attachment, and submit states without hidden library state or automatic mutation

#### Scenario: Composer behavior is absent

- **WHEN** no consumer controller is attached
- **THEN** the native fields and buttons remain discoverable and operable according to their native semantics without claiming that a comment was saved or uploaded

### Requirement: Responsive and content-stress behavior is explicit

Comment Feed SHALL preserve source hierarchy, DOM order, visible focus, text scaling, and content reachability in narrow containers. Responsive rules absent from the desktop SVG SHALL be recorded as repository decisions and MUST NOT be described as source facts.

#### Scenario: Narrow comment feed

- **WHEN** the feed contains long localized text, long filenames, several attachments, mentions, and enlarged text in a narrow container
- **THEN** content and native actions reflow without clipping, overlap, unreadable measure, or page-level horizontal overflow

### Requirement: Consumer ownership remains explicit

Consumers SHALL own comment identity, ordering, author and mention data, sanitization, localization, permissions, editing/deletion rules, submission, pagination, synchronization, persistence, moderation, attachment lifecycle, announcements, and rerendering.

#### Scenario: Consumer updates the feed

- **WHEN** a consumer appends, replaces, edits, or removes comment markup
- **THEN** Comment Feed requires no undocumented library state to present the resulting source-backed structure

### Requirement: Comment Feed completion is independently auditable

Comment Feed SHALL remain below `VERIFIED` until the repository-wide census classifies every occurrence and source integrity, structural contract, runtime-native behavior, accessibility, frame-focused visual fidelity, responsive/content stress, and at least one real consumer independently pass. Page-level screenshots and Message Thread evidence MUST NOT satisfy Comment Feed fidelity.

#### Scenario: Exact source frame has not been compared

- **WHEN** the implementation has only a broad showcase screenshot, derived inventory, or evidence inherited from Message Thread
- **THEN** focused visual fidelity remains unproven and Comment Feed cannot be marked `VERIFIED`
