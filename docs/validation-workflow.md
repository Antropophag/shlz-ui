# Change-aware validation and review

Use the ladder:

`edit → cheapest relevant check → focused module/component checks → affected integrations → aggregate/final checks`

Ask the harness for deterministic routing:

```bash
npm run harness -- affected <changed-file> [changed-file...]
```

For requirements-gated work, bind routing to normative impact declarations:

```bash
npm run harness -- affected <changed-file> [changed-file...] --change <openspec-change>
```

The mapping lives in `docs/exec-plans/config.json` and is regression-tested. Paths locate candidate surfaces; they do not decide impact. A change whose contract classifies it as harness/spec/docs-only excludes Playwright only when no changed browser/product executable surface contradicts that claim. Browser-contract or browser-executable impact selects browser validation even when the edited file is prose. Missing, unknown, or contradictory impact conservatively escalates to `full-browser`. `native-dialog.ts` expands to Modal, Drawer, and overlay integration; component-local changes remain component-local; manifests select census/schema evidence.

Record a result with `validation-record --raw-log <repository-path>`. From a fixed base it first proves target relevance, then fingerprints the complete configured validation-input closure: relevant source/executable surfaces, target tests and oracles, validation policy, runner/browser configuration, and applicable dependency/lock inputs. It copies raw output to a digest-named artifact under `docs/exec-plans/raw-logs/` and appends the compact result/reason/pointer to the ledger. `validation-check` returns `action: reuse` for an expensive successful target with an identical closure, so the command must not be executed again. Any closure mutation yields `action: run`; an explicit reason can justify a deliberate rerun of an unchanged closure but cannot make changed inputs reusable. Unmatched or unknown impact conservatively selects browser escalation instead of returning no checks.

## Review lifecycle

After focused validation, inspect the complete target diff from the execution-episode baseline. For material work, M/L/XL execution, or explicit review risk, run one diff-scoped Standards review and one Spec review from that same baseline. Direct S work needs the complete target-diff inspection but does not create independent review ceremony by default. Share the diff command and narrow sources, not full prior discovery. Consolidate actionable findings into one remediation batch. Re-review only the remediation/current episode diff and unresolved findings; do not restart parent-PR or repository-wide discovery.

Use `review-init --plan <execution-plan>`, `review-record`, `review-context`, and `review-resolve` to persist the authoritative plan, fixed base, reviewed head, axes, findings, and dispositions. After a pass, `review-context` returns `<last-reviewed-head>..HEAD` plus unresolved findings, which is the complete re-review working set; resolve ids only after the targeted re-review confirms closure.

When the material diff changes a state machine, persisted recovery, or a subprocess/stream boundary, mark each applicable current-change delta scenario with `<!-- failure-invariant: <id> concern=<concern> -->`, derive the executable manifest from those contracts, and initialize the same review with `--failure-path-concerns <list> --change <name> --invariants <manifest>`. Before treating its two axes as complete, run a focused failure-path fixture and record it with `review-proof --proof <result>`. A valid proof covers the fixed baseline plus every marked current-change invariant, binds their contract/manifest digests, and discriminates a known-bad revision from the reviewed head; physical reviewer separation, green happy-path tests, prose handoffs, and a third PASS do not supply that guarantee. If the fixture or an independent failure-path method is unavailable, keep review incomplete and seek external diversity only when it can supply the missing method or environment. Direct S target-diff review and stateless changes skip this branch.

For an enforced spec-driven TDD plan, pass `--tdd-plan` and `--tdd-state` to
`review-init` and every `review-record`. Spec review owns scenario coverage,
authority independence, and oracle strength. Standards review owns deterministic
controls, surface isolation, cleanup, and harness integrity. GREEN is necessary
but does not replace marked failure-invariant proof; both must identify the same
reviewed candidate head. For version 2 slices, both axes and delivery are also
bound to the current pre-implementation test-contract approval digest. A later
Spec finding that invalidates that approval returns through requirements or test
design/review re-entry; the earlier approval cannot waive the finding. For the
test-design route, record `invalidatesTestContract: true`, the affected
`sliceId`, and `reentry: "test-design"`; TDD-bound `review-record` resets the
slice's design, review, and implementation packets and handoffs.

For GitHub follow-ups, load actionable unresolved threads only. Route verified findings by their bounded delta, never by review author. Exclude resolved discussion, walkthroughs, release/billing messages, and duplicate bot summaries from active context. P0/P1 defects remain blocking regardless of budget.

## Evidence and telemetry

`harness evidence <base-ref>` queries baseline/current refs, changed files, and working-tree state without editing a report. Record validation results, totals exposed by commands, occurrence counts, CI/review state, and material states as structured observations. Prose owns decisions, limitations, findings, and dispositions. Never commit a “final SHA” update whose own commit immediately makes it stale.

Telemetry events require packet/session/agent/phase and record only observed counts. Token/context usage requires an explicit runtime source; absent usage is `unavailable`, not zero. Summaries stay out of normal packet context unless evaluation needs them.

# Contract-derived TDD routing

Before accepting a newly created requirements-gated execution plan, validation
must confirm that the selected delta contract is readable, every scenario has
one supported `implementation-semantics` declaration, and every derived
material identity has exact enforced-slice coverage. Run the focused public
probe with:

```bash
node tools/tests/contract-derived-tdd-routing-probe.mjs
```

The probe must reject the original Wave 9 omission, report all six uncovered
identities, accept complete material coverage, and accept source-only,
absence-only, and documentation-only controls. `plan-check` remains the
compatibility seam for historical persisted plans without a
`contractDerivedTdd` binding.
