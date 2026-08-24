# SHLZ UI repository instructions

## Purpose

This repository contains the reusable corporate UI/design system for SHLZ web applications.

The design system must not be derived from any single existing application.

Existing corporate portals, including IC, are consumers of this library, not sources of truth for its visual design.

## Design source

The entire directory:

shlz-design-source/

is reference material and MUST be treated as read-only.

Do not modify, format, rename, move, regenerate, or delete files inside `shlz-design-source/`.

### Authority order

1. `shlz-design-source/raw/svg/`
   Original SVG exports from Figma.
   This is the primary source of truth.

2. Other files under `shlz-design-source/`
   Derived extraction data, inventories, statistics, extracted assets, reports and source maps.

If derived data conflicts with an original SVG, trust the original SVG.

## Implementation

New implementation belongs outside `shlz-design-source/`.

Primary implementation locations:

- `packages/`
- `apps/`
- `tools/`
- `docs/`

Do not place generated library code inside `shlz-design-source/`.

## Architecture

The core design system MUST be framework-agnostic.

It must be usable by:

- plain HTML/CSS/JavaScript;
- server-rendered PHP applications;
- Vue applications;
- other frontend frameworks in the future.

Vue must be an optional adapter, not the foundation of the design system.

Prefer this conceptual layering:

tokens
→ icons
→ framework-agnostic styles/primitives
→ interactive web layer
→ framework adapters
→ application-specific UI

## Design discipline

Do not invent design values when they can be verified from the source material.

Clearly distinguish:

- facts directly observed in source SVGs;
- statistically derived patterns;
- design-system decisions introduced by this repository;
- assumptions where source material is insufficient.

Do not automatically turn every observed numeric value into a design token.

Repeated values in exported SVGs may represent:

- actual system tokens;
- component-specific dimensions;
- screen-specific layout values;
- incidental Figma geometry.

Verify semantics before promoting observed values to canonical tokens.

## Existing applications

Do not inspect or copy UI implementation from IC or other corporate applications unless a future task explicitly asks for comparison or migration work.

When such applications are eventually analyzed:

- use them as consumers and real-world validation cases;
- do not treat their existing CSS/components as design authority;
- distinguish application-specific requirements from reusable design-system requirements.

## Scope discipline

Prefer small, reviewable architectural steps.

Do not implement a large component library before the foundation, contracts and source interpretation are established.

Do not modify unrelated files.

Before implementation, classify the change impact using the OpenSpec routing rules in `docs/openspec.md`. Direct is a positively proven narrow route, not a fallback. Before the first implementation mutation, run the repo-owned route and execution preflight described there; unknown or material state routes through requirements/OpenSpec. Inspect first when impact is uncertain; repository support for OpenSpec alone does not require creating a change.

Requirements integration: for short, ambiguous, or substantial intents and for material ambiguity discovered during apply, use the repo-owned protocol in `docs/requirements-elicitation.md`. It surrounds the generated OpenSpec skills and controls inspection, interview, authorization, and apply re-entry; those generated skills provide artifact mechanics only. Fully determined and direct work skips interview. Explicit pre-authorization recorded by the protocol controls over a generated skill's default planning stop.

After choosing the direct or OpenSpec workflow, select the smallest materially useful set of engineering skills using `docs/skill-routing.md`.

For M/L/XL work, or whenever scope/context growth is uncertain, use the adaptive execution workflow in `docs/agent-execution.md` after requirements readiness and OpenSpec synthesis. Keep OpenSpec normative; store only minimal requirements provenance plus plan, packet, claim, handoff, validation, review, and telemetry state under `docs/exec-plans/`.

Normal new implementation starts from clean current `origin/main` on a task branch/worktree. A bounded follow-up on an existing PR may instead start from that clean, fully pushed, verified open-PR head; its immutable episode baseline scopes routing, validation, and review to the follow-up delta. Both paths end with proportionate validation/review plus an unmerged PR. Never commit or push implementation directly to `main`. Before completion, run the post-discovery route-conformance and delivery guards in `docs/agent-execution.md`; material scope discovered on a direct route requires re-routing before completion.

## UI component completion gate

For a numbered component-audit request such as `Сделай Wave N`, read
`docs/component-audit-roadmap.md` first; it owns the durable Wave 9+ scope map,
short-intent resolution, and drift behavior.

Do not call a component fixed, complete, production-ready, review-ready, or a
finished side quest until the component completion gate in
`docs/component-audit-workflow.md` passes. In particular:

- inventory repository-wide occurrences and classify executable fixtures, live
  compositions, inert diagnostics, and legacy/native substitutes;
- verify the authoritative source and record the applicable state, size, and
  content-stress contract before implementation;
- cover runtime, accessibility, focused visual fidelity, responsive/content
  stress, and at least one real consumer when those levels apply;
- update the machine-readable audit manifest and leave no unclassified or
  unexplained implementation;
- report exact observed counts, scope, checks, limitations, blockers, CI, and
  unresolved review threads.

A pre-existing cross-component finding may be accepted as non-blocking for a
scoped component PR only when the PR neither introduced nor worsened it, the
fix requires changing an authoritative source or shared contract outside the
PR scope, and the severity, evidence, explicit disposition, and linked
follow-up are recorded. A regression, scope-local fix, or untracked finding
still blocks completion.

Structural/source tests do not prove runtime behavior. A page-level screenshot
does not prove component fidelity. Never combine completion statuses across
components or side quests: finishing Notification says nothing about Select.
