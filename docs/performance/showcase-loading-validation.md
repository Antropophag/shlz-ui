# Showcase loading validation

PR #66 separates the immediately usable documentation shell from the coarse
deferred documentation graph.

## Measurements

- Baseline initial JavaScript: 1,088,896 bytes.
- Candidate initial JavaScript: 8,359 bytes (99.23% reduction).
- Initial CSS: 133,653 → 134,020 bytes (0.27% growth).
- Initial fonts: 219,500 → 219,500 bytes (0% growth).
- Initial images and generated source references: 0.

The committed reports bind the baseline and candidate source commits, emitted
asset hashes, raw and gzip sizes, initial/deferred classification, build
command, Node version, and aggregate asset digest. Candidate generation
rebuilds the showcase and rejects a mismatched commit or dirty build inputs.

## Validation

- Node tests: 199/199 passed.
- Focused progressive-loading browser tests: 7/7 passed.
- Full Chromium regression: 281/281 passed.
- ESLint, Stylelint, workspace builds, source validation, and the clean packed
  consumer smoke passed.
- Strict OpenSpec validation, route conformance, and independent Standards and
  Spec reviews passed.
- The Impeccable detector reported one pre-existing advisory grid-background
  pattern outside the changed loading UI.

## Residual disposition

The Standards reviewer retained one non-blocking LOW maintainability note: the
test-only `?full=1` compatibility URL is repeated in legacy Playwright suites.
It has no runtime or contract impact; centralizing the helper is intentionally
left to future test-harness maintenance rather than expanding this PR.
