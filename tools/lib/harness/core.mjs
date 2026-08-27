import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const sha = /^[0-9a-f]{40}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const assert = (ok, message) => {
  if (!ok) throw new Error(message);
};
export const kinds = new Set([
  "route",
  "requirements",
  "baseline",
  "contract",
  "tdd",
  "validation",
  "review",
  "failure-proof",
  "isolated-result",
  "conformance",
  "delivery",
  "telemetry-summary",
]);
export const materialSignals = [
  "newCapability",
  "publishingOrRelease",
  "externalEffects",
  "publicUrlOrDomain",
  "deploymentSemantics",
  "permissionsOrSecurity",
  "destructiveOrIrreversible",
  "externalAutomation",
  "publicContract",
  "materialAmbiguity",
];
const waveEvidenceKinds = new Set(["source-only", "discovery", "audit"]);
const productionDeltaKinds = new Set([
  "implementation",
  "behavior",
  "public-interface",
  "consumer",
]);

export function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => order(a, b))
        .map(([k, v]) => [k, stable(v)]),
    );
  return value;
}
export const digest = (value) =>
  createHash("sha256")
    .update(typeof value === "string" ? value : JSON.stringify(stable(value)))
    .digest("hex");
export function receipt(kind, payload, identity = {}) {
  assert(kinds.has(kind), `unknown receipt kind: ${kind}`);
  const body = stable({ version: 1, kind, ...identity, payload });
  return { ...body, digest: digest(body) };
}
export function verify(value, kind) {
  assert(value?.version === 1 && kinds.has(value.kind), "invalid receipt");
  if (kind) assert(value.kind === kind, `expected ${kind} receipt`);
  assert(digestPattern.test(value.digest ?? ""), "invalid receipt digest");
  const { digest: stored, ...body } = value;
  assert(digest(body) === stored, `${value.kind} receipt digest is stale`);
  return value;
}
function signals(value) {
  assert(value && typeof value === "object", "materialSignals are required");
  for (const name of materialSignals)
    assert(
      [true, false, "unknown"].includes(value[name]),
      `${name} must be true, false, or unknown`,
    );
  assert(
    Object.keys(value).every((name) => materialSignals.includes(name)),
    "unknown material signal",
  );
}

function uniqueStrings(values, label, { allowEmpty = false } = {}) {
  assert(Array.isArray(values), `${label} must be an array`);
  const normalized = values.map((value) => {
    assert(
      typeof value === "string" && value.trim() === value && value,
      `${label} must contain non-empty canonical strings`,
    );
    return value;
  });
  assert(allowEmpty || normalized.length, `${label} must not be empty`);
  assert(
    new Set(normalized).size === normalized.length,
    `duplicate ${label.slice(0, -1)}`,
  );
  return normalized.sort(order);
}

function normalizeClosedSets(value = []) {
  assert(Array.isArray(value), "closedSets must be an array");
  const normalized = value.map((item) => {
    assert(
      item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        item.id.trim() === item.id &&
        item.id,
      "closed-set id must be a non-empty canonical string",
    );
    return {
      id: item.id,
      members: uniqueStrings(item.members, "closed-set members"),
    };
  });
  assert(
    new Set(normalized.map(({ id }) => id)).size === normalized.length,
    "duplicate closed-set id",
  );
  return normalized.sort((a, b) => order(a.id, b.id));
}

