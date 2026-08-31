# Composer / Rich Text Toolbar validation summary

## Scope and census

- Composer: 6 classified executable roots — 4 state fixtures, 1 content-stress fixture, and 1 live consumer.
- Rich Text Toolbar: 6 independently classified roots with the same fixture/consumer partition.
- Nested File Row: 6 classified occurrences added; the File Row ledger now contains 14 occurrences (12 executable/content fixtures and 2 live consumers).
- Nested Button: 6 classified action groups covering 12 native buttons; 5 fixture groups and 1 live-consumer group.
- No inert diagnostic, legacy/native substitute, local alternative, or unclassified Composer / Rich Text Toolbar occurrence was found.

## Passing evidence

- `node --test --test-concurrency=1 tools/tests/*.test.mjs`: 185/185 passed.
- `npx playwright test tools/playwright/composer-rich-text-toolbar.spec.js`: 5/5 passed.
- `npx stylelint packages/styles/components/composer.css packages/styles/components/rich-text-toolbar.css apps/showcase/src/showcase.css`: passed.
- `npm run build`: passed for all packages and Showcase; the existing Vite large-chunk advisory remains.
- `npx openspec validate add-composer-rich-text-toolbar --strict`: passed.
- `git diff --check`: passed.
- `git diff --exit-code -- shlz-design-source`: passed; authoritative material is unchanged.
- Manual inspection: source-focused, 220 px / 200% text-stress, pressed, and focus-visible snapshots remain coherent without page-level horizontal overflow.
- Impeccable detector: one advisory at the pre-existing `showcase.css` grid background; the flagged rule is unchanged and outside this delta.

## Aggregate limitation

`npm run check` reaches the 265-test Playwright suite after OpenSpec health, generation, 185 Node tests, lint, build, validation, and clean-package consumption pass. The suite then reports an unrelated existing `Card with Action` snapshot mismatch: 386 pixels (about 1%) localized to text antialiasing. The Card implementation, test, and snapshot are unchanged by this branch; its geometry and CSS assertions pass, and the mismatch reproduces in isolation. This scoped PR neither introduced nor worsened it. Follow-up: [#59](https://github.com/Antropophag/shlz-ui/issues/59).

## Ownership and limitations

The library owns framework-neutral presentation, semantic composition hooks, normalized icon use, and observable disabled/read-only/invalid/pressed/focus states. Consumers retain editor selection, formatting commands, shortcuts, attachment lifecycle, validation policy, submission/persistence, and live-region messaging. The Showcase consumer wires one Bold toggle and submit-status example only.

## Review independence

Standards and Spec were reviewed in separate, context-isolated Codex runtimes against the current-main integration baseline. Both re-reviews report no remaining scope-local findings after the live-consumer placement, audit-manifest deviation, editor maximum-height, and rebase-coexistence checks were resolved.
