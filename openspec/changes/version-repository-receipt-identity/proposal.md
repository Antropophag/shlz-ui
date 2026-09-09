## Why

Issues #71 and #82 identify absolute checkout paths and raw origins published by harness repository identities. Removing fields in historical receipts would invalidate evidence chains; the generator and verifier need a versioned contract.

## What Changes

- Emit version 2 repository identities without raw filesystem paths or origins.
- Preserve distinct checkout identities and origin mismatch detection.
- Verify legacy identities using their original algorithm without rewriting historical chains.
- Cover relocation, worktrees, origin mismatches, malformed identities, and tampering with executable tests.

## Capabilities

### New Capabilities

- `harness-repository-identity`: Versioned repository identity serialization and compatibility during delivery.

### Modified Capabilities

None.

## Impact

Affects `tools/lib/harness/core.mjs`, focused harness tests, and execution documentation. Receipt envelopes remain version 1; their repository payload gains an explicit version. No external dependencies are planned. Old consumers of the new payload need version awareness. Historical receipts, component behavior, release tooling, general log redaction, and cross-clone continuation of an execution episode are out of scope. A principal risk is accidentally accepting a receipt from another checkout when minimizing paths.
