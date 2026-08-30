## Context

`Messages.svg` and `Planner.svg` are the authoritative static sources for the observed composer/editor artwork. The normalized icon package already contains 17 editor icons, including alignment, heading, emphasis, list, image, and file glyphs. The Wave 12 audit proves source integrity and current implementation absence, but explicitly establishes no editor-command, attachment-lifecycle, persistence, messaging, or accessibility behavior. See `proposal.md` for motivation and the two delta specs for the observable contract.

## Goals / Non-Goals

**Goals:** add two independently auditable HTML/CSS contracts; make native semantics usable with styles alone; reuse existing icons and nested primitives; keep visual source facts separate from design-system decisions; exercise the shell with a real consumer-provided editing surface.

**Non-Goals:** select or wrap an editor library; define a document schema or command API; execute formatting; preserve selections; sanitize HTML; implement shortcuts, uploads, messaging, persistence, or framework adapters; certify the whole Messaging or Planner domain.

## Decisions

### Keep Composer and Rich Text Toolbar as separate public roots

Use independent `.shlz-composer` and `.shlz-rich-text-toolbar` contracts. The toolbar can serve editing surfaces outside a composer, while the Composer can host a smaller consumer-specific command set. A single editor widget was rejected because it would couple layout to an editor engine and make the CSS package appear to own behavior.

### Treat the editing surface as an explicit consumer-owned slot

Document markup for textarea, contenteditable, and editor mount-point integrations, with an accessible-name requirement and state hooks on the shell. Do not ship a custom element or JavaScript facade. A library-owned contenteditable implementation was rejected because correct value, selection, input, sanitization, and accessibility behavior require a document-model contract absent from the source.

### Use native buttons inside semantic toolbar groups

Icon commands use native `button` elements; toggles use `aria-pressed`; unavailable commands use `disabled`. The CSS layer provides states but neither roving focus nor keyboard shortcuts. An ARIA composite with a controller was rejected because it would add behavior infrastructure and stronger focus guarantees than this change can support.

### Reuse editor icons without making the full icon set mandatory

Showcase specimens use the normalized source-backed editor icons. The public CSS contract remains compatible with consumer-supplied icons that meet documented sizing and decorative-alt requirements. No new glyphs or aliases are invented.

### Prefer group wrapping for narrow containers

Toolbar groups remain intact and wrap as units; Composer supporting regions stack when needed. This is a design-system decision because the static exports do not establish responsive behavior. Clipping and a library-owned overflow menu were rejected: clipping makes commands inaccessible, while overflow requires command-state and focus behavior outside scope.

### Audit the components independently

Create separate machine-readable manifests and focused evidence for toolbar and Composer, then classify every repository occurrence. One real consumer must mount a native editing surface and wire at least one toolbar control so browser evidence covers the ownership seam rather than a static picture.

## Risks / Trade-offs

- [Visual fidelity can vary across editor engines] → Keep the mount surface contract explicit and compare the SHLZ-owned shell separately from consumer-owned editable content.
- [Native tab order can be verbose with many commands] → Document that advanced roving focus is consumer-owned and avoid claiming an APG composite controller.
- [Wrapping differs from the fixed source composition] → Record it as a responsive design-system decision and retain a source-sized focused specimen for visual evidence.
- [State hooks can drift from nested editor state] → Require the consumer to apply both semantic editor state and the documented root hook; examples and tests show the pairing.

## Migration Plan

This change is additive. Export the two component styles, add documented markup and classified consumers, and leave all existing contracts unchanged. Rollback removes the new exports, fixtures, manifests, and documentation without data migration or source changes.
