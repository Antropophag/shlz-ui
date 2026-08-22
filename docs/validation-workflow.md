# Change-aware validation and review

Use the ladder:

`edit → cheapest relevant check → focused module/component checks → affected integrations → aggregate/final checks`

Ask the harness for deterministic routing:

```bash
npm run harness -- affected <changed-file> [changed-file...]
```

The mapping lives in `docs/exec-plans/config.json` and is regression-tested. It is conservative for shared seams. A docs-only result excludes Playwright; `native-dialog.ts` expands to Modal, Drawer, and overlay integration; component-local changes remain component-local; manifests select census/schema evidence.

Before repeating an expensive successful target at the same relevant-file fingerprint, run `validation-check` against the plan ledger. A changed runtime input, substantive remediation, flaky/infrastructure diagnosis, changed browser/dependency, or final stabilized integration can be an invalidation reason. Report/docs edits are not browser invalidation. The full suite remains required when the change/final gate calls for it; the selector does not weaken acceptance or the component gate.

## Review lifecycle

After focused validation, run one diff-scoped Standards review and one Spec review from the same fixed base. Share the diff command and narrow sources, not full prior discovery. Consolidate actionable findings into one remediation batch. Re-review the remediation/current diff and unresolved findings; do not restart repository-wide discovery.

For GitHub remediation, load actionable unresolved threads only. Exclude resolved discussion, walkthroughs, release/billing messages, and duplicate bot summaries from active context. P0/P1 defects remain blocking regardless of budget.

## Evidence and telemetry

`harness evidence <base-ref>` queries baseline/current refs, changed files, and working-tree state without editing a report. Record validation results, totals exposed by commands, occurrence counts, CI/review state, and material states as structured observations. Prose owns decisions, limitations, findings, and dispositions. Never commit a “final SHA” update whose own commit immediately makes it stale.

Telemetry events require packet/session/agent/phase and record only observed counts. Token/context usage requires an explicit runtime source; absent usage is `unavailable`, not zero. Summaries stay out of normal packet context unless evaluation needs them.