function normalizeClosedSetEvidence(value = [], closurePaths = null) {
  assert(Array.isArray(value), "closedSetEvidence must be an array");
  const normalized = value.map((item) => {
    const [{ id, members }] = normalizeClosedSets([
      { id: item?.id, members: item?.members },
    ]);
    assert(Array.isArray(item.covered), `covered members are required: ${id}`);
    assert(
      Array.isArray(item.excluded),
      `excluded members are required: ${id}`,
    );
    const declared = new Set(members);
    const covered = item.covered.map((entry) => {
      assert(
        entry && typeof entry.member === "string" && declared.has(entry.member),
        `undeclared closed-set member: ${id}: ${entry?.member ?? "<missing>"}`,
      );
      const evidence = uniqueStrings(entry.evidence, "evidence paths");
      if (closurePaths)
        assert(
          evidence.every((name) => closurePaths.has(name)),
          `closed-set evidence must be in validation input closure: ${id}: ${entry.member}`,
        );
      return { member: entry.member, evidence };
    });
    const excluded = item.excluded.map((entry) => {
      assert(
        entry && typeof entry.member === "string" && declared.has(entry.member),
        `undeclared closed-set member: ${id}: ${entry?.member ?? "<missing>"}`,
      );
      assert(
        typeof entry.reason === "string" &&
          entry.reason.trim() === entry.reason &&
          entry.reason,
        `closed-set exclusion reason is required: ${id}: ${entry.member}`,
      );
      return { member: entry.member, reason: entry.reason };
    });
    const coveredMembers = covered.map(({ member }) => member);
    const excludedMembers = excluded.map(({ member }) => member);
    assert(
      new Set(coveredMembers).size === coveredMembers.length,
      `duplicate covered closed-set member: ${id}`,
    );
    assert(
      new Set(excludedMembers).size === excludedMembers.length,
      `duplicate excluded closed-set member: ${id}`,
    );
    const overlap = coveredMembers.filter((member) =>
      excludedMembers.includes(member),
    );
    assert(
      !overlap.length,
      `closed-set members are covered and excluded: ${id}: ${overlap.join(", ")}`,
    );
    const accounted = new Set([...coveredMembers, ...excludedMembers]);
    const missing = members.filter((member) => !accounted.has(member));
    assert(
      !missing.length,
      `unaccounted closed-set members: ${id}: ${missing.join(", ")}`,
    );
    return {
      id,
      members,
      covered: covered.sort((a, b) => order(a.member, b.member)),
      excluded: excluded.sort((a, b) => order(a.member, b.member)),
    };
  });
  assert(
    new Set(normalized.map(({ id }) => id)).size === normalized.length,
    "duplicate closed-set evidence id",
  );
  return normalized.sort((a, b) => order(a.id, b.id));
}

export function assertClosedSetProof(closedSets = [], validationReceipts = []) {
  const declarations = normalizeClosedSets(closedSets);
  const evidence = validationReceipts.flatMap((item) => {
    verify(item, "validation");
    return normalizeClosedSetEvidence(item.payload.closedSetEvidence ?? []);
  });
  for (const declaration of declarations) {
    const expected = JSON.stringify(declaration.members);
    const matches = evidence.filter(
      (item) =>
        item.id === declaration.id && JSON.stringify(item.members) === expected,
    );
    assert(matches.length, `missing closed-set validation: ${declaration.id}`);
  }
}

function classifyWave(value) {
  if (value === undefined) return undefined;
  assert(value && typeof value === "object", "wave assessment is required");
  assert(
    Number.isInteger(value.number) && value.number > 0,
    "wave number must be a positive integer",
  );
  const risk = value.evidenceRisk ?? {};
  assert(
    risk &&
      typeof risk === "object" &&
      Object.keys(risk).every((name) =>
        ["testFirst", "independentReview"].includes(name),
      ) &&
      Object.values(risk).every((flag) => typeof flag === "boolean"),
    "wave evidence risk must contain only boolean testFirst and independentReview flags",
  );
  const evidenceRisk = {
    testFirst: risk.testFirst === true,
    independentReview: risk.independentReview === true,
  };
  if (value.expectedProductionDelta != null) {
    assert(
      !value.evidenceKind,
      "evidence-only wave cannot declare a production delta",
    );
    assert(
      typeof value.expectedProductionDelta === "object" &&
        productionDeltaKinds.has(value.expectedProductionDelta.kind) &&
        typeof value.expectedProductionDelta.description === "string" &&
        value.expectedProductionDelta.description.trim(),
      "numbered product wave requires an expected production delta",
    );
    return {
      number: value.number,
      workKind: "product",
      evidenceKind: null,
      expectedProductionDelta: {
        kind: value.expectedProductionDelta.kind,
        description: value.expectedProductionDelta.description.trim(),
      },
      evidenceRisk,
      executionPath: "product",
      heavyExecution: true,
      roadmapAdvance: true,
    };
  }
  assert(
    waveEvidenceKinds.has(value.evidenceKind),
    "wave requires an evidence kind or expected production delta",
  );
  return {
    number: value.number,
    workKind: value.evidenceKind,
    evidenceKind: value.evidenceKind,
    expectedProductionDelta: null,
    evidenceRisk,
    executionPath: "bounded-evidence",
    heavyExecution: false,
    roadmapAdvance: false,
  };
}

function assertWaveReceipt(value) {
  if (value === undefined) return;
  assert(
    JSON.stringify(stable(value)) ===
      JSON.stringify(stable(classifyWave(value))),
    "route receipt has an invalid wave execution classification",
  );
}

