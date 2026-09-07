## Why

Three-engine browser smoke does not establish actual screen-reader announcements. SHLZ needs bounded, repeatable Windows/NVDA evidence for its existing interaction contracts, executed by the agent without manual user work.

## What Changes

- Define a versioned Windows/NVDA support-evidence matrix for Chrome and Firefox, covering seven existing critical workflows.
- Add an agent-operated local runner using real Windows browsers, NVDA input/output logs, guarded OS keyboard input, and isolated temporary profiles.
- Record scenario-level speech, focus, state, versions, failures and limitations; update the roadmap's completed browser-smoke status.
- Diagnose observed accessibility failures and fix scope-local issues only with their own source/contract and component-gate evidence.

## Capabilities

### New Capabilities

- `screen-reader-support`: evidence requirements and safe execution of the bounded actual-AT matrix.

### Modified Capabilities

None initially. Any discovered component-contract change requires explicit reconciliation before its implementation.

## Impact

Primary surfaces are test tooling and accessibility documentation. Existing Showcase and plain-HTML fixtures remain the test consumers. Windows 10 build 19045, Chrome 152, NVDA 2026.2 and stock Firefox 155.0.1 are the initial inspected/downloaded versions; final results must record actual runtime versions.

Original source SVGs remain read-only. No new component, framework adapter, external application pilot, release activation, generic accessibility certification, macOS/VoiceOver result, mobile/braille support, or subjective usability claim is included. Actual AT automation is distinct from human usability evaluation. Portable software and temporary browser profiles are task-owned and existing user sessions must be preserved.
