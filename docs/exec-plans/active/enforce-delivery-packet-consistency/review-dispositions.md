# Review dispositions

## Canonical packet split brain

Accepted. PR #40 retained `routing-engine` as canonically pending while its
trusted execution boundary and durable handoff described an executed worker.
The regression fixture now reproduces that exact state, and planned delivery
fails with `ERR_DELIVERY_PACKET_EVIDENCE routing-engine` before the generic
incomplete-packet check. Coherent current attempts and recorded retry history
remain accepted; unrecorded detached attempts are rejected.

## Future-dated metadata

Rejected as a false positive. The repository timezone is `Europe/Moscow`
(UTC+03:00 on 25 August 2026). Local date `2026-08-25` began at
`2026-08-24T21:00:00Z`; therefore metadata written after local midnight can
validly carry `2026-08-25` while the UTC calendar still reads 24 August. The
metadata and its provenance digests remain unchanged.
