## Context

The existing harness begins deterministic enforcement at requirements-state validation and adaptive planning. Semantic impact routing occurs before that seam, so an agent can label material work `direct` and bypass all downstream readiness logic. The existing GitHub Pages fixture records the right ownership decisions but is retrospective data, not input to a route guard. GitHub currently protects `main`, but administrator enforcement is disabled and zero approving reviews are required.

## Goals / Non-Goals

**Goals:**

- Put a small deterministic interface on both sides of semantic routing: pre-mutation eligibility and post-diff conformance.
- Keep semantic classification structured and agent-supplied while making conservative invariants executable.
- Enforce task-branch and PR delivery locally without changing server settings.
- Reuse the existing readiness state and OpenSpec lifecycle.

**Non-Goals:**

- Infer intent quality from keywords or replace LLM semantic judgment.
- Build a generic workflow engine, automatic session adapter, or sizing recalibration.
- Change Pages, branch protection, generated OpenSpec skills, or merge a PR.

## Decisions

### 1. One compact route evidence interface

Add a versioned route assessment consumed by the harness. It records the selected route plus closed-set material signals and positive direct assertions. Direct is valid only when every positive assertion is true, no material signal is true or unknown, and ambiguity is resolved. OpenSpec is valid conservatively and links to the existing requirements state. This is a deep module seam: callers provide semantic evidence; the harness owns invariants and actionable failures.

A keyword classifier was rejected because filenames and prose cannot reliably distinguish a harmless workflow typo from changed deployment semantics. An unconstrained free-form rationale was rejected because it cannot be deterministically guarded.

### 2. Preflight composes route, readiness, and git state

A preflight command validates route eligibility, requires ready requirements for OpenSpec work, and checks repository state before mutation. Implementation on the default branch, a dirty/stale baseline when clean current main is required, or unresolved blocking decisions produces a failure. Direct work needs no `requirements.json`, preserving its lightweight path.

### 3. Conformance uses change-aware semantic evidence

A completion guard accepts the original assessment and a discovered-surface record tied to changed files/diff inspection. Sensitive paths are conservative evidence, but escalation depends on declared semantic change categories; a workflow file alone is not proof of deployment semantics. Any newly material or unknown category incompatible with direct returns a deterministic re-route error.

### 4. Delivery state is a narrow completion invariant

Implementation completion validates non-default execution branch, default-base relationship, push target, and PR evidence. It does not call GitHub or mutate protection settings. The agent/CI remains responsible for creating the PR, and the user owns merge.

### 5. Fixture becomes reusable semantic input

Extend the GitHub Pages fixture with route-assessment input and expected guard results while retaining its ownership analysis. Tests assert exact intent routing, required decision IDs, zero pre-resolution mutations, and post-diff escalation through public harness interfaces.

## Risks / Trade-offs

- **[Agent falsely asserts all direct invariants]** → Closed-set evidence, unknown-is-material handling, post-diff re-evaluation, and agent-facing mandatory preflight reduce—but cannot eliminate—dishonest input.
- **[Path heuristics over-escalate CI maintenance]** → Treat paths as inspection triggers; require semantic surface classification and test harmless maintenance.
- **[Local guard is bypassed entirely]** → Document server-side residual risk and recommend admin-enforced PR reviews separately; do not silently alter settings.
- **[Operational state becomes a second spec]** → Keep normative behavior in OpenSpec; route/discovery records contain only guard evidence and status.

## Migration Plan

Add failing public-interface regressions, implement the route/preflight/conformance/delivery guard, update repo-owned pointers and fixtures, validate strict OpenSpec and affected checks, then deliver on a task branch through a PR. Existing v1 plan and requirements files remain readable.
