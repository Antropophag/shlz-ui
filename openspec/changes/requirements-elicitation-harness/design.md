## Context

The adaptive harness introduced by PR #27 is a deep deterministic module behind `node tools/harness.mjs`, with OpenSpec as normative state and `docs/exec-plans/` as operational state. Its current seam begins at assessment and packet planning. Repo-local OpenSpec skills route planning and apply but currently treat proposal authorization and execution authorization as separate turns without durable requirements provenance.

The architecture stress-test considered the main failure branches: ritual interviews, duplicated specs, bypassable readiness, direct-work regression, unbounded product-management state, fresh-session loss, and apply-time scope discovery.

## Goals / Non-Goals

**Goals:**

- Add one small readiness interface before the existing planning seam.
- Make the mechanical part of readiness deterministic while leaving semantic ownership classification to repository-informed agent judgment.
- Preserve one normative requirements source and recover the operational gate without chat history.
- Support both approval-stop and explicit pre-authorization paths.

**Non-Goals:**

- Algorithmically judge whether an interview was perfect.
- Add a generic questionnaire, backlog, product-management database, daemon, or autonomous workflow engine.
- Replace OpenSpec routing, artifacts, or adaptive execution packets.
- Implement the GitHub Pages fixture.

## Decisions

### 1. Deepen the existing harness with a readiness state, not a second workflow

Add a compact versioned requirements state under the same `docs/exec-plans/active/<work>/` root and expose validation/status transitions through the existing `harness` command family. The state records decision IDs, ownership, resolution state, blocking flag, short provenance pointers, OpenSpec linkage, and authorization; normative answers live only in OpenSpec after synthesis.

The external seam stays small: initialize/validate or update readiness, then pass the ready state to `plan`. A separate interview application was rejected because deletion would merely scatter the same guards across skills and create competing lifecycle state.

### 2. Separate semantic judgment from deterministic guards

The agent inspects repository authority and classifies decisions. The harness validates allowed owners/status transitions, ensures every blocking user-owned decision is resolved or delegated, checks required provenance/linkage, and refuses guarded planning when the gate is closed. It does not score question quality or infer product decisions.

This preserves honest boundaries: deterministic code proves state consistency, while smoke fixtures and agent-facing protocol evaluate elicitation behavior.

### 3. Route interview before OpenSpec proposal and packets after OpenSpec readiness

Agent-facing routing becomes `request → inspect → impact route → decision ownership → targeted interview if needed → readiness → OpenSpec synthesis → authorization gate → adaptive assessment/packets → apply`. Direct work exits after impact routing. Contract-affecting but fully specified work skips questions while still producing OpenSpec.

This seam ordering prevents execution packets from embedding unresolved requirements and avoids turning packet plans into a second spec.

### 4. Authorization is an explicit state machine

Authorization records `approval-required`, `pre-authorized`, or `approved`, with provenance. Ready substantial work may plan/apply only in the latter two states. The default proposal path emits a compact summary and stops; an explicit request to implement after synthesis sets `pre-authorized`. Approval after summary transitions to `approved`.

The current unconditional same-turn proposal stop is revised only through this explicit state, preserving a conservative default.

### 5. Apply-time ambiguity invalidates only the affected path

Apply guidance records a newly discovered blocking decision, pauses the affected packet, updates the existing OpenSpec change through the requirements/update-change path, and re-checks readiness and authorization before resume. Completed packet handoffs remain valid unless the updated specification explicitly invalidates their assumptions.

Restarting the whole change was rejected because the existing packet dependency and handoff model already localizes invalidation.

### 6. Evaluate behavior with deterministic fixtures plus policy smoke tests

Machine fixtures cover the ten required routes and state transitions. The GitHub Pages retrospective fixture contains expected categories and OpenSpec shape, but no deployment implementation. Documentation/skill contract tests assert routing order and guard phrases where runtime behavior cannot be fully proved by code.

## Risks / Trade-offs

- **[Agents classify ownership inconsistently]** → Define narrow ownership rules, require provenance, and test representative fixtures without pretending the harness can prove semantic quality.
- **[Operational state duplicates requirements]** → Constrain schema fields and reject free-form normative answer payloads; link to OpenSpec after synthesis.
- **[New guard burdens direct work]** → Require readiness state only for routes explicitly marked as requirements-gated; keep direct assessment/implementation unchanged.
- **[Generated OpenSpec skill refresh overwrites local behavior]** → Keep requirements/authorization policy in the repo-owned `AGENTS.md` → protocol pointer, keep upstream-managed propose/apply/update skills pristine, and simulate a force update in the deterministic OpenSpec check.
- **[Pre-authorization becomes implicit]** → Accept it only from explicit user language and retain provenance in durable state.

## Migration Plan

1. Add readiness contracts, fixtures, and core validation without changing existing plan fixtures.
2. Require a ready authorization-linked state only for new assessments declaring the requirements gate; preserve v1 plans and direct routes.
3. Update the repo-owned `AGENTS.md` → protocol integration to invoke the gate around generated OpenSpec artifact mechanics, and protect that seam with a regeneration check.
4. Dogfood the change's own assessment/packets, then run focused, affected, review, and final validation.
5. Roll back by removing the new commands/state fields and restoring the prior pointers; existing OpenSpec and v1 execution plans remain readable.
