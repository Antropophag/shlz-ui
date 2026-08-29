## 1. Baseline and source contract

- [x] 1.1 Record the clean task baseline, authoritative Planner SVG hashes and frame census, existing Planner/Calendar Grid/Popover occurrences, CI, and review state; verify source-integrity checks prove no file under `shlz-design-source/` changed
- [x] 1.2 Extract and classify schedule geometry, meeting-card durations and states, time/day context, unavailable treatment, current-time lines, detail layouts, and unsupported behavior as source facts, supplemental evidence, repository decisions, or assumptions; verify focused source-contract tests cover every claimed state

## 2. Public module implementation

- [x] 2.1 Add framework-neutral Planner Schedule semantic markup and source-backed CSS for day headers, time scale, duration geometry, overlap lanes, events, empty periods, temporal/unavailable states, current time, sticky context, and contained overflow; verify structural, style, source-fidelity, and accessibility-contract tests pass
- [x] 2.2 Add Planner event-detail composition styles and documented integration with the existing Popover, Avatar, Button, Textarea, and file primitives; verify real Popover lifecycle tests cover open, Escape/outside dismissal, focus restoration, optional content, and consumer actions without adding planner-specific behavior
- [x] 2.3 Add style exports, generated distribution artifacts, public documentation, and plain-HTML consumption for the Planner Schedule interface and consumer-owned boundaries; verify package build and consumer smoke tests pass

## 3. Executable consumers and audit inventory

- [x] 3.1 Add source-matrix, interaction, overlap, temporal, empty, and responsive Showcase fixtures plus one Data Workspace consumer using stable audit IDs and application-owned data/actions; verify both applications build and Planner Schedule contains no application shell contract
- [x] 3.2 Split Planner evidence from the combined source-only compositions family, update project inventory, and add a Planner Schedule component manifest classifying every executable fixture, live consumer, diagnostic, and legacy/native substitute; verify manifest-contract and repository occurrence guards pass without changing Messaging or History status

## 4. Browser, accessibility, and visual evidence

- [x] 4.1 Add focused browser coverage for semantic day/time/event relationships, native event activation, real Popover disclosure, keyboard focus, dismissal, consumer action, temporal/unavailable descriptions, and rerender/re-enhancement; verify runtime and accessibility assertions pass without substituting static states
- [x] 4.2 Add focused visual and computed-geometry coverage for duration and overlap lanes, default/hover/focus/completed/canceled states, current time, unavailable periods, sticky context, two-axis overflow, dense/empty/long localized content, narrow viewport, text scaling, and representative bounded performance; inspect and approve focused snapshots

## 5. Completion, review, and delivery

- [x] 5.1 Run the complete component gate, manual interaction walk, source integrity, OpenSpec, lint, build, package, full browser, accessibility, visual, and regression validation; record exact occurrences, evidence levels, supported bounds, limitations, CI, review threads, and Planner Schedule status without changing Calendar Grid, Date Picker, Messaging, or History status
- [x] 5.2 Run independent Standards and Spec review against the immutable baseline, remediate every scope-local finding, rerun affected checks, complete route-conformance and delivery guards, push the task branch, open an unmerged PR to `main`, explicitly trigger CodeRabbit review, resolve every still-valid thread, and verify required GitHub checks are green
