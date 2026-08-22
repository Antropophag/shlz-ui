import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const modes = new Set([
  "continue",
  "fresh-session",
  "isolated-subagent",
  "parallelizable-subagent",
]);
const eventTypes = new Set([
  "command",
  "context-read",
  "validation",
  "review",
  "scope-addition",
  "remediation",
  "usage",
]);
const requiredPacketFields = [
  "id",
  "objective",
  "scope",
  "nonGoals",
  "dependencies",
  "contracts",
  "contextSources",
  "implementationSurface",
  "focusedValidation",
  "outputs",
  "handoff",
  "implementationOutcomes",
  "preferredExecutionMode",
];

export const readJson = async (file) =>
  JSON.parse(await readFile(file, "utf8"));
export const writeJson = async (file, value) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
};

export function classify(assessment, config) {
  const contributions = {};
  let score = 0;
  for (const [name, weight] of Object.entries(config.sizing.weights)) {
    const value = assessment.signals?.[name];
    if (!Number.isInteger(value) || value < 0)
      throw new Error(`signal ${name} must be a non-negative integer`);
    contributions[name] = value * weight;
    score += contributions[name];
  }
  const bands = Object.entries(config.sizing.bands).sort((a, b) => a[1] - b[1]);
  let size = bands[0][0];
  for (const [candidate, minimum] of bands)
    if (score >= minimum) size = candidate;
  return {
    size,
    score,
    contributions,
    kind: "routing-heuristic-not-token-forecast",
  };
}

function assertAcyclic(packets) {
  const byId = new Map(packets.map((packet) => [packet.id, packet]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`packet dependency cycle at ${id}`);
    if (visited.has(id)) return;
    const packet = byId.get(id);
    if (!packet) throw new Error(`unknown packet dependency ${id}`);
    visiting.add(id);
    for (const dependency of packet.dependencies) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
}

export function validatePlan(plan, config) {
  if (!plan.id || !Array.isArray(plan.packets) || plan.packets.length === 0)
    throw new Error("plan requires id and packets");
  const ids = new Set();
  for (const packet of plan.packets) {
    for (const field of requiredPacketFields)
      if (!(field in packet))
        throw new Error(`packet ${packet.id ?? "?"} missing ${field}`);
    if (ids.has(packet.id)) throw new Error(`duplicate packet ${packet.id}`);
    ids.add(packet.id);
    for (const field of [
      "scope",
      "nonGoals",
      "dependencies",
      "contracts",
      "contextSources",
      "implementationSurface",
      "focusedValidation",
      "outputs",
      "handoff",
      "implementationOutcomes",
    ])
      if (!Array.isArray(packet[field]))
        throw new Error(`packet ${packet.id} ${field} must be an array`);
    if (!modes.has(packet.preferredExecutionMode))
      throw new Error(`packet ${packet.id} has invalid execution mode`);
    if (
      config.sizing.decompositionRequired.includes(plan.classification.size) &&
      (packet.implementationOutcomes.length < 3 ||
        packet.implementationOutcomes.length > 7)
    )
      throw new Error(
        `packet ${packet.id} requires 3-7 implementation outcomes`,
      );
  }
  assertAcyclic(plan.packets);
  if (
    config.sizing.decompositionRequired.includes(plan.classification.size) &&
    plan.packets.length < 2
  )
    throw new Error(`${plan.classification.size} work requires decomposition`);
  return plan;
}

export function createPlan(assessment, config) {
  if (
    !assessment.id ||
    !Array.isArray(assessment.workUnits) ||
    assessment.workUnits.length === 0
  )
    throw new Error("assessment requires id and semantic workUnits");
  const classification = classify(assessment, config);
  const regroupRequired =
    (assessment.openSpecTaskCount ?? 0) > config.sizing.taskRegroupThreshold ||
    assessment.signals.independentWorkUnits > 1 ||
    assessment.signals.sharedSeams > 0;
  const plan = {
    version: 1,
    id: assessment.id,
    baseline: assessment.baseline ?? null,
    classification,
    regroupCheck: {
      required: regroupRequired,
      openSpecTaskCount: assessment.openSpecTaskCount ?? null,
    },
    contextPolicy: config.context,
    packets: assessment.workUnits.map((workUnit) => {
      const packet = { ...workUnit };
      delete packet.group;
      return { ...packet, status: "pending" };
    }),
  };
  return validatePlan(plan, config);
}

function expandBraces(pattern) {
  const match = pattern.match(/\{([^{}]+)\}/);
  if (!match) return [pattern];
  return match[1]
    .split(",")
    .flatMap((choice) =>
      expandBraces(
        `${pattern.slice(0, match.index)}${choice}${pattern.slice(match.index + match[0].length)}`,
      ),
    );
}
function globRegex(pattern) {
  let source = "";
  for (let index = 0; index < pattern.length; index++) {
    if (pattern.slice(index, index + 3) === "**/") {
      source += "(?:.*/)?";
      index += 2;
    } else if (pattern.slice(index, index + 2) === "**") {
      source += ".*";
      index += 1;
    } else if (pattern[index] === "*") source += "[^/]*";
    else source += pattern[index].replace(/[.+^$()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}
export function matchesPattern(file, pattern) {
  return expandBraces(pattern).some((expanded) =>
    globRegex(expanded).test(file),
  );
}

async function walk(root, directory = "") {
  const absolute = path.join(root, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, relative)));
    else files.push(relative);
  }
  return files;
}

export async function contextIndex(plan, packetId, repoRoot, state = null) {
  validatePlan(plan, { sizing: { decompositionRequired: [] } });
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet) throw new Error(`unknown packet ${packetId}`);
  const allFiles = await walk(repoRoot);
  const sources = [
    ...new Set(
      packet.contextSources.flatMap((pattern) =>
        allFiles.filter((file) => matchesPattern(file, pattern)),
      ),
    ),
  ].sort();
  const missingPatterns = packet.contextSources.filter(
    (pattern) => !allFiles.some((file) => matchesPattern(file, pattern)),
  );
  const dependencyHandoffs = state?.handoffs
    ? packet.dependencies.map((id) => state.handoffs[id]).filter(Boolean)
    : state?.completedPacket &&
        packet.dependencies.includes(state.completedPacket)
      ? [state]
      : [];
  return {
    packet,
    sources,
    missingPatterns,
    dependencyHandoffs,
    disclosure: "paths-and-current-handoff-only",
  };
}

