import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const targetRoot = path.resolve(process.argv[2]);
const core = await import(
  pathToFileURL(path.join(targetRoot, "tools/lib/harness/core.mjs"))
);
const ids = [
  "marked-contracts-require-manifest",
  "manifest-sources-are-grounded",
  "marked-contract-coverage-is-complete",
  "change-specific-results-discriminate",
  "contract-edits-stale-proof",
  "stale-plan-or-pending-packet-blocks-delivery",
];
const results = Object.fromEntries(ids.map((id) => [id, false]));

if (
  typeof core.loadChangeFailureInvariants === "function" &&
  typeof core.recordFailurePathProof === "function"
) {
  const root = await mkdtemp(path.join(tmpdir(), "shlz-invariant-probe-"));
  const change = "probe-change";
  const specRoot = path.join(
    root,
    "openspec/changes/probe-change/specs/harness/probe",
  );
  const entry = {
    id: "probe-is-grounded",
    concern: "persistence",
    requirement: "Proof binding",
    scenario: "Failure is observed",
  };
  const manifest = { version: 1, change, invariants: [entry] };
  const spec = (
    outcome = "the failure is retained",
  ) => `### Requirement: Proof binding

<!-- failure-invariant: probe-is-grounded concern=persistence -->

#### Scenario: Failure is observed
- **WHEN** the probe executes
- **THEN** ${outcome}
`;
  try {
    await mkdir(specRoot, { recursive: true });
    const specPath = path.join(specRoot, "spec.md");
    await writeFile(specPath, spec());
    const binding = await core.loadChangeFailureInvariants(
      change,
      manifest,
      root,
    );
    results["marked-contracts-require-manifest"] = await core
      .loadChangeFailureInvariants(change, null, root)
      .then(
        () => false,
        (error) => /manifest is invalid/.test(error.message),
      );
    results["manifest-sources-are-grounded"] = await core
      .loadChangeFailureInvariants(
        change,
        { ...manifest, invariants: [{ ...entry, scenario: "Missing" }] },
        root,
      )
      .then(
        () => false,
        (error) => /ungrounded/.test(error.message),
      );
    await writeFile(
      specPath,
      `${spec()}
<!-- failure-invariant: second-probe-is-grounded concern=persistence -->

#### Scenario: Second failure is observed
- **WHEN** the second probe executes
- **THEN** the second failure is retained
`,
    );
    results["marked-contract-coverage-is-complete"] = await core
      .loadChangeFailureInvariants(change, manifest, root)
      .then(
        () => false,
        (error) => /do not cover: second-probe-is-grounded/.test(error.message),
      );
    await writeFile(specPath, spec());
    const state = core.createReviewState("base", ["persistence"], binding);
    const proof = {
      version: 1,
      reviewBase: "base",
      knownBadRevision: "a".repeat(40),
      reviewedHead: "b".repeat(40),
      command: ["node", "probe"],
      openSpecChange: change,
      manifestDigest: binding.manifestDigest,
      contractDigest: binding.contractDigest,
      invariants: [
        "retry-state-is-monotonic",
        "persisted-completions-are-report-bound",
      ].map((id) => ({
        id,
        concern: "persistence",
        knownBad: "fail",
        reviewedHead: "pass",
      })),
    };
    proof.resultDigest = core.failurePathResultDigest(proof);
    results["change-specific-results-discriminate"] = (() => {
      try {
        core.recordFailurePathProof(state, proof);
        return false;
      } catch (error) {
        return /does not cover/.test(error.message);
      }
    })();
    const completeProof = {
      ...proof,
      invariants: [
        ...proof.invariants,
        {
          id: `${change}/${entry.id}`,
          concern: entry.concern,
          knownBad: "fail",
          reviewedHead: "pass",
        },
      ],
    };
    completeProof.resultDigest = core.failurePathResultDigest(completeProof);
    core.recordFailurePathProof(
      core.createReviewState("base", ["persistence"], binding),
      completeProof,
    );
    await writeFile(specPath, spec("the changed failure is retained"));
    const changed = await core.loadChangeFailureInvariants(
      change,
      manifest,
      root,
    );
    results["contract-edits-stale-proof"] = (() => {
      try {
        core.recordFailurePathProof(
          core.createReviewState("base", ["persistence"], changed),
          completeProof,
        );
        return false;
      } catch (error) {
        return /contract is invalid/.test(error.message);
      }
    })();
    if (typeof core.assertImplementationDelivery === "function") {
      let stalePlanRejected = false;
      try {
        core.assertImplementationDelivery(
          { actual: {} },
          {
            plan: {
              id: "probe",
              requirementsGate: "required",
              requirementsRevision: 1,
              openSpecChange: change,
              packets: [],
            },
            state: { planId: "probe", requirementsRevision: 1, packets: {} },
            requirementsState: {
              version: 1,
              revision: 2,
              intent: "Probe stale execution-plan delivery behavior.",
              route: "open-spec",
              decisions: [],
              openSpec: { change, status: "synthesized" },
              authorization: {
                status: "approved",
                provenance: { kind: "probe", ref: "stale-plan" },
              },
            },
          },
        );
      } catch (error) {
        stalePlanRejected = /execution plan revision.*stale/.test(
          error.message,
        );
      }
      let pendingPacketRejected = false;
      try {
        core.assertImplementationDelivery(
          {
            defaultBranch: "main",
            pullRequestUrl: "https://github.com/o/r/pull/1",
            actual: {},
          },
          {
            plan: {
              id: "probe",
              requirementsGate: "none",
              packets: [{ id: "required" }],
            },
            state: {
              planId: "probe",
              packets: { required: { status: "pending" } },
            },
          },
        );
      } catch (error) {
        pendingPacketRejected = /completed mandatory packets/.test(
          error.message,
        );
      }
      results["stale-plan-or-pending-packet-blocks-delivery"] =
        stalePlanRejected && pendingPacketRejected;
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

process.stdout.write(`${JSON.stringify(results)}\n`);
