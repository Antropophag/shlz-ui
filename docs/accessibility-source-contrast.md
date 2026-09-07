# Accessible source contrast

SHLZ UI preserves the original Figma exports as design evidence while requiring active production text to meet WCAG 2.2 SC 1.4.3. Normal text must reach 4.5:1 against its effective background; large text must reach 3:1. Disabled or otherwise inactive controls are measured and documented separately because the criterion exempts them.

## Authority and decision

- **FACT:** Field source labels use Gray 200 (`#939CA5`), Field placeholders use 25% Dark Blue, and compact Modal secondary text uses Gray 200. Those values remain unchanged in the source token layer and in `shlz-design-source/`.
- **DERIVED:** the source Dark Blue opacity family contains 50%, 25%, and 10% variants. A 60% Dark Blue value retains that hue and muted hierarchy while reaching at least 4.5:1 on the supported white, Gray 50, Blue 50, and page surfaces.
- **DECISION:** `supporting-accessible` and `placeholder-accessible` are semantic production roles with the default value `rgb(11 22 35 / 60%)`. They override insufficient source paint for active Field guidance/placeholders and compact Modal secondary copy.
- **FACT:** Status source foregrounds and backgrounds are preserved in `Status.svg`. The `Empty/Simple`, `Empty/Customize`, and `Empty/Basic` source entries are in `UI Kit – Basic elements.zip`; Simple's original title and Basic's description use Gray 200.
- **DECISION:** `semantic.color.status-foreground` adds six production foreground roles: green `#3D6940`, bright-green `#1B6D2D`, orange `#8A521E`, cyan `#2E667D`, pink `#90388E`, and neutral `#676D74`. They are source-derived percentage darkenings with a 4.75:1 engineering margin (above the 4.5:1 public threshold) on white, Gray 50, Blue 50, and page surfaces. Empty State secondary titles and all descriptions reuse `supporting-accessible`; Customize and Basic primary titles and all illustrations remain unchanged.

The semantic roles are the public customization seam. Consumers may override their CSS custom properties through the normal cascade, but contrast validation for those backgrounds is consumer-owned. The library does not rewrite source tokens, inspect consumer styles at runtime, or infer an accessible value dynamically.

## Closed affected surface

The Field surface includes the six Input, twelve Textarea, eight Select, and thirty-four Date Picker/Calendar audit roots recorded in their component manifests. Tests cover the shared label, message, counter, native placeholder, Select placeholder, Date Field label/description, and Date Field placeholder selectors. Representative live consumers include Data Workspace Input/Select and the application-owned Date Picker form.

The Modal surface includes four compact Showcase roots, one structured Showcase root, and the plain-HTML live consumer recorded in the Modal manifest. The contrast correction applies to visible compact Info, Success, Warning, and Error secondary copy without changing modal semantics or behavior.

Status uses only its six additive foreground roles for green, bright-green, orange, cyan, pink, and neutral. Blue, source-blue, and purple keep their source foregrounds; all Status backgrounds, source tokens, geometry, and Badge styling remain unchanged. These paint names do not create behavior or business-state meanings. Consumers may override the semantic variables, but validation of an override or an unsupported background remains consumer-owned. Other uses of the legacy `text.secondary` token are outside this closed correction and remain independently auditable.

## Evidence expectations

Completion requires generated-token parity, immutable source facts, alpha-aware computed contrast across supported active backgrounds, separate disabled-state observation, focused visual review, responsive/content stress, real consumer coverage, and unchanged interaction contracts. Structural token checks or screenshots alone do not prove contrast.
