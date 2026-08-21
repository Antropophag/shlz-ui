# Wave 3.5 — Interaction Evidence Hardening

Baseline: `f5d7f3279565ea2136f75018f24f7ca4318d983d` (merged PR #17).
Branch: `chore/interaction-evidence-hardening`. This is a narrow
cross-wave interaction sweep, not a new component-family audit. No Wave 4
family was inspected or changed.

## Process and machine contract

The completion workflow and manifest contract now separate `static-visual`,
`real-interaction-visual`, and `runtime-behavior`. A material state claim needs
one browser flow that selects the variant, creates the real state, reads the
computed source-relevant result, and compares it with the documented contract.
Fake states remain static evidence even when real/static computed equivalence is
also checked. Bare/generic `pass`, bare `applicable`, and unexplained
`not-applicable` decisions fail manifest validation. `VERIFIED` is explicitly
revocable.

All 11 interactive manifests declare their material states, three evidence
types, focused executable spec, and manual state-walk surfaces. The focused
browser spec asserts only material paint/geometry: foreground, background,
border, outline, shadow, opacity, thumb transform, and icon/currentColor where
applicable. The executable state ledger compares the states actually asserted
by each browser flow with that family's manifest declaration, so a prose-only
claim cannot satisfy the contract. Its contrast guard derives 4.5:1 for normal
text and 3:1 for large text; disabled states are excluded and exact source
fidelity remains separate.

## Sweep

| Family     | Real-state computed contract                                              | Static equivalence / disposition                                                                 |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Input      | default, hover, keyboard focus, disabled and invalid shell paint          | real/fake hover and focus shell paint are equivalent                                             |
| Textarea   | default, hover, keyboard focus, disabled and invalid shell paint          | real/fake hover and focus shell paint are equivalent                                             |
| Select     | closed, hover, keyboard focus, opened, option hover/selected and disabled | real/fake hover and focus surfaces are equivalent; content paint remains content-state-specific  |
| Checkbox   | unchecked, checked, mixed, focus and disabled box/check paint             | exact hover mapping remains source-unknown and neutral, not passed as a distinct material state  |
| Radio      | unchecked, checked, focus and disabled circle/dot paint                   | exact hover remains source-unknown and neutral, not passed as a distinct material state          |
| Switch     | off/on, focus and disabled off/on track/thumb paint and offset            | hover is not a distinct source state                                                             |
| Button     | Primary/Secondary/Text × default/real hover/real active/focus/disabled    | real hover/active equals fake fixtures for relevant paint                                        |
| Link       | default/real hover/real active/focus/unavailable                          | real hover/active matches the four source rows                                                   |
| Segment    | selected/unselected/focus/disabled label paint                            | hover/pressed are not supported distinct source states                                           |
| Tabs       | active/real hover per underline, pill and boxed family; focus; disabled   | P2: generic real hover contradicted three source families; family-specific real/fake rules added |
| Pagination | number/direction hover, active, focus, current and disabled boundaries    | P2: real/fake hover and pressed diverged; source Number/Hover and Pressed paint restored exactly |

## Findings and status

Two P2 family regressions were found by the new real-state flow and fixed with
component-local CSS selector changes. Tabs had real/fake hover divergence plus
source-inaccurate active and disabled paint; it now preserves exact active,
hover and disabled foreground/surface/border contracts independently for
underline, pill and boxed. Pagination had real/fake divergence plus incorrect
Default, Pressed and Disabled paint; Number/Hover now stays white with action
text and the default border, Pressed uses blue-100, and Default/Disabled use
their exact primitive paints. No token, public API, behavior controller, or
foundation was changed. The
affected families were treated as `FINDINGS` while the regression was open and
restored to `VERIFIED` only after the focused regression passed; the resolved
findings remain recorded in their manifests.

The active-state contrast guard reports no new blocking text contrast failure.
It detected the source-backed Pagination Default foreground `#939ca5` on white
below 4.5:1; this is recorded as a P3 source-fidelity finding and was not
automatically recolored. The pre-existing source-backed Field contrast
deviation remains explicitly tracked in issue #13.

Manual interaction state walk: pass — the manifest entries enumerate the
pointer, keyboard, disabled, and narrow/content surfaces inspected for every
family. Snapshot policy: the single bounded Pagination typography raster was
reviewed against the raw source and intentionally updated after the exact
Default/Pressed/Disabled paint fix; no unrelated snapshot was regenerated or
accepted merely to make the suite pass.
