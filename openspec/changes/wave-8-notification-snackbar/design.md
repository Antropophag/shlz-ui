## Context

See `proposal.md` and the two delta specs. Notification currently ships as shared CSS plus application-owned Showcase close/action wiring. Snackbar is represented mainly by static fidelity markup using six extracted source contours. Both inventory entries are historical and lack component manifests, occurrence guards, focused stress evidence, and independent completion status.

The raw authorities establish static appearance only. `Notification.svg` contains the three Notification compositions and sheet-level Snackbar material; the canonical exported Snackbar component set is also preserved inside raw `UI Kit – Basic elements.zip`. Current docs incorrectly name `UI Kit – Interface elements.zip` for Snackbar. Existing CSS, derived indexes, tests, snapshots, and Showcase are evidence to audit, not authority.

## Goals / Non-Goals

**Goals:**

- Establish two independently auditable manifests and ledgers while retaining the proven shared visual primitive.
- Make source identity, variant census, exact contour geometry, public ownership seams, occurrences, interactive states, content stress, and limitations executable.
- Preserve backward-compatible selectors and framework-neutral native-button composition.
- Close the full component gate for each family and report each status independently.

**Non-Goals:**

- A behavior package, controller, queue, timer, animation, toast manager, placement layer, live-region manager, or framework adapter.
- Deriving lifecycle semantics from the six static Snackbar frames.
- Recoloring source-backed paint to solve a source-owned contrast issue without a separately authorized source/shared-contract decision.
- Combining Notification and Snackbar status merely because they share CSS.

## Decisions

### 1. Keep shared CSS but split public audit identities

Notification and Snackbar share the 384×58 pill, typography, action geometry, and application-owned lifecycle seam, so a second production stylesheet or base abstraction would duplicate the same primitive. Wave 8 keeps the compatible `.shlz-notification` foundation and introduces a semantic Snackbar modifier/markup contract only where needed to classify and test Snackbar independently.

Alternative: treat Snackbar as a Notification diagnostic. Rejected because the authoritative component set has its own name, variant axis, consumer purpose, evidence gaps, and completion status.

Alternative: create a generic Toast API. Rejected because no authority establishes orchestration behavior and the repository explicitly keeps lifecycle consumer-owned.

### 2. Use exact source contour paths for Snackbar frames

The six contours are not uniform percentages; the fidelity contract will retain exact exported path geometry or an equivalently exact reusable representation. Production stress fixtures may use the same accessible decorative graphic, but no CSS animation or inferred step timing is added.

Alternative: conic-gradient percentages. Rejected for focused source fidelity because generic percentages do not prove the exported contour geometry.

### 3. Separate semantic content from changing countdown decoration

Snackbar's stable message and native action remain accessible. The changing numeral/contour is decorative by default in the reusable example so a consumer-controlled timer does not create repeated announcements. Consumers may expose an independently designed time status when their product requirements establish one.

Alternative: force `role="status"` or `role="timer"`. Rejected because urgency, insertion context, duration, and announcement cadence are not recoverable from static source.

### 4. Census source files and built DOM

Each manifest will enumerate executable fixtures, content-stress fixtures, and live consumers with stable audit IDs. Focused Playwright guards will compare built roots to those IDs, classify all legacy/native substitutes, and verify inert diagnostic counts. Repository tests will scan implementation files so an executable occurrence cannot evade a DOM-only guard.

Alternative: encode fixed total counts in browser tests. Rejected because counts are observations, while stable IDs and classifications are the durable contract.

### 5. Prove material states in real browser flows

Notification and Snackbar each receive a focused browser ledger. Native focus, hover, active, disabled and activation assertions will select the named variant, create the real state, read relevant computed properties/geometry/contrast, and verify behavior in one flow. Static source matrices remain static-visual evidence only. Focused snapshots will cover representative default/error/action/countdown and stress states, while exact programmatic assertions cover every source variant.

### 6. Treat 384×58 as source minimum under stress

Exact single-line fixtures must match source geometry. Long localized content, narrow viewport, and text scaling may increase block size while preserving radius, spacing intent, control operability, and overflow safety. This is a repository accessibility/responsive decision rather than an invented source size.

## Risks / Trade-offs

- [Exact source paint may fail emergency contrast] → Measure real active text states, record any source-backed deviation with severity/evidence, and do not silently recolor authority.
- [Shared selectors can blur component census] → Add an explicit Snackbar root marker/modifier and component-specific audit IDs while preserving the base class.
- [Showcase consumer behavior can be mistaken for library API] → Label application-owned wiring and keep package export tests asserting no Notification/Snackbar behavior controller.
- [Snapshot breadth can hide state gaps] → Pair representative focused snapshots with exact source-frame and real-interaction computed assertions.
- [A DOM-only guard can miss dormant executable markup] → Add repository-wide source census tests alongside the shared browser occurrence guard.

## Migration Plan

Existing Notification markup remains valid. Showcase and documentation gain explicit audit IDs and clearer Snackbar markup/provenance. No package behavior export or consumer migration is planned. If focused evidence exposes a backward-incompatible source defect, implementation pauses and the OpenSpec requirements return to readiness rather than silently changing the public contract.
