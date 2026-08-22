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

Before implementation, classify the change impact using the OpenSpec routing rules in `docs/openspec.md`. Inspect first when impact is uncertain; repository support for OpenSpec alone does not require creating a change.

After choosing the direct or OpenSpec workflow, select the smallest materially useful set of engineering skills using `docs/skill-routing.md`.

## UI component completion gate

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
