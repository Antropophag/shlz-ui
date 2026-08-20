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

## UI component completion

Before declaring a UI component fixed, complete, production-ready, or ready for
review:

- inventory every occurrence of that component in the Showcase and in live
  consumer fixtures;
- distinguish executable/live surfaces from inert visual or source-diagnostic
  matrices;
- apply the supported production contract to every executable occurrence, not
  only to one representative example;
- verify all visible component details against the authoritative source,
  including opened/expanded states, icons, affordances, focus, keyboard behavior
  and consumer compositions;
- add browser coverage for each materially different executable surface,
  including at least one real consumer fixture when one exists;
- report the exact occurrence counts, what was migrated, and what intentionally
  remains diagnostic or unsupported.

A passing representative fixture or source-regex test is not evidence that the
component is complete across the repository. Do not close or present a component
side quest as finished while an executable Showcase or consumer occurrence still
uses the superseded contract.
