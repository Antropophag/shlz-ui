## Why

The repository audit measured a 1.08 MB minified showcase entry chunk and roughly 16 MB of generated source-reference SVGs, while the current single-page entry eagerly imports documentation, component demos, icon URLs, and the complete fidelity manifest. With the coverage denominator and extraction diagnostics now classified by PRs #62–#65, roadmap step 3 can establish a current reproducible baseline and reduce initial documentation loading without weakening evidence or changing consumer packages.

## What Changes

- Add a reproducible, machine-checked showcase loading baseline that records entry assets, initial-request assets, and deferred documentation assets from a production build.
- Split below-the-fold component, consumer, and fidelity documentation into deferred chunks and load the requested section on demand, including direct hash navigation.
- Keep the initial shell, navigation, search affordance, and above-the-fold foundations usable while deferred content loads; expose an accessible loading and failure state.
- Prevent audit-only source-reference SVGs from entering the initial request set while retaining every existing reference and fidelity fixture when its section is requested.
- Add regression budgets derived from the measured current-main baseline and verify keyboard navigation, deep links, search, visual stability, and representative component interactions before and after deferred loading.
- Preserve all public package exports, framework-neutral component contracts, source-derived visual values, generated source evidence, and the read-only `shlz-design-source/` tree.
- Exclude publishing/CDN changes, service workers, dependency upgrades, source-image recompression, visual redesign, component API changes, and roadmap accessibility-policy decisions.

## Capabilities

### New Capabilities

- `showcase/loading-performance`: Observable loading, deferred-section, navigation, failure-recovery, and performance-evidence contracts for the documentation showcase.

### Modified Capabilities

None.

## Impact

The change is limited primarily to `apps/showcase`, its build/test evidence, focused browser tests, and operational validation artifacts. It may add small showcase-local modules or measurement tooling, but it must not change `@shlz/tokens`, `@shlz/icons`, `@shlz/styles`, `@shlz/behaviors`, Vue adapters, package exports, or consumer bundle contracts. Compatibility risk centers on hash deep links, search-to-section navigation, enhancement timing, focus continuity, and test selectors that currently assume the entire page is synchronously present. The implementation depends on first capturing a clean current-main production baseline; numerical budgets must be derived from that measurement rather than copied from the older audit.
