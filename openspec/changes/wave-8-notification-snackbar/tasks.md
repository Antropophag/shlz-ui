## 1. Baseline and source authority

- [x] 1.1 Record clean branch/HEAD, existing CI and review-thread state, baseline checks, exact repository occurrences, and raw source hashes in Wave 8 evidence; verify no source file is modified
- [x] 1.2 Correct and harden Notification/Snackbar source provenance, variant census, geometry, effects, contour, and lossless-reference checks; verify all three Notification and six Snackbar variants against raw authority

## 2. Independent audit contracts

- [x] 2.1 Add Notification and Snackbar component manifests with separate states, stress ledgers, claims, occurrences, findings, limitations, and evidence; verify manifest-contract tests accept each independently
- [x] 2.2 Add stable audit IDs and repository-wide plus built-DOM occurrence guards for all executable fixtures, consumers, diagnostics, and substitutes; verify positive census and negative unclassified-occurrence regressions

## 3. Notification implementation and evidence

- [x] 3.1 Reconcile Notification CSS, docs, Showcase, plain-HTML consumption, and application-owned lifecycle examples with the source/spec contract; verify selector compatibility and no behavior package export
- [x] 3.2 Add focused Notification browser coverage for source geometry/paint, real hover/active/focus-visible/disabled states, activation and focus recovery, semantics, long/narrow/text-scale stress, and consumer integration; inspect and approve focused snapshots

## 4. Snackbar implementation and evidence

- [x] 4.1 Add an explicit accessible Snackbar Showcase/consumer contract that preserves exact source frames without a library timer or announcement policy; verify all six contours and application-owned action/lifecycle boundary
- [x] 4.2 Add focused Snackbar browser coverage for real action hover/active/focus-visible/disabled states, stable accessible content, long/narrow/text-scale stress, and consumer integration; inspect and approve focused snapshots independently from Notification

## 5. Integration, review, and delivery

- [x] 5.1 Run source integrity, OpenSpec, lint, build, package, full browser, accessibility, visual and regression validation plus manual state walks; record exact counts, snapshot disposition, limitations, CI, and independent component statuses in the Wave 8 report
- [ ] 5.2 Run two-axis Standards and Spec review against `origin/main`, remediate every scope-local finding, rerun affected checks, complete route-conformance/delivery guards, push the task branch, open an unmerged PR, and verify required GitHub checks are green
