## Context

See `proposal.md` for motivation and `specs/harness/closed-set-executable-evidence/spec.md` for behavior. The current receipt workflow already separates semantic declaration (`conformance`), executable checks (`validate`), and final composition (`delivery`). The harness deliberately validates agent-supplied semantic evidence rather than guessing intent from source text.

## Goals / Non-Goals

**Goals:**

- Put finite-set declaration, executable proof, and final enforcement at their existing ownership seams.
- Keep the data model generic enough for variants, states, weights, roles, enum values, and explicitly declared combinations.
- Produce deterministic, content-addressed evidence with useful missing/extra diagnostics.
- Preserve the existing manifest for episodes with no changed finite set.

**Non-Goals:**

- Parse code, CSS, OpenSpec prose, or test source to infer a set.
- Decide whether an exclusion is semantically acceptable; Spec review owns that judgment.
- Model axis algebra or automatically expand Cartesian products.
- Add a standalone coverage command, schema registry, or domain-specific font logic.

## Decisions

### Declare changed sets in conformance, prove them in validation

`discovered.closedSets` will contain `{ id, members }` entries. Conformance validates non-empty unique identities and members, normalizes ordering, and binds them into its receipt. This makes post-discovery intent part of the same candidate-bound surface used by delivery.

Validation accepts `closedSetEvidence` entries containing the exact set identity and declaration plus `covered` entries and `excluded` entries. Covered entries carry one or more paths already present in the validation input closure; excluded entries carry a non-empty justification. Delivery compares the current conformance declarations with the aggregate validation receipts.

Alternative: validate a standalone manifest with a new CLI command. Rejected because it would create evidence that delivery could forget to compose and would duplicate candidate/contract/closure binding.

Alternative: put the complete set only in validation. Rejected because omitting the entire declaration would remain indistinguishable from “no finite-set change.” The conformance seam already owns complete discovered impact.

### Treat members as opaque canonical strings

The harness performs set equality, partition, and membership checks only. A weight can be `400`, a role `menuitem`, and a supported combination `size=large|state=disabled`. Producers choose stable identities that match the changed contract.

Alternative: add typed schemas for weights, roles, states, and enum values. Rejected because the exhaustive invariant is identical and typed domain branches would make the interface shallower and easier to omit.

### Require evidence paths per covered member

Each covered member references at least one path from the validation closure. This proves that the executable oracle or fixture affecting the assertion is digest-bound; a boolean or count alone is insufficient. The harness does not parse that file to certify semantic quality, which remains a Spec-review responsibility.

Alternative: accept `covered: [member]` without references. Rejected because the declaration would be self-attestation disconnected from executable evidence.

### Aggregate by exact declaration at delivery

One validation receipt may cover one or many sets, and several receipts may collectively cover different sets. For a given set, one receipt must contain an exhaustive proof of the exact current declaration; partial fragments are not unioned across receipts. This avoids contradictory exclusions and makes each proof independently reviewable.

Alternative: merge member fragments across receipts. Rejected because partition validity and exclusion ownership become ambiguous across stale or independently scoped checks.

## Risks / Trade-offs

- **[Agent omits a discovered finite set]** → Documentation makes the semantic declaration mandatory and final Spec review checks the episode against the OpenSpec contract; the harness does not claim source inference.
- **[Opaque identities drift]** → Exact declaration equality and content-addressed receipts invalidate stale evidence; OpenSpec supplies the canonical contract names.
- **[Exclusions become a loophole]** → Require per-member non-empty reasons, expose them in receipts, and leave acceptability to independent Spec review.
- **[Manifest verbosity for large sets]** → Keep one generic structure and allow a single evidence path to support multiple members; exhaustiveness is intentionally explicit.

## Migration Plan

1. Add focused RED tests at the public validation/conformance/delivery seams, including the PR #45 fixture.
2. Add normalization and partition validation behind the existing receipt interfaces.
3. Update validation workflow guidance and run focused plus aggregate validation.

Rollback is a revert. Existing manifests with no `closedSets` or `closedSetEvidence` remain compatible throughout.
