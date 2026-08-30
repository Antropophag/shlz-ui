# File Upload source-fidelity validation summary

Implementation baseline: `b7f34e9` on draft PR #55. Source authority: `shlz-design-source/raw/svg/Documents.svg` (`b2be2c…`), unchanged.

## Completion gate

- Repository census: 6 classified File Upload occurrences — 4 executable Showcase fixtures, 1 Data Workspace live consumer, and 1 plain-HTML fixture; no diagnostics, legacy substitutes, or unclassified implementations.
- Source contract: the default root has a fluid 467px maximum width, and its full-width associated label has a 102px minimum height, a centered 24×24 canonical cloud-upload icon, and the single Russian instruction from the source; the invented pill trigger is absent.
- Runtime/accessibility: native keyboard selection and `change`, real `FileList` drop, non-file filtering, disabled suppression, bubbling payload, idempotence, teardown, focus, and focused Axe checks pass.
- Visual/content stress: empty, populated, drag-active, disabled, error, narrow, long-content, and actual 200% text states pass computed assertions; the stress oracle requires the source-default 14px instruction to compute to 28px, and the focused state and narrow snapshots were inspected against the authoritative SVG.
- Consumer boundary: the Data Workspace consumer still receives selected files and renders the reusable File Row; upload policy, validation, transport, progress, retry, cancellation, and persistence remain consumer-owned.

## Automated evidence

- OpenSpec strict validation passed (4/4 artifacts).
- Focused Node contract suite passed 8/8; full Node suite passed 176/176.
- Focused File Upload Playwright suite passed 5/5; full Chromium suite passed 257/257 in 14.6 minutes.
- Cross-wave census checks passed 6/6.
- ESLint, Stylelint, Prettier, generation, and production build passed; Showcase built 509 modules.
- Source validation passed: 68 SVGs, 3 token groups, 119 canonical icons, and 42 aliases.
- Packed consumer smoke passed for all 4 SHLZ packages.

## Manual state walk and limitations

The default, populated, drag-active, disabled, error, narrow, enlarged-text, keyboard-selection, consumer-rerender, repeated-enhancement, and destroyed-controller states were exercised through the real Showcase and plain-HTML surfaces. The regenerated snapshots show the source-backed full-width composition and a source-scale attached File Row.

The source does not define upload policy or transport semantics. The Impeccable detector ran in degraded regex-only mode because its optional parsers were unavailable; it reported one pre-existing Showcase grid-background advisory outside this change, so that detector is not treated as completion-gate evidence.

CI and review-thread state are recorded at delivery after the final candidate is pushed; neither is represented by the local validation counts above.
