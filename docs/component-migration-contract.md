# Component migration contract

1. Read the Figma Component Set manifest and exact variant SVGs; record source facts and UNKNOWNs before coding.
2. Model the full Figma node as reusable DOM composition, with the native interactive element inside that composition where semantics permit.
3. Map every source node ID to an implementation fixture. Use structured variant properties when available; never reconstruct unavailable properties from names.
4. Generate the showcase source fixture from the same Component Set and compare at an equivalent scale.
5. Validate manifest coverage, targeted tests, lint, and build. Assign fidelity only after visual comparison; browser/font-only deviations are the threshold for HIGH.
