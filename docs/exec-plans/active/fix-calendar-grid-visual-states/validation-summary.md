# Validation summary

- Focused Calendar Grid Playwright contract: 6/6 passed.
- Aggregate Node tests: 170/170 passed.
- Full browser and visual suite: 243/243 passed.
- ESLint, Stylelint, repository-wide Prettier, package builds, Showcase build, repository validation, and package-consumer smoke: passed.
- Strict OpenSpec validation: passed.
- `git diff --check`: passed.
- Independent Standards review against baseline `1c6a93f`: passed with no findings.
- Independent Spec review against baseline `1c6a93f`: passed after resolving the visible unavailable-reason, header/body evidence-scope, and block-inset geometry findings.
- TDD and validation harness guards: passed for the reviewed implementation candidate; route-conformance and delivery guards bind the final delivered PR head.
- Required checks, SonarCloud, and browser/visual CI: passed for the reviewed implementation candidate and the final documentation-only closure commit.
- Delivery target: open, unmerged PR #51 targeting `main`.

The first clean aggregate gate attempt encountered a shared-worktree generation race while another process temporarily removed a generated manifest. Review processes were then barred from build commands, the corpus was restored with `npm run generate`, and the gate passed in one process. A subsequent attempt stopped only because five local ignored harness-input JSON files needed repository formatting; after formatting those operational inputs, the unchanged candidate passed the complete gate above.
