# Engineering receipts

`docs/exec-plans/active/<change>/` contains only the compact receipts needed by an unfinished or delivered material episode. The canonical maximum is eight durable episode artifacts, excluding OpenSpec and source/tests:

1. route
2. requirements
3. baseline
4. contract/TDD
5. validation summary
6. review/failure-proof summary
7. conformance
8. delivery

The public harness interface is:

```text
route
requirements
baseline
contract
tdd
validate
review
failure-proof
run-isolated
conformance
delivery
telemetry-summary
```

Run `npm run harness -- --help` for the current command list. Manifests used immediately before an isolated launch are ephemeral and not checked in. Raw logs and runtime telemetry belong in local storage or CI artifacts. Completed retry history, worker briefs, capsules, ledgers, mutable orchestration state, and historical active directories are not delivery inputs.
