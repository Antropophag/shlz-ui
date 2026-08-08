# ADR 0008: Source-spec token layers

## Status

Accepted.

## Context

The first token model normalized dominant extracted colors into artificial brand/neutral scales and inferred spacing/radius scales from generic geometry. Human comparison with the specialized Figma sheets found material divergence: `Spacing.svg` omits inferred 12/20px steps, the verified corner-radius source uses 8/12/16/48/100px, and `Colors.svg` already provides authoritative names.

## Decision

The authored model has two explicit roots only:

- `source`: literal specialized-sheet groups, labels and values, classified **FACT**;
- `semantic`: justified aliases or engineering defaults, classified **DERIVED** or **DECISION**.

Specialized sheets outrank statistical frequency. We accept breaking variable names because there are no production consumers. Component-specific geometry stays in component CSS with provenance instead of being promoted into the source scale. Typography uses an explicit system sans stack until an exact family is recoverable.

The showcase separates Source Spec reconstruction, real Implementation, and Fidelity comparison.

## Consequences

Old `color.brand`, `color.neutral`, `space`, `radius`, shared `shadow.surface`, and their CSS variables are removed. Components now consume source facts or semantic aliases; isolated 6/12/20px geometry and shadows remain local. Reviewers can compare authoritative values without conflating them with implementation decisions.
