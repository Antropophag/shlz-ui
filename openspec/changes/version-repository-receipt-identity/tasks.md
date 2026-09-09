## 1. Authorization and baseline

- [ ] 1.1 Record approval of the synthesized contract, emit requirements, push planning, and establish an open-PR baseline; verify the requirements and baseline commands succeed.

## 2. Identity contract

- [ ] 2.1 Add regression tests for version 2 serialization, checkout isolation, relocation, origins, legacy compatibility, and malformed/tampered payloads; demonstrate RED against the baseline.
- [ ] 2.2 Implement minimized identity generation and version-aware verification; verify focused identity tests pass.
- [ ] 2.3 Integrate verification into delivery and emit version 2 payloads after legacy continuation; verify delivery integration tests retain the original baseline digest and historical files remain unchanged.

## 3. Documentation and delivery

- [ ] 3.1 Document schema dispatch, relocation behavior, and compatibility limits; verify documentation agrees with all spec scenarios.
- [ ] 3.2 Run harness regression tests, focused lint/format checks, strict OpenSpec validation, and discriminating contract evidence; record candidate-bound validation receipts.
- [ ] 3.3 Complete independent Standards/Spec review, conformance, and delivery on an unmerged PR linked to #71 and #82; report CI and unresolved review threads.
