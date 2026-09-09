# Rounded-control alignment correction

Change: `fix-rounded-control-alignment`; planning/baseline PR #85. The public
Showcase audit identified A1–A13 below. Raw captures remain local/CI artifacts;
this record binds compact source and verification evidence without declaring
unrelated families complete.

| IDs      | Owning seam                | Observed baseline                                                                                             | Authority                                                                           |
| -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A1       | Small Switch               | Painted thumb center differs by approximately half a pixel at fractional placement despite centered CSS boxes | `Switch.svg`: 24×14 track, 11.2 thumb, 1.4 inset                                    |
| A2–A3    | Select diagnostics         | 8 medium chips keep 27px lines in 23px shells; 18 placeholders render above center                            | `Select.svg`, Basic Elements archive, form-control source spec                      |
| A4, A9   | Tabs                       | 8 pill and 6 boxed specimens stretch to 61px                                                                  | `Tabs.svg`: 40px pill, 39px boxed, 61px underline                                   |
| A5       | Empty State Customize      | One 131×32 action wraps the source label and paints beyond top/bottom                                         | Empty State source and component composition contract                               |
| A6, A10  | Notification               | Narrow short content is 11px above center; 8 action labels overflow horizontally at 768px in Golos            | `Notification.svg` source minima plus documented content policy                     |
| A7, A8   | Badge Showcase             | 3 Medium counts get 12px instead of 14px type; 7 matrix counts stretch beyond intrinsic widths                | `Bage.svg`, component size contract                                                 |
| A11, A12 | Advanced Field actions     | 4 textual actions shrink to 37px and retain Arial                                                             | Original archive Advanced 2 SVG has two 82×27 white action pills                    |
| A12      | Comment Feed text actions  | 6 context/suggestion text buttons retain Arial in both profiles                                               | Component profile inheritance and native button boundary                            |
| A13      | History source composition | 3 short-label shells become 36px through wrapping/stretch                                                     | `History of changes.svg`: 66×30, 137×30, 111×30; separate new status remains 119×35 |

The initial audit counted 647 principal roots and 100 additional pips/labels;
701 were nonzero before opening native overlays. The extended stress scan
measured 520 selected roots (486 nonzero) for each of eight width/profile pairs.
These are observed baseline counts, not permanent acceptance thresholds.
Executable roots, live consumers, inert diagnostics, and native substitutes
remain governed by their existing per-component manifests and shared occurrence
guards. Dynamic test-only plain HTML probes are not new Showcase occurrences.

## Contract and validation

The normative delta is
`openspec/changes/fix-rounded-control-alignment/specs/rounded-control-layout/spec.md`.
The focused regression entrypoint is
`tools/playwright/rounded-control-alignment.spec.js`; existing family suites
retain native, accessibility, consumer, and focused-source evidence. Validate
320/390/768/1440px with both profiles and source-sized Switch paint at integer
and quarter-pixel positions with DPR1/2. Distinguish line geometry, icon slots,
painted centroids, and actual source glyph outlines.

Input Advanced and Select chip/placeholder diagnostics remain inert: this
change does not introduce runtime multiselect/removal or a source-absent Medium
Advanced Input variant. Optical Fira/Avatar differences are outside the thirteen
confirmed defects; no universal glyph offset is introduced.

Implementation evidence and final per-family dispositions are recorded in the
component manifests after their relevant checks pass. This record is not a
blanket component verification certificate.

## Observed correction evidence — 2026-09-09

The scoped guards observe 46 classified Showcase roots plus three standalone
HTML roots, across ten independently tracked families. They report 114
inert/diagnostic legacy-selector matches and zero unclassified legacy matches.
`evidence/rounded-control-alignment.json` preserves per-surface IDs and counts;
these numbers do not replace the guards or count every internal DOM child.

All A1–A13 regressions passed in the relevant profiles and widths. Small Switch
also passed DPR 1/1.25/1.5/2, quarter-pixel placement, native Space/click, exact
input/change events, focus-visible and disabled rejection. Existing affected
browser coverage passed 61/66 initially; the five source-minimum/snapshot
updates then passed, including their remaining 200% text checks. New long-label
probes verify contained reflow and a compact neighboring History tag.

Focused updated images were inspected for Tabs, History (source and narrow),
Snackbar stress, and Empty State. Notification action reflow aligns content
within each row when controls need a second row; a short single-row notification
remains centered within its 58px shell. The Input audit now cites the original
Input archive rather than the separate Input Number sheet.

Final repository checks, independent review and delivery are recorded by the
candidate-bound harness receipts and the PR checks; this working evidence
record does not substitute for those gates.
