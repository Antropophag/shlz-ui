## Context

See `proposal.md` and `specs/forms/file-upload/spec.md`. The current controller and native input seam work, but the visible markup split one source composition into title, help text, and an invented pill trigger. The generic Showcase grid then shrinks four specimens below the 467px source width. `Documents.svg` is read-only and remains the visual authority.

## Goals / Non-Goals

**Goals:**

- Make the native associated label itself the deep visible module: one interface provides activation, focus, source geometry, icon, instruction, and state paint.
- Preserve behavior and consumer ownership while replacing the incorrect presentation.
- Make source-default and responsive-fallback evidence independently observable.

**Non-Goals:**

- Changes to file validation, drop filtering, event payloads, queue ownership, transport, progress, persistence, or File Row.
- A custom element, JavaScript renderer, framework adapter, new icon normalization, or edits under `shlz-design-source/`.

## Decisions

### Put the complete surface inside the associated label

The visible `.shlz-file-upload__surface` becomes the input's label and contains an existing canonical cloud-upload icon plus one instruction span. This preserves native activation while matching the source's single visual object and reduces what callers must learn.

Alternative: keep a nested label styled like plain text. Rejected because it leaves only part of the source surface clickable and retains unnecessary markup/interface complexity.

### Keep source width as a maximum, not an inflexible fixed width

The root is capped by `inline-size: min(100%, 467px)`, while the surface fills that available width and uses the source-default `min-block-size: 102px`. Media-independent wrapping allows narrower consumers and 200% text to grow vertically rather than clip.

Alternative: force 467px everywhere. Rejected because the established public contract explicitly supports narrow containers and text enlargement.

### Separate source specimens vertically in Showcase

The component receives a dedicated Showcase stack rather than the generic auto-fit 240px grid. Each state is independently labeled outside the component root; the Data Workspace consumer remains a separate application-owned composition.

Alternative: raise the generic grid minimum globally. Rejected because it would alter unrelated component galleries and still conflate a source specimen with a compact matrix.

### Preserve repository states without presenting them as source facts

Drag-active, disabled, invalid, focus-visible, long text, and narrow layout continue as repository decisions. Default and populated specimens reproduce source composition; extra state fixtures are documented and tested separately.

## Risks / Trade-offs

- [Full-surface label changes documented child markup] → Treat it as an explicit migration, retain root/input/files/error interfaces, and update all classified occurrences atomically.
- [The canonical icon may differ subtly from the outlined export] → Verify identity and computed 24px geometry against the source; do not invent a new asset unless the authoritative export proves the canonical icon incompatible.
- [Long translations cannot stay one line] → Preserve the source's single-line default at 467px and allow intentional wrapping only under constrained width or enlarged text.
- [Snapshot updates could hide unrelated drift] → Regenerate only File Upload snapshots and inspect old/new images side by side.

## Migration Plan

Update every repository-owned occurrence and documentation example in the same change. Consumers migrate from separate `.shlz-file-upload__content`, title, instructions, and trigger children to a `<label class="shlz-file-upload__surface">` containing icon and instruction. Rollback restores the previous markup, CSS, audit contract, and focused snapshots without behavior or data migration.
