## 1. Shared smoke suite

- [x] 1.1 Tag the seven existing scenarios and add the three-project smoke command/configuration; verify exact CLI discovery and unchanged full-suite identities.
- [x] 1.2 Add the separate CI job and developer commands; verify browser/host installation precedes smoke execution and existing jobs remain intact.

## 2. Validation and delivery

- [x] 2.1 Run the functional smoke scenarios in all three browsers, using CI for missing local prerequisites, and verify existing Chromium regression coverage.
- [x] 2.2 Complete independent Standards/Spec review, route conformance and delivery checks; publish the unmerged PR with exact results and limitations.

## 3. PR review follow-up

- [ ] 3.1 Disable smoke checkout credential persistence; verify the parsed workflow explicitly opts out and smoke scenario selection still passes.
