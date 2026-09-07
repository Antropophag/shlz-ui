# Library development roadmap

This roadmap orders release, adoption and remaining library work. Current-state
reconciliation is based on main `b1cef24` (2026-09-07 inspection). Classification
changes describe existing reality; they do not count as new components.

## Ordered work

1. **Classify existing component and composition records** — completed by PR
   #64.
   Reconcile unresolved source records with committed reusable components,
   composition evidence, and explicit consumer-ownership boundaries. Retain
   `unresolved` whenever the proof is incomplete.
2. **Classify source extraction diagnostics** — completed by PR #65. Separate
   extraction defects, source ambiguities, and harmless diagnostics from the
   product backlog without changing `shlz-design-source/`. The committed index
   supports 44 node-level diagnostic units and two archive-level skipped-instance
   cohorts whose multiplicities account for all 91 reported instances.
3. **Optimize showcase loading** — completed by PR #66. The delivered change reduces
   initial JavaScript from 1,088,896 to 8,359 bytes (99.23%), keeps initial
   font bytes unchanged at 219,500, limits CSS growth to 0.27%, and makes zero
   initial image or generated source-reference requests.
4. **Resolve accessibility-versus-fidelity policy** — completed by PR #67.
   Active production text takes precedence when source paint fails WCAG 2.2
   SC 1.4.3; source facts stay immutable and explicit semantic overrides carry
   the repository decision. Issues #13 and #25 are the closed affected surface.

The component work that an earlier version of this roadmap queued after step 4
was already delivered before the roadmap was written:

- File Upload / Drop Zone was implemented by PR #54 and brought back to the
  authoritative full-surface source composition by PR #55. Its independent
  component manifest records runtime, accessibility, focused visual,
  responsive/content-stress, consumer, and occurrence evidence.
- Message Thread and History Timeline were implemented as independent reusable
  modules by PR #57. The implementation deliberately did not force a shared
  domain model; ordering, synchronization, persistence, and application
  semantics remain consumer-owned.
- Card with action, Report card, and Cover were implemented as three bounded
  framework-neutral compositions by PR #56. Their evidence does not establish
  or require a generic Card API.
- Composer / Rich Text Toolbar was implemented as a framework-neutral shell by
  PR #58. Editing state, command execution, sanitization, and persistence
  remain consumer-owned.
- Date Picker, Calendar Grid and Planner Schedule already have independent
  reusable contracts and manifests. Comment Feed, Dashboard, Chart Widget and
  Bar Chart are also present in the current inventory. Their individual limits
  remain authoritative; a chart surface does not imply an unrestricted chart
  engine or application dashboard framework.

## Next milestones

5. **Reconcile current planning and completion claims** — addressed by PR #68.
   The current-state documentation is aligned with merged component manifests;
   dated wave reports remain historical evidence and retain their original
   baselines.
6. **Release readiness: policy and pipeline implemented; activation pending.**
   The [release contract](../openspec/changes/define-release-readiness/specs/release/package-release-readiness/spec.md)
   and merged pipeline PR #70 establish fixed-set SemVer, Changesets, private
   corporate GitLab distribution, exact-package verification and rollback.
   [Preparation operations](release-preparation.md) records recovery of the
   version-PR permission failure. Successful preparation is not publication.
   Live activation remains in [PR #72](https://github.com/Antropophag/shlz-ui/pull/72):
   configure the protected `release` environment, provision registry coordinates
   and separate read/publish credentials, select approved test versions and a
   rollback target, then prove partial resume, exact installation, promotion
   and rollback. Record redacted evidence before advancing milestone 7.
7. **Run a real consumer pilot.** Integrate packed packages into one existing
   application after live activation and use the result to validate installation,
   update, CSS ordering, framework-adapter, accessibility, and migration
   contracts. The application remains validation evidence, not design
   authority.
   Select one application and bounded workflow explicitly. A useful proposed
   scope is filtered table → record detail → edit form with dates and files.
   Acceptance includes installing and upgrading exact published package sets,
   CSS coexistence, controller teardown/re-entry, keyboard/focus behavior and
   migration instructions. Existing Showcase consumers and historical
   ServiceDesk research do not by themselves pass this milestone. Add a Vue or
   other adapter only when the pilot proves the need; retain the neutral core.
8. **Close icon provenance in bounded cohorts.** Work through the 103 residual
   standalone source records using exact, reproducible matches. Keep ambiguous
   identities unresolved and do not treat provenance bookkeeping as new
   component delivery.
9. **Add public components only from proven reusable demand.** A source record
   or application screen alone is insufficient. Require a repeated consumer
   need, a framework-neutral ownership seam, source/contract evidence, and the
   component completion gate.

## Sequencing rule

The release path is preparation → protected GitLab activation → real consumer
pilot → general-consumption assessment. Milestone numbers remain stable for
existing references. Activation waits for its existing material decisions and
OpenSpec contract; this roadmap does not approve arbitrary versions or supply
corporate credentials. No PR merge is implied.

Independent quality and evidence work can proceed while activation inputs are
pending, in this priority order:

| Priority | Bounded change                           | Acceptance boundary                                                                                                                                                                                                          |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Status and Empty State contrast          | Independently resolve the findings in their manifests through explicit semantic production decisions and computed contrast/state evidence; preserve source facts. PR #67 covered Field and Modal, not these families.        |
| P1       | Browser and assistive-technology support | Define the supported matrix, then prove critical form, focus, dialog, floating, date and file-selection flows in each supported engine and representative assistive technology. Current automated coverage is Chromium only. |
| P2       | Current specs and completion records     | Reconcile completed changes individually, sync actual behavioral deltas and archive only after their own verification. Do not bulk-convert historical audit reports into normative specs.                                    |
| P2       | Source mappings and icon provenance      | Reconcile delivered components with residual source mappings and process the 103 standalone icon records in bounded exact-match cohorts. Preserve unresolved identities where proof is missing.                              |
| P3       | Additional components or adapters        | Require repeated consumer demand, an explicit ownership seam and independent component completion evidence.                                                                                                                  |

The current coverage matrix reports 117 unresolved records out of 195, of which
103 require icon provenance. These are source-record classifications, not a
percentage of missing library functionality. The 54 inventory families include
foundations, reusable components, compositions and source-only evidence;
their `VERIFIED` audit statuses do not imply 54 independently shipped components.

Consumer findings may reorder provenance cohorts or identify a new component
candidate; they do not make application code design authority. Existing plans
and branches remain user history until a dedicated reconciliation records
whether each is resumed, superseded, archived, or left untouched.
