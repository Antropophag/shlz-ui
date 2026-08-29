## Why

Calendar Grid exposes `past`, `today`, `future`, and `unavailable` states, but its current paint does not reproduce the authoritative `Calendar.svg`: past and future headers lose their distinct treatments, today uses an invented blue top rule instead of the source column fill, and snapshots do not independently prove the temporal states. This follow-up restores the merged component's state fidelity without changing temporal calculation or Date Picker scope.

## What Changes

- Define the source-backed header and body-cell treatment for each Calendar Grid temporal state, including where a treatment applies to the full column and where the source intentionally leaves body cells at the base surface.
- Replace the incomplete Calendar Grid CSS state paint and make the Showcase state matrix expose the authoritative distinctions.
- Add focused computed-style assertions for `past`, `today`, and `future`, update only Calendar Grid snapshots, and visually inspect the resulting state matrix.
- Refresh Calendar Grid source-contract documentation and audit evidence as needed; leave Date Picker implementation and status unchanged.
- Pass the complete Calendar Grid component gate, full repository checks, independent Standards/Spec review, and follow-up PR delivery guards.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `data-display/calendar-grid`: Tighten the existing temporal-presentation requirement so past, today, future, and unavailable headers/body cells reproduce the authoritative source and each temporal state has independent computed-style evidence.

## Impact

The public `data-shlz-calendar-grid-state` vocabulary and consumer ownership remain backward-compatible. Expected changes are limited to Calendar Grid CSS, Showcase/fixture evidence where necessary, focused Playwright assertions and Calendar Grid snapshots, Calendar Grid documentation/audit artifacts, and this follow-up's OpenSpec/execution receipts. No behavior controller, package API, Date Picker status, design-source file, dependency, or application-specific calendar logic changes.
