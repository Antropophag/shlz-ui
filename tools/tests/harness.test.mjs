import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import {
  contract,
  digest,
  failureProof,
  materialSignals,
  receipt,
  requirements,
  review,
  route,
  sourceManifest,
  stable,
  tdd,
  telemetry,
  validation,
  verify,
} from "../lib/harness/core.mjs";
import {
  launchCodexWorker,
  parseCodexExecJsonl,
} from "../lib/harness/codex-worker.mjs";

const exec = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "../..");
const candidate = (
  await exec("git", ["rev-parse", "HEAD"], { cwd: repoRoot })
).stdout.trim();
const baselineCommit = "a".repeat(40);
const falseSignals = Object.fromEntries(
  materialSignals.map((name) => [name, false]),
);
const material = { ...falseSignals, publicContract: true };
const assessment = {
  version: 1,
  intent: "simplify harness",
  route: "open-spec",
  openSpecChange: "simplify-engineering-harness",
  requiredDecisions: [{ id: "architecture", owner: "agent", blocking: true }],
  materialSignals: material,
};
const routeReceipt = route(assessment);
const requirementsState = {
  version: 1,
  intent: assessment.intent,
  revision: 1,
  route: "open-spec",
  decisions: [
    { id: "architecture", owner: "agent", status: "delegated", blocking: true },
  ],
  openSpec: { change: assessment.openSpecChange, status: "synthesized" },
  authorization: { status: "pre-authorized" },
};
const requirementsReceipt = requirements(routeReceipt, requirementsState);
const baselineReceipt = receipt("baseline", {
  repository: {
    root: repoRoot,
    remote: "git@example.test:repo.git",
    digest: digest({ root: repoRoot, remote: "git@example.test:repo.git" }),
  },
  branch: "feat/task",
  upstream: "origin/feat/task",
  commit: baselineCommit,
  defaultBranch: "main",
});
const contractReceipt = receipt("contract", {
  scenarios: [
    {
      id: "harness/receipt-workflow::Requirement::Scenario",
      content: "WHEN x THEN y",
    },
  ],
  failureInvariants: [
    { id: "state", concern: "state-machine", scenarioId: "scenario" },
    { id: "process", concern: "subprocess", scenarioId: "scenario" },
  ],
  contractDigest: digest([
    {
      id: "harness/receipt-workflow::Requirement::Scenario",
      content: "WHEN x THEN y",
    },
  ]),
});

test("direct routing is positively proven and material or unknown signals fail closed", () => {
  assert.equal(
    route({
      version: 1,
      intent: "typo",
      route: "direct",
      materialSignals: falseSignals,
    }).payload.route,
    "direct",
  );
  assert.throws(
    () =>
      route({
        version: 1,
        intent: "contract",
        route: "direct",
        materialSignals: material,
      }),
    /route must be open-spec/,
  );
  assert.throws(
    () =>
      route({
        version: 1,
        intent: "unknown",
        route: "direct",
        materialSignals: { ...falseSignals, permissionsOrSecurity: "unknown" },
      }),
    /route must be open-spec/,
  );
  assert.throws(
    () =>
      route({
        version: 1,
        intent: "missing",
        route: "direct",
        materialSignals: { ...falseSignals, publicContract: undefined },
      }),
    /publicContract/,
  );
});

test("numbered product waves require production delta and PR 43 stays bounded evidence", async () => {
  const incident = JSON.parse(
    await readFile(
      path.join(repoRoot, "tools/tests/fixtures/pr43-wave-incident.json"),
      "utf8",
    ),
  );
  const waveAssessment = {
    ...assessment,
    intent: "numbered wave",
  };

  assert.throws(
    () =>
      route({
        ...waveAssessment,
        wave: {
          number: 11,
          expectedProductionDelta: {
            kind: "implementation",
            description: "   ",
          },
        },
      }),
    /expected production delta/,
  );

  const product = route({
    ...waveAssessment,
    wave: {
      number: 11,
      expectedProductionDelta: {
        kind: "implementation",
        description:
          "A production Upload composition with a public interaction contract",
      },
    },
  });
  assert.deepEqual(product.payload.wave, {
    number: 11,
    workKind: "product",
    evidenceKind: null,
    expectedProductionDelta: {
      kind: "implementation",
      description:
        "A production Upload composition with a public interaction contract",
    },
    evidenceRisk: { testFirst: false, independentReview: false },
    executionPath: "product",
    heavyExecution: true,
    roadmapAdvance: true,
  });

  const replay = route({
    ...waveAssessment,
    intent: `Replay PR #${incident.pullRequest}`,
    wave: incident.wave,
  });
  assert.equal(incident.evidence.auditDisposition, "VERIFIED");
  assert.equal(incident.evidence.productionImplementations, 0);
  assert.deepEqual(replay.payload.wave, {
    number: 10,
    workKind: "source-only",
    evidenceKind: "source-only",
    expectedProductionDelta: null,
    evidenceRisk: { testFirst: false, independentReview: false },
    executionPath: "bounded-evidence",
    heavyExecution: false,
    roadmapAdvance: false,
  });

  assert.throws(
    () =>
      route({
        ...waveAssessment,
        wave: {
          ...incident.wave,
          expectedProductionDelta: {
            kind: "implementation",
            description: "Claimed production delivery",
          },
        },
      }),
    /evidence-only wave cannot declare a production delta/,
  );
});

