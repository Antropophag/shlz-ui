## Why

PR #43 completed a source-only audit as numbered Wave 10 through the same expensive execution and roadmap-completion language used for product delivery, despite producing no production behavior. Numbered product work needs a fail-closed production-outcome gate, while discovery and audit work needs a cheaper bounded route that cannot consume or advance a product wave.

## What Changes

- Require every numbered product wave to declare its expected production delta before baseline or heavier execution evidence can be produced.
- Classify source-only, discovery-only, and audit-only wave work as bounded evidence work and make it ineligible to advance the product roadmap.
- Make the route receipt the single typed seam that carries this classification through the existing immutable receipt chain.
- Reframe the component-audit roadmap so audit dispositions remain useful evidence but do not count as product-wave delivery without a production delta.
- Preserve PR #43's source-only Wave 10 shape as a regression fixture that must take the bounded path and leave the product roadmap unchanged.
- Require roadmap advancement to use candidate/runtime-bound production-outcome proof rather than a repeated production-delta declaration, and prevent bounded evidence from launching isolated multi-session execution.
- Do not select or start Wave 11 as part of this change.

## Capabilities

### New Capabilities

- `harness/wave-execution-gate`: Classifies numbered work as production-bearing or bounded evidence before expensive execution and binds roadmap eligibility into the receipt chain.
- `component-audits/product-wave-roadmap`: Defines when numbered audit-map work may represent or advance a product wave.

### Modified Capabilities

None.

## Impact

The change affects the harness route, validation, and isolated-execution contracts and focused tests, the numbered component-audit roadmap and its structural test, and agent-facing workflow guidance. It adds no UI component, public runtime API, dependency, design-source mutation, or next-wave implementation. Existing non-wave route inputs remain compatible.
