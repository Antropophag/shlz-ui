# Wave 9 snapshot inspection

The source-correct 301px shell and new header changed available page width and
subpixel placement in the captures below. The clean baseline passed before the
shell change. Each regenerated image was inspected for intact component content,
focus/state paint, clipping, and accidental shell inclusion, then re-run without
update mode in the 99-test affected group and the 207-test aggregate suite.

| Snapshot                                           | Inspection disposition                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `button-focused-contract-chromium-linux.png`       | Button focus ring and label remain intact; only placement raster changed.          |
| `fidelity-dropdown-chromium-linux.png`             | Complete dropdown source/production comparison remains visible and aligned.        |
| `fidelity-popover-chromium-linux.png`              | Complete popover comparison remains visible and aligned.                           |
| `textarea-focused-states-chromium-linux.png`       | Focused textarea states remain complete with unclipped focus paint.                |
| `icon-catalog-chromium-linux.png`                  | Catalog grid and icon paint remain complete; no shell content entered the capture. |
| `notification-default-chromium-linux.png`          | Default notification geometry, text, and actions remain intact.                    |
| `notification-error-action-chromium-linux.png`     | Error/action notification state remains intact and unclipped.                      |
| `drawer-chromium-linux.png`                        | Drawer surface and backdrop retain full viewport composition.                      |
| `modal-chromium-linux.png`                         | Modal surface, backdrop, and controls remain centered and intact.                  |
| `modal-long-content-chromium-linux.png`            | Long modal body and fixed regions remain complete.                                 |
| `modal-nested-popover-chromium-linux.png`          | Nested popover remains visible within the modal top-layer composition.             |
| `button-icon-foregrounds-chromium-linux.png`       | All icon foreground variants remain painted and aligned.                           |
| `remediation-button-chromium-linux.png`            | Full Button source-mode matrix remains present and legible.                        |
| `remediation-switch-chromium-linux.png`            | Both Switch sizes and states remain present and aligned.                           |
| `typography-fira-compatibility-chromium-linux.png` | Fira stress samples remain legible and unclipped.                                  |

The three focused Wave 9 images were inspected separately: opened Sidebar
shows the full hierarchy and active Input item; closed Sidebar shows distinct
compact text labels, full-title tooltips, and the active marker; filled Header shows the populated search,
48px avatar geometry, and typography-profile control without clipping.
