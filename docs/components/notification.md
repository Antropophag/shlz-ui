# Notification

## Purpose and evidence

| Class    | Evidence / contract                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| FACT     | `Notification.svg` shows eleven 384×58 pill surfaces with radius 29.                                         |
| FACT     | Nine are dark, one red and one white; examples contain leading status/count, text and close/action controls. |
| FACT     | Action pills are 79/90×32 with radius 16; circular leading regions are 40×40.                                |
| DERIVED  | The visual is toast-like, with default, danger, action and countdown compositions.                           |
| DECISION | This iteration supplies a static notification primitive only; close/action controls are native buttons.      |
| UNKNOWN  | Live-region priority, stacking, placement, timeout, countdown and auto-dismiss lifecycle.                    |

No toast manager is provided. Consumers choose `role="status"` for polite
status updates or `role="alert"` only for urgent errors. Static page content
needs neither role. The library never auto-dismisses content and does not infer
severity from color alone.