export function route(assessment) {
  assert(
    assessment?.version === 1 && assessment.intent,
    "invalid route assessment",
  );
  signals(assessment.materialSignals);
  const material = materialSignals.filter(
    (name) => assessment.materialSignals[name] === true,
  );
  const unknown = materialSignals.filter(
    (name) => assessment.materialSignals[name] === "unknown",
  );
  const wave = classifyWave(assessment.wave);
  const waveRisk =
    wave?.evidenceRisk.testFirst || wave?.evidenceRisk.independentReview;
  const expected =
    material.length || unknown.length || wave || waveRisk
      ? "open-spec"
      : "direct";
  assert(assessment.route === expected, `route must be ${expected}`);
  if (expected === "open-spec") {
    assert(
      assessment.openSpecChange,
      "material route requires OpenSpec change",
    );
    assert(
      Array.isArray(assessment.requiredDecisions),
      "material route requires decisions",
    );
  }
  return receipt("route", {
    intent: assessment.intent,
    route: expected,
    openSpecChange: assessment.openSpecChange,
    requiredDecisions: assessment.requiredDecisions ?? [],
    materialSignals: assessment.materialSignals,
    material,
    unknown,
    wave,
  });
}
export function requirements(routeReceipt, state) {
  verify(routeReceipt, "route");
  assert(
    routeReceipt.payload.route === "open-spec",
    "requirements are only for material work",
  );
  assert(
    state?.version === 1 &&
      state.route === "open-spec" &&
      state.intent === routeReceipt.payload.intent,
    "requirements state differs from route",
  );
  assert(
    state.openSpec?.change === routeReceipt.payload.openSpecChange &&
      state.openSpec.status === "synthesized",
    "OpenSpec synthesis is incomplete",
  );
  assert(
    ["approved", "pre-authorized"].includes(state.authorization?.status),
    "authorization is missing",
  );
  const decisions = new Map(
    (state.decisions ?? []).map((item) => [item.id, item]),
  );
  for (const expected of routeReceipt.payload.requiredDecisions) {
    const actual = decisions.get(expected.id);
    assert(
      actual &&
        actual.owner === expected.owner &&
        actual.blocking === expected.blocking,
      `decision is missing or mismatched: ${expected.id}`,
    );
  }
  const unresolved = [...decisions.values()].filter(
    (item) => item.blocking && !["resolved", "delegated"].includes(item.status),
  );
  assert(
    !unresolved.length,
    `unresolved decisions: ${unresolved.map(({ id }) => id).join(", ")}`,
  );
  return receipt(
    "requirements",
    {
      intent: state.intent,
      revision: state.revision,
      change: state.openSpec.change,
      authorization: state.authorization.status,
      decisions: [...decisions.values()].map(
        ({ id, owner, status, blocking }) => ({ id, owner, status, blocking }),
      ),
    },
    { routeDigest: routeReceipt.digest },
  );
}

async function run(binary, args, cwd) {
  return (
    await exec(binary, args, { cwd, maxBuffer: 10 * 1024 * 1024 })
  ).stdout.trim();
}
async function git(cwd, ...args) {
  return run("git", args, cwd);
}
async function gh(cwd, url) {
  return JSON.parse(
    await run(
      "gh",
      [
        "pr",
        "view",
        url,
        "--json",
        "url,state,isDraft,headRefName,headRefOid,baseRefName",
      ],
      cwd,
    ),
  );
}
export async function repository(repoRoot) {
  const root = path.resolve(
    await git(repoRoot, "rev-parse", "--show-toplevel"),
  );
  const remote = await git(repoRoot, "remote", "get-url", "origin");
  return { root, remote, digest: digest({ root, remote }) };
}
export async function baseline({
  repoRoot,
  routeReceipt,
  requirementsReceipt,
  defaultBranch = "main",
  pullRequestUrl,
}) {
  verify(routeReceipt, "route");
  assertWaveReceipt(routeReceipt.payload.wave);
  if (routeReceipt.payload.route === "open-spec") {
    verify(requirementsReceipt, "requirements");
    assert(
      requirementsReceipt.routeDigest === routeReceipt.digest,
      "requirements belong to another route",
    );
  }
  assert(
    !(await git(repoRoot, "status", "--porcelain")),
    "baseline requires clean worktree",
  );
  const branch = await git(repoRoot, "branch", "--show-current");
  assert(branch && branch !== defaultBranch, "baseline requires task branch");
  const commit = await git(repoRoot, "rev-parse", "HEAD");
  const upstream = await git(
    repoRoot,
    "rev-parse",
    "--abbrev-ref",
    "@{upstream}",
  );
  assert(
    (await git(repoRoot, "rev-parse", "@{upstream}")) === commit,
    "upstream differs from local head",
  );
  let pullRequest = null;
  if (pullRequestUrl) {
    pullRequest = await gh(repoRoot, pullRequestUrl);
    assert(
      pullRequest.state === "OPEN" &&
        pullRequest.headRefName === branch &&
        pullRequest.headRefOid === commit &&
        pullRequest.baseRefName === defaultBranch,
      "pull-request baseline differs",
    );
  } else
    assert(
      commit === (await git(repoRoot, "rev-parse", `origin/${defaultBranch}`)),
      "new branch does not start at current default head",
    );
  return receipt(
    "baseline",
    {
      repository: await repository(repoRoot),
      branch,
      upstream,
      commit,
      defaultBranch,
      pullRequest,
    },
    {
      routeDigest: routeReceipt.digest,
      requirementsDigest: requirementsReceipt?.digest,
    },
  );
}

