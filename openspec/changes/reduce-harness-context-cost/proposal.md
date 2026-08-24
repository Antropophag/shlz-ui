## Why

PR #36 exposed a disproportionate context-cost signal: a bounded documentation change and one small review follow-up consumed about 188K active/session context. The harness currently preserves correctness gates, but it does not give an agent one compact, phase-specific input or a reproducible way to prove that procedural context and evidence are not repeatedly reloaded.

## What Changes

- Add a representative PR #36 replay that records a user-observed 188K active/session signal separately from reproducible measurements and reconciles it with the forensic contributor breakdown.
- Probe and compare discovery, procedural context, validation/review output, repeated reads, state, and orchestration as independent context-cost contributors.
- Compare materially different corrective architectures and select the smallest approach whose replay evidence shows a notable reduction.
- Make improvement claims fail closed unless correctness, evidence, and reproducibility obligations remain equivalent.
- Document the selected operating contract only after probes establish which mechanism is necessary.
- Integrate phase input control into guarded worker execution and define a compact validation/CI index whose raw logs remain retained and addressable.
- Keep the solution local and deterministic; embeddings, semantic retrieval, brokers, databases, and new services are out of scope.

## Capabilities

### New Capabilities

- `harness/context-cost-control`: Deterministic context-cost replay, phase capsules, equivalence guards, and measurable improvement reporting.

### Modified Capabilities

None.

## Impact

The change affects the repository-local harness CLI and core module, guarded worker execution, harness fixtures/tests, execution documentation, and OpenSpec planning artifacts. It adds no runtime dependency or external service and does not change SHLZ UI packages or `shlz-design-source/`. Existing plans remain valid. The main risks are overstating proxy savings as active/session savings and hiding necessary validation evidence; the contract therefore separates prevented work from content merely not reread, keeps retention/output costs explicit, and retains raw logs behind content-addressed pointers.
