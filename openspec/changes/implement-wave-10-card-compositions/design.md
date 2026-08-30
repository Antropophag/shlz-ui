## Context

Wave 10 verified three static SVG exports and explicitly rejected deriving a generic Card or runtime behavior from them. The user has authorized a separate implementation contract. The exports provide reliable geometry and paint, but their outlined text cannot define literal copy or application data.

## Goals / Non-Goals

**Goals:** ship three framework-neutral, semantic HTML/CSS compositions; preserve exact source specimen dimensions as opt-in variants; provide bounded fluid variants; reuse existing Button and Link contracts; add executable showcase and Data Workspace evidence; keep each composition independently auditable.

**Non-Goals:** generic Card API, whole-card activation, JavaScript controllers, data fetching, loading/error models, media lifecycle, framework adapters, or new global tokens.

## Decisions

### Separate public roots instead of a shared Card abstraction

Use `.shlz-card-with-action`, `.shlz-report-card`, and `.shlz-cover`. Their common source geometry is an observed pattern, not proof of shared semantics. This keeps future changes local and avoids coupling unrelated content models.

### Exact specimens and fluid variants are explicit

The default roots provide source-backed appearance and bounded container fit. `--source` modifiers lock the exported dimensions for visual comparison. `--fluid` modifiers permit content-driven height and wrapping at documented minimum widths. Exact geometry is never silently claimed as responsive behavior.

### Semantics stay in consumer markup

Examples use `article`, headings, paragraphs, and existing `.shlz-button` or `.shlz-link` controls. Decorative geometry is `aria-hidden`. Roots receive no role, tabindex, click handler, cursor, or navigation contract.

### Component-local values remain local

Source-observed dimensions, radii, and muted paint remain in component CSS with FACT comments. Existing semantic tokens are reused only where their meaning already matches. No repeated SVG number is promoted to a token.

## Risks / Trade-offs

- Structured runtime text cannot be pixel-identical to outlined source paths. Mitigation: audit typography and layout separately and record this limitation.
- Fixed specimens can overflow narrow consumers. Mitigation: document `--fluid` and test 240/320-pixel containers.
- Similar surfaces may invite a generic abstraction. Mitigation: occurrence guards reject `.shlz-card` and require independent manifests.

## Migration Plan

This is additive. Import the new component styles from `@shlz/styles`, document each root, and add classified showcase/workspace occurrences. Removal is a clean revert because no existing selector or behavior changes.

## Open Questions

None block implementation. Literal product copy, destinations, live values, and asynchronous states remain consumer-owned.
