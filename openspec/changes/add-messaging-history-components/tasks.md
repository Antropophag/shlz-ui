## 1. Baseline and source contracts

- [ ] 1.1 Record the clean task baseline, Wave 12 source hashes, current Messaging/History/Planner census, CI and review state, and verify source-integrity checks prove `shlz-design-source/` is unchanged
- [ ] 1.2 Extract and classify Message Thread and History Timeline geometry, paint, content roles, states, primitive dependencies, and unsupported semantics as source facts, repository decisions, or assumptions; verify focused source-contract tests cover every claim

## 2. Public modules

- [ ] 2.1 Implement and export framework-neutral Message Thread styles and semantic markup for thread, item direction/grouping, author, timestamp, body, metadata, attachments, and empty/loading-safe states; verify structural, style, source-fidelity, responsive, and content-stress tests pass
- [ ] 2.2 Implement and export framework-neutral History Timeline styles and semantic markup for periods, entries, actor, timestamp, description, metadata, attachments, emphasis, and empty/loading-safe states; verify structural, style, source-fidelity, responsive, and content-stress tests pass
- [ ] 2.3 Add public documentation and plain-HTML consumption for both modules, including consumer-owned boundaries and supported limits; verify package build and clean consumer smoke tests pass

## 3. Consumers and inventory

- [ ] 3.1 Add source-matrix, state, density, empty, long-content, and responsive Showcase fixtures plus independent Data Workspace consumers using stable audit IDs; verify both applications build and no application shell or unsupported behavior enters either interface
- [ ] 3.2 Split the Wave 12 parent evidence into independently reportable Message Thread, History Timeline, and already-delivered Planner Schedule status; add manifests classifying every executable fixture, consumer, diagnostic, nested primitive, and substitute; verify manifest and repository occurrence guards pass

## 4. Browser and visual evidence

- [ ] 4.1 Add focused browser and accessibility coverage for list relationships, DOM order, authors/actors, timestamps, attachments, native actions, focus, empty states, rerendering, and consumer ownership; verify runtime-semantic and accessibility assertions pass
- [ ] 4.2 Add focused visual and computed-geometry coverage for source-backed states, grouping/connector continuity, incoming/outgoing alignment, dense/empty/long localized content, narrow viewport, text scaling, and representative bounded performance; inspect and approve snapshots

## 5. Completion and delivery

- [ ] 5.1 Run the complete component gate and independent Standards/Spec review, remediate every scope-local finding, rerun affected and aggregate validation, record exact evidence and limitations, complete route/delivery guards, push the task branch, open an unmerged PR to `main`, and verify required GitHub checks are green
