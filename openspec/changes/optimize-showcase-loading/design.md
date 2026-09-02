## Context

See `proposal.md` for motivation. `apps/showcase/src/main.js` currently owns the whole document: it statically imports all documentation/demos, builds one large HTML string, appends later component groups, and immediately enhances globally queried roots. `fidelity.js` eagerly imports the complete source-reference manifest and an eager URL map for every generated reference. The source references occupy roughly 16 MB in the worktree, and the 2026-09-01 audit observed a 1.08 MB minified main JavaScript asset, but implementation must capture a fresh clean-main build because those figures predate PR #65.

The showcase is a documentation consumer, not a public package. Its current hash ids, navigation, search, component fixtures, and audit evidence are compatibility surfaces even though its internal module layout is not. The design source remains read-only.

## Goals / Non-Goals

**Goals:**

- Make the initial documentation shell useful without evaluating every demo and fidelity fixture.
- Give every existing deep link a deterministic owner so navigation can load the deferred documentation boundary.
- Move source-reference manifest parsing, URL enumeration, and image requests behind the fidelity boundary.
- Produce candidate-bound build/network evidence rather than relying on a bundler warning or a hand-copied size.
- Keep deferred enhancement idempotent and preserve the existing DOM and browser contracts once a section is loaded.

**Non-Goals:**

- Redesign the showcase, alter source-derived component appearance, or reinterpret component semantics.
- Virtualize documentation, add a router/framework/service worker, or create a generic lazy-loading package API.
- Recompress or edit generated/raw source SVGs, change consumer packages, or optimize application-owned runtime behavior.

## Decisions

### 1. Use a showcase-local section registry and one coarse dynamic documentation boundary

Create a small registry in the entry module that maps every stable navigation target to one coarse documentation owner. The entry renders the shell and a lightweight placeholder, then imports the complete documentation module only for an initial hash, navigation/search request, or explicit full-document test mode.

One coarse documentation bundle is preferred over independently migrating dozens of tightly coupled fixtures and enhancers: it materially reduces the entry, preserves the established single-document lifecycle, and avoids request fan-out and duplicated initialization seams. Finer groups remain a future optimization only if measurements justify them. A framework router was rejected because it would add a dependency and change a single-document hash contract. `content-visibility` alone was rejected because it reduces rendering work but leaves parsing/evaluation and eager asset discovery intact.

### 2. Keep the shell index eager, but move heavy markup/data behind owners

Navigation labels, ids, search metadata, and group ownership remain in a compact eager index so the shell can navigate before content exists. Markup factories, component-specific consumers, large JSON manifests, and their enhancement imports live with the owning deferred group. Existing ids and relevant `data-component-audit-id` values remain unchanged after insertion.

The deferred documentation module exclusively owns the complete reference manifest and its `import.meta.glob`. Dynamic module isolation prevents those URLs from entering the entry graph; native `loading="lazy"` remains a secondary image-decoding optimization after the documentation module loads. Making every SVG a direct dynamic import was rejected because it complicates evidence enumeration and can create excessive module requests.

### 3. Model loading as an explicit idempotent state machine

The documentation boundary has `idle`, `loading`, `ready`, or `error` state and a shared in-flight promise. Repeated requests reuse that promise; enhancers run only after committed markup and only once. The eager shell carries a bounded placeholder and named status/error region. Once ready, the coarse documentation module replaces that placeholder shell while retaining the eager header and the shell's document position and width; this preserves above-boundary geometry without duplicating foundation IDs or enhancer ownership. Hash reveal is performed after the owner reaches `ready`; focus changes only as existing navigation/search behavior already requires.

This explicit seam is preferred to scattered `IntersectionObserver` callbacks because deep links and user requests need deterministic completion and failure behavior. Viewport observation may trigger background loading, but it cannot be the sole owner of correctness.

### 4. Derive and enforce budgets from two immutable builds

Before runtime edits, build clean `origin/main` with the repository lockfile and record hashes, raw/gzip bytes, chunk imports, initial request membership, CSS/fonts, source-reference membership, and tool versions. Build the candidate with the same command/environment and compare through a focused repository-owned checker. The report binds both Git commits and rejects missing or unclassified emitted assets.

The acceptance floor is a 30% reduction in raw initial JavaScript, zero initial generated source-reference requests, and no more than 2% growth in initial CSS or font bytes. Raw bytes are the primary deterministic gate; gzip bytes and browser timing/network traces are reported evidence because compression/runtime timings vary by environment. The checker must not treat total deferred bytes as initial bytes, nor claim that moving bytes alone proves faster interaction.

### 5. Validate user-perceived and contract behavior in bounded layers

Structural tests prove complete id ownership, no duplicate registrations, deferred import boundaries, and build-report integrity. Browser tests use a production build and an empty browser cache to inspect requests and exercise root load, direct hash, navigation, search, failure/retry injection, repeated requests, keyboard focus, narrow viewport, enlarged text, and representative interactive demos. Focused snapshots cover shell/loading/error/loaded states in one desktop-plus-mobile pass, followed by at most one correction pass per Impeccable guidance. Public package builds and packed-consumer smoke checks prove that the change stayed showcase-local.

## Risks / Trade-offs

- [Splitting the monolithic entry can omit or duplicate existing sections] → Generate/test a closed set of current ids and audit fixture identities against exactly one group owner.
- [Hash scrolling can run before content exists] → Resolve the hash through the eager registry and reveal only after the owner's shared load promise settles.
- [Deferred enhancement can double-bind listeners] → Give every group an idempotent enhancer and test repeated concurrent navigation.
- [Chunking may trade one large request for excessive fan-out] → Use a small number of evidence-based coarse groups and report request count alongside byte totals.
- [Placeholders can introduce layout shift or confusing screen-reader output] → Reserve bounded space, keep status local and named, avoid focus stealing, and inspect loading/error snapshots at desktop and narrow widths.
- [Measurement can become stale or compare unlike builds] → Bind reports to Git SHA, lockfile, build command, emitted manifest, hashes, and explicit initial/deferred classification; fail closed on mismatch.
- [Lazy loading can hide evidence from existing tests] → Update tests to request the owning group explicitly while retaining the full fixture/evidence census; do not lower counts to make tests pass.

## Migration Plan

1. Capture and commit planning/requirements state, then run route and implementation preflight on the clean task branch.
2. Install dependencies from the lockfile, build the untouched baseline commit in a separate home-directory worktree or immutable checkout, and persist the candidate-comparable report.
3. Introduce the registry/loader and migrate coarse groups without changing rendered ids or fixture contracts.
4. Add build/network and browser evidence, run focused visual inspection, full relevant validation, independent review, route conformance, and delivery guards.
5. Roll back by reverting the task branch/PR; no data, public API, deployment, or consumer migration is required.
