# File Upload / Drop Zone validation summary

Candidate baseline: `aa519fae9fc31614d148aa558e2cd33bba555d29` (`origin/main`).

## Completion gate

- Repository census: 6 classified File Upload occurrences — 4 executable Showcase fixtures, 1 Data Workspace live consumer, and 1 plain-HTML fixture; 0 diagnostics, legacy substitutes, or unclassified occurrences.
- Cross-component census: the associated label uses the independent File Upload trigger contract; 1 populated File Row stress fixture and 1 Data Workspace File Row consumer are explicitly classified, with no dynamic unclassified File Row generation.
- Source authority: `shlz-design-source/raw/svg/Documents.svg`; the recorded source hash and read-only source tree are unchanged.
- Runtime/accessibility: native keyboard file selection, native `change`, real `FileList` drop, non-file filtering, disabled suppression, bubbling event payload, idempotence, teardown, focus, and focused Axe checks pass.
- Visual/content stress: empty, populated, drag-active, disabled, error, narrow, long-content, and 200% text states pass computed assertions; focused narrow and state-matrix snapshots were inspected.
- Consumer boundary: browser selection executes the Data Workspace branch, updates its application-owned status, and rerenders its classified File Row; the library owns no validation, transport, progress, retry, cancellation, or persistence state.

## Automated evidence

- `npm run check`: OpenSpec health, generation, source validation, lint, build, and package smoke passed; Node suite passed 176/176. The final browser leg was rerun after the last census correction.
- `npm run test:e2e`: Chromium passed 257/257 in 15.6 minutes.
- Focused File Upload plus full Wave 5 browser suites: 13/13 passed.
- Focused Wave 3 occurrence guard: 1/1 passed.
- Full Wave 5 browser suite: 8/8 passed.
- Packed consumer smoke: all 4 SHLZ packages installed and consumed from a clean project.

## Manual state walk and limitations

The empty, populated, drag-active, disabled, error, narrow, long filename/instructions, enlarged-text, keyboard selection, consumer rerender, repeated enhancement, and destroyed-controller states were exercised through the real Showcase/plain-HTML surfaces and focused screenshots. At 200% text and a 300px component width, the native trigger, File Row action, upload focus ring, and action focus ring were measured as visible and contained.

The source does not define upload policy or transport semantics. File acceptance, validation, deduplication, previews, removal, progress, retry, cancellation, persistence, and announcements remain consumer-owned. The existing Showcase bundle-size warning remains and is unrelated to this component. The Impeccable detector ran in degraded regex-only mode because optional parser dependencies were unavailable; no regex findings were reported, so its count is treated as an undercount rather than gate evidence.
