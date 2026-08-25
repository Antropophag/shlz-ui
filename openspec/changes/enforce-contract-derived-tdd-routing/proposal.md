## Why

The current spec-driven TDD lifecycle is planner-opt-in: a material OpenSpec change can omit `specDrivenTdd` from its assessment and receive a valid plan with no RED-before-production gate. Wave 9 demonstrated this bypass when its behavior/state implementation and tests were produced together even though its change contract contained deterministic, executable interaction scenarios.

## What Changes

- Make each current-change scenario declare a closed implementation-semantics category in its delta contract.
- Derive the change's TDD obligation from those contract declarations during plan creation instead of trusting planner-selected `specDrivenTdd` presence.
- Require every material behavior/state scenario to be covered by an enforced TDD slice before a plan can be emitted.
- Keep source-only, absence-only, and documentation scenarios outside the mandatory lifecycle while retaining ordinary voluntary TDD.
- Preserve historical plans as readable state, but fail closed for newly planned OpenSpec changes whose current contracts require TDD.
- Add the original Wave 9 execution plan and contract as a regression fixture, plus negative fixtures proving the non-material exclusions.
- Make validation routing impact-aware so harness/spec/docs-only work that does not affect browser or product executable behavior cannot select Playwright merely because a generic final/full gate exists.
- Bind reusable validation evidence to the complete validation-input closure, including relevant source, tests/oracles, runner configuration, dependency inputs, and validation policy.

## Capabilities

### New Capabilities

- `harness/contract-derived-tdd-routing`: Contract classification, obligation derivation, plan enforcement, compatibility, and regression evidence for mandatory test-first execution.

### Modified Capabilities

None. The related spec-driven TDD contracts remain in unarchived historical changes rather than a living `openspec/specs/` capability, so this change adds a self-contained capability.

## Impact

The public harness `plan`, `affected`, `validation-check`, and `validation-record` commands, plan construction/validation modules, OpenSpec delta parsing, validation policy, harness fixtures/tests, and execution/validation documentation are affected. No design-system package or `shlz-design-source/` file changes. The principal risks are over-classifying evidence-only scenarios and reusing stale expensive evidence; closed semantics, executable impact fixtures, and validation-input-closure fingerprints bound those risks. PR merge remains user-owned and outside this change.