async function markdown(root) {
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(target);
      else if (entry.name.endsWith(".md")) out.push(target);
    }
  }
  await walk(root);
  return out.sort(order);
}
export async function contract(changeRoot) {
  const root = path.join(changeRoot, "specs");
  const scenarios = [];
  for (const file of await markdown(root)) {
    const capability = path
      .relative(root, path.dirname(file))
      .split(path.sep)
      .join("/");
    const lines = (await readFile(file, "utf8")).split(/\r?\n/);
    let requirement;
    let requirementContent;
    for (let i = 0; i < lines.length; i += 1) {
      const requirementMatch = lines[i].match(/^### Requirement:\s*(.+)$/);
      if (requirementMatch) {
        requirement = requirementMatch[1];
        const body = [];
        for (
          let j = i + 1;
          j < lines.length && !/^#### Scenario:/.test(lines[j]);
          j += 1
        )
          body.push(lines[j].trimEnd());
        requirementContent = body.join("\n").trim();
      }
      const name = lines[i].match(/^#### Scenario:\s*(.+)$/)?.[1];
      if (!name) continue;
      const body = [];
      for (
        let j = i + 1;
        j < lines.length && !/^#{3,4}\s/.test(lines[j]);
        j += 1
      )
        if (
          !/^<!-- (implementation-semantics|validation-impact):/.test(lines[j])
        )
          body.push(lines[j].trimEnd());
      const content = body.join("\n").trim();
      assert(
        requirement &&
          /- \*\*WHEN\*\*/.test(content) &&
          /- \*\*THEN\*\*/.test(content),
        `invalid scenario: ${name}`,
      );
      scenarios.push({
        id: `${capability}::${requirement}::${name}`,
        capability,
        requirement,
        requirementContent,
        name,
        content,
      });
    }
  }
  scenarios.sort((a, b) => order(a.id, b.id));
  assert(
    scenarios.length &&
      new Set(scenarios.map(({ id }) => id)).size === scenarios.length,
    "missing or duplicate scenarios",
  );
  const failureInvariants = scenarios
    .flatMap((scenario) =>
      [
        ...scenario.content.matchAll(
          /<!-- failure-invariant:\s*(\S+)\s+concern=(\S+)\s*-->/g,
        ),
      ].map(([, id, concern]) => ({ id, concern, scenarioId: scenario.id })),
    )
    .sort((a, b) => order(a.id, b.id));
  assert(
    new Set(failureInvariants.map(({ id }) => id)).size ===
      failureInvariants.length,
    "failure invariant identities are duplicated",
  );
  return receipt("contract", {
    scenarios,
    failureInvariants,
    contractDigest: digest({ scenarios, failureInvariants }),
  });
}

export async function command(argv, cwd) {
  assert(Array.isArray(argv) && argv.length, "command is required");
  try {
    const { stdout, stderr } = await exec(argv[0], argv.slice(1), {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      outcome: "pass",
      code: 0,
      stdoutDigest: digest(stdout),
      stderrDigest: digest(stderr),
    };
  } catch (error) {
    return {
      outcome: "fail",
      code: Number.isInteger(error.code) ? error.code : 1,
      stdoutDigest: digest(error.stdout ?? ""),
      stderrDigest: digest(error.stderr ?? ""),
    };
  }
}
export async function tdd({
  contractReceipt,
  baselineReceipt,
  candidateHead,
  oracle,
  cwd,
}) {
  verify(contractReceipt, "contract");
  verify(baselineReceipt, "baseline");
  assert(sha.test(candidateHead), "invalid candidate head");
  assert(
    (await git(cwd, "rev-parse", "HEAD")) === candidateHead,
    "TDD candidate differs from checked-out Git head",
  );
  assert(
    Array.isArray(oracle?.command) &&
      oracle.command.includes("{target}") &&
      oracle.redTarget?.kind === "known-bad-adapter" &&
      typeof oracle.redTarget.path === "string" &&
      oracle.greenTarget?.kind === "candidate" &&
      oracle.greenTarget.commit === candidateHead,
    "one symmetric oracle command and RED/GREEN targets are required",
  );
  const knownBadPath = path.resolve(cwd, oracle.redTarget.path);
  const knownBadDigest = digest(await readFile(knownBadPath));
  const invoke = (target) =>
    oracle.command.map((part) => (part === "{target}" ? target : part));
  const red = await command(invoke(knownBadPath), cwd);
  const green = await command(invoke(cwd), cwd);
  assert(red.outcome === "fail", "RED did not reject known-bad behavior");
  assert(green.outcome === "pass", "GREEN did not accept candidate");
  return receipt(
    "tdd",
    {
      candidateHead,
      contractDigest: contractReceipt.payload.contractDigest,
      baselineCommit: baselineReceipt.payload.commit,
      oracleDigest: digest({
        command: oracle.command,
        shared: oracle.shared ?? {},
        redTarget: { ...oracle.redTarget, digest: knownBadDigest },
        greenTarget: oracle.greenTarget,
      }),
      red,
      green,
    },
    {
      contractReceiptDigest: contractReceipt.digest,
      baselineReceiptDigest: baselineReceipt.digest,
    },
  );
}

async function files(repoRoot, names) {
  assert(
    Array.isArray(names) && names.every((name) => typeof name === "string"),
    "files must be strings",
  );
  return Promise.all(
    [...new Set(names)].sort(order).map(async (name) => {
      const target = path.resolve(repoRoot, name);
      assert(
        target.startsWith(`${path.resolve(repoRoot)}${path.sep}`),
        `path escapes repository: ${name}`,
      );
      const data = await readFile(target);
      return {
        path: name.split(path.sep).join("/"),
        bytes: data.byteLength,
        digest: createHash("sha256").update(data).digest("hex"),
      };
    }),
  );
}
export async function validation({
  repoRoot,
  routeReceipt,
  contractReceipt,
  candidateHead,
  target,
  argv,
  inputs,
  productionDelta = null,
  outcomeEvidence = [],
  closedSetEvidence = [],
  priorReceipt,
  cwd = repoRoot,
}) {
  verify(contractReceipt, "contract");
  if (routeReceipt) verify(routeReceipt, "route");
  assert(sha.test(candidateHead), "invalid candidate head");
  assert(
    (await git(repoRoot, "rev-parse", "HEAD")) === candidateHead,
    "validation candidate differs from checked-out Git head",
  );
  const closure = await files(repoRoot, inputs);
  const closurePaths = new Set(closure.map(({ path: name }) => name));
  const normalizedClosedSetEvidence = normalizeClosedSetEvidence(
    closedSetEvidence,
    closurePaths,
  );
  const closureDigest = digest({
    target,
    argv,
    closure,
    productionDelta,
    outcomeEvidence,
    closedSetEvidence: normalizedClosedSetEvidence,
    routeDigest: routeReceipt?.digest ?? null,
    contractDigest: contractReceipt.payload.contractDigest,
  });
  if (productionDelta !== null)
    assert(
      typeof productionDelta === "object" &&
        productionDeltaKinds.has(productionDelta.kind) &&
        typeof productionDelta.description === "string" &&
        productionDelta.description.trim() === productionDelta.description &&
        productionDelta.description,
      "validation production delta is invalid",
    );
  if (productionDelta !== null)
    assertProductionOutcomeEligible(routeReceipt, productionDelta);
  assert(
    Array.isArray(outcomeEvidence) &&
      outcomeEvidence.every((name) => typeof name === "string"),
    "validation outcome evidence must be paths",
  );
  if (productionDelta !== null)
    assert(
      outcomeEvidence.length > 0 &&
        outcomeEvidence.every((name) => closurePaths.has(name)),
      "production validation requires outcome evidence in its input closure",
    );
  if (priorReceipt) {
    verify(priorReceipt, "validation");
    assert(
      priorReceipt.payload.candidateHead === candidateHead &&
        priorReceipt.contractReceiptDigest === contractReceipt.digest &&
        priorReceipt.payload.closureDigest === closureDigest &&
        priorReceipt.payload.outcome === "pass",
      "validation receipt cannot be reused",
    );
    return receipt(
      "validation",
      { ...priorReceipt.payload, reusedFrom: priorReceipt.digest },
      { contractReceiptDigest: contractReceipt.digest },
    );
  }
  const result = await command(argv, cwd);
  assert(result.outcome === "pass", `validation failed: ${target}`);
  const productionOutcomeProof =
    productionDelta === null
      ? null
      : {
          productionDelta,
          routeDigest: routeReceipt.digest,
          candidateHead,
          target,
          argv,
          closureDigest,
          outcomeEvidence: [...new Set(outcomeEvidence)].sort(order),
          resultDigest: digest(result),
        };
  return receipt(
    "validation",
    {
      candidateHead,
      contractDigest: contractReceipt.payload.contractDigest,
      target,
      argv,
      productionDelta,
      productionOutcomeProof,
      closedSetEvidence: normalizedClosedSetEvidence,
      closure,
      closureDigest,
      outcome: "pass",
      result,
    },
    { contractReceiptDigest: contractReceipt.digest },
  );
}

export function assertProductionDeltaProof(
  wave,
  validationReceipts,
  routeDigest,
) {
  if (!wave?.roadmapAdvance) return;
  assert(
    validationReceipts.some(({ payload }) => {
      const proof = payload.productionOutcomeProof;
      return (
        proof &&
        proof.routeDigest === routeDigest &&
        digest(proof.productionDelta) ===
          digest(wave.expectedProductionDelta) &&
        proof.candidateHead === payload.candidateHead &&
        proof.target === payload.target &&
        digest(proof.argv) === digest(payload.argv) &&
        proof.closureDigest === payload.closureDigest &&
        Array.isArray(proof.outcomeEvidence) &&
        proof.outcomeEvidence.length > 0 &&
        proof.outcomeEvidence.every((name) =>
          payload.closure.some(({ path: closurePath }) => closurePath === name),
        ) &&
        proof.resultDigest === digest(payload.result)
      );
    }),
    "roadmap advancement requires candidate/runtime-bound production outcome proof",
  );
}

export function assertProductionOutcomeEligible(routeReceipt, productionDelta) {
  verify(routeReceipt, "route");
  assert(
    routeReceipt.payload.wave?.roadmapAdvance === true &&
      digest(routeReceipt.payload.wave.expectedProductionDelta) ===
        digest(productionDelta),
    "production outcome proof requires its roadmap-eligible route delta",
  );
}

export function assertIsolatedExecutionAllowed(dependencies) {
  const routes = dependencies.filter(({ kind }) => kind === "route");
  assert(routes.length === 1, "isolated execution requires one route receipt");
  verify(routes[0], "route");
  assert(
    routes[0].payload.wave?.executionPath !== "bounded-evidence",
    "bounded evidence must execute inline",
  );
}
export function review({ contractReceipt, candidateHead, standards, spec }) {
  verify(contractReceipt, "contract");
  assert(sha.test(candidateHead), "invalid candidate head");
  for (const [axis, value] of Object.entries({ standards, spec }))
    assert(
      value?.outcome === "pass" &&
        value.runtimeId &&
        value.runtimeSource === "codex-exec-jsonl" &&
        value.candidateHead === candidateHead &&
        value.contractDigest === contractReceipt.payload.contractDigest,
      `${axis} review is incomplete or stale`,
    );
  assert(
    standards.runtimeId !== spec.runtimeId,
    "review axes require distinct runtime identities",
  );
  return receipt(
    "review",
    {
      candidateHead,
      contractDigest: contractReceipt.payload.contractDigest,
      standards,
      spec,
    },
    { contractReceiptDigest: contractReceipt.digest },
  );
}
export async function failureProof({
  contractReceipt,
  candidateHead,
  oracle,
  cwd,
}) {
  verify(contractReceipt, "contract");
  assert(sha.test(candidateHead), "invalid candidate head");
  assert(
    (await git(cwd, "rev-parse", "HEAD")) === candidateHead,
    "failure-proof candidate differs from checked-out Git head",
  );
  const expected = new Set(
    contractReceipt.payload.failureInvariants.map(({ id }) => id),
  );
  assert(expected.size, "failure invariants are required");
  assert(
    Array.isArray(oracle?.command) &&
      oracle.command.includes("{target}") &&
      oracle.command.includes("{invariant}") &&
      typeof oracle.knownBadAdapter === "string",
    "failure proof requires one executable candidate/known-bad oracle",
  );
  const knownBadPath = path.resolve(cwd, oracle.knownBadAdapter);
  const knownBadDigest = digest(await readFile(knownBadPath));
  const invoke = (target, invariant) =>
    oracle.command.map((part) =>
      part === "{target}" ? target : part === "{invariant}" ? invariant : part,
    );
  const results = [];
  for (const id of [...expected].sort(order)) {
    const candidate = await command(invoke(cwd, id), cwd);
    const knownBad = await command(invoke(knownBadPath, id), cwd);
    assert(
      candidate.outcome === "pass" && knownBad.outcome === "fail",
      `non-discriminating invariant: ${id}`,
    );
    results.push({ id, candidate, knownBad });
  }
  return receipt(
    "failure-proof",
    {
      candidateHead,
      contractDigest: contractReceipt.payload.contractDigest,
      invariants: [...expected].sort(order),
      results: stable(results),
      oracleDigest: digest({
        command: oracle.command,
        knownBadAdapter: oracle.knownBadAdapter,
        knownBadDigest,
      }),
      outcome: "pass",
    },
    { contractReceiptDigest: contractReceipt.digest },
  );
}
export async function sourceManifest(repoRoot, sources, byteBudget = null) {
  const contributors = await files(repoRoot, sources);
  const bytes = contributors.reduce((total, item) => total + item.bytes, 0);
  assert(
    byteBudget === null || (Number.isInteger(byteBudget) && byteBudget > 0),
    "byte budget must be positive",
  );
  const body = stable({ contributors, bytes, byteBudget });
  return {
    ...body,
    digest: digest(body),
    allowed: byteBudget === null || bytes <= byteBudget,
  };
}
export function telemetry(runtime = {}, observations = {}) {
  const metric = (name) =>
    Number.isFinite(runtime[name]) ? runtime[name] : "unavailable";
  return receipt("telemetry-summary", {
    inputTokens: metric("inputTokens"),
    cachedInputTokens: metric("cachedInputTokens"),
    outputTokens: metric("outputTokens"),
    peakActiveContext: metric("peakActiveContext"),
    observations: stable(observations),
  });
}
export async function conformance({
  repoRoot,
  routeReceipt,
  baselineReceipt,
  discovered,
}) {
  verify(routeReceipt, "route");
  verify(baselineReceipt, "baseline");
  assert(
    baselineReceipt.routeDigest === routeReceipt.digest,
    "baseline belongs to another route",
  );
  signals(discovered?.materialSignals);
  const closedSets = normalizeClosedSets(discovered.closedSets ?? []);
  const raw = await git(
    repoRoot,
    "diff",
    "--name-only",
    `${baselineReceipt.payload.commit}...HEAD`,
  );
  const excluded = (name) => name.startsWith("docs/exec-plans/active/");
  const actual = raw
    ? raw
        .split("\n")
        .filter((name) => !excluded(name))
        .sort(order)
    : [];
  const declared = [...new Set(discovered.changedFiles)]
    .filter((name) => !excluded(name))
    .sort(order);
  assert(
    JSON.stringify(actual) === JSON.stringify(declared),
    "discovered and actual surfaces differ",
  );
  if (routeReceipt.payload.route === "direct")
    assert(
      materialSignals.every(
        (name) => discovered.materialSignals[name] === false,
      ),
      "direct route discovered material or unknown impact",
    );
  return receipt(
    "conformance",
    {
      candidateHead: await git(repoRoot, "rev-parse", "HEAD"),
      actual,
      closedSets,
      materialSignals: discovered.materialSignals,
      outcome: "pass",
    },
    {
      routeReceiptDigest: routeReceipt.digest,
      baselineReceiptDigest: baselineReceipt.digest,
    },
  );
}
export async function delivery({
  repoRoot,
  routeReceipt,
  requirementsReceipt,
  baselineReceipt,
  contractReceipt,
  tddReceipt,
  validationReceipts,
  reviewReceipt,
  failureProofReceipt,
  conformanceReceipt,
  pullRequestUrl,
}) {
  verify(routeReceipt, "route");
  verify(baselineReceipt, "baseline");
  verify(conformanceReceipt, "conformance");
  const head = await git(repoRoot, "rev-parse", "HEAD");
  const branch = await git(repoRoot, "branch", "--show-current");
  const upstream = await git(repoRoot, "rev-parse", "@{upstream}");
  const pr = await gh(repoRoot, pullRequestUrl);
  assert(
    pr.state === "OPEN" &&
      pr.headRefName === branch &&
      pr.headRefOid === head &&
      upstream === head &&
      pr.baseRefName === baselineReceipt.payload.defaultBranch,
    "delivery Git/PR identity differs",
  );
  assert(
    conformanceReceipt.payload.candidateHead === head,
    "conformance candidate differs",
  );
  assert(
    conformanceReceipt.routeReceiptDigest === routeReceipt.digest &&
      conformanceReceipt.baselineReceiptDigest === baselineReceipt.digest &&
      baselineReceipt.payload.branch === branch &&
      baselineReceipt.payload.upstream ===
        (await git(repoRoot, "rev-parse", "--abbrev-ref", "@{upstream}")),
    "baseline, conformance, branch, or upstream receipt chain differs",
  );
  if (routeReceipt.payload.route === "open-spec") {
    verify(requirementsReceipt, "requirements");
    verify(contractReceipt, "contract");
    assert(
      requirementsReceipt.routeDigest === routeReceipt.digest &&
        baselineReceipt.routeDigest === routeReceipt.digest &&
        baselineReceipt.requirementsDigest === requirementsReceipt.digest,
      "route, requirements, and baseline receipt chain differs",
    );
    const wave = routeReceipt.payload.wave;
    const tddRequired =
      wave?.heavyExecution !== false || wave.evidenceRisk.testFirst;
    const reviewRequired =
      wave?.heavyExecution !== false ||
      routeReceipt.payload.material.length > 0 ||
      wave.evidenceRisk.independentReview;
    if (tddRequired) {
      verify(tddReceipt, "tdd");
      assert(
        tddReceipt.payload.candidateHead === head &&
          tddReceipt.contractReceiptDigest === contractReceipt.digest,
        "TDD candidate or contract differs",
      );
    }
    if (reviewRequired) {
      verify(reviewReceipt, "review");
      assert(
        reviewReceipt.payload.candidateHead === head &&
          reviewReceipt.contractReceiptDigest === contractReceipt.digest,
        "review candidate or contract differs",
      );
    }
    if (contractReceipt.payload.failureInvariants.length) {
      verify(failureProofReceipt, "failure-proof");
      assert(
        failureProofReceipt.payload.candidateHead === head &&
          failureProofReceipt.contractReceiptDigest === contractReceipt.digest,
        "failure proof candidate or contract differs",
      );
    }
  }
  assert(validationReceipts?.length, "delivery requires validation");
  for (const item of validationReceipts) {
    verify(item, "validation");
    assert(
      item.payload.candidateHead === head && item.payload.outcome === "pass",
      "validation candidate differs",
    );
    assert(
      routeReceipt.payload.route === "direct" ||
        item.contractReceiptDigest === contractReceipt.digest,
      "validation contract differs",
    );
  }
  assertProductionDeltaProof(
    routeReceipt.payload.wave,
    validationReceipts,
    routeReceipt.digest,
  );
  assertClosedSetProof(
    conformanceReceipt.payload.closedSets ?? [],
    validationReceipts,
  );
  const repo = await repository(repoRoot);
  assert(
    repo.digest === baselineReceipt.payload.repository.digest,
    "delivery repository differs",
  );
  return receipt("delivery", {
    repository: repo,
    branch,
    upstream,
    pullRequest: pr,
    candidateHead: head,
    receiptDigests: [
      routeReceipt,
      requirementsReceipt,
      baselineReceipt,
      contractReceipt,
      tddReceipt,
      ...validationReceipts,
      reviewReceipt,
      failureProofReceipt,
      conformanceReceipt,
    ]
      .filter(Boolean)
      .map(({ digest }) => digest),
    outcome: "pass",
  });
}
export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}
