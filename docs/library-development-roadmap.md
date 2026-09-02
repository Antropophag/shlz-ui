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
2. **Classify source extraction diagnostics** — active in PR #65. Separate
   extraction defects, source ambiguities, and harmless diagnostics from the
   product backlog without changing `shlz-design-source/`. The committed index
   supports 44 node-level diagnostic units and two archive-level skipped-instance
   cohorts whose multiplicities account for all 91 reported instances.
3. **Optimize showcase loading** — queued after the coverage denominator is
   trustworthy. Establish a measured baseline before changing loading or
   bundling behavior.
4. **Resolve accessibility-versus-fidelity policy** — queued before new
   component delivery. Record how native semantics, source fidelity, and
   unavoidable deviations are decided and evidenced.
5. **Audit and propose File Upload / Drop Zone** — queued after the policy.
   Establish source, state, size, content-stress, ownership, and consumer
   contracts without implementing the component.
6. **Implement File Upload through the component completion gate** — queued
   after its proposal. Complete repository-wide census, runtime,
   accessibility, focused visual, responsive/content-stress, consumer,
   manifest, and review evidence.
7. **Explore a shared Timeline/Message model** — queued after File Upload.
   Determine whether the concepts share a durable domain seam without forcing
   one abstraction.
8. **Decide Composer and Card only after step 7** — deliberately deferred.
   Reuse prior work as historical evidence or remove it from active planning
   without deleting or overwriting user changes.

## Sequencing rule

Steps are evaluated in order. A later step may be researched enough to avoid
losing context, but it does not enter active implementation until its stated
predecessors are resolved. Existing plans and branches are preserved as user
history until a dedicated reconciliation records whether each is resumed,
superseded, archived, or left untouched.