test("requirements require decisions, synthesis, authorization, and exact route identity", () => {
  assert.equal(requirementsReceipt.payload.authorization, "pre-authorized");
  assert.throws(
    () =>
      requirements(routeReceipt, {
        ...requirementsState,
        openSpec: { ...requirementsState.openSpec, status: "pending" },
      }),
    /synthesis/,
  );
  assert.throws(
    () =>
      requirements(routeReceipt, {
        ...requirementsState,
        authorization: { status: "approval-required" },
      }),
    /authorization/,
  );
  assert.throws(
    () =>
      requirements(routeReceipt, {
        ...requirementsState,
        decisions: [
          { ...requirementsState.decisions[0], status: "unresolved" },
        ],
      }),
    /unresolved/,
  );
});

test("all receipts are immutable and tampering invalidates the digest", () => {
  verify(routeReceipt, "route");
  assert.throws(
    () =>
      verify({
        ...routeReceipt,
        payload: { ...routeReceipt.payload, route: "direct" },
      }),
    /stale/,
  );
  assert.deepEqual(stable({ z: 1, a: { y: 2, x: 3 } }), {
    a: { x: 3, y: 2 },
    z: 1,
  });
});

test("OpenSpec contract identity is order-stable and normative-content sensitive", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "shlz-contract-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const specRoot = path.join(root, "specs", "harness", "sample");
  await mkdir(specRoot, { recursive: true });
  const spec = (then) =>
    `## Purpose\n\nA sufficiently long purpose for a stable contract.\n\n## ADDED Requirements\n\n### Requirement: Stable\n\nThe harness SHALL work.\n\n#### Scenario: Alpha\n\n<!-- implementation-semantics: material-behavior -->\n<!-- validation-impact: harness -->\n\n- **WHEN** input exists\n- **THEN** ${then}\n`;
  await writeFile(path.join(specRoot, "spec.md"), spec("output exists"));
  const first = await contract(root);
  const second = await contract(root);
  assert.equal(first.payload.contractDigest, second.payload.contractDigest);
  await writeFile(path.join(specRoot, "spec.md"), spec("output changes"));
  assert.notEqual(
    (await contract(root)).payload.contractDigest,
    first.payload.contractDigest,
  );
});

test("TDD requires symmetric discriminating RED and GREEN bound to one contract", async () => {
  const oracle = (redKind = "known-bad-adapter", greenCommit = candidate) => ({
    shared: { repetitions: 1 },
    command: [
      process.execPath,
      "-e",
      "process.exit(process.argv[1].endsWith('receipt-known-bad.mjs') ? 1 : 0)",
      "{target}",
    ],
    redTarget: {
      kind: redKind,
      path: "tools/tests/fixtures/receipt-known-bad.mjs",
    },
    greenTarget: { kind: "candidate", commit: greenCommit },
  });
  const good = await tdd({
    contractReceipt,
    baselineReceipt,
    candidateHead: candidate,
    oracle: oracle(),
    cwd: repoRoot,
  });
  assert.equal(good.payload.red.outcome, "fail");
  assert.equal(good.payload.green.outcome, "pass");
  await assert.rejects(
    tdd({
      contractReceipt,
      baselineReceipt,
      candidateHead: candidate,
      oracle: oracle("candidate"),
      cwd: repoRoot,
    }),
    /symmetric/,
  );
  await assert.rejects(
    tdd({
      contractReceipt,
      baselineReceipt,
      candidateHead: candidate,
      oracle: {
        redTarget: {
          kind: "known-bad-adapter",
          path: "tools/tests/fixtures/receipt-known-bad.mjs",
        },
        greenTarget: { kind: "candidate", commit: candidate },
        command: [process.execPath, "-e", "process.exit(0)"],
      },
      cwd: repoRoot,
    }),
    /symmetric/,
  );
});

