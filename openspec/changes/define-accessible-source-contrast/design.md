## Context

See `proposal.md` for motivation. The Field module currently uses source Gray 200 for labels and 25%-alpha Dark Blue for placeholders; compact Modal copy uses the semantic secondary token, which currently aliases the same Gray 200. Browser evidence measures these active pairs at approximately 1.73:1 and 2.79:1. The raw SVGs are read-only, existing class and behavior interfaces are stable, and issue #13 spans multiple Field consumers while issue #25 spans four compact Modal variants.

## Goals / Non-Goals

**Goals:**

- Put one accessible production-text policy behind a small semantic token interface.
- Preserve source values and make every divergence inspectable.
- Prove effective rendered contrast rather than only checking token strings.
- Keep current markup, behaviors, geometry, and consumer ownership unchanged.

**Non-Goals:**

- A theme architecture, consumer runtime validator, source SVG edit, or generic color-generation algorithm.
- Reclassification of disabled text as active text.
- Automatic correction of the distinct Status tone palette or unrelated non-text contrast.

## Decisions

### Use semantic accessible-text roles as the seam

Add narrow semantic roles for muted supporting text and placeholder text. Both default to a repository-decided 60% Dark Blue value, extending the source's existing 50%/25%/10% opacity family just enough to clear 4.5:1 on the supported white, Gray 50, Blue 50, and page surfaces. This is a derived accessible value, not a newly claimed source token. Field labels/messages/counters use the supporting role; Field placeholder states use the placeholder role; compact Modal secondary copy uses the supporting role.

This is a deep module: downstream CSS and consumers learn two role names while provenance, source divergence, supported-background validation, and future coordinated correction remain local to tokens. Reusing `text.primary` would pass contrast but erase the intended hierarchy. Component-local literals would duplicate the decision and make later auditing fragile. A computed color algorithm would introduce unsupported runtime/theme complexity.

### Preserve the original source token instead of repointing it

Existing `source.*` tokens continue to represent Figma facts. The pre-existing semantic `text.secondary` alias also remains unchanged for compatibility; the new accessible roles express the stronger production policy without retroactively changing every consumer of secondary text. This separates evidence from decision and limits visual impact to the closed affected surface.

### Validate the effective paint matrix

Shared test helpers will calculate alpha-aware effective backgrounds and apply the 4.5:1/3:1 thresholds. Tests will enumerate the Field roots and states identified by the census plus compact Modal variants, including a real consumer. Token/provenance tests will prevent the accessible roles from aliasing the known failing source paints. Focused snapshots will be regenerated only for affected fixtures.

### Treat disabled text as measured but non-blocking

WCAG 2.2 excludes inactive controls from SC 1.4.3. Tests will still record/verify the expected disabled styling and will never use that exception for default, placeholder, error, focus, filled, or other active states. This avoids an invented disabled redesign while keeping the exception bounded.

### Keep Status as a separately governed finding

Status foregrounds encode multiple source tones, remain readable labels whose text is not the sole carrier of meaning, and have a separately recorded P3 finding. Folding them into two generic text roles would destroy their source semantics and expand this PR beyond issues #13/#25. The audit census will explicitly retain that disposition.

## Risks / Trade-offs

- [Accessible paint reduces exact source fidelity] → Preserve exact source values and provenance; label the semantic override as a repository decision and limit it to active textual roles.
- [One color may fail on a newly introduced background] → Specify supported backgrounds, test them as a closed set, and make consumers responsible when overriding tokens or backgrounds.
- [Broad `text.secondary` replacement causes visual churn] → Introduce dedicated accessible roles and migrate only the censused affected surfaces.
- [Snapshots conceal an unintended geometry change] → Assert computed color and existing geometry/behavior separately; inspect only focused snapshot diffs.
- [Future source updates make the override unnecessary] → Keep the semantic interface stable and allow its value/provenance to be reconciled in a dedicated source-update change.

## Migration Plan

Generate token distributions after adding the semantic roles, update the affected CSS selectors, run focused and full validation, then publish through the normal package release process after user-owned merge. Rollback is a normal revert of the semantic-token/CSS change; no data or runtime state migration exists.
