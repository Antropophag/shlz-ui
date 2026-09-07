## Why

Six Status foregrounds and Empty State secondary text fail the repository's active-text contrast requirement. Their existing audits explicitly retain source-paint deviations, and Empty State also names the wrong source archive. The user approved addressing these two components first while GitLab activation stays deferred.

## What Changes

- Introduce six documented semantic Status foregrounds that retain the source hue families and original pill backgrounds.
- Reuse the existing accessible supporting-text role for Empty State secondary titles/descriptions; retain primary titles and illustration paints.
- Preserve public markup, geometry, behavior ownership, all raw source values and Badge styling.
- Verify all nine Status paints and four Empty State compositions on the four supported light surfaces, re-attest each component's occurrences and consumer evidence, and reconcile documentation and findings.

## Capabilities

### New Capabilities

- `data-display/status`: Establish the existing static Status contract with accessible production foregrounds and immutable source evidence.
- `data-display/empty-state`: Establish the existing optional-region presentation contract with accessible supporting text.

### Modified Capabilities

None. Existing source values and shared text roles retain their contracts.

## Impact

Tokens, two component stylesheets, component/source documentation, audit manifests, focused browser/source tests and affected visual snapshots. This is a backward-compatible visible correction with additive semantic variables and a patch changeset for tokens/styles. No library behavior, new framework dependency, application migration, GitLab setup or package publication is included. Each component must pass its own completion gate.
