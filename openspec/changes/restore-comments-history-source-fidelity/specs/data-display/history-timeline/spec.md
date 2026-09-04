## MODIFIED Requirements

### Requirement: Entry and grouping presentation

History Timeline SHALL support optional period labels and the source-observed entry presentations for record creation, status transition, quoted comment, before/after field value, tag collection, employee collection with disclosure, and attachment card. The changed value or content SHALL be the primary scan anchor; actor and timestamp SHALL remain associated supporting metadata. A period label SHALL use a native list-item wrapper containing a visible element with a stable consumer-owned `id`; every following timeline entry in that period SHALL reference that `id` with `aria-describedby` until the next period label. Avatar, connector, marker, color, or prose alone MUST NOT replace the visible structured change.

#### Scenario: Entries span periods

- **WHEN** a consumer inserts labeled period groups
- **THEN** each period label retains valid native list structure, is explicitly associated with its following entries, and does not imply library-owned sorting

#### Scenario: Long and sparse entries

- **WHEN** entries contain long localized content or omit optional actor imagery and attachments
- **THEN** the timeline remains legible and does not render misleading empty affordances

#### Scenario: Status changes

- **WHEN** an entry supplies an old and new status
- **THEN** both values and their transition are visible with source-backed status treatment and do not rely on marker color alone

#### Scenario: Field value changes

- **WHEN** an entry supplies an old and new text value
- **THEN** the values and transition remain directly scannable rather than being flattened into an undifferentiated description sentence

#### Scenario: Comment, tags, people, or attachment is recorded

- **WHEN** an entry supplies quoted comment content, tags, employee identities, disclosure, or an attached file
- **THEN** the applicable content uses its source-observed structure and composes existing verified primitives without transferring their runtime ownership to History Timeline

## ADDED Requirements

### Requirement: History Timeline uses frame-bound source fidelity

History Timeline SHALL derive its desktop visual contract from `shlz-design-source/raw/svg/History of changes.svg`. Exact source frame geometry, spacing, typography, colors, event treatments, and composed primitive boundaries MUST be recorded before implementation. Existing generic rail/avatar styling, snapshots, or derived audit claims MUST NOT override the original SVG.

#### Scenario: Generic timeline convention conflicts with the source

- **WHEN** a rail, marker, avatar, or generic event layout is not present in the authoritative frame or obscures the source-observed changed content
- **THEN** it is removed or corrected and visual evidence is compared directly with the named source frame

#### Scenario: Responsive behavior is not exported

- **WHEN** narrow-container or enlarged-text behavior has no corresponding authoritative source frame
- **THEN** it is implemented only as an explicit accessibility/design-system decision that preserves source hierarchy and is not labelled a Figma fact

### Requirement: History Timeline verification is revoked by fidelity findings

History Timeline SHALL remain below `VERIFIED` while its authoritative-source attribution, supported event contract, implementation, consumer examples, audit manifest, or focused evidence contradicts `History of changes.svg`. Verification MAY be restored only after repository-wide occurrence classification and all applicable component-gate evidence independently pass.

#### Scenario: Existing evidence proves only generic geometry

- **WHEN** prior snapshots prove containment and connector continuity but do not reproduce the source-observed event variants
- **THEN** those snapshots remain historical evidence but cannot support a current focused-visual `pass`

#### Scenario: Corrected implementation passes the component gate

- **WHEN** exact source-frame comparisons, semantics, native actions, accessibility, responsive/content stress, and a real consumer pass with no unclassified occurrences or blocking findings
- **THEN** History Timeline may return to `VERIFIED` independently of Comment Feed and Message Thread
