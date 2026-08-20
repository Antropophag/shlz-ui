# Wave 1 foundation re-attestation

Baseline: `6faefdb19a3053d7aed0362603d02ca40fa47103` (merged PR #14).

The seven foundation families were re-audited against the source-to-consumer
pipeline. Generated files are distribution evidence, not authority. Golos is
the source-backed typography profile; Fira is compatibility-only. Effects stay
component-local because the source does not establish a shared elevation scale.

Repository scans found no unexplained production foundation alternatives.
Hard-coded values that remain in component CSS are traceable component geometry
or paints and were not mechanically promoted. This is a foundation claim only;
it does not attest the owning UI component.

No P0, P1, P2, or P3 foundation findings remain. Wave 1 makes no production
runtime change and does not change the design source.

`VERIFIED` applies only to the concrete foundation claims named in each evidence
cell. Every applicable level records the tested claim after `pass:`; every
excluded level records its boundary after `not-applicable:`. In particular,
source-backed palette, typography metrics, and icon geometry do not certify the
contrast, readability, semantics, or accessibility of every consuming
component. Those remain component and consumer audit responsibilities.

The Impeccable integrity detector ran in degraded regex mode because its HTML
parser modules are unavailable. Its only hit is the pre-existing 24px grid on
the source-fidelity measurement canvas; this is an intended measurement surface
and a verified false positive, not production UI or a foundation alternative.
