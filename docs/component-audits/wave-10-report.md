# Wave 10 Card compositions audit

- Baseline: `d919cbc0e698637207df5a5bdd55841c9d637868` on `audit/wave-10-card-compositions`, bound to current `origin/main` and PR #43 by the baseline receipt.
- Baseline delivery state: PR #43 was open with planning artifacts only; implementation review and CI were pending.
- Raw authority hashes: `Card with button.svg` `01abde3b045ab0c36160e5e71a829bffc37d2bb3bbafaadac3a04e350b064719`; `Reports card.svg` `e28cb879e2a2e577154cfa3caf541de020431ef8ba6e44550ad0e54bddf63c4f`; `Cover.svg` `c857eb75fe105238c2a0d222a5dd27fae74006cf6db43488fa4d9bbe77feb612`.
- `shlz-design-source/` is unchanged.

## Source contract

`Card with button.svg` is one 314×230 radius-16 composition with vector illustration geometry, a small white content panel, and a 137×40 radius-20 blue action affordance. `Reports card.svg` is a 354×810 sheet with three vertically arranged 314×230 radius-16 specimens: two white and one `#EEF0F4`; each repeats trailing 18.5×18.5 outlined geometry. `Cover.svg` is an 874×400 static vector composition with two white background rectangles and six outlined text paths. None of the three files embeds a raster image; Card with button has one filter, Reports card has three, and Cover has none.

The repeated 314×230/radius-16 surface and recurring blue/dark/neutral paint are derived composition patterns, not promoted design tokens or a generic component contract. The exports contain outlined text rather than structured content nodes and cannot establish literal runtime copy, click or navigation behavior, loading, media lifecycle, responsive reflow, application data models, or a reusable Card API.

## Census and evidence applicability

The bounded census covers application, package, fixture, Playwright, CSS, JavaScript/TypeScript, Vue, PHP, and HTML surfaces. It found exactly zero production implementations, public exports, executable roots, live consumers, Data Workspace consumers, inert diagnostics, legacy/native substitutes, and local alternatives for the source-defined family. It separately classified 15 files containing generic card/cover terminology: the Showcase icon inventory and styles/tests, prose and coverage wording, `object-fit: cover` uses/assertions, and other unrelated test language. A synthetic `.shlz-card` production surface is rejected by the focused test.

Source integrity and structural contract pass independently. Runtime browser, accessibility, focused visual, consumer integration, and responsive/content stress are each `not-applicable` because no executable composition or public behavior exists. Static visual evidence is limited to direct inspection of the authoritative exports. Real-interaction visual and runtime behavior are `not-applicable`, the material-state ledger is empty, and no screenshot is claimed. Manual review covered all three source sheets and the absence/terminology census rather than inventing an interaction walk.

## Validation, review, CI, and delivery

Focused evidence passes as 6/6 source/manifest/census checks and 1/1 Chromium source-only contract check. The stabilized aggregate `npm run check` passes: OpenSpec health; deterministic generation; 118/118 Node tests; ESLint, Stylelint, and Prettier; all workspace builds (including 496 Showcase modules); validation of 68 source SVGs, 3 token groups, 119 canonical icons, and 42 aliases; clean consumption of 4 packed packages; and 208/208 Chromium tests. `git diff --check` also passes. Independent Standards/Spec review, GitHub CI, review-thread state, receipt conformance, and delivery evidence are recorded at delivery time rather than inferred from aggregate validation.

## Component disposition

Card compositions are `VERIFIED` for the bounded source-only and repository-absence contract. `implementation_status` remains `source-only`. This status does not certify a production component, Card API, consumer behavior, responsive layout, or any nested verified primitive. There are no accepted deviations or known scope-local findings.
