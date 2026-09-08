# PR 84 review follow-up

The follow-up binds the clean, pushed open-PR baseline `a37c478a919b8883ba5da508307e42d710208f1d`. It applies the existing `verify-windows-screen-reader-support` contract. The material signal is the runner's ownership/privacy boundary; requirements are fully determined by the review and existing spec. Execution is one coherent medium tooling task, inline with independent Standards and Spec review.

## Changes

Resolved six review findings: redacted the published historical baseline root and regenerated both repository and receipt digests; bounded initial Chrome page attachment; reused owned-window semantics at every checkpoint boundary; returned a basename run ID; normalized trailing task-root separators; and waited for an owned native dialog with its Edit control focused.

Also addressed three accompanying comments: process-race timers no longer keep Node alive, the Windows uptime function caches its library/function, and matrix validation rejects failed, blocked, missing-status or error-bearing checkpoints.

Live verification exposed NVDA's stale browse position after Firefox's native dialog. The runner now revisits the returned file input using guarded OS Tab/Shift+Tab and checks document focus before capturing consumer-list speech. Selection and speech assertions remain unchanged.

No package, component, fixture, source artwork, support matrix membership, or published historical AT recording changed. This is runner remediation, not a new component completion claim.

## Evidence

- Before correction, targeted settings/evidence tests reproduced two failures. Runtime regression probes also rejected the original implementation. Final focused Node checks: 20/20; Python input checks: 8/8. The repository unit suite has 254 passing tests.
- Regressions exercise delayed Chrome contexts/pages, native-dialog readiness beyond the former 600 ms sleep, timeout, foreign/returned foreground, stopped observation, every checkpoint ownership boundary, trailing separators with containment preserved, contradictory checkpoint verdicts, and cached 64-bit uptime.
- Independent Standards and Spec reviews passed at implementation commit `6ea8f286e4fa0fb8c4eed3e4d1633fef1cda3425`. Spec additionally executed 43 independent negative/boundary cases. Final candidate re-attestation and candidate-bound TDD, failure-proof, validation, conformance and delivery receipts are retained locally; the PR handoff reports delivery and CI.
- Actual Windows/NVDA File Upload at that implementation commit: Chrome **5/5**, Firefox **5/5** checkpoints; all **6/6** owned NVDA/browser/monitor cleanup results passed. Both returned records omitted `directory` and contained only basename `runId` values. Raw speech and run records remain local.
- The earlier full live attempt passed **11/14** workflows: Chrome Input/Checkbox stopped on foreign foreground ownership; Firefox selected-file speech failed because its browse cursor read another list. The latter was corrected and rechecked in the final focused runs. A separate initial Chrome-only probe failed during NVDA setup focus. These attempts are not relabeled as passes. The entire AT matrix was not rerun after the browse-position correction.
- The existing published record still validates **14 workflows / 58 checkpoints** at its original recorded source commit. Offline validation does not attest the new candidate's entire AT matrix.
- Changed JavaScript, CSS lint, changed-file formatting, OpenSpec integration, and published receipt hashes pass. Unfiltered local `npm run lint` also scans pre-existing ignored diagnostic scripts; full-repository Prettier reports four unrelated old receipt files. Those files were left unchanged. CI uses its existing changed-file formatting scope.

The PR remains unmerged. Review-thread resolution and final CI status are recorded in the PR, without publishing absolute local paths or raw desktop logs.
