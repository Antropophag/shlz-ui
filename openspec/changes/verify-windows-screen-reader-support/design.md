## Context

The baseline already has 316 Chromium regression tests and seven shared smoke scenarios in three engines. Existing component docs explicitly limit claims about assistive technology. The host is Windows 10 via WSL2, with usable Windows Node.js, Python and 7-Zip. Chrome is installed; official signed NVDA and Firefox packages can be extracted to fresh temporary directories.

## Goals / Non-Goals

Provide real NVDA speech evidence without manual user work. Preserve existing consumers and public behavior. This is one bounded evidence runner and matrix, not a new remote desktop service, general accessibility certification, or mass component redesign.

## Decisions

- Start with actual Windows/NVDA on Chrome and stock Firefox. Use Chrome's local automation interface and Firefox's WebDriver interface for navigation/state inspection; send interaction keys through a guarded Windows input helper. Playwright's patched Firefox binary is not silently relabeled as stock Firefox.
- Run portable NVDA with an isolated configuration and its documented input/output logging level. Keep exact raw logs local and publish only checkpoint speech from owned fixture windows. Speech output is evidence of NVDA's semantic presentation; it is not a subjective listening/usability study.
- Reuse existing executable Showcase and plain-HTML routes. A dedicated new page would expand occurrence/audit obligations and could hide differences in real compositions.
- Use per-checkpoint semantic assertions, including language/version-specific accepted wording where necessary, and independently verify DOM focus/value outcomes. Keep setup focus changes distinct from keyboard actions under test.
- Fail closed for missing AT speech, absent matrix members and foreign foreground ownership. Prove the two marked failure invariants against known-bad inputs at the same validation boundary used by actual runs.
- Keep scope inline at medium size. Tooling, seven workflow definitions and one evidence record are one tightly related seam; independent Standards/Spec review provides the useful physical context boundary. If an actual component requires a fix, re-attest its authoritative source and update its own contract/audit before changing it.
- Initial downloads are from official NV Access and Mozilla release endpoints; Authenticode signatures of NVDA and Firefox were checked as valid. Record actual runtime versions and binary hashes in local setup evidence.

## Risks / Trade-offs

- Screen-reader keyboard modes affect arrows and shortcuts → record mode/setup and distinguish a harness-mode failure from a component failure.
- Foreground input can interfere with another window → verify ownership for every injected action; preserve existing sessions and isolate profiles.
- Log absence or delayed speech can create false passes → checkpoint evidence is mandatory, waits are bounded, and missing data is not treated as silence/success.
- Automatic AT coverage cannot prove comprehension, every supported browser version or all component states → publish the exact finite matrix and retain existing component completion limits.
- Real AT discovery can reveal a component defect → record its reproduction and apply the existing component-specific gate; do not downgrade assertions to obtain a pass.

## Migration Plan

Additive local verification tooling and versioned documentation. CI validates the evidence contract and failure cases without claiming to run a Windows desktop reader on Linux. Existing three-engine smoke remains separate. Consumers need no package migration unless a separately reconciled component fix is required.
