## Why

Executable evidence can currently prove one representative member of a newly declared finite set while silently omitting its peers. PR #45 exposed this with Golos Text: a loading test covered weight 400 while the implementation declared 400, 500, 600, and 700, so three missing faces could have passed until CodeRabbit identified the gap.

## What Changes

- Extend validation manifests with an optional closed-set coverage declaration for changes that introduce or modify finite variants, states, weights, roles, enum values, or finite combinations.
- Refuse a validation receipt unless every declared member is executable-covered or has an explicit, non-empty exclusion justification.
- Reject duplicate, undeclared, overlapping, or malformed coverage entries so arithmetic or self-asserted counts cannot hide a gap.
- Bind the normalized closed-set declaration and its evidence references into the validation receipt and reuse identity.
- Add the PR #45 Golos Text 400/500/600/700 omission as a regression fixture plus generalized fixtures for other finite-set errors.
- Document when agents must declare closed-set coverage and what counts as an acceptable exclusion.
- Preserve existing validation manifests that do not claim a changed closed set.

Non-goals: infer finite sets from source code or prose, prove the semantic truth of a test assertion, require Cartesian-product coverage when the contract declares only independent axes, or add a separate coverage service.

## Capabilities

### New Capabilities

- `harness/closed-set-executable-evidence`: Declares, validates, receipts, and documents exhaustive executable evidence for changed finite contract sets.

### Modified Capabilities

None. The related receipt-workflow contract remains in an unarchived historical change rather than `openspec/specs/`, so this change adds a self-contained capability.

## Impact

- Affects the public `validate` manifest/receipt contract in `tools/lib/harness/core.mjs` and its CLI adapter.
- Adds focused harness tests and a representative regression fixture derived from PR #45.
- Updates agent-facing validation workflow documentation.
- No UI packages, design values, dependencies, deployment, permissions, or `shlz-design-source/` files change.
- Compatibility is additive: closed-set coverage is required when the change declares that finite-set impact; existing unrelated validation manifests remain valid.
