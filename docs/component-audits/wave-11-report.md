# Wave 11 Upload / Document compositions audit

- Baseline: `f2787626f79ae6e6b63486809ad20792f8cccd38` on `audit/wave-11-upload-document-compositions`, bound to PR #47 and current `main` by the baseline receipt.
- Baseline delivery state: PR #47 was open with validated planning artifacts only; implementation review and CI were pending.
- Raw authority hash: `Documents.svg` `b2be2ccea150ae49fb8363eae648bede428cace071d9783ce30f15c9c338bfdb`. Inspected out-of-family reference hash: `Detailed appeals.svg` `f916402a452edfdb7eee603cc75dc8028e6cf7d28eda13d6058ba488b59830e7`.
- `shlz-design-source/` is unchanged.

## Source contract and primitive boundary

`Documents.svg` is a 700×2269 sheet with four blue dashed composition frames. It contains five Document specimens (one 240×55 outer specimen and four 230×55 specimens), two 467×102 dashed Upload-Drag surfaces, Description Files rows, a Small document group, and embedded document-preview imagery. Attached Document and Drag and Drop Document are nested representations inside the Upload-Drag frame: the filled specimen contains two attached-document items plus summary/delete-all affordances, while the empty and filled drop-zone specimens represent the two static drag/drop states. All six family variants are traceable to this source and the exact enclosing frame rectangles in the manifest.

`Detailed appeals.svg` is an 873×4163 application-composition sheet whose three blue dashed frames visibly contain Employees, Event plaque, and Event material. It was inspected and classified outside this family; its geometry is not used as authority for any Upload / Document variant.

The six roadmap names identify source variants, not six independent top-level frames or a reusable runtime API. File Row owns the reusable 55px file identity composition established in Wave 5. Document Row is a separately documented repository extension. Their implementations, fixtures, browser tests, responsive/content evidence, and native nested actions remain regression dependencies; none certifies an enclosing uploader, Detailed appeals screen, attachment lifecycle, or upload controller.

Static drop zones and attachment artwork do not establish file selection, drag/drop events, validation, progress, retry, preview, removal, transport, persistence, form integration, live announcements, or responsive reflow. Screen-specific Detailed appeals geometry is not promoted into a generic package contract.

## Census and evidence applicability

The bounded census covers all application, package, tool, fixture, Playwright, component-documentation, CSS, JavaScript/TypeScript, Vue, PHP, and HTML surfaces. It found exactly zero higher-level production implementations, public exports, executable roots, live consumers, Data Workspace consumers, inert diagnostics, legacy/native substitutes, and unclassified local alternatives. It separately classifies 61 paths containing generic upload/document/attachment/drag-drop terminology: 10 File Row or Document Row dependencies, 1 Wave 11 audit-evidence path, and 50 unrelated terminology paths. The two primitive CSS implementations remain the inventory's two known local alternatives, not higher-level implementations. The fail-closed matcher covers SHLZ and legacy class/data/custom-element forms, production declarations, re-exports, and semantic filenames (including plain `Upload.vue` and `upload.js`); synthetic `.shlz-upload`, `DocumentUpload`, `export { Upload }`, `AttachedDocument`, `<shlz-upload>`, `Upload.vue`, and `upload.js` surfaces are rejected.

Source integrity and structural contract pass independently. Runtime browser, accessibility, focused visual, consumer integration, and responsive/content stress are `not-applicable` for the higher-level family because no executable composition or behavior exists. The Chromium check is a structural occurrence guard only. Static visual evidence is direct source inspection; real-interaction visual and runtime behavior are inapplicable, the material-state ledger is empty, and no snapshot is claimed.

## Validation, review, CI, and delivery

Focused evidence passes as 6/6 source/manifest/census checks and 1/1 Chromium structural occurrence-guard check. The aggregate `npm run check` passes: OpenSpec health; deterministic generation; 130/130 Node tests; ESLint, Stylelint, and Prettier; all workspace builds (including 497 Showcase modules); validation of 68 source SVGs, 3 token groups, 119 canonical icons, and 42 aliases; clean consumption of 4 packed packages; and 209/209 Chromium tests. The browser result proves only structural absence for this family. `git diff --check`, candidate-bound receipts, GitHub CI, review-thread state, and delivery evidence are recorded at delivery time. No primitive status or evidence result is combined with the Wave 11 family disposition.

## Component disposition

The source mapping is reconciled with no open finding: all six variants belong to `Documents.svg`, with Attached Document and Drag and Drop Document nested inside Upload-Drag; `Detailed appeals.svg` is an inspected out-of-family reference. During final validation and review the inventory remains `INVENTORIED`. `implementation_status` remains `composition-only`, with zero higher-level production implementations; only clean candidate-bound validation, independent review, and the delivery guard may advance the bounded audit to `VERIFIED`.
