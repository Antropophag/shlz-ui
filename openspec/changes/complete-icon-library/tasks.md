## 1. Baseline and source census

- [x] 1.1 Capture the current 119 canonical icons, 125 variants, 42 aliases, geometry hashes, paint policies, source hashes, and package sizes as a compatibility fixture; verify the focused baseline test passes before production changes.
- [x] 1.2 Build an exhaustive `Icons.svg` candidate/source-ID census that independently preserves both calendar candidates and assigns every candidate an explicit pending disposition; verify counts and source hashes against the extraction collision report and raw SVG.

## 2. Normalization and public package

- [x] 2.1 Add failing coverage and compatibility tests for full candidate accounting, stable existing outputs, distinct `calendar-sidebar`/`calendar-interface`, provenance, exports, sprite symbols, and paint policy; verify the tests fail for the expected missing-corpus reasons.
- [x] 2.2 Implement deterministic `Icons.svg` extraction, geometry/paint classification, and disposition analysis without reading derivative icon SVGs as authority; verify every candidate is classified and no source file changes.
- [x] 2.3 Merge approved new glyphs and exact-duplicate provenance into the normalized corpus, using explicit qualified or uncertain names for non-equivalent collisions; verify existing canonical geometry/paint fixtures remain byte/hash stable and both calendars differ.
- [x] 2.4 Generate the expanded `@shlz/icons` manifest, individual exports, sprite, runtime helpers, types, and compatibility metadata; verify package builds and all canonical names resolve to emitted files and symbols.

## 3. Showcase and consumers

- [x] 3.1 Add `Icons` to shared Showcase navigation with a stable `#icons` destination and make the manifest-driven catalog visible rather than anonymously nested; verify lazy navigation, direct hash loading, search discovery, keyboard access, and exact manifest count in browser tests.
- [x] 3.2 Extend plain HTML and Showcase consumer evidence to exercise representative new icons and both calendars while leaving accessible naming consumer-owned; verify non-empty browser geometry and currentColor/preserved-paint behavior.

## 4. Evidence and delivery

- [x] 4.1 Add focused visual evidence for old/new, monochrome/preserved-paint, collision, uncertain, and both-calendar topologies; run affected browser snapshots and document exact source/canonical/deduplication counts plus package-size delta.
- [x] 4.2 Update icon methodology and the machine-readable foundation audit with multi-source coverage, dispositions, checks, limitations, and no unsupported completion claims; verify docs and audit contracts.
- [x] 4.3 Run strict OpenSpec validation, source integrity, icon tests, package builds, full relevant Chromium coverage, and the production Showcase build; inspect the built assets for the `#icons` navigation target and manifest-matching catalog count.
- [ ] 4.4 Perform independent Standards and Spec reviews against the immutable baseline, remediate scoped findings, run final conformance/delivery guards, push the task branch, and open an unmerged PR with CI and residual-risk status.