export function readyPackets(plan, state = null) {
  const completed = new Set(
    state?.packets
      ? Object.entries(state.packets)
          .filter(([, value]) => value.status === "completed")
          .map(([id]) => id)
      : (state?.completedPackets ??
          (state?.completedPacket ? [state.completedPacket] : [])),
  );
  return plan.packets
    .filter(
      (packet) =>
        !completed.has(packet.id) &&
        (!state?.packets || state.packets[packet.id]?.status === "pending") &&
        packet.dependencies.every((id) => completed.has(id)),
    )
    .map(({ id, objective, preferredExecutionMode }) => ({
      id,
      objective,
      preferredExecutionMode,
    }));
}

export function validateHandoff(value, plan) {
  const allowed = [
    "completedPacket",
    "completedPackets",
    "changed",
    "provenChecks",
    "settledDecisions",
    "unresolvedFindings",
    "nextPacket",
    "invalidatedAssumptions",
  ];
  for (const key of Object.keys(value))
    if (!allowed.includes(key))
      throw new Error(`handoff field ${key} is not allowed`);
  for (const key of [
    "completedPacket",
    "changed",
    "provenChecks",
    "settledDecisions",
    "unresolvedFindings",
    "nextPacket",
    "invalidatedAssumptions",
  ])
    if (!(key in value)) throw new Error(`handoff missing ${key}`);
  if (!plan.packets.some(({ id }) => id === value.completedPacket))
    throw new Error("handoff completedPacket is unknown");
  if (
    value.completedPackets !== undefined &&
    (!Array.isArray(value.completedPackets) ||
      value.completedPackets.some(
        (id) => !plan.packets.some((packet) => packet.id === id),
      ))
  )
    throw new Error("handoff completedPackets must contain known packet ids");
  if (
    value.nextPacket !== null &&
    !plan.packets.some(({ id }) => id === value.nextPacket)
  )
    throw new Error("handoff nextPacket is unknown");
  for (const key of [
    "changed",
    "provenChecks",
    "settledDecisions",
    "unresolvedFindings",
    "invalidatedAssumptions",
  ])
    if (!Array.isArray(value[key]))
      throw new Error(`handoff ${key} must be an array`);
  return value;
}

