## 1. Source contract and regression seam

- [ ] 1.1 Update the Calendar Grid source-contract evidence with exact header/body state facts, derived patterns, repository decisions, and assumptions, and verify the authoritative SVG hash remains unchanged.
- [ ] 1.2 Add focused Playwright computed-style assertions for past, today, and future headers and body cells, including whole-column today coverage and intentional past/future base surfaces, and verify the focused test fails against the pre-fix CSS for the documented reasons.

## 2. State fidelity implementation

- [ ] 2.1 Correct Calendar Grid role-specific CSS using existing source-mapped tokens, removing the invented today top rule and preserving unavailable hatching, then verify the focused computed-style test passes.
- [ ] 2.2 Refine the Calendar Grid Showcase state matrix and component documentation only where needed to expose the authoritative distinctions, and verify all Calendar Grid occurrences remain classified without changing Date Picker status.

## 3. Visual and component-gate evidence

- [ ] 3.1 Regenerate only Calendar Grid snapshots, inspect their diffs against the authoritative SVG, and verify both desktop and narrow snapshots show the intended state hierarchy without unrelated visual drift.
- [ ] 3.2 Complete Calendar Grid runtime, accessibility, focused-visual, consumer, and responsive/content-stress checks; update its audit manifest/status with exact counts and limitations only if the full component completion gate passes.

## 4. Validation, review, and delivery

- [ ] 4.1 Run OpenSpec validation, relevant targeted tests, the Impeccable detector, and full `npm run check`; resolve all scope-local failures and verify `shlz-design-source/` and Date Picker status are unchanged.
- [ ] 4.2 Run independent Standards and Spec reviews against the immutable episode baseline, resolve all findings, pass route conformance and delivery guards, create an unmerged PR to `main`, and verify required CI is green.
