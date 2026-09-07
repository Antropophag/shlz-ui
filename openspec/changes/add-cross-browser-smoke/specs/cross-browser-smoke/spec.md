## Purpose

Detect regressions in representative SHLZ interactions across three browser engines while preserving the existing full Chromium regression and visual evidence.

## ADDED Requirements

### Requirement: Shared bounded functional smoke coverage

The smoke command SHALL run exactly seven shared functional scenarios in each of Chromium, Firefox, and WebKit (21 executions). The scenarios SHALL cover Input native value/events, Checkbox native lifecycle, Select keyboard selection and focus restoration, Modal focus containment and Escape, Popover dismissal and state synchronization, Date Picker keyboard dismissal/commit and accessibility, and File Upload selection/drop/disabled/consumer rendering. These SHALL reuse the full suite's test bodies without browser-specific skips or reduced assertions and SHALL NOT compare screenshots.

#### Scenario: Three-engine smoke execution

- **WHEN** the smoke command runs with all browser prerequisites installed
- **THEN** all seven scenarios execute in each of the three engines and any failed scenario makes the command fail

#### Scenario: Smoke selection is inspected

- **WHEN** a developer lists the smoke suite
- **THEN** the listing contains the same seven scenario identities for each browser and no visual snapshot tests

### Requirement: Full Chromium regression coverage is preserved

The default browser test command SHALL retain the entire Chromium suite, including the seven smoke scenarios and all existing visual tests, with unchanged snapshot identities.

#### Scenario: Default suite is inspected

- **WHEN** a developer lists the default suite after smoke support is added
- **THEN** it contains the same Chromium test identities as before and no Firefox or WebKit projects

### Requirement: CI runs smoke with browser prerequisites

CI SHALL run the three-browser smoke suite in a separate job on pull requests to main and pushes to main. That job SHALL install the pinned dependency tree, all three browser binaries, and their Linux host dependencies. A smoke failure SHALL fail its job; full Chromium browser and visual tests SHALL continue in their existing job.

#### Scenario: Clean CI runner

- **WHEN** CI starts on a clean supported Linux runner
- **THEN** browser and host dependencies are installed before the smoke command and no missing local WebKit dependency is treated as a skip

#### Scenario: Smoke failure is visible

- **WHEN** any smoke test fails
- **THEN** the smoke job reports failure independently of the full Chromium suite

### Requirement: Smoke checkout credentials are not persisted

The smoke job SHALL use checkout without persisting its authentication token or SSH key in local Git configuration for subsequent repository-controlled commands.

#### Scenario: Repository commands run after checkout

- **WHEN** the smoke checkout finishes and dependency, build, or test commands run
- **THEN** checkout authentication credentials are not retained in local Git configuration
