# Wave 12 Messaging / History / Planner compositions audit

- Baseline: `bc867d032d865afafee9dc1e10fd9522aee0dc81` on `audit/wave-12-messaging-history-planner`, bound to draft PR #48 by the baseline receipt.
- Baseline delivery state: PR #48 was open with validated planning artifacts only; implementation review and CI were pending.
- Raw authority hashes: `Messages.svg` `b61167bf011d15e5956d409d6746b5440cf4417522f1f14d6d27084bfb4b5357`; `History of changes.svg` `83d8c9ab89fa7c3677ed6d4105a150f55676bcf732160892b06773d6d4ac0e76`; `Planner.svg` `3f23135cbccf6cd8d1054feef90990d94ec647d8ef12de091ee6b76a022f2ed7`.
- `shlz-design-source/` is unchanged.

## Independent source contracts

Messaging authority is only `Messages.svg`: a 1504×7405 sheet with five blue dashed frames and five embedded raster images. It depicts static message, editor, employee, and attachment concepts. It does not establish editor commands, delivery/read state, synchronization, attachment lifecycle, persistence, live announcements, or responsive message behavior.

History authority is only `History of changes.svg`: an 873×1558 sheet with one blue dashed frame and one embedded raster image. It depicts static history content. It does not establish chronology, audit semantics, ordering, filtering, persistence, live updates, or an accessible list model.

Planner authority is only `Planner.svg`: a 3646×6729 sheet with seven blue dashed frames and five embedded raster images. It depicts static employee, event, planner, and attachment concepts. It does not establish scheduling, recurrence, timezone rules, employee data behavior, event controllers, attachment lifecycle, persistence, grid semantics, or responsive schedule behavior.

The roadmap grouping is an audit boundary, not a shared application-domain API. Facts, evidence, limitations, findings, and dispositions are recorded separately. Avatar, File Row, Document Row, Notification, Snackbar, and other already verified primitives remain independent dependencies; their runtime, accessibility, visual, responsive, and consumer evidence certifies none of these higher-level domains.

## Census and evidence applicability

The bounded census covers application, package, tool, fixture, Playwright, component-documentation, CSS, JavaScript/TypeScript, Vue, PHP, and HTML surfaces. For each of Messaging, History, and Planner it finds exactly zero production implementations, public exports, executable fixtures, live consumers, Data Workspace consumers, inert diagnostics, legacy/native substitutes, local alternatives, and unclassified higher-level surfaces.

The terminology ledger contains 51 paths: 27 paths are independently verified primitive surfaces, one is the Wave 12 browser guard, and 41 are unrelated generic-terminology paths; these categories overlap because only nine primitive paths also contain the generic terms. The structural matcher is domain-specific and rejects synthetic implementations for all three sub-scopes, including semantic filenames, classes, exports, data attributes, and custom-element forms.

Source integrity and the structural contract pass independently for all three sub-scopes. Runtime browser behavior, accessibility, focused visual fidelity, consumer integration, and responsive/content stress are `not-applicable` because no higher-level executable contract exists. The Chromium check proves structural absence only; it is not interaction or visual evidence.

## Validation, review, CI, and delivery

Focused source/manifest/census evidence and the Chromium absence guard pass. The aggregate check passes 135 Node tests and 210 Chromium tests, validates 68 source SVGs, three token groups, 119 canonical icons and 42 aliases, and installs and consumes four packed packages from a clean project. Initial independent Standards and Spec reviews found that the parent manifest was not registered with the canonical contract, its ledger validation was shallow, and its occurrence checks missed canonical and legacy roots. The remediation registers the manifest, adds the required parent evidence contracts, delegates browser classification to the shared guard, verifies every sub-scope field semantically, and rejects canonical synthetic roots for all three domains. Focused Node, Chromium, lint, OpenSpec, and source-integrity checks pass after remediation. Final independent Standards and Spec reviews pass with no remaining findings. GitHub CI, review-thread state, route conformance, and delivery evidence are checked against the final candidate. No source file or runtime/public composition implementation is added.

## Component disposition

Messaging, History, and Planner each independently receive bounded-audit `VERIFIED`: exact source authority and current repository absence are proven with no open finding. The parent family may therefore advance to `VERIFIED`, while `implementation_status` remains `source-only` and all measured occurrence counts remain zero. This does not claim that any product composition exists or advance a product roadmap wave.

## 2026-09-04 comments and history fidelity correction

The follow-up `restore-comments-history-source-fidelity` separates the previously conflated product concepts. Message Thread remains independently derived from `Messages.svg`. Comment Feed is a new reusable family derived only from the seven 1440×1000 frames in `Комментарии.svg`; its exact census is one executable Showcase root, one plain-HTML fixture, one ServiceDesk live consumer, six diagnostic comment roots, and zero legacy/native substitutes or local alternatives. The seven source states are default, populated composer, successful add, own-comment Edit/Delete, other-comment Reply, mention suggestions, and delete/undo feedback.

History Timeline retains `History of changes.svg` as authority but replaces the unsupported avatar/rail/current-marker source fixture with the seven content structures visible inside the 463×997 frame: creation, status transition, quoted comment, field transition, tags, employees/disclosure, and attachment. Its exact census is one executable Showcase root, one plain-HTML fixture, the existing compatibility consumer, one new ServiceDesk source-contract consumer, and zero diagnostics, legacy/native substitutes, local alternatives, or unclassified roots.

Both families preserve native lists and consumer-owned data/mutations. Focused desktop geometry is source-backed: Comment Feed now has seven 1304px state snapshots and a computed 1196px composer input; History asserts the 463×997 frame, 424×137 quote, status, tag, person and file dimensions. Narrow (390px), intermediate (768px), wide (1440px), 200% text, focus, forced-colors, sparse History and attachment behavior are repository decisions with component-level containment/action checks. Source `#939CA5` active text fails the emergency contrast threshold, so production uses the existing accessible supporting/placeholder semantic roles while retaining the original paint in provenance. Comment Feed and History Timeline independently pass source-integrity, structural, runtime/native-action, accessibility, focused-visual, consumer, and responsive/content-stress evidence in `tools/tests/comments-history-fidelity.test.mjs` and `tools/playwright/comments-history-fidelity.spec.js`. Message Thread evidence remains separate.

The aggregate lint command retains one non-component P3 finding: two pre-existing harness route receipts are not Prettier-normalized. Neither file is in the episode diff from `19483737ef250c70830b74986174e82463fad0cf`; this change neither introduced nor worsened the formatting. The files are owned by the active `classify-existing-component-records` and `classify-source-extraction-diagnostics` changes, and changing their content here would cross the source-fidelity scope. The exact affected-component ESLint, Stylelint, and Prettier closures pass, so this finding is accepted as non-blocking for Comment Feed and History Timeline only; it does not mark either harness change complete.

Final local validation passes 219 Node tests and 295 Chromium tests, strict OpenSpec validation, source-integrity checks, package generation/build, repository validation, and installation/consumption of all four packed packages. The Impeccable detector returned no findings through its regex fallback because optional HTML parser modules were unavailable; browser/axe/computed-style and focused snapshot evidence therefore remains the authoritative runtime signal for this change.
