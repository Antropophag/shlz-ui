## 1. Baseline and source contract

- [x] 1.1 Record the clean execution baseline, CI/review state, exact repository occurrences, raw source hashes, and unchanged-source guard; verify the Wave 9 evidence distinguishes baseline facts from introduced changes.
- [x] 1.2 Extract Sidebar and Header geometry, typography, paint, content, and represented state facts directly from the raw SVGs; verify the ledger labels facts, derived patterns, decisions, assumptions, and unknowns without promoting incidental geometry.

## 2. Manifest and census

- [x] 2.1 Add the Sidebar / Application Shell schema-v2 manifest with stable audit IDs, separate sidebar/header state ledgers, all seven evidence levels, classified occurrences/alternatives, findings, and limitations; verify manifest schema tests pass.
- [x] 2.2 Add a repository and built-DOM census guard for shell/sidebar/header roots and substitutes; verify the positive census passes and a synthetic unclassified occurrence fails.

## 3. Application composition

- [x] 3.1 Reconcile the Showcase sidebar and header markup/styles with source-supported opened/closed, active/default, default/hover/typing/filled, and native accessibility states while keeping all implementation application-local; verify the focused structural and source contracts pass and no package export is added.
- [x] 3.2 Implement the bounded real interaction seam for sidebar state/current navigation and header typing/filled behavior; verify keyboard, pointer, focus, current-item, and lifecycle tests pass without introducing routing, authorization, or unsupported mobile-drawer behavior.

## 4. Evidence ladder

- [x] 4.1 Add focused Wave 9 runtime, accessibility, computed fidelity, and component screenshot coverage for every material sidebar/header state; verify real-interaction evidence and any diagnostic state are computed-equivalent and source-critical mutations are caught.
- [x] 4.2 Add desktop, narrow, long Cyrillic/Latin, text-scale, overflow, and real Showcase consumer coverage; verify essential navigation/header controls remain reachable and no unintended horizontal overflow or clipped focus occurs.
- [x] 4.3 Run and record the manual state walk for pointer, keyboard, focus-visible, open/closed, active/default, header hover/typing/filled, and narrow/content stress; verify findings are resolved or explicitly dispositioned under the completion contract.

## 5. Integration, review, and delivery

- [x] 5.1 Reconcile the project inventory and create the Wave 9 audit report with exact counts, source hashes, evidence results, snapshot disposition, limitations, CI/review state, and independent bounded status; verify `VERIFIED` is claimed only if the full component gate passes.
- [x] 5.2 Run source integrity, OpenSpec, formatting/lint/build/package, source/manifest/census, focused browser/accessibility/visual/stress, affected regressions, and final aggregate validation; verify raw results and exact totals are retained without hiding browser failures behind aggregate success.
- [ ] 5.3 Review the complete episode diff against repository standards, the Wave 9 spec, authoritative SVGs, and scoped non-goals; remediate every scope-local finding, re-run affected checks, satisfy delivery guards, and deliver an unmerged green PR targeting `main`.
