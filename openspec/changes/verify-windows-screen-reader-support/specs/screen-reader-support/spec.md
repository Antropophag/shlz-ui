## Purpose

Establish bounded, reproducible evidence of what a real screen reader conveys during SHLZ workflows, separately from browser automation and general accessibility conformance.

## ADDED Requirements

### Requirement: Versioned Windows screen-reader matrix

The support record SHALL distinguish engine smoke, actual AT-tested combinations, failures, and untested combinations. The initial actual AT matrix SHALL contain Windows with NVDA and each of Chrome and Firefox. It SHALL record exact OS/build, browser, AT version, locale, relevant settings, source commit and date. Results SHALL NOT imply coverage of different versions, operating systems, VoiceOver, mobile AT, braille, or human usability evaluation.

#### Scenario: Read the support record

- **WHEN** a consumer inspects support evidence
- **THEN** it can identify the exact tested combinations, scenario verdicts and limitations without interpreting a browser-only pass as an AT pass

### Requirement: Critical workflows have actual speech and keyboard evidence

Each initial combination SHALL execute seven workflows against existing SHLZ fixtures or consumers: Input, Checkbox, Select, Modal, Popover, Date Picker and File Upload. User interaction checkpoints SHALL use OS-level keyboard input with NVDA active. Browser APIs may prepare the initial fixture, locate targets and inspect resulting DOM state; they SHALL NOT stand in for recorded NVDA speech.

Input evidence SHALL cover name/value and the invalid/error-description relationship. Checkbox evidence SHALL cover name, checked and mixed state. Select evidence SHALL cover name/role, expansion, option navigation, committed value, cancellation and focus return. Modal evidence SHALL cover name/role, initial focus, containment and dismissal/return. Popover evidence SHALL cover expansion, interactive content access and dismissal/return without a modal trap. Date Picker evidence SHALL cover opening, date navigation, commitment/cancellation and returned focus/value. File Upload evidence SHALL cover named native selection, chosen file state and its consumer-authored error relationship. Disabled controls SHALL retain their applicable native unavailable semantics.

Assertions SHALL compare required meaning with observed speech, not prescribe universal word order. Consumer-owned content, validation, queue announcements and application semantics SHALL remain explicitly distinguished from library behavior.

#### Scenario: Execute a workflow

- **WHEN** the agent operates a workflow in a declared browser with NVDA active
- **THEN** the result contains the starting state, input actions, observed speech per checkpoint, resulting focus/value and per-assertion verdict

### Requirement: Missing or unrelated evidence cannot pass

Every requested workflow SHALL be accounted for as pass, fail, or blocked. A pass SHALL require all applicable checkpoints, real AT output, and successful runtime state assertions. Missing AT, absent speech, a stopped process, a failed action, or an unexecuted checkpoint SHALL NOT receive a pass. Scope-local failures SHALL be fixed and rechecked; component completion claims SHALL follow that component's gate independently.

#### Scenario: Speech evidence is missing

- **WHEN** a result has browser-state success but lacks required actual AT speech for a checkpoint
- **THEN** validation rejects a pass

<!-- failure-invariant: missing-speech-cannot-pass concern=subprocess -->

#### Scenario: A workflow is absent

- **WHEN** a matrix result omits a requested browser/workflow combination
- **THEN** validation rejects a complete-matrix claim

### Requirement: Desktop execution preserves unrelated sessions

The runner SHALL use isolated task-owned browser and NVDA profiles, refuse to replace an existing user NVDA session, and verify the intended owned foreground window before sending OS input. It SHALL stop key injection on ownership loss. Cleanup SHALL address only processes and temporary profiles created by this run; it SHALL NOT terminate unrelated browser or screen-reader sessions. Raw desktop logs SHALL remain local; published evidence SHALL contain only relevant fixture speech and redacted environment metadata.

#### Scenario: Foreground belongs to another application

- **WHEN** a keyboard action is requested while the foreground target is not owned by the run
- **THEN** the runner rejects the action before injecting a key

<!-- failure-invariant: foreign-foreground-rejects-input concern=subprocess -->

#### Scenario: Execution ends or fails

- **WHEN** a run completes or fails after starting its own browser or NVDA process
- **THEN** it closes only its owned processes and reports any cleanup failure without masking the original result
