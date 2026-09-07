## Context

See proposal.md for motivation. The existing Playwright configuration has one Chromium project and a built-showcase server. The seven functional scenarios already exist in six files with suite setup that must continue to run.

## Goals / Non-Goals

Keep a single executable body per scenario and preserve default test/snapshot identities. No production component or source changes are required; this is CI coverage, not a component completion audit.

## Decisions

- Add Playwright metadata tag `@smoke` to the selected test declarations. Metadata preserves titles and full-suite membership. Copying test bodies would allow browser expectations to drift; title-regex selection would couple selection to prose.
- Add `playwright.smoke.config.js` inheriting the base configuration, overriding projects, tag filter, and output directory. Keep the base configuration untouched so full-suite snapshot resolution stays stable.
- Use one sequential three-project CI smoke job with `playwright install --with-deps chromium firefox webkit`. A matrix would repeat installation/build overhead for only seven cases per engine.
- Expose `npm run test:e2e:smoke`, including normal Playwright `--project` and `--list` options. Document the commands and the limits of smoke coverage.
- Verify suite discovery through the Playwright CLI against the seven literal scenario identities and the unchanged default test listing. Run functional tests in all three browsers on CI; local Chromium/Firefox results and WebKit prerequisite availability are reported separately.

## Risks / Trade-offs

- WebKit host libraries are absent locally → install host dependencies on CI and require that run before claiming three-engine success.
- Browser-native behavior can expose pre-existing product differences → report a failure without suppressing its assertions or silently expanding into component changes.
- Tagged test growth can widen the smoke set → an executable CLI discovery check verifies exact identities and counts.
- Smoke is representative only → retain full Chromium coverage and make no general Firefox/WebKit component-completion claim.

## Migration Plan

Additive CI/test configuration; no consumer migration or new npm dependencies. Reverting the smoke configuration, tags, command, and CI job removes the added coverage.
