# PR 86 browser census follow-up

Baseline: clean pushed PR head 96db84321981df8e2aaffd06781ddb7994ab1dc0. This is a direct, behavior-preserving test correction; it does not change a component contract or production code.

CI run 34390681289: 333 browser tests passed, one Date Picker test passed on retry, and the Wave 11 browser census test failed consistently on all three attempts. The manifest and the independently scanning Node test already establish 15 primitive dependency paths, but the browser test still expected 11.

Local reproduction: `npx playwright test tools/playwright/upload-document-compositions-wave11.spec.js` fails with `Expected length: 11 / Received length: 15` at line 33. This exact assertion mismatch establishes the cause without speculative instrumentation. The follow-up synchronizes the browser expectation with the already validated census; it preserves occurrence and material-state guards.

Validation: rerun the original browser test and the independently scanning Wave 11 Node census, then verify the complete remote CI run for the pushed candidate. No snapshot updates or production mutations are part of this follow-up.

Observed local result: original Playwright reproduction now passes (1 test, 13 seconds); independent Wave 11 Node census passes all 4 tests. ESLint and diff whitespace checks pass. The reviewed code delta is only the browser expectation `11 → 15`; all product files and remaining assertions are unchanged. Remote run completion is reported separately for the final candidate.
