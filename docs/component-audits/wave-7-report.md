# Wave 7 Modal and Drawer overlay audit

- Baseline: `0cbc1286046186d60b5b4dad93931756528f2ea9`.
- Reviewed implementation revision: `ef0d1c86b953f6e134f33b24516269eeb9d6aeb6` (audited range `0cbc128...ef0d1c8`). The following report-only revision records that immutable implementation SHA without changing audited code.
- Baseline working tree: only the approved Wave 7 OpenSpec artifacts were untracked.
- Baseline checks: 87/87 Node tests and 12/12 Chromium overlay tests passed. The baseline branch had no open PR or review thread.
- Source hashes: Modal `62b0686f4ea17ecb8bb0bf25fe9020ee3a1512728e4271fd6fc734595e2b7fed`; Drawer `a7ff3b75584ad5782bb2e3b2bc6b2dd62baec589c32edb334d619a65dbf49e8e`. Both remain unchanged.

## Census and scope

Modal has five executable Showcase roots (structured long-content Basic, compact Info, Success, Warning, and Error), one plain-HTML live consumer, and five inert source diagnostics. Drawer has one executable Showcase stress fixture, the Data Workspace live consumer, one plain-HTML live consumer, and one inert source diagnostic. No legacy/native substitute or local alternative was found.

Scans found no supported Modal-in-Modal, Drawer-in-Modal, Modal-in-Drawer, sibling modal concurrency, nested-popover-tree, or portal occurrence. No public `OverlayController`, `ModalManager`, portal, focus trap, inert polyfill, z-index stack, or document scroll lock was introduced.

## Evidence disposition

Modal independently passes source integrity, structural contract, Chromium runtime, accessibility, focused visual, consumer integration, and responsive/content-stress evidence. Its executable ledger covers Basic, Info, Success, Warning, Error, focus-visible, long-content, and narrow layout.

Drawer independently passes the same seven levels. Its ledger covers dismissible and non-dismissible open states, focus-visible, long content, and narrow layout. Data Workspace retains application-owned filter state.

Focused snapshots were inspected. A temporary background shift caused by visible audit triggers was rejected rather than accepted as a new baseline; the triggers were removed from layout and existing component snapshots remain unchanged. No source-backed image changed.

One pre-existing source-backed P1 deviation is accepted for this PR: compact Modal secondary text measures approximately 2.79:1 rather than the 4.5:1 emergency guard. Wave 7 neither introduced nor worsened it and does not silently recolor the authority; [issue #25](https://github.com/Antropophag/shlz-ui/issues/25) tracks the required source/shared-contract decision.

Manual Chromium walks covered pointer open/explicit close/backdrop/outside drag, Tab/Shift+Tab and focus-visible, Escape and nested-surface precedence, native form values, long/narrow content, stale/aria-disabled opener handling, repeated enhancement/reopen/teardown, nested Dropdown/Tooltip/Popover, plain HTML, and Data Workspace.

## Limitations, CI, and review

The current harness supports Chromium only, so no cross-engine claim is made. The build retains its pre-existing Vite chunk-size warning.

Final local validation results:

- `npm run check:openspec` — pass, OpenSpec 1.10.0 harness healthy;
- `openspec validate wave-7-modal-drawer-overlays --strict` — pass;
- `npm test` — 87/87 pass;
- `npm run lint` — ESLint, Stylelint, and Prettier pass;
- `npm run build` and `node tools/validate.mjs` — all workspaces build; 68 source SVGs, three token groups, 119 canonical icons, and 42 aliases validate;
- `npm run test:packages` — four packed packages install and execute from a clean project;
- `npx playwright test tools/playwright/overlay.spec.js --project=chromium` — 25/25 focused overlay tests pass;
- `npm run test:e2e` — 190/190 Chromium tests pass, including Wave 6, Data Workspace, plain HTML, accessibility, responsive/content stress, and focused visual snapshots;
- `git diff --check` and final raw SVG SHA-256 comparison — pass with no source diff.

The first two-axis review of implementation commit `236d387` reported three Standards and six Spec findings. Follow-up review left one report and three partial spec findings; all are resolved in the audited implementation through `ef0d1c8`: stale-owner deletion is identity-conditional; exact census/report claims are corrected; Modal and Drawer nested reopen/second-Escape/teardown, two-Drawer isolation, pointer gesture reset, plain-HTML teardown, and Data Workspace stress evidence execute. No material scope creep was found. GitHub CI and review threads are pending PR creation; the unmerged PR head carries their current state.