test("validation reuse requires identical candidate and meaning-changing closure", async (context) => {
  const root = await mkdtemp(
    path.join(repoRoot, "docs/exec-plans/validation-"),
  );
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "source.txt"), "one");
  const first = await validation({
    repoRoot,
    contractReceipt,
    candidateHead: candidate,
    target: "focused",
    argv: [process.execPath, "-e", "process.exit(0)"],
    inputs: [path.relative(repoRoot, path.join(root, "source.txt"))],
  });
  assert.equal(
    (
      await validation({
        repoRoot,
        contractReceipt,
        candidateHead: candidate,
        target: "focused",
        argv: first.payload.argv,
        inputs: [path.relative(repoRoot, path.join(root, "source.txt"))],
        priorReceipt: first,
      })
    ).payload.reusedFrom,
    first.digest,
  );
  await writeFile(path.join(root, "source.txt"), "two");
  await assert.rejects(
    validation({
      repoRoot,
      contractReceipt,
      candidateHead: candidate,
      target: "focused",
      argv: first.payload.argv,
      inputs: [path.relative(repoRoot, path.join(root, "source.txt"))],
      priorReceipt: first,
    }),
    /cannot be reused/,
  );
  await assert.rejects(
    validation({
      repoRoot,
      contractReceipt,
      candidateHead: "c".repeat(40),
      target: "focused",
      argv: first.payload.argv,
      inputs: [path.relative(repoRoot, path.join(root, "source.txt"))],
      priorReceipt: first,
    }),
    /candidate differs/,
  );
});

test("independent review keeps Standards and Spec distinct and candidate-bound", () => {
  const axis = (runtimeId) => ({
    runtimeId,
    runtimeSource: "codex-exec-jsonl",
    outcome: "pass",
    candidateHead: candidate,
    contractDigest: contractReceipt.payload.contractDigest,
  });
  assert.equal(
    review({
      contractReceipt,
      candidateHead: candidate,
      standards: axis("standards"),
      spec: axis("spec"),
    }).payload.spec.outcome,
    "pass",
  );
  assert.throws(
    () =>
      review({
        contractReceipt,
        candidateHead: candidate,
        standards: axis("same"),
        spec: axis("same"),
      }),
    /distinct/,
  );
  assert.throws(
    () =>
      review({
        contractReceipt,
        candidateHead: candidate,
        standards: axis("standards"),
        spec: { ...axis("spec"), candidateHead: "c".repeat(40) },
      }),
    /stale/,
  );
});

test("failure proof derives every invariant and executes candidate/known-bad behavior", async () => {
  const input = {
    contractReceipt,
    candidateHead: candidate,
    cwd: repoRoot,
    oracle: {
      command: [
        process.execPath,
        "-e",
        "process.exit(process.argv[1].endsWith('receipt-known-bad.mjs') ? 1 : 0)",
        "{target}",
        "{invariant}",
      ],
      knownBadAdapter: "tools/tests/fixtures/receipt-known-bad.mjs",
    },
  };
  const proof = await failureProof(input);
  assert.equal(proof.payload.outcome, "pass");
  assert.deepEqual(proof.payload.invariants, ["process", "state"]);
  await assert.rejects(
    failureProof({
      ...input,
      oracle: {
        ...input.oracle,
        command: [
          process.execPath,
          "-e",
          "process.exit(0)",
          "{target}",
          "{invariant}",
        ],
      },
    }),
    /non-discriminating/,
  );
});

test("ephemeral source manifest measures every declared source and blocks over budget", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "shlz-sources-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "a.txt"), "1234");
  await writeFile(path.join(root, "b.txt"), "56");
  const fit = await sourceManifest(root, ["b.txt", "a.txt"], 6);
  assert.equal(fit.allowed, true);
  assert.equal(fit.bytes, 6);
  assert.deepEqual(
    fit.contributors.map(({ path: name }) => name),
    ["a.txt", "b.txt"],
  );
  const blocked = await sourceManifest(root, ["a.txt", "b.txt"], 5);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.contributors.length, 2);
  await assert.rejects(sourceManifest(root, ["missing.txt"], 100), /ENOENT/);
});

