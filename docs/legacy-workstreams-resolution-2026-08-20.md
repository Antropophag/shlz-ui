# Legacy workstreams resolution — 2026-08-20

This report closes the six workstreams left open by the local forensic report
`docs/repository-worktree-forensics-2026-08-20.md`. Recovery details remain in
the local `docs/recovery-checkpoint-2026-08-20.md`. Those two reports are not in
`origin/main`. The forensic report is preserved by path inside the checkpoint's
`artifacts/untracked-files.tar.gz`; the recovery report remains in the shared
tree, while its durable inventories, artifact hashes and restoration evidence
are stored under the checkpoint directory.
The shared dirty worktree and the recovery checkpoint were used read-only.

Baseline for the re-audit was `origin/main` at
`f0ca626087374a391c74ae838f72d4a3283161ef`, the owner-merged PR #6.

## Resolution

| Workstream                                        | Previous status | Final status     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                           | Action                                                                                                                                                                                                                                                                                            | PR                                                  |
| ------------------------------------------------- | --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Package smoke + cross-browser compatibility       | SALVAGE         | SALVAGE          | Current validation checked built export targets but not published tarball contents or clean-project consumption. The recovered smoke used workspace resolution, included obsolete Select assumptions and mixed Chromium/Firefox/WebKit policy into one config.                                                                                                                                                                     | Rebuilt only the generic publication check: pack four packages, verify exported files, install in a temporary clean consumer and resolve/import representative public entry points. Firefox remains a useful observation, not a declared support contract; no WebKit infrastructure was restored. | [#7](https://github.com/Antropophag/shlz-ui/pull/7) |
| Lazy-loading / stabilization of source references | SALVAGE         | SALVAGE          | The Showcase exposes about 15 MB of generated source-reference SVGs. Immediate `complete` checks were timing-sensitive. Recovered `sourceWidth`/`sourceHeight` were source-node geometry, not emitted SVG canvas dimensions: 82 of 268 differed and must not be used as HTML dimensions.                                                                                                                                           | Restored only `loading="lazy"`, `decoding="async"` and explicit successful-load waits. No dimensions, source assets, snapshots, tolerances or component code were changed.                                                                                                                        | [#8](https://github.com/Antropophag/shlz-ui/pull/8) |
| Icon-stroke audit                                 | SALVAGE         | ALREADY_UPSTREAM | Raw Figma authority contains 48 files with 1.5px strokes and none with 2px. Current normalization preserves source paint/geometry, and `basic-icons-normalization.test.mjs` checks raw hashes and element-level stroke attributes. The recovered test only loaded 43 experimental pairs and wrote screenshots.                                                                                                                     | Keep the finding that 1.5px is authoritative. Do not restore the 2px generator, comparison UI, generated copies, screenshots or weaker Playwright experiment.                                                                                                                                     | —                                                   |
| Status «Обращения» findings/tests                 | SALVAGE         | ALREADY_UPSTREAM | Current source-reference manifest and tests preserve all nine source variants and their node IDs; source typography/index data retains Golos Regular 15px/130% with -1% letter spacing and exact source geometry. Showcase fidelity samples and Status developer docs keep business mapping consumer-owned. Old CSS-dependent assertions did not independently validate the source and the registry screen was application-shaped. | Do not replay `c33cfa2` registry/CSS assertions. Source evidence is already protected in `main`.                                                                                                                                                                                                  | —                                                   |
| Fixed-width request-status modifiers              | UNCERTAIN       | DROP             | The nine widths are real bounding boxes for exact Russian ServiceDesk labels, not a reusable property of generic Status. No second consumer or generic need was found. Core Status intentionally uses content-driven sizing and semantic paint variants.                                                                                                                                                                           | Do not restore `.shlz-status--requests` or business-named width modifiers in core. If a future ServiceDesk product requires exact-label widths, implement them in its composition/extension after a concrete consumer decision.                                                                   | —                                                   |
| Profile Lab                                       | UNCERTAIN       | DROP             | The six archived source files form a K2 salesperson-dashboard concept lab with invented KPI/person data and hard-coded application layouts. It has no tests, commit provenance, Showcase integration or current consumer. It is unrelated to the upstream typography profiles. Four `dist` files are reproducible.                                                                                                                 | Keep the recovery archive as the product/design record. Do not add the lab or its workspace scripts to `shlz-ui`; externalize it to a K2 archive only if the owner wants to continue that product exploration.                                                                                    | —                                                   |

## Extracted

### Package publication smoke

Branch: `test/package-tarball-consumer-smoke`.

The clean reconstruction intentionally does not use the recovered
`tools/package-smoke.mjs` verbatim. It validates actual tarball membership,
installs all four local tarballs into a temporary project, exercises JavaScript,
JSON, CSS and SVG exports (including both icon wildcard families), cleans up in
`finally`, and runs in required Ubuntu/Node 22 CI.

Independent review found two P2 issues: the first version was not wired into
required CI and did not exercise `file-types/*`. Both were fixed; final review
reported no P1/P2/P3. Deliberate limits are clean TypeScript-consumer compilation,
native-Windows command resolution and independent installation of each dependency
edge.

### Source-reference loading

Branch: `perf/showcase-source-reference-loading`.

Independent review rejected the recovered intrinsic-dimension idea as P1 because
source-node geometry was not emitted SVG canvas geometry. The final branch omits
all width/height attributes and keeps only lazy/async browser hints plus explicit
test readiness. Full fidelity coverage passed 13/13 without snapshot changes;
final independent review reported no P1/P2/P3.

## Already upstream

- Icon source fidelity: raw 1.5px strokes, normalized geometry/paint and regression
  protection are already authoritative in `main`.
- Status «Обращения»: nine source variants, node provenance, representative
  fidelity fixtures and the consumer-owned semantic boundary are already in
  `main`.
- Existing Chromium component behavior and plain-fixture coverage were not copied
  into PR #7.

## Drop candidates

After explicit owner approval, the following old-tree material can be removed
without losing accepted design-system work:

- experimental 2px icon copies, comparison UI, generated report/screenshots and
  its weak screenshot-producing test;
- `c33cfa2` registry implementation, request-specific core CSS modifiers and their
  CSS-dependent tests;
- Profile Lab workspace integration and reproducible `dist` output; its unique six
  source files remain protected by the recovery archive;
- recovered package/compatibility implementation superseded by PR #7, except that
  the broader browser-support question remains recorded below;
- recovered source-image dimension changes and all four mixed historical PNGs.

No physical cleanup was performed.

## Still uncertain

Two future decisions remain, but neither requires retaining the old implementation:

1. Browser support policy: Firefox direct smoke was useful, while current required
   browser CI is Chromium-oriented. Adding Firefox or WebKit should follow an
   explicit supported-browser contract, not the recovered config.
2. ServiceDesk extension admission: exact fixed-width request labels belong outside
   generic Status. A first-class extension is justified only when an active
   consumer demonstrates reusable domain behavior.

## Cleanup readiness

For these six workstreams, all unique evidence is either upstream, reconstructed
on clean branches, or retained in the verified checkpoint at
`/home/antropophag/recovery/shlz-ui-20260820T120831+0300/`. The request-status
commit is recoverable from `artifacts/request-status-c33cfa2.patch` (SHA-256
`8b07a2ae4bc95218a5adb9ff6740d4c1223fd7e56baeae79f1476cf01ef37a61`) and the
bundle; Profile Lab sources are listed in
`inventory/profile-lab-archived-sha256-size.tsv` and stored in the untracked-file
archive.

Cleanup must still wait for:

- the owner's decision/merge outcome for PRs #7 and #8;
- explicit approval of the drop list;
- a fresh non-destructive comparison of the shared tree against the checkpoint and
  final `origin/main` immediately before cleanup.

No branch, worktree, stash, untracked file, screenshot, Profile Lab file or recovery
artifact was removed or modified during this resolution.
