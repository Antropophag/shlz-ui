## Why

Modal and Drawer are reusable and already have preliminary native-dialog implementations, but remain only `INVENTORIED`: their source census, semantic boundaries, focus/top-layer lifecycle, nested-overlay behavior, controller isolation, material states, occurrences, and real-consumer evidence have not passed the component completion gate. Wave 7 establishes an executable, source-traceable contract before either family can be reported `VERIFIED`.

## What Changes

- Re-attest `Modal.svg` as the sole Modal visual authority: five standalone components (`.Modal/Basic(Legacy)`, `Modal/Info`, `Modal/Success`, `Modal/Warning`, `Modal/Error`), not a Figma Component Set and not evidence for additional variants or interaction semantics.
- Re-attest `Drawer.svg` as the sole Drawer visual authority: one standalone `Sidebar/Drawer` component at 420×900, with no variant properties and no source proof of edge, modality, backdrop, focus, dismissal, or responsive behavior.
- Define Modal and the bounded first Drawer contract as modal native-dialog overlays while retaining separate component identities; explicitly exclude non-modal Drawer until authoritative or consumer evidence supports it.
- Specify focus ownership, Escape and top-layer precedence, backdrop/outside interaction, scroll ownership, nested overlays, Wave 6 floating-surface composition, and controller lifecycle/stale-state isolation.
- Inventory and classify every repository occurrence, add component audit manifests and occurrence guards, and replace broad structural claims with executable runtime, accessibility, visual, responsive/content-stress, and consumer regression evidence.
- Preserve the existing public component names and native-first direction unless the audit exposes a source or contract defect; no generic public Overlay API, portal, z-index manager, focus-trap framework, inert polyfill, or speculative variant API is introduced.

## Capabilities

### New Capabilities

- `overlays/modal`: Source-backed Modal structure, native modal semantics, lifecycle, supported material states, nested-overlay composition, and audit acceptance contract.
- `overlays/drawer`: Source-backed right-side modal Drawer structure, modal-only boundary, lifecycle, scroll/responsive behavior, and audit acceptance contract.
- `overlays/composition`: Shared semantic boundary and precedence rules across Modal, Drawer, Popover, Tooltip, and Dropdown without creating a generic overlay framework.

### Modified Capabilities

None. The repository has no living OpenSpec overlay capabilities yet.

## Impact

Implementation, if separately approved, may touch Modal/Drawer styles and behavior controllers, their narrowly shared native-dialog helper, Showcase and plain-HTML fixtures, the Data Workspace Drawer consumer, component documentation, audit inventory/manifests, source/structural tests, Playwright interaction/fidelity coverage, snapshots, and package exports. `shlz-design-source/` remains read-only. Wave 6 Dropdown, Tooltip, and Popover public contracts are prerequisites and regression surfaces, not redesign targets.

Non-goals are non-modal or multi-edge Drawer, arbitrary nested modal dialogs, a generic Overlay/ModalManager abstraction, portals, animation APIs, new placement/size/status names, legacy-dialog polyfills, application-owned workflow state, and changes to Wave 6 floating positioning or dismissal APIs absent a demonstrated regression.
