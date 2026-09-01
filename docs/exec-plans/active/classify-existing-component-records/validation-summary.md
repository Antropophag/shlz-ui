# Existing component record classification validation

Episode baseline: `2e18d09eae0f201a2c19f2443113165f471b9e8c`;
classification candidate: `71a49c5875eb4441d6b9aca466b0f6d8665bd099`.

## Automated evidence

- Focused coverage suite: 7/7 passed, including exact identity-swap, unknown
  cohort, invalid ownership, missing review, denominator, provenance, and
  deterministic-output guards.
- Full Node suite: 194/194 passed after generation and package builds were run
  from the task worktree.
- Package build: tokens, icons, styles, and behaviors passed.
- Source coverage check: 195 records and 630 variants validated.
- OpenSpec: `openspec validate classify-existing-component-records --strict`
  passed.
- Formatting and ESLint passed for every changed implementation/report file.
- Protected-path check passed: the committed episode delta contains no source,
  runtime package, or Showcase changes.

  ```sh
  git diff --exit-code 2e18d09eae0f201a2c19f2443113165f471b9e8c 71a49c5875eb4441d6b9aca466b0f6d8665bd099 -- shlz-design-source packages apps
  ```

## Environment correction and limitations

The first full-suite attempt used a `node_modules` symlink whose workspace
package links resolved to the original worktree. That run passed 193/194 and
failed the built-DOM census because Vite read the other worktree's stale
`@shlz/behaviors` export map. Dependencies were then copied into the task
worktree and relinked with `npm install --ignore-scripts`; the unchanged test
suite passed 194/194. This classification-only episode adds no browser runtime
or visual behavior, so no new Playwright run is claimed.
