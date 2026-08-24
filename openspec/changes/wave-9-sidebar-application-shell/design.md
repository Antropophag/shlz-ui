## Context

See `proposal.md` for motivation. The current Showcase constructs a desktop sidebar around the generated page content in `main.js`, styles it in `showcase.css`, and has one page-level keyboard-navigation test. The inventory records one live consumer and one local alternative but no dedicated manifest, fixture classification, focused visual proof, narrow stress contract, or source/state ledger. The raw `Sidebar.svg` and `Header.svg` files are the authority; the current app is evidence only.

## Goals / Non-Goals

**Goals:**

- Reconcile the actual Showcase shell with both raw sources and preserve the boundary between source facts and repository-owned application composition.
- Give the shell one stable executable audit root and a census that can detect new unclassified alternatives.
- Exercise material navigation and header states through real interaction, with component-focused screenshots and computed contracts rather than page-level inference.
- Prove the same application composition as the real consumer under desktop and narrow/content-stress conditions.

**Non-Goals:**

- No package export, generic shell/sidebar abstraction, router, authorization model, portal-specific menu, or shared responsive framework.
- No re-certification or visual redesign of verified primitives nested in the shell.
- No unsupported mobile drawer behavior, animation API, or design-source edit.

## Decisions

### 1. Keep one application-local composition

Wave 9 will evolve the existing Showcase markup/CSS only as source reconciliation requires. Creating a package component would falsely promote screen- and application-owned decisions into the framework-neutral layer. The alternative—introducing a reusable primitive with a narrow API—was rejected because the source exports do not establish ownership, routing, authorization, persistence, or general responsive semantics.

### 2. Treat Sidebar and Header as one inventory family with separate state ledgers

One manifest will represent the application-shell audit boundary, but sidebar and header facts/states will be recorded separately so one surface cannot prove the other. This follows the roadmap's single family while preserving independent evidence. Splitting them into public component families was rejected because neither has a reusable implementation contract in scope.

### 3. Use native semantics and real interaction as the executable seam

Navigation remains an `aside`/`nav` with links and current-page semantics. Header editing/search behavior, if supported by `Header.svg`, uses a native labeled input so hover, focus, typing, and filled states are browser-created. Diagnostic forced-state selectors may support stable screenshots only when computed equivalence with the real state is proven; they cannot supply runtime evidence.

### 4. Make narrow behavior an explicit Showcase decision

The raw sources establish represented compositions, not a universal breakpoint system. Existing narrow layout is retained or corrected only as an application-local decision, then stress-tested for reachability, overflow, text scaling, long content, and focus visibility. A mobile off-canvas drawer is not inferred.

### 5. Reuse the established manifest and evidence machinery

Add `sidebar-application-shell.json`, stable `data-component-audit-id` roots, a focused Wave 9 Playwright suite, a source/manifest/census Node suite, snapshots, inventory reconciliation, and `wave-9-report.md`. The occurrence guard will scan repository source and built DOM and classify the current Showcase consumer plus every discovered alternative. Verified Button, Link, Avatar, Tooltip, and other nested primitives remain regression scope only.

### 6. Evidence must be layered and mutation-sensitive

Source hashes/geometry, structural semantics, browser runtime, accessibility, focused visual fidelity, consumer integration, and responsive/content stress are recorded separately. At least one negative census fixture and source-critical visual/computed mutation must be caught. Manual pointer, keyboard, typing, filled, open/closed, and narrow stress walks supplement automation.

## Risks / Trade-offs

- **Source exports may not define behavior or narrow transitions** → Record those gaps as unknowns and constrain repository decisions to the Showcase instead of inventing a reusable contract.
- **The current shell may bundle unrelated page-level styles** → Keep edits selector-local and use focused fixtures/screenshots so the audit does not certify the whole Showcase page.
- **Active-link state can be confused with routing** → Test hash navigation and `aria-current` only; explicitly exclude router/history ownership.
- **Header nomenclature can collide with generic document headers** → Census uses bounded shell markers and explicit classifications rather than matching every HTML `header` element as an implementation.
- **Source-backed contrast may fail an emergency guard** → Record a scoped finding and follow-up if it is pre-existing and authority-bound; never silently recolor the SVG contract.

## Migration Plan

This is an application-local additive audit. Existing Showcase URLs and package exports remain compatible. Rollback removes the Wave 9 audit fixtures/metadata and reverts only scoped Showcase shell changes; no consumer migration is required.
