## Why

SHLZ UI currently preserves source-backed text colors that leave active Field labels/placeholders and compact Modal secondary text below WCAG 2.2 AA contrast. The unresolved P1 deviations in issues #13 and #25 block a coherent rule for future component delivery, including the next roadmap item.

## What Changes

- Establish a repository policy that active production text meets WCAG 2.2 SC 1.4.3 even when an explicit semantic override must supersede source paint.
- Preserve the original SVG value and the accessible override as distinct source facts and repository decisions without modifying `shlz-design-source/`.
- Add shared semantic text tokens at the token seam and apply them to Field-family labels/placeholders and compact Modal secondary copy.
- Verify the policy across supported active states, backgrounds, affected components, and real consumers; disabled or otherwise inactive text remains measured and documented but is exempt from the blocking threshold.
- Reconcile component manifests, documentation, inventory evidence, roadmap status, and the two tracked P1 findings.
- Keep the existing public class/behavior interfaces backward compatible.

Non-goals are changing raw design sources, redesigning component geometry or interaction, introducing themes, recoloring non-text UI, resolving unrelated source diagnostics, or automatically folding the separate Status P3 paint finding into this change.

## Capabilities

### New Capabilities

- `foundations/accessible-source-contrast`: Defines how SHLZ UI records and applies accessible production-text overrides when authoritative source paint is below the required contrast threshold.

### Modified Capabilities

None; no living OpenSpec capability currently defines this cross-component policy.

## Impact

The change affects token definitions and generated distributions, Field and Modal styling, component documentation, accessibility/browser evidence, audit manifests, project inventory, and the library roadmap. Visual snapshots for affected surfaces will change. No JavaScript interface, DOM contract, dependency, source SVG, release behavior, or consumer-owned application logic changes.
