# Accessible source contrast

SHLZ UI preserves the original Figma exports as design evidence while requiring active production text to meet WCAG 2.2 SC 1.4.3. Normal text must reach 4.5:1 against its effective background; large text must reach 3:1. Disabled or otherwise inactive controls are measured and documented separately because the criterion exempts them.

## Authority and decision

- **FACT:** Field source labels use Gray 200 (`#939CA5`), Field placeholders use 25% Dark Blue, and compact Modal secondary text uses Gray 200. Those values remain unchanged in the source token layer and in `shlz-design-source/`.
- **DERIVED:** the source Dark Blue opacity family contains 50%, 25%, and 10% variants. A 60% Dark Blue value retains that hue and muted hierarchy while reaching at least 4.5:1 on the supported white, Gray 50, Blue 50, and page surfaces.
- **DECISION:** `supporting-accessible` and `placeholder-accessible` are semantic production roles with the default value `rgb(11 22 35 / 60%)`. They override insufficient source paint for active Field guidance/placeholders and compact Modal secondary copy.

The semantic roles are the public customization seam. Consumers may override their CSS custom properties through the normal cascade, but contrast validation for those backgrounds is consumer-owned. The library does not rewrite source tokens, inspect consumer styles at runtime, or infer an accessible value dynamically.

## Closed affected surface

The Field surface includes the six Input, twelve Textarea, eight Select, and thirty-four Date Picker/Calendar audit roots recorded in their component manifests. Tests cover the shared label, message, counter, native placeholder, Select placeholder, Date Field label/description, and Date Field placeholder selectors. Representative live consumers include Data Workspace Input/Select and the application-owned Date Picker form.

The Modal surface includes four compact Showcase roots, one structured Showcase root, and the plain-HTML live consumer recorded in the Modal manifest. The contrast correction applies to visible compact Info, Success, Warning, and Error secondary copy without changing modal semantics or behavior.

The source-tone Status finding remains separately governed: its palette carries status-specific semantics and is not replaced by these generic text roles. Other uses of the legacy `text.secondary` token are outside this closed correction and remain independently auditable.

## Evidence expectations

Completion requires generated-token parity, immutable source facts, alpha-aware computed contrast across supported active backgrounds, separate disabled-state observation, focused visual review, responsive/content stress, real consumer coverage, and unchanged interaction contracts. Structural token checks or screenshots alone do not prove contrast.
