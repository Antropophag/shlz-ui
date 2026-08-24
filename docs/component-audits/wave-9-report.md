# Wave 9 Sidebar / Application Shell audit

- Baseline: `27f7b49aa407afd9c41e0f32f6eedc14320fcb16` on `feat/wave-9-data-display` from `origin/main`.
- Baseline delivery state: no Wave 9 PR or review thread existed.
- Raw authority hashes: `Sidebar.svg` `92ec7b5992b3f05548f5bb937f856746c4abbd27c675bff3ea37e8ddbdfc96a0`; `Header.svg` `8af415f1b5a499d89b189372837c4a6c584b05471753688550187832ca672392`.
- `shlz-design-source/` is unchanged.

## Census and contract

The repository contains one executable and live application-shell occurrence in the Showcase, one application-local stylesheet implementation, one focused Playwright fixture, eight additional executable Playwright references, one inert source-only Sidebar/Drawer diagnostic reference, and one bounded pre-existing hero-header substitute. No second shell implementation, legacy/native shell substitute, Data Workspace consumer, or package export exists. The repository and built-DOM guard passes for this classification and rejects synthetic unclassified occurrences, including inside the Playwright surface.

The raw Sidebar source contains 301×1000 opened and 72×1000 closed dark compositions plus active/default item treatments. Header establishes represented vector paint, sheet geometry, and two 48×48 radius-24 avatar instances; its outlined text does not establish typography. Repeated paint and spacing are recorded as derived patterns rather than promoted to global tokens. Routing, authorization, toggle persistence, native input behavior, mobile-drawer behavior, and a universal breakpoint are not source facts; the implemented interaction and narrow layout remain bounded Showcase decisions.

## Evidence and manual walk

All seven evidence levels pass independently: source integrity, structural contract, runtime browser, accessibility, focused visual, consumer integration, and responsive/content stress. Nine focused Chromium tests cover the eight material states: sidebar opened, closed, active item, and default item; header default, hover, typing, and filled. Real pointer and keyboard interactions create the states, and computed assertions lock the source-critical 301px/72px geometry, the visible 32×32 mark cropped from the authoritative `Sidebar.svg` sheet, icon-based closed hierarchy, 44×44 active item, `#0b1623` sidebar paint, accessible 48px avatar, header hover/focus/filled changes, one `aria-current="location"`, and native input value lifecycle.

Three component-focused snapshots were manually inspected: opened sidebar, closed sidebar, and filled header. The manual state walk also covered pointer hover, visible keyboard focus and Enter activation, open/closed and active/default navigation, header default/hover/typing/filled behavior, and a 390px viewport with 20px root text plus long Cyrillic and unbroken Latin content. The density control exposes truthful pressed state rather than disclosure semantics. Exact active/default and documented header token paint plus active text contrast are read while each real state is present. Long links wrap, essential controls remain reachable, link/search focus boxes are not clipped, and page-level horizontal overflow is zero.

## Validation, review, CI, and delivery

The stabilized aggregate `npm run check` passed: OpenSpec health; deterministic generation and source validation; 192/192 Node tests; ESLint, Stylelint, and Prettier; all workspace builds (including 495 Showcase modules); validation of 68 source SVGs, 3 token groups, 119 canonical icons, and 42 aliases; clean consumption of 4 packed packages; and 207/207 Chromium tests. Focused evidence remains independently visible as 8/8 source/manifest/census checks, 9/9 Wave 9 browser checks, and 99/99 affected snapshot-regression checks. `git diff --check` also passed.

Independent Standards and Spec reviews inspected the complete episode diff from the fixed baseline. Their nine initial findings were remediated; a final Standards re-review found one residual contrast-oracle defect, which was corrected by compositing the real computed active-item background over the real sidebar backdrop. A later external review identified compact-destination identity, narrow-toggle fidelity, and executable-census gaps; all three were remediated and both independent axes passed the targeted re-review. A final two-axis review then caught the invented closed-sidebar abbreviations/hidden source mark and ambiguous avatar semantics. The confirmed application-local browser seams were remediated test-first: both tests failed on the delivered head, the minimal icon/mark and avatar-semantic changes made them green, and the complete 9-test Wave 9 suite passed. Targeted re-review then rejected a lookalike 24×24 mark; an asset-identity browser assertion failed before the mark was bound directly to the embedded raster region in authoritative `Sidebar.svg`. No review finding remains open. PR #39 targets `main`; Required checks, Browser and visual tests, SonarCloud, and CodeRabbit pass on the delivered candidate.

The source-correct 301px shell and header composition changed downstream page layout and subpixel placement in 15 legacy component captures. A clean baseline run passed those same captures, so they were treated as affected regression baselines rather than pre-existing drift. Only the failing captures were regenerated; each has a per-image inspection disposition in `docs/exec-plans/active/wave-9-sidebar-application-shell/snapshot-inspection.md`. Their behavioral and computed assertions plus the 99-test affected browser group passed after regeneration. The final aggregate browser run remains the delivery authority.

## Component disposition

Sidebar / Application Shell is `VERIFIED` for the bounded application-owned Showcase composition. This does not certify a reusable package component, router, authorization system, persistence contract, mobile drawer, or cross-engine rendering. No accepted deviation or scope-local blocking finding remains.
