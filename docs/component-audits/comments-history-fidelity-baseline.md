# Comments and history source-fidelity baseline

- Episode baseline: `19483737ef250c70830b74986174e82463fad0cf` on `fix/comments-history-source-fidelity`, bound to draft PR #73 by the baseline receipt.
- Comments authority: `shlz-design-source/raw/svg/Комментарии.svg`, SHA-256 `20e2dc809b8fa832cc73bd078abd57678c9614a70da7dbf376ab1a1f25458a88`, 8480×2830.
- Messages authority: `shlz-design-source/raw/svg/Messages.svg`, SHA-256 `b61167bf011d15e5956d409d6746b5440cf4417522f1f14d6d27084bfb4b5357`, 1504×7405.
- History authority: `shlz-design-source/raw/svg/History of changes.svg`, SHA-256 `83d8c9ab89fa7c3677ed6d4105a150f55676bcf732160892b06773d6d4ac0e76`, 873×1558.
- `shlz-design-source/` is unchanged.

## Observed baseline census

The tracked source/code census finds zero Comment Feed occurrences. Message Thread has exactly three classified roots: one executable Showcase fixture, one live Data Workspace consumer, and one plain-HTML fixture. History Timeline has the same three classified root kinds. The bounded implementation/evidence surface consists of:

- `apps/showcase/src/messaging-history-showcase.js`;
- `apps/showcase/src/consumer-workspace.js`;
- `tools/fixtures/messaging-history-components.html`;
- `packages/styles/components/message-thread.css`;
- `packages/styles/components/history-timeline.css`;
- `docs/components/message-thread.md`;
- `docs/components/history-timeline.md`;
- `tools/tests/messaging-history-components.test.mjs`;
- `tools/playwright/messaging-history-components.spec.js`.

No current root is classified as Comment Feed. The current History focused fixture renders a generic avatar/rail/marker timeline and does not render the source-observed creation, status transition, quoted comment, field transition, tag, employee/disclosure, and attachment variants. History Timeline is therefore `FINDINGS` for focused visual fidelity until this change completes its own gate. Message Thread remains independently governed by `Messages.svg`; its status is not changed by the Comments finding.

## Evidence classification

- `source-fact`: Comments and Messages are separate exports with separate canvases, hashes, frames and visual grammars.
- `source-fact`: History contains seven structurally distinct event payloads rather than one generic description row.
- `repository-decision`: Comment Feed becomes a separate reusable seam instead of changing Message Thread's authority.
- `repository-decision`: native semantics and responsive containment are required where desktop artwork does not define them.
- `finding`: existing History snapshots prove containment of a repository-designed generic timeline but do not prove fidelity to the authoritative event variants.