export function createExecutionState(plan) {
  return {
    version: 1,
    planId: plan.id,
    packets: Object.fromEntries(
      plan.packets.map(({ id }) => [id, { status: "pending" }]),
    ),
    handoffs: {},
  };
}

export function claimPacket(plan, state, packetId, session) {
  if (!session) throw new Error("claim requires session");
  if (!readyPackets(plan, state).some(({ id }) => id === packetId))
    throw new Error(`packet ${packetId} is not ready or already claimed`);
  state.packets[packetId] = { status: "claimed", session };
  return state;
}

export function completePacket(plan, state, handoff) {
  validateHandoff(handoff, plan);
  const current = state.packets[handoff.completedPacket];
  if (current?.status !== "claimed")
    throw new Error(`packet ${handoff.completedPacket} must be claimed first`);
  state.packets[handoff.completedPacket] = {
    ...current,
    status: "completed",
  };
  state.handoffs[handoff.completedPacket] = handoff;
  return state;
}

export function affectedValidation(files, config) {
  const selected = new Set();
  for (const rule of config.validationRules)
    if (
      files.some((file) =>
        rule.patterns.some((pattern) => matchesPattern(file, pattern)),
      )
    )
      for (const target of rule.targets) selected.add(target);
  if (files.length > 0 && selected.size === 0) selected.add("full");
  return [...selected]
    .map((id) => ({ id, ...config.validationTargets[id] }))
    .sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
}

export function fingerprint(files, contentsByFile = {}) {
  const hash = createHash("sha256");
  for (const file of [...files].sort())
    hash.update(`${file}\0${contentsByFile[file] ?? ""}\0`);
  return hash.digest("hex");
}

export async function fingerprintFiles(files, repoRoot) {
  const contents = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => {
        const target = path.resolve(repoRoot, file);
        if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
          throw new Error(`validation file escapes repository: ${file}`);
        return [file, await readFile(target)];
      }),
    ),
  );
  return fingerprint(files, contents);
}

export function assertValidationRun(
  { target, currentFingerprint, reason },
  ledger,
  config,
) {
  const definition = config.validationTargets[target];
  if (!definition) throw new Error(`unknown validation target ${target}`);
  const duplicate = ledger.find(
    (entry) =>
      entry.target === target &&
      entry.fingerprint === currentFingerprint &&
      entry.outcome === "pass",
  );
  if (definition.expensive && duplicate && !reason)
    throw new Error(
      `expensive target ${target} already passed for this fingerprint; --reason is required`,
    );
}

export async function recordValidation(
  { target, files, outcome, reason, packet, session },
  ledger,
  config,
  repoRoot,
) {
  if (!files.length || !["pass", "fail"].includes(outcome))
    throw new Error("validation record requires files and pass/fail outcome");
  const currentFingerprint = await fingerprintFiles(files, repoRoot);
  assertValidationRun({ target, currentFingerprint, reason }, ledger, config);
  ledger.push({
    target,
    files: [...files].sort(),
    fingerprint: currentFingerprint,
    outcome,
    reason: reason ?? null,
    packet,
    session,
    recordedAt: new Date().toISOString(),
  });
  return ledger;
}

export function createReviewState(base) {
  if (!base) throw new Error("review base is required");
  return { version: 1, base, passes: [], findings: [] };
}

export function recordReview(state, { axis, head, findings }) {
  if (
    !["Standards", "Spec"].includes(axis) ||
    !head ||
    !Array.isArray(findings)
  )
    throw new Error(
      "review record requires Standards/Spec axis, head, and findings",
    );
  const pass = state.passes.length + 1;
  state.passes.push({ pass, axis, head });
  for (const finding of findings)
    state.findings.push({
      ...finding,
      axis,
      introducedPass: pass,
      status: finding.status ?? "open",
    });
  return state;
}

