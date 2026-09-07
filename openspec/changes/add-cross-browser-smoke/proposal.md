## Why

CI currently exercises browser behavior only in Chromium. A small shared smoke suite will detect browser-specific interaction failures in Firefox and WebKit without multiplying the visual baseline suite.

## What Changes

- Tag seven existing functional scenarios and run the same scenarios in Chromium, Firefox, and WebKit through a separate smoke configuration and npm command.
- Add a separate CI job installing all three browsers and their Linux dependencies.
- Preserve the complete Chromium browser/visual suite and its snapshot paths.

## Capabilities

### New Capabilities

- `cross-browser-smoke`: bounded three-browser functional CI coverage and suite isolation.

### Modified Capabilities

None.

## Impact

Affected surfaces: Playwright configuration, seven test declarations across six existing spec files, package scripts, CI, and developer test documentation. Browser binaries and Linux dependencies are prerequisites; local WebKit currently lacks host libraries. Component behavior, public APIs, source artwork, snapshots, release/deployment permissions, and full Firefox/WebKit visual coverage are outside this change. Smoke coverage does not constitute component audit completion or a complete browser compatibility guarantee.
