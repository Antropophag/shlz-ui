## Context

See proposal.md. Current main is 3bdb2ac; the original checkout was older. Use current Button docs, CSS, original SVG and audit manifests. The issue's historical 27-family inventory is not a current scope census.

## Goals / Non-Goals

Deliver V00 and the V01 Button slice with the minimum V02 consumer/test foundation needed to prove it. Other V02 expansion and later components remain under #92. This is one M-sized package/interface seam, implemented inline; independent review uses fresh contexts. No token budget is predicted. Split further if source or shared behavior changes become necessary.

## Decisions

- Use a TypeScript render-function module compiled by existing tsc, with Vue external as a peer. A new SFC compiler/build pipeline adds no value for a native single-root primitive.
- Reuse classes and native attribute/listener fallthrough. Do not declare and re-emit click: that risks two event paths. Expose only a native element ref; commands remain application-owned.
- Map neutral/primary/text and md/sm/xs to existing CSS; default type=button prevents accidental form submission. Explicit submit/reset use native browser semantics. Do not expand source-only icon-xs into a supported variant. Use discriminated public props to reject the xs/icon-only combination. For JavaScript values that bypass typing, normalize to the nearest supported icon-only size (sm) in the render path, preserving SSR and reactive consistency without throwing through the consumer application.
- Pin development Vue to an available 3.5 patch and limit the initial peer range to the tested minor. Use vue/server-renderer from the same install. SSR compatibility is user-delegated; a Nuxt module and global registrations are excluded.
- Keep adapter private and packable pending a future publishing decision. Do not add it to the current fixed release group or change public release automation.
- Add a small separate Vue consumer with deterministic server markup and browser hydration. This proves rendering, events and lifecycle through the package export without porting Showcase. Use a focused browser config so existing framework-neutral tests remain independent.
- Evidence: Node SSR/isolated package/type checks; browser hydration/form/keyboard/reactive/lifecycle checks; source-backed computed geometry/paint and narrow/icon content; Button manifest update and focused consumer occurrence guard. Existing Button tests remain regression evidence, not automatic Vue certification.

## Risks / Trade-offs

- Shared CSS findings → record source evidence and disposition; do not recolor or alter shared styles in an adapter task.
- Packaging policy enumerates core packages → verify unchanged release policy, keep this package private and avoid introducing publishing behavior.
- Fresh-main workflow now uses receipts → use its current route/requirements/baseline/contract/validation/review/conformance/delivery commands. Planning is committed/pushed to the task PR before the implementation episode is explicitly based on that clean PR head.
- Scope growth → stop the affected slice for contract revision; do not absorb another component into Button work.

## References

- https://vuejs.org/guide/scaling-up/ssr.html — server-safe lifecycle and hydration.
- https://vuejs.org/guide/components/attrs.html — single-root native attribute/listener fallthrough.
- https://vuejs.org/api/render-function.html — render-function composition.
