## Why

Semantic packet decomposition currently limits what work should be done together, but it does not limit the active Codex reasoning context that actually performs it. Wave 8 exposed the gap: an XL plan with four packets and isolation recommendations was completed under `root-wave8`, consuming roughly 592K tokens while the harness accepted every claim.

## What Changes

- Make execution mode a guarded runtime contract instead of advisory metadata.
- Add the smallest supported repo-local adapter for launching a fresh non-interactive Codex worker, issuing a scoped packet brief, capturing a durable runtime identity and usage events, and returning a validated handoff.
- Prevent a root execution from silently claiming guarded fresh/isolated packets; unsupported or failed isolation stops explicitly or follows a declared downgrade rule.
- Bind worker identity and lifecycle evidence to packet claims, requirements revision, immutable baseline, dependencies, validation, handoff, review, and delivery state.
- Add honest isolation telemetry and S/M/L/XL regression fixtures, with Wave 8 as the primary evaluation case.
- Preserve bounded execution episodes as a separate small-follow-up mechanism and avoid sizing or review-remediation retuning.

## Capabilities

### New Capabilities

- `harness/execution-context-isolation`: Enforce and attest fresh Codex execution contexts for guarded semantic packets, including lifecycle, recovery, and telemetry contracts.

### Modified Capabilities

None. The earlier adaptive harness change has not been synced into living specs, so this change introduces a separate capability rather than pretending an absent main spec can be modified.

## Impact

The change affects the repo-local harness CLI/core, execution plan/state schemas, fixtures/tests, and agent execution documentation. It may invoke the installed `codex exec --json` interface as a subprocess but introduces no daemon, UI dependency, SDK service, release behavior, or changes under `shlz-design-source/`. Existing direct/S flows remain lightweight; existing bounded execution episode baselines and branch-to-PR delivery guards remain authoritative.
