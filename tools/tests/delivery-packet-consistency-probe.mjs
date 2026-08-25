import { execFile } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const fixtureRoot = path.join(
  root,
  "tools/tests/fixtures/delivery-packet-consistency",
);
const adapter = process.env.SHLZ_TDD_ORACLE_ADAPTER;
const expectedOutcome = adapter
  ? (await import(pathToFileURL(path.resolve(root, adapter))))
      .deliveryPacketConsistencyOutcome
  : undefined;
const candidateHead = "0123456789abcdef0123456789abcdef01234567";
const pullRequestUrl = "https://github.com/Antropophag/shlz-ui/pull/40";
const failureSignature = "ERR_DELIVERY_PACKET_CONSISTENCY_BYPASS";
const rejectionSignature = "ERR_DELIVERY_PACKET_EVIDENCE routing-engine";

const packet = {
  id: "routing-engine",
  objective: "Reconcile delivery packet evidence",
  scope: ["delivery evidence"],
  nonGoals: ["production implementation"],
  dependencies: [],
  contracts: ["harness/delivery-packet-consistency"],
  contextSources: ["incident evidence"],
  implementationSurface: ["delivery-check"],
  focusedValidation: ["argv probe"],
  outputs: ["consistent result"],
  handoff: ["worker binding"],
  implementationOutcomes: ["packet reconciliation"],
  preferredExecutionMode: "continue",
};
const plan = {
  version: 1,
  id: "delivery-packet-consistency-probe",
  requirementsGate: "none",
  classification: { size: "S" },
  packets: [packet],
};
const delivery = {
  defaultBranch: "main",
  pullRequestUrl,
};
const review = {
  version: 1,
  base: "probe-base",
  passes: [
    { axis: "Standards", head: candidateHead },
    { axis: "Spec", head: candidateHead },
  ],
  findings: [],
};
const handoffFor = (attempt) => ({
  completedPacket: packet.id,
  changed: ["delivery evidence"],
  provenChecks: ["worker completed"],
  settledDecisions: [],
  unresolvedFindings: [],
  nextPacket: null,
  invalidatedAssumptions: [],
  claimId: attempt.claimId,
  briefDigest: attempt.briefDigest,
  workerReportDigest: attempt.workerReportDigest,
});
const stateFor = ({
  canonicalAttempt,
  detachedAttempt,
  divergentField,
  canonicalStatus = "completed",
  recordedAttempts = [],
  canonicalHandoff = false,
}) => ({
  version: 1,
  planId: plan.id,
  packets: {
    [packet.id]: {
      status: canonicalStatus,
      session: canonicalAttempt.session,
      claimId: canonicalAttempt.claimId,
      briefDigest: canonicalAttempt.briefDigest,
      execution: {
        version: 1,
        source: "codex-exec-jsonl",
        runtimeId: canonicalAttempt.runtimeId,
        launchId: canonicalAttempt.launchId,
        startedAt: "2026-08-24T22:30:00.000Z",
        evidenceDigest:
          "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      },
      launch: {
        terminalStatus: "completed",
        launchId:
          divergentField === "launchId"
            ? detachedAttempt.launchId
            : canonicalAttempt.launchId,
        workerReport: "routing engine completed",
        workerReportDigest: canonicalAttempt.workerReportDigest,
      },
      attemptHistory: recordedAttempts,
    },
  },
  handoffs: {
    [packet.id]: handoffFor(
      canonicalHandoff ? canonicalAttempt : detachedAttempt,
    ),
  },
});
const telemetryBoundary = (attempt) => ({
  at: "2026-08-24T22:30:00.000Z",
  packet: packet.id,
  session: attempt.session,
  agent: "codex-worker",
  phase: "execution",
  type: "execution-boundary",
  executionSource: "codex-exec-jsonl",
  runtimeId: attempt.runtimeId,
});
const telemetryFor = ({
  canonicalAttempt,
  detachedAttempt,
  includeCanonical,
}) =>
  `${(includeCanonical
    ? [telemetryBoundary(canonicalAttempt), telemetryBoundary(detachedAttempt)]
    : [telemetryBoundary(detachedAttempt)]
  )
    .map((event) => JSON.stringify(event))
    .join("\n")}\n`;

const sandbox = await mkdtemp(
  path.join(tmpdir(), "shlz-delivery-packet-consistency-"),
);
try {
  await mkdir(path.join(sandbox, "tools"), { recursive: true });
  await mkdir(path.join(sandbox, "docs/exec-plans/probe"), {
    recursive: true,
  });
  await cp(
    path.join(root, "tools/harness.mjs"),
    path.join(sandbox, "tools/harness.mjs"),
  );
  await cp(path.join(root, "tools/lib"), path.join(sandbox, "tools/lib"), {
    recursive: true,
  });
  await cp(
    path.join(root, "docs/exec-plans/config.json"),
    path.join(sandbox, "docs/exec-plans/config.json"),
  );
  const bin = path.join(sandbox, "bin");
  await mkdir(bin);
  const git = path.join(bin, "git");
  const gh = path.join(bin, "gh");
  await writeFile(
    git,
    `#!${process.execPath}\nconst a=process.argv.slice(2).join(" ");\nconst out=a==="branch --show-current"?"feat/deterministic-tdd-routing":a.includes("--abbrev-ref --symbolic-full-name")?"origin/feat/deterministic-tdd-routing":"${candidateHead}";\nprocess.stdout.write(out+"\\n");\n`,
  );
  await writeFile(
    gh,
    `#!${process.execPath}\nconst a=process.argv.slice(2);\nconst value=a[0]==="repo"?{nameWithOwner:"Antropophag/shlz-ui"}:{url:"${pullRequestUrl}",headRefName:"feat/deterministic-tdd-routing",headRefOid:"${candidateHead}",baseRefName:"main",state:"OPEN"};\nprocess.stdout.write(JSON.stringify(value)+"\\n");\n`,
  );
  await Promise.all([chmod(git, 0o755), chmod(gh, 0o755)]);
  const probeRoot = path.join(sandbox, "docs/exec-plans/probe");
  await Promise.all([
    writeFile(
      path.join(probeRoot, "plan.json"),
      `${JSON.stringify(plan, null, 2)}\n`,
    ),
    writeFile(
      path.join(probeRoot, "delivery.json"),
      `${JSON.stringify(delivery, null, 2)}\n`,
    ),
    writeFile(
      path.join(probeRoot, "review.json"),
      `${JSON.stringify(review, null, 2)}\n`,
    ),
  ]);
  const outcomes = [];
  const failures = [];
  for (const name of [
    "incident",
    "incident-pending",
    "detached-boundary",
    "retry-history",
    "coherent",
  ]) {
    const fixture = JSON.parse(
      await readFile(path.join(fixtureRoot, `${name}.json`), "utf8"),
    );
    const cases = (fixture.divergentFields ?? [null]).map((field) => ({
      ...fixture,
      id: field ? `${fixture.id}-${field}` : fixture.id,
      divergentField: field,
      detachedAttempt: field
        ? {
            ...fixture.canonicalAttempt,
            [field]: fixture.detachedAttempt[field],
          }
        : fixture.detachedAttempt,
    }));
    for (const current of cases) {
      const statePath = path.join(probeRoot, `${current.id}-state.json`);
      const telemetryPath = path.join(
        probeRoot,
        `${current.id}-telemetry.jsonl`,
      );
      await Promise.all([
        writeFile(statePath, `${JSON.stringify(stateFor(current), null, 2)}\n`),
        writeFile(telemetryPath, telemetryFor(current)),
      ]);
      let status = "accept";
      let output = "";
      try {
        const done = await exec(
          process.execPath,
          [
            "tools/harness.mjs",
            "delivery-check",
            "docs/exec-plans/probe/delivery.json",
            "--plan",
            "docs/exec-plans/probe/plan.json",
            "--state",
            `docs/exec-plans/probe/${current.id}-state.json`,
            "--review",
            "docs/exec-plans/probe/review.json",
            "--telemetry",
            `docs/exec-plans/probe/${current.id}-telemetry.jsonl`,
          ],
          {
            cwd: sandbox,
            env: {
              ...process.env,
              PATH: `${bin}${path.delimiter}${process.env.PATH}`,
            },
            timeout: 10000,
          },
        );
        output = done.stdout;
      } catch (error) {
        status = "reject";
        output = `${error.stdout ?? ""}${error.stderr ?? ""}`.replaceAll(
          sandbox,
          "<sandbox-root>",
        );
      }
      if (
        !expectedOutcome &&
        current.expected === "reject" &&
        status === "reject" &&
        !output.includes(rejectionSignature)
      )
        status = "wrong-reject";
      if (expectedOutcome) status = expectedOutcome(current, status);
      outcomes.push({ id: current.id, expected: current.expected, status });
      if (current.expected !== status) {
        failures.push(
          current.expected === "reject" && status === "accept"
            ? `${failureSignature}-${current.id}`
            : `ERR_DELIVERY_PACKET_CONSISTENCY_FALSE_POSITIVE ${current.id}\n${output}`,
        );
      }
    }
  }
  if (failures.length) {
    if (expectedOutcome)
      failures.unshift("ERR_DELIVERY_PACKET_CONSISTENCY_ORACLE_DECOY");
    process.stderr.write(
      `${failures.join("\n")} controls=${outcomes
        .filter(({ expected }) => expected === "accept")
        .map(({ id, status }) => `${id}:${status}`)
        .join(",")}\n`,
    );
    process.exitCode = 1;
  } else if (expectedOutcome) {
    process.stdout.write("delivery-packet-consistency-v1\n");
  } else {
    process.stdout.write(
      `${JSON.stringify({ version: 1, outcomes }, null, 2)}\n`,
    );
  }
} finally {
  await rm(sandbox, { recursive: true, force: true });
}
