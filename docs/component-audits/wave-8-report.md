# Wave 8 Notification and Snackbar audit

- Baseline: `b0be221855bf7a16181a797d39387cc77f3ae626` on clean `feat/wave-8-notification-snackbar` from current `origin/main`.
- Baseline PR/review state: no PR existed for the task branch and no task review thread existed.
- Raw authority hashes: Notification SVG `47452a53ea7b6b123de3292d0a0deed656d7f3a5dfa138e7577429ed07abbf05`; Basic elements ZIP `1c468cc4c1246aabfd0932451dedd5126cce2d24597b3141b50f8437146e3cf8`.
- `shlz-design-source/` is unchanged.

## Census and confirmed contracts

Notification has three executable Showcase roots: two live application-owned examples and one content-stress fixture. Plain HTML adds one live consumer. Six inert diagnostic roots cover the two Implementation source matrices plus four fidelity compositions. No legacy/native substitute or local alternative was found.

Snackbar has two executable Showcase roots: one live application-owned action example and one content-stress fixture. Seven inert diagnostics cover one Implementation matrix plus all six exact fidelity frames. No plain-HTML or Data Workspace consumer, legacy/native substitute, or local alternative was found.

Raw source proves exactly three Notification Type variants (Default, With button, Error) and six Snackbar Number variants (5, 4, 3, 2, 1, 0), all 384×58. The source establishes radius 29, paint, stable content/action geometry, numerals and contour paths. It does not establish urgency, placement, queueing, timing, one-second steps, animation, auto-dismiss, pause, persistence, synchronization, callbacks, live-region policy, removal or focus recovery; those remain consumer-owned.

## Evidence disposition

Notification independently passes source integrity, structural contract, Chromium runtime, accessibility, focused visual, consumer integration, and responsive/content-stress evidence. Its material-state ledger covers default, error, with-button, real hover/active/focus-visible, native disabled, long content, 320px layout, and 200 percent text scaling. Application-owned close restores eligible focus and action activation executes once without a library behavior export.

Snackbar independently passes the same seven evidence levels. Its ledger covers all six exact static contours, real action hover/active/focus-visible, native disabled, stable accessible content, long/narrow/text-scaled content, and one live Showcase consumer. Waiting does not advance the frames: no timer, lifecycle controller, repeated countdown announcement, or SHLZ event is introduced.

Five focused snapshots were generated and manually inspected. The first pass exposed a high-content radius defect caused by `radius-max=100px`, an intra-word action wrap, and a missing contour in the stress fixture. The final source-backed implementation uses radius 29, normal word wrapping, and the exact Number=0 contour; the second bounded snapshot pass shows no remaining clipping or unexplained change. A canonical framework-neutral contour module now supplies both Showcase surfaces, while browser expectations are independently extracted from the lossless raw-derived SVG references.

Manual Chromium walks cover pointer hover/down, Tab/focus-visible, Enter/Space, disabled actions, Notification close/focus return, all six Snackbar frames, long localized content, 320px viewport, and 200 percent text scaling. Cross-engine certification is not claimed because the current harness runs Chromium only.

## Validation, review, CI and delivery

Focused source/manifest/census Node checks pass 6/6. Focused Notification contract plus Wave 8 Chromium checks pass 10/10. Final local validation records:

- `npm run check:openspec` and strict Wave 8 validation — pass on OpenSpec 1.10.0;
- `npm test` — 123/123 pass;
- `npm run lint` — ESLint, Stylelint and Prettier pass;
- `npm run build` and `node tools/validate.mjs` — all workspaces build; 68 source SVGs, three token groups, 119 canonical icons and 42 aliases validate;
- `npm run test:packages` — four packed packages install and execute from a clean project;
- `npm run test:e2e` — 200/200 pass on the stabilized fingerprint after the broad Showcase snapshot was manually reviewed and accepted;
- `git diff --check`, raw source hash comparison and no-diff check under `shlz-design-source/` — pass.

Impeccable technical audit after remediation scores Accessibility 4/4, Performance 4/4, Theming 4/4, Responsive 4/4, and Implementation Integrity 4/4 (20/20). Its only mechanical advisory is a pre-existing Showcase decorative grid background outside the Wave 8 diff; it is not a component finding. Positive evidence includes native controls, no new runtime dependency, source tokens/paints, bounded responsive growth, exact contour assets, and independent occurrence/state ledgers.

Two-axis review initially found five spec-evidence gaps and two standards concerns. Remediation added a lossless Notification crop comparison, independent dark `With button` evidence, complete six-frame Snackbar numeral/geometry/paint checks, component-isolated 200 percent text scaling with page-overflow assertions, the final 200/200 regression run, and canonical contour ownership. The reviewers found no scope creep; a post-remediation re-review is required before delivery.

Final implementation SHA, PR URL, GitHub CI and review-thread state are recorded here before delivery; until those fields are populated neither component is reported as delivered or review-ready.

No accepted deviation or open component finding is currently recorded. The existing Vite chunk-size warning is repository-wide and Wave 8 neither introduces nor worsens it.