test("isolated adapter requires runtime-issued identity and complete result", async () => {
  const jsonl = [
    { type: "thread.started", thread_id: "runtime-1" },
    {
      type: "item.completed",
      item: { type: "agent_message", text: "complete report" },
    },
    { type: "turn.completed", usage: { input_tokens: 10, output_tokens: 2 } },
  ]
    .map(JSON.stringify)
    .join("\n");
  assert.equal(parseCodexExecJsonl(jsonl).runtimeId, "runtime-1");
  let calls = 0;
  const completed = await launchCodexWorker({
    brief: { objective: "bounded" },
    cwd: repoRoot,
    run: async () =>
      ++calls === 1
        ? { code: 0, stdout: "--json" }
        : { code: 0, stdout: jsonl },
  });
  assert.equal(completed.terminalStatus, "completed");
  assert.equal(completed.evidence.runtimeId, "runtime-1");
  assert.ok(completed.workerReportDigest);
  let incompleteCalls = 0;
  const incomplete = await launchCodexWorker({
    brief: {},
    cwd: repoRoot,
    run: async () =>
      ++incompleteCalls === 1
        ? { code: 0, stdout: "--json" }
        : { code: 0, stdout: JSON.stringify({ type: "turn.completed" }) },
  });
  assert.notEqual(incomplete.terminalStatus, "completed");
  assert.equal(incomplete.evidence, undefined);
  const unavailable = await launchCodexWorker({
    brief: {},
    cwd: repoRoot,
    run: async () => ({ code: 1, stdout: "", stderr: "missing" }),
  });
  assert.equal(unavailable.terminalStatus, "unavailable");
});

test("missing runtime telemetry remains unavailable and proxies stay labeled", () => {
  const summary = telemetry({}, { sourceBytes: 42, sourceCount: 2 });
  assert.equal(summary.payload.inputTokens, "unavailable");
  assert.equal(summary.payload.peakActiveContext, "unavailable");
  assert.equal(summary.payload.observations.sourceBytes, 42);
  assert.equal(telemetry({ inputTokens: 7 }).payload.inputTokens, 7);
});

test("every prior harness scenario has an explicit migration disposition", async () => {
  const map = JSON.parse(
    await readFile(
      path.join(repoRoot, "tools/tests/fixtures/harness-scenario-map.json"),
      "utf8",
    ),
  );
  const { stdout } = await exec(
    "git",
    ["ls-files", "openspec/changes/*/specs/harness/*/spec.md"],
    { cwd: repoRoot },
  );
  const identities = [];
  for (const file of stdout
    .trim()
    .split("\n")
    .filter(
      (name) =>
        name &&
        !name.includes("simplify-engineering-harness") &&
        !name.includes("gate-product-waves-by-production-delta"),
    )) {
    const capability = file.match(/specs\/(harness\/[^/]+)\/spec\.md$/)[1];
    const lines = (await readFile(path.join(repoRoot, file), "utf8")).split(
      /\r?\n/,
    );
    let requirement;
    for (const line of lines) {
      requirement = line.match(/^### Requirement:\s*(.+)$/)?.[1] ?? requirement;
      const scenario = line.match(/^#### Scenario:\s*(.+)$/)?.[1];
      if (scenario)
        identities.push(`${capability}::${requirement}::${scenario}`);
    }
  }
  assert.deepEqual(
    Object.keys(map.mappings).sort(),
    [...new Set(identities)].sort(),
  );
  for (const disposition of Object.values(map.mappings)) {
    assert.ok(
      ["preserved", "revised", "retired-with-reason"].includes(
        disposition.status,
      ),
    );
    if (disposition.status === "retired-with-reason")
      assert.ok(disposition.reason);
    else assert.ok(disposition.target);
  }
});

test("CLI exposes exactly twelve receipt commands and no removed orchestration", async () => {
  const { stdout } = await exec(
    process.execPath,
    ["tools/harness.mjs", "--help"],
    { cwd: repoRoot },
  );
  for (const name of [
    "route",
    "requirements",
    "baseline",
    "contract",
    "tdd",
    "validate",
    "review",
    "failure-proof",
    "run-isolated",
    "conformance",
    "delivery",
    "telemetry-summary",
  ])
    assert.match(stdout, new RegExp(`\\b${name}\\b`));
  for (const removed of [
    "claim",
    "complete",
    "pause",
    "resume",
    "context-capsule",
    "context-ack",
    "worker-run",
    "telemetry-record",
  ])
    assert.doesNotMatch(stdout, new RegExp(`\\b${removed}\\b`));
});

test("CLI route writes a verifiable immutable receipt", async (context) => {
  const root = await mkdtemp(
    path.join(repoRoot, "docs/exec-plans", "cli-test-"),
  );
  context.after(() => rm(root, { recursive: true, force: true }));
  const input = path.join(root, "assessment.json");
  const output = path.join(root, "receipt.json");
  await writeFile(
    input,
    JSON.stringify({
      version: 1,
      intent: "small",
      route: "direct",
      materialSignals: falseSignals,
    }),
  );
  await exec(
    process.execPath,
    [
      "tools/harness.mjs",
      "route",
      path.relative(repoRoot, input),
      "--out",
      path.relative(repoRoot, output),
    ],
    { cwd: repoRoot },
  );
  verify(JSON.parse(await readFile(output, "utf8")), "route");
});
