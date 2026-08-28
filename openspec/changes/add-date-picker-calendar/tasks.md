## 1. Execution readiness and source contract

- [x] 1.1 Run the repository apply preflight from the approved OpenSpec change, create the adaptive execution state required for this M/L capability, and verify the execution receipt authorizes only `add-date-picker-calendar` scope.
- [x] 1.2 Re-attest `Date-Picker.svg`, `Calendar.svg`, Picker Dropdown, and Picker Cell facts without modifying `shlz-design-source/`; record observed variants/dimensions separately from design-system decisions and verify source-integrity tests cover every cited authority.
- [x] 1.3 Inventory repository-wide Date Picker/Calendar occurrences and substitutes, classify each as executable fixture, live composition, inert diagnostic, or legacy/native substitute, and verify the census has no unclassified occurrence.
- [x] 1.4 Record the applicable state, size, content-stress, accessibility, responsive, and real-consumer acceptance matrix for Date Field, Calendar, and Date Picker and verify it satisfies `docs/component-audit-workflow.md` before implementation.

## 2. Date-only foundation

- [x] 2.1 Add failing unit contracts for ISO date validation, leap years, comparison, safe month/day arithmetic, month matrices, locale week ordering, and timezone invariance; verify the focused test command fails for the intended missing behavior.
- [x] 2.2 Implement the framework-neutral date-only helpers behind a small typed interface and verify all focused date-domain tests pass in non-UTC and UTC environments.
- [x] 2.3 Add failing contracts for `Intl` display-part formatting and strict complete-pattern parsing across the primary locale and a contrasting day/month locale; verify invalid, ambiguous, incomplete, and impossible input cases fail as specified.
- [x] 2.4 Implement locale resolution, formatting, and strict parsing without natural-language guesses and verify the focused parser/formatter suite passes.

## 3. Calendar behavior

- [x] 3.1 Add failing state-transition tests for single selection, provisional/committed ordered ranges, replacement ranges, min/max, disabled dates, navigation bounds, and dynamic constraint mismatch; verify each spec scenario is traceable to a test.
- [x] 3.2 Implement pure Calendar state and selection transitions and verify the focused Calendar model suite passes without DOM or framework dependencies.
- [x] 3.3 Add failing keyboard/focus tests for roving focus, arrows, Home/End, Page Up/Page Down, Enter/Space, month crossings, clamping, and disabled-date skipping; verify the failures cover boundary and all-disabled cases.
- [x] 3.4 Implement Calendar keyboard and focus transitions and verify the focused interaction suite passes.
- [x] 3.5 Bind Calendar state to semantic inline DOM with accessible month/weekday/date/today/selection/range/disabled information and verify focused browser accessibility and keyboard tests pass.

## 4. Date Field behavior

- [x] 4.1 Add failing browser/unit contracts for stable ISO values, localized display/manual editing, invalid preservation, min/max/disabled constraints, accessible error association, disabled/read-only behavior, committed change events, form submission, and reset; verify the expected failures.
- [x] 4.2 Implement Date Field behavior and native form integration without a framework dependency and verify all focused Date Field contracts pass.
- [x] 4.3 Document the public Date Field options, values, events, locale fallback, supported parsing boundary, validation ownership, and form semantics and verify every public contract is represented in generated/type checks and an executable plain-HTML example.

## 5. Source-backed visual layer

- [x] 5.1 Add Date Field CSS states and Large/Medium sizing from authoritative source evidence, tagging source-observed values versus repository decisions, and verify structural tests plus focused visual comparisons for default, hover, focus, filled, invalid, and disabled states.
- [x] 5.2 Add Calendar surface, header, weekday grid, day cells, today, selected, range, hover, focus, outside-month, and disabled styles from authoritative source evidence and verify structural/source tests plus focused state screenshots.
- [x] 5.3 Implement one-month default and explicitly requested two-month container-responsive layout, including narrow fallback without horizontal page overflow, and verify focused width-boundary and content/locale-stress browser tests.

## 6. Date Picker composition

- [ ] 6.1 Add failing integration contracts for field/calendar synchronization, Popover opening/viewport positioning, single commit, provisional and committed range behavior, Escape/outside dismissal, focus restoration, disable-while-open, and reset-while-open; verify the expected failures.
- [ ] 6.2 Compose Date Field and Calendar through the existing Popover seam without changing its public contract and verify the complete focused Date Picker integration suite passes.
- [ ] 6.3 Export the new framework-neutral styles and behaviors through documented package entry points and verify package build, type checks, export-surface tests, and existing consumer imports remain compatible.

## 7. Fixtures, consumer, and evidence

- [ ] 7.1 Add exhaustive Showcase fixtures for every authoritative size/state plus single/range, constraints, invalid input, one/two-month, narrow, long-label, and locale stress; verify the occurrence guard classifies them as executable fixtures.
- [ ] 7.2 Add at least one application-owned consumer flow using only public APIs for native form submission and both input/calendar interaction; verify focused runtime tests exercise the integration rather than fixture-only markup.
- [ ] 7.3 Run automated accessibility checks and a manual keyboard/focus/state walk for standalone Calendar and Date Picker, record exact outcomes and limitations, and verify no scope-local violation remains unresolved.
- [ ] 7.4 Capture focused visual evidence against the authoritative SVG states at applicable sizes and responsive widths, document tolerances/source limitations, and verify snapshots are component-focused rather than page-level proxies.

## 8. Documentation, audit, and delivery

- [ ] 8.1 Publish Date Field, Calendar, and Date Picker usage/reference documentation with contracts, accessibility, constraints, localization, form integration, examples, non-goals, and framework-adapter boundary; verify documentation links and examples pass repository checks.
- [ ] 8.2 Update the machine-readable audit manifest and related inventory/reporting with exact occurrence counts, evidence, consumer coverage, and separate completion status for each module; verify the audit validator leaves no unclassified or unexplained implementation.
- [ ] 8.3 Run the proportionate unit, structural, source-integrity, build/type, browser runtime, accessibility, visual, responsive/content-stress, consumer, and regression suites; record exact commands, results, CI status, limitations, and unresolved review threads.
- [ ] 8.4 Run post-discovery route conformance, independent review, component completion gates, and delivery guards; reroute any material scope expansion, then commit and push the task branch and open an unmerged PR for the user's merge decision.
