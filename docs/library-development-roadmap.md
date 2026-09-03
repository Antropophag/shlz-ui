# Library development roadmap

This roadmap turns the remaining source-library coverage work into ordered,
reviewable changes. Classification changes describe existing reality; they do
not count as new component implementation.

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

## Next milestones

5. **Reconcile current planning and completion claims.** Keep current-state
   documentation aligned with merged component manifests and preserve dated
   wave reports as historical evidence rather than rewriting their baselines.
6. **Define release readiness.** Establish an explicit versioning,
   distribution, compatibility, changelog, and release-validation contract for
   the four public packages before calling the library generally consumable.
   Publishing or release automation is a separate material OpenSpec change;
   this roadmap does not choose a registry, release authority, or versioning
   policy.
7. **Run a real consumer pilot.** Integrate packed packages into one existing
   application as a consumer and use the result to validate installation,
   update, CSS ordering, framework-adapter, accessibility, and migration
   contracts. The application remains validation evidence, not design
   authority.
8. **Close icon provenance in bounded cohorts.** Work through the 103 residual
   standalone source records using exact, reproducible matches. Keep ambiguous
   identities unresolved and do not treat provenance bookkeeping as new
   component delivery.
9. **Add public components only from proven reusable demand.** A source record
   or application screen alone is insufficient. Require a repeated consumer
   need, a framework-neutral ownership seam, source/contract evidence, and the
   component completion gate.

## Sequencing rule

Steps are evaluated in order. Release policy and consumer choice may be
researched in parallel, but release implementation waits for its material
decisions and OpenSpec contract. Consumer findings may reorder provenance
cohorts or identify a new component candidate; they do not turn an application
implementation into design authority. Existing plans and branches remain user
history until a dedicated reconciliation records whether each is resumed,
superseded, archived, or left untouched.
