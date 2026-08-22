# Change-aware validation and review

Use the ladder:

`edit → cheapest relevant check → focused module/component checks → affected integrations → aggregate/final checks`

Ask the harness for deterministic routing:

```bash
npm run harness -- affected <changed-file> [changed-file...]
```

The mapping lives in `docs/exec-plans/config.json` and is regression-tested. It is conservative for shared seams. A docs-only result excludes Playwright; `native-dialog.ts` expands to Modal, Drawer, and overlay integration; component-local changes remain component-local; manifests select census/schema evidence.

Record a result with `validation-record`; from a fixed base it derives target-relevant changed files using configured fingerprint patterns, reads them inside the repository, computes their SHA-256 fingerprint, checks prior successful entries, and appends the result/reason to the ledger. Before repeating an expensive successful target at the same fingerprint, supply an invalidation reason. A changed runtime input, substantive remediation, flaky/infrastructure diagnosis, changed browser/dependency, or final stabilized integration can be a reason. Report/docs edits are not browser invalidation. Unmatched scope conservatively selects the full target instead of returning no checks. The full suite remains required when the change/final gate calls for it; the selector does not weaken acceptance or the component gate.

## Review lifecycle

After focused validation, run one diff-scoped Standards review and one Spec review from the same fixed base. Share the diff command and narrow sources, not full prior discovery. Consolidate actionable findings into one remediation batch. Re-review the remediation/current diff and unresolved findings; do not restart repository-wide discovery.

Use `review-init`, `review-record`, `review-context`, and `review-resolve` to persist the fixed base, reviewed head, axes, findings, and dispositions. After a pass, `review-context` returns `<last-reviewed-head>..HEAD` plus unresolved findings, which is the complete re-review working set; resolve ids only after the targeted re-review confirms closure.

For GitHub remediation, load actionable unresolved threads only. Exclude resolved discussion, walkthroughs, release/billing messages, and duplicate bot summaries from active context. P0/P1 defects remain blocking regardless of budget.

## Evidence and telemetry

`harness evidence <base-ref>` queries baseline/current refs, changed files, and working-tree state without editing a report. Record validation results, totals exposed by commands, occurrence counts, CI/review state, and material states as structured observations. Prose owns decisions, limitations, findings, and dispositions. Never commit a “final SHA” update whose own commit immediately makes it stale.

Telemetry events require packet/session/agent/phase and record only observed counts. Token/context usage requires an explicit runtime source; absent usage is `unavailable`, not zero. Summaries stay out of normal packet context unless evaluation needs them.
