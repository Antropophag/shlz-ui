# Repository identity validation

Issues #71 and #82 share this change. Implementation is isolated to repository identity generation/verification, its executable tests and oracle, focused test routing, and documentation. The Wave 12 census metadata records the new oracle's generic `error.message` terminology as unrelated to UI; no component behavior changed.

## Observed checks

- `npm run generate` and `npm run build:packages` prepared the disposable worktree; no design-source or generated tracked files changed.
- `npm test`: 264 passed, zero failed after build prerequisites were present.
- `npm run test:harness`: 30 passed, including eight repository identity integration tests.
- Focused ESLint and Prettier checks passed. Strict OpenSpec validation passed; `npm run check:openspec` passed.
- The same identity oracle rejects the pinned pre-implementation core and accepts the candidate. The persistence failure oracle separately proves that altering a legacy field with a re-signed outer receipt is rejected by the candidate and accepted by the previous implementation.
- Version evidence covers both `legacy` and `v2`, with no excluded members. Temporary real Git clones/worktrees exercise isolation, relocation, raw aliases, resolved URL changes, immutable baseline bytes, and legacy digest references; only GitHub's PR lookup is stubbed in the integration tests.
- Independent Sol Low Standards review passed. Spec review found a Git URL rewrite case; it was reproduced, fixed, and re-reviewed to PASS. Both axes use distinct runtime-attested Codex sessions.
- Route conformance and delivery passed on implementation commit `796899a`. Final candidate receipts are regenerated after this documentation-only closeout and reported on PR #89; raw review streams and candidate-bound receipts remain local under ignored `test-results/identity-review/` to avoid committing a receipt for its own future Git commit.

## Compatibility and limits

The episode baseline was emitted by the old harness before implementation and intentionally retains the legacy coordinates and original digest. It must not be rewritten. Successful delivery from that baseline emits version 2. Earlier historical receipt files are unchanged.

Version 2 minimizes disclosure; hashes are not anonymization. Cross-checkout or relocated execution needs a fresh baseline. Legacy comparison retains Git's original URL resolution behavior. Runtime visual changes are outside this task; CI and unresolved GitHub review threads are reported on the PR, separately from the local checks above.
