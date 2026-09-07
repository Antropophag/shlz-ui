# Cross-browser smoke validation

Implementation candidate: `22b686f3fbd79685f7fce1d29be636f225e58552`.
Baseline: `961fb72208b5732fc64d80d6ecb1914ce1faab98`, a planning-only PR head based on current `origin/main` `f32aa17509580bab1836b9f1d09365633cc9bb7f`.
Delivery: [PR #83](https://github.com/Antropophag/shlz-ui/pull/83), unmerged.

## Authorization and scope

The user explicitly requested continuation of the interrupted codex-kz session and supplied its plan: preserve the full Chromium suite and run seven shared functional scenarios across Chromium, Firefox, and WebKit, with WebKit host dependencies on CI. This pre-authorizes implementation after OpenSpec synthesis. Scenario selection is agent-owned; the same existing bodies cover Input, Checkbox, Select, Modal, Popover, Date Picker, and File Upload.

No component implementation, source artwork, snapshot, release behavior, permission, or component completion status changed. The new checker contributes one unrelated event-terminology path to the Wave 12 census: unrelated 66 → 67, total 81 → 82. The focused five-test census suite passes.

## Observed checks

- Default Playwright discovery: 316 unchanged Chromium test identities before/after the smoke addition.
- All 54 literal-title test callback bodies in the six touched spec files retain identical syntax trees apart from formatting metadata.
- Smoke discovery: exactly seven shared scenario titles per engine, 21 executions. Candidate-bound closed-set validation executes the discovery oracle for every browser/scenario member.
- Local Chromium and Firefox smoke: 14/14 passed. Local WebKit cannot launch because host libraries are missing; no browser skip was added.
- [Smoke CI on the implementation candidate](https://github.com/Antropophag/shlz-ui/actions/runs/34144797749/job/101814372236): 21/21 passed, including WebKit.
- [Full Chromium CI after tagging](https://github.com/Antropophag/shlz-ui/actions/runs/34144084990/job/101812197918): 316/316 passed. Later changes affect only the discovery checker, smoke-job installation, and census/receipt metadata; test bodies and the full-suite configuration stay identical.
- Implementation-candidate Required checks and SonarCloud passed. The full Chromium job on that exact candidate was still running when this record was written; inspect the PR for subsequent CI state.
- OpenSpec strict validation and integration check, relevant ESLint/Prettier checks, and `tools/validate.mjs` passed. The latter verified 68 source SVGs, three token groups, 119 canonical icons, and 42 aliases.
- Symmetric discovery oracle: default Chromium configuration is rejected as the known-bad smoke target; candidate smoke selection passes.
- Route conformance and delivery receipts passed on the implementation candidate. Metadata-only finalization requires refreshed candidate-bound receipts; raw logs and transient receipts stay local.

## Independent review

Standards: PASS, zero findings; runtime `01a07cc5-d9c0-7c01-b29c-6cc44a608023`.
Spec: PASS, zero findings; runtime `01a07cc5-d9c8-7e42-b9bd-7434c2d9d40e`.

Both used independent Codex execution identities and reviewed the full baseline-to-candidate diff. SonarCloud findings were fixed by restricting checker inputs to repository-owned configurations, adding explicit string ordering, installing dependencies without lifecycle scripts, and invoking the locally pinned Playwright CLI. At this checkpoint there were zero GitHub review threads; CodeRabbit was queued. This record does not substitute for later external review.

This is representative functional browser coverage, not complete Firefox/WebKit compatibility, a visual audit, or any component completion claim.