export function reviewContext(state) {
  const lastHead = state.passes.at(-1)?.head ?? null;
  return {
    diff: lastHead ? `${lastHead}..HEAD` : `${state.base}...HEAD`,
    base: state.base,
    unresolvedFindings: state.findings.filter(
      ({ status }) => status !== "resolved",
    ),
    discovery: "fixed-diff-and-known-findings-only",
  };
}

export async function recordEvent(file, event) {
  if (!eventTypes.has(event.type))
    throw new Error(`unknown telemetry event ${event.type}`);
  if (!event.packet || !event.session || !event.agent || !event.phase)
    throw new Error("telemetry requires packet/session/agent/phase");
  if (("tokens" in event || "contextTokens" in event) && !event.usageSource)
    throw new Error("token/context usage requires usageSource");
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(
    file,
    `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`,
  );
}

export function summarizeEvents(events) {
  const result = {
    events: events.length,
    commands: 0,
    contextReads: 0,
    repeatedReads: 0,
    outputBytes: 0,
    focusedSuites: 0,
    fullSuites: 0,
    reviewPasses: 0,
    scopeAdditions: 0,
    remediationLoops: 0,
    invalidationReasons: 0,
    tokenUsage: "unavailable",
    contextUsage: "unavailable",
  };
  const reads = new Set();
  let tokens = 0,
    contextTokens = 0,
    usageSeen = false,
    contextSeen = false;
  for (const event of events) {
    if (event.type === "command") result.commands += 1;
    if (event.type === "context-read") {
      result.contextReads += 1;
      if (reads.has(event.path)) result.repeatedReads += 1;
      reads.add(event.path);
    }
    result.outputBytes += event.outputBytes ?? 0;
    if (event.type === "validation") {
      event.level === "full" ? result.fullSuites++ : result.focusedSuites++;
      if (event.invalidationReason) result.invalidationReasons++;
    }
    if (event.type === "review") result.reviewPasses++;
    if (event.type === "scope-addition") result.scopeAdditions++;
    if (event.type === "remediation") result.remediationLoops++;
    if (event.usageSource && Number.isFinite(event.tokens)) {
      tokens += event.tokens;
      usageSeen = true;
    }
    if (event.usageSource && Number.isFinite(event.contextTokens)) {
      contextTokens = Math.max(contextTokens, event.contextTokens);
      contextSeen = true;
    }
  }
  if (usageSeen)
    result.tokenUsage = {
      actual: tokens,
      sources: [
        ...new Set(
          events.filter((e) => e.usageSource).map((e) => e.usageSource),
        ),
      ],
    };
  if (contextSeen)
    result.contextUsage = {
      actualPeak: contextTokens,
      sources: [
        ...new Set(
          events.filter((e) => e.usageSource).map((e) => e.usageSource),
        ),
      ],
    };
  return result;
}

export async function gitEvidence(repoRoot, base) {
  const options = { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 };
  const [
    { stdout: head },
    { stdout: changed },
    { stdout: status },
    { stdout: untracked },
  ] = await Promise.all([
    exec("git", ["rev-parse", "HEAD"], options),
    exec("git", ["diff", "--name-only", `${base}...HEAD`], options),
    exec("git", ["status", "--short"], options),
    exec("git", ["ls-files", "--others", "--exclude-standard"], options),
  ]);
  const workingTree = status.trimEnd() ? status.trimEnd().split("\n") : [];
  const trackedFiles = changed.trim() ? changed.trim().split("\n") : [];
  const modifiedFiles = workingTree
    .filter((line) => !line.startsWith("?? "))
    .map((line) => line.slice(3).split(" -> ").at(-1));
  const untrackedFiles = untracked.trim() ? untracked.trim().split("\n") : [];
  return {
    baseline: base,
    currentHead: head.trim(),
    changedFiles: [
      ...new Set([...trackedFiles, ...modifiedFiles, ...untrackedFiles]),
    ].sort(),
    workingTree,
    collectedAt: new Date().toISOString(),
    mutatesRepository: false,
  };
}
