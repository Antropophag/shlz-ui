import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  appendFile,
  mkdir,
  readFile,
  realpath,
  readdir,
  rename,
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
const decisionOwners = new Set(["repo", "agent", "user"]);
const decisionStatuses = new Set(["unresolved", "resolved", "delegated"]);
const authorizationStatuses = new Set([
  "approval-required",
  "pre-authorized",
  "approved",
]);
const allowedRequirementsFields = new Set([
  "version",
  "revision",
  "intent",
  "route",
  "decisions",
  "openSpec",
  "authorization",
]);
const allowedDecisionFields = new Set([
  "id",
  "owner",
  "status",
  "blocking",
  "provenance",
]);
const materialSignalNames = [
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
const directEvidenceNames = [
  "behaviorPreserving",
  "local",
  "reversible",
  "noExternalEffects",
  "noContractChange",
  "ambiguityResolved",
];

function validateSignalSet(signals, label) {
  if (!signals || typeof signals !== "object" || Array.isArray(signals))
    throw new Error(`${label} requires materialSignals`);
  const unsupported = Object.keys(signals).filter(
    (name) => !materialSignalNames.includes(name),
  );
  if (unsupported.length)
    throw new Error(
      `${label} has unsupported material signals: ${unsupported.join(", ")}`,
    );
  for (const name of materialSignalNames)
    if (![true, false, "unknown"].includes(signals[name]))
      throw new Error(
        `${label} material signal ${name} must be true, false, or unknown`,
      );
}

export function evaluateRouteEligibility(assessment) {
  if (!assessment || assessment.version !== 1)
    throw new Error("route assessment version must be 1");
  if (typeof assessment.intent !== "string" || !assessment.intent.trim())
    throw new Error("route assessment requires intent");
  if (!["direct", "open-spec"].includes(assessment.route))
    throw new Error("route assessment must select direct or open-spec");
  validateSignalSet(assessment.materialSignals, "route assessment");
  const materialSignals = materialSignalNames.filter(
    (name) => assessment.materialSignals[name] === true,
  );
  const unresolvedMaterialSignals = materialSignalNames.filter(
    (name) => assessment.materialSignals[name] === "unknown",
  );
  const requiredRoute =
    materialSignals.length || unresolvedMaterialSignals.length
      ? "open-spec"
      : "direct";
  if (assessment.route === "open-spec") {
    if (
      typeof assessment.openSpecChange !== "string" ||
      !assessment.openSpecChange ||
      !Array.isArray(assessment.requiredDecisions) ||
      assessment.requiredDecisions.some(
        (decision) =>
          !decision ||
          typeof decision.id !== "string" ||
          !decision.id ||
          !decisionOwners.has(decision.owner) ||
          typeof decision.blocking !== "boolean" ||
          Object.keys(decision).some(
            (key) => !["id", "owner", "blocking"].includes(key),
          ),
      )
    )
      return {
        eligible: false,
        selectedRoute: "open-spec",
        requiredRoute,
        materialSignals,
        unresolvedMaterialSignals,
        reason:
          "open-spec route requires change linkage and required decision identities",
      };
    if (requiredRoute !== "open-spec")
      return {
        eligible: false,
        selectedRoute: "open-spec",
        requiredRoute,
        materialSignals,
        unresolvedMaterialSignals,
        reason: "route evidence does not establish OpenSpec impact",
      };
  }
  if (assessment.route === "direct") {
    if (
      !assessment.directEvidence ||
      typeof assessment.directEvidence !== "object" ||
      directEvidenceNames.some(
        (name) => assessment.directEvidence[name] !== true,
      )
    )
      return {
        eligible: false,
        selectedRoute: "direct",
        requiredRoute,
        materialSignals,
        unresolvedMaterialSignals,
        reason: "direct route requires every positive eligibility assertion",
      };
    if (requiredRoute !== "direct")
      return {
        eligible: false,
        selectedRoute: "direct",
        requiredRoute,
        materialSignals,
        unresolvedMaterialSignals,
        reason: "material or unknown state cannot use direct",
      };
  }
  return {
    eligible: true,
    selectedRoute: assessment.route,
    requiredRoute,
    materialSignals,
    unresolvedMaterialSignals,
  };
}

function assertExecutionState(execution) {
  if (!execution || typeof execution !== "object")
    throw new Error("implementation preflight requires execution state");
  for (const field of ["currentBranch", "defaultBranch"])
    if (typeof execution[field] !== "string" || !execution[field])
      throw new Error(`execution state requires ${field}`);
  if (execution.currentBranch === execution.defaultBranch)
    throw new Error(
      `implementation is on default branch ${execution.defaultBranch}; mutation forbidden until redirected to a task branch`,
    );
  if (execution.baseCurrent !== true || execution.startedAtCurrentBase !== true)
    throw new Error(
      "implementation branch must start from current origin/default branch",
    );
  if (!Array.isArray(execution.preImplementationChanges))
    throw new Error("execution state requires preImplementationChanges");
}

export function assertImplementationPreflight(
  assessment,
  requirementsState,
  execution,
) {
  const eligibility = evaluateRouteEligibility(assessment);
  if (!eligibility.eligible)
    throw new Error(
      `route is not eligible: ${eligibility.reason}; required route ${eligibility.requiredRoute}`,
    );
  if (assessment.route === "open-spec") {
    if (!requirementsState)
      throw new Error("open-spec implementation requires readiness state");
    if (requirementsState.route !== "open-spec")
      throw new Error(
        "open-spec assessment requires open-spec readiness state",
      );
    if (requirementsState.intent !== assessment.intent)
      throw new Error("requirements intent does not match route assessment");
    if (requirementsState.openSpec?.change !== assessment.openSpecChange)
      throw new Error(
        "requirements OpenSpec change does not match route assessment",
      );
    const decisionsById = new Map(
      requirementsState.decisions.map((decision) => [decision.id, decision]),
    );
    const missing = assessment.requiredDecisions
      .filter(({ id }) => !decisionsById.has(id))
      .map(({ id }) => id);
    if (missing.length)
      throw new Error(`required decisions are missing: ${missing.join(", ")}`);
    const mismatched = assessment.requiredDecisions
      .filter(({ id, owner, blocking }) => {
        const actual = decisionsById.get(id);
        return actual.owner !== owner || actual.blocking !== blocking;
      })
      .map(({ id }) => id);
    if (mismatched.length)
      throw new Error(
        `required decision ownership does not match: ${mismatched.join(", ")}`,
      );
    const status = requirementsStatus(requirementsState);
    if (!status.readyForPlanning)
      throw new Error(
        `requirements are not ready: ${status.unresolvedBlocking.join(", ") || status.authorization}`,
      );
  }
  assertExecutionState(execution);
  const allowedPlanningPrefixes =
    assessment.route === "open-spec"
      ? [
          `openspec/changes/${assessment.openSpecChange}/`,
          `docs/exec-plans/active/${assessment.openSpecChange}/`,
        ]
      : [];
  const unexpectedChanges = execution.preImplementationChanges.filter(
    (file) =>
      !allowedPlanningPrefixes.some((prefix) => file.startsWith(prefix)),
  );
  if (unexpectedChanges.length)
    throw new Error(
      `implementation did not start from a clean task state: ${unexpectedChanges.join(", ")}`,
    );
  return { allowed: true, route: assessment.route };
}

export function assertRouteConformance(assessment, discovered, actualSurfaces) {
  const initial = evaluateRouteEligibility(assessment);
  if (!initial.eligible)
    throw new Error("initial route is not eligible; re-route required");
  if (!discovered || discovered.version !== 1)
    throw new Error("discovered route surface version must be 1");
  if (!Array.isArray(discovered.changedFiles))
    throw new Error("discovered route surface requires changedFiles");
  if (!Array.isArray(actualSurfaces))
    throw new Error("route conformance requires actual changed surfaces");
  const surfaces = actualSurfaces.map((surface) =>
    typeof surface === "string"
      ? { path: surface, status: "modified", patch: "" }
      : surface,
  );
  for (const surface of surfaces)
    if (
      !surface ||
      typeof surface.path !== "string" ||
      !["added", "modified", "deleted", "renamed"].includes(surface.status) ||
      typeof surface.patch !== "string"
    )
      throw new Error("actual changed surface has invalid path/status/patch");
  const declaredFiles = [...new Set(discovered.changedFiles)].sort((a, b) =>
    a.localeCompare(b),
  );
  const actualFiles = [...new Set(surfaces.map(({ path }) => path))].sort(
    (a, b) => a.localeCompare(b),
  );
  if (JSON.stringify(declaredFiles) !== JSON.stringify(actualFiles))
    throw new Error(
      "discovered changed-file set does not match actual target-relevant diff",
    );
  validateSignalSet(discovered.materialSignals, "discovered route surface");
  const agentMaterial = materialSignalNames.filter(
    (name) => discovered.materialSignals[name] !== false,
  );
  const deterministicFloor = deterministicRouteRiskFloor(surfaces);
  const material = [...new Set([...agentMaterial, ...deterministicFloor])];
  if (assessment.route === "direct" && material.length)
    throw new Error(
      deterministicFloor.length
        ? `deterministic risk floor (${deterministicFloor.join(", ")}) makes direct route non-conformant; re-route required`
        : `direct route no longer conforms (${material.join(", ")}); re-route required`,
    );
  return {
    allowed: true,
    route: assessment.route,
    changedFiles: discovered.changedFiles,
    deterministicFloor,
  };
}

const dedicatedWorkflowSignals = {
  ".github/workflows/pages.yml": [
    "publishingOrRelease",
    "deploymentSemantics",
    "externalAutomation",
  ],
  ".github/workflows/release.yml": [
    "publishingOrRelease",
    "externalAutomation",
  ],
};

function changedPatchLines(patch) {
  return patch
    .split("\n")
    .filter((line) => /^[+-]/.test(line) && !/^\+\+\+|^---/.test(line))
    .map((line) => {
      const content = line.replace(/^[+-]/, "");
      return {
        direction: line.startsWith("-") ? "removed" : "added",
        indent: content.length - content.trimStart().length,
        text: content.trim(),
      };
    })
    .filter(({ text }) => text && !text.startsWith("#"));
}

function dedicatedWorkflowChanged(surface) {
  if (surface.status !== "modified") return true;
  const lines = changedPatchLines(surface.patch).filter(
    ({ indent, text }) => !(indent === 0 && /^(name|run-name):/.test(text)),
  );
  const normalized = (direction) =>
    lines
      .filter((line) => line.direction === direction)
      .map(({ text }) => text)
      .sort((a, b) => a.localeCompare(b));
  return (
    JSON.stringify(normalized("removed")) !==
    JSON.stringify(normalized("added"))
  );
}

export function deterministicRouteRiskFloor(surfaces) {
  const signals = new Set();
  for (const surface of surfaces) {
    const dedicatedSignals = dedicatedWorkflowSignals[surface.path];
    if (dedicatedSignals && dedicatedWorkflowChanged(surface))
      dedicatedSignals.forEach((signal) => signals.add(signal));
    if (surface.path === "apps/showcase/public/CNAME") {
      signals.add("publishingOrRelease");
      signals.add("publicUrlOrDomain");
    }
    if (!/^\.github\/workflows\/[^/]+\.ya?ml$/.test(surface.path)) continue;
    for (const { text } of changedPatchLines(surface.patch)) {
      if (/^(pages|id-token|packages|deployments):\s*write\b/.test(text))
        signals.add("permissionsOrSecurity");
      if (
        /^uses:\s*(actions\/(configure-pages|upload-pages-artifact|deploy-pages|create-release)|softprops\/action-gh-release)@/.test(
          text,
        ) ||
        /^run:\s*npm publish\b/.test(text)
      ) {
        signals.add("publishingOrRelease");
        signals.add("externalAutomation");
      }
    }
  }
  return [...signals].sort((a, b) => a.localeCompare(b));
}

export function assertImplementationDelivery(delivery) {
  if (!delivery || typeof delivery !== "object")
    throw new Error("implementation delivery evidence is required");
  const actual = delivery.actual;
  if (!actual || typeof actual !== "object")
    throw new Error(
      "implementation delivery requires actual repository evidence",
    );
  if (actual.currentBranch === delivery.defaultBranch)
    throw new Error(
      `implementation cannot complete on default branch ${delivery.defaultBranch}`,
    );
  if (actual.pushBranch === delivery.defaultBranch)
    throw new Error(
      `direct push to default branch ${delivery.defaultBranch} is forbidden`,
    );
  if (actual.pushBranch !== actual.currentBranch)
    throw new Error("implementation must push its current task branch");
  if (
    typeof delivery.pullRequestUrl !== "string" ||
    !/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(
      delivery.pullRequestUrl,
    )
  )
    throw new Error(
      "implementation completion requires a GitHub pull request URL",
    );
  if (
    !delivery.pullRequestUrl.startsWith(
      `https://github.com/${actual.repository}/pull/`,
    )
  )
    throw new Error(`pull request does not belong to ${actual.repository}`);
  if (
    actual.pullRequest?.url !== delivery.pullRequestUrl ||
    actual.pullRequest?.state !== "OPEN"
  )
    throw new Error(
      "delivery evidence does not identify the actual open pull request",
    );
  if (actual.pullRequest.headRefName !== actual.currentBranch)
    throw new Error("pull request head does not match the current task branch");
  if (
    actual.localHead !== actual.upstreamHead ||
    actual.localHead !== actual.pullRequest.headRefOid
  )
    throw new Error(
      "current task branch is not fully pushed to the pull request",
    );
  if (actual.pullRequest.baseRefName !== delivery.defaultBranch)
    throw new Error("pull request must target the default branch");
  return { allowed: true, pullRequestUrl: delivery.pullRequestUrl };
}

export async function gitImplementationState(
  repoRoot,
  { defaultBranch = "main", baseRef = "origin/main" } = {},
) {
  const options = { cwd: repoRoot };
  const [
    { stdout: branch },
    { stdout: head },
    { stdout: base },
    { stdout: mergeBase },
    { stdout: status },
  ] = await Promise.all([
    exec("git", ["branch", "--show-current"], options),
    exec("git", ["rev-parse", "HEAD"], options),
    exec("git", ["rev-parse", baseRef], options),
    exec("git", ["merge-base", "HEAD", baseRef], options),
    exec("git", ["status", "--porcelain=v1"], options),
  ]);
  const preImplementationChanges = status.trim()
    ? status
        .trimEnd()
        .split("\n")
        .map((line) => line.slice(3).split(" -> ").at(-1))
    : [];
  return {
    currentBranch: branch.trim(),
    defaultBranch,
    baseCurrent: head.trim() === base.trim(),
    startedAtCurrentBase: mergeBase.trim() === base.trim(),
    preImplementationChanges,
    baseRef,
  };
}

export async function gitDeliveryState(repoRoot, pullRequestUrl) {
  const options = { cwd: repoRoot };
  const [branch, upstream, localHead, upstreamHead, repository, pullRequest] =
    await Promise.all([
      exec("git", ["branch", "--show-current"], options),
      exec(
        "git",
        ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
        options,
      ),
      exec("git", ["rev-parse", "HEAD"], options),
      exec("git", ["rev-parse", "@{upstream}"], options),
      exec("gh", ["repo", "view", "--json", "nameWithOwner"], options),
      exec(
        "gh",
        [
          "pr",
          "view",
          pullRequestUrl,
          "--json",
          "url,headRefName,headRefOid,baseRefName,state",
        ],
        options,
      ),
    ]);
  const [pushRemote, ...pushParts] = upstream.stdout.trim().split("/");
  return {
    repository: JSON.parse(repository.stdout).nameWithOwner,
    currentBranch: branch.stdout.trim(),
    pushRemote,
    pushBranch: pushParts.join("/"),
    localHead: localHead.stdout.trim(),
    upstreamHead: upstreamHead.stdout.trim(),
    pullRequest: JSON.parse(pullRequest.stdout),
  };
}

export const readJson = async (file) =>
  JSON.parse(await readFile(file, "utf8"));
export const writeJson = async (file, value) => {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, file);
};

function assertProvenance(value, label) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.kind !== "string" ||
    value.kind.length === 0 ||
    typeof value.ref !== "string" ||
    value.ref.length === 0 ||
    Object.keys(value).some((key) => !["kind", "ref"].includes(key))
  )
    throw new Error(`${label} requires compact kind/ref provenance`);
}

export function validateRequirementsState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state))
    throw new Error("requirements state must be an object");
  for (const key of Object.keys(state))
    if (!allowedRequirementsFields.has(key))
      throw new Error(`requirements field ${key} is not allowed`);
  if (state.version !== 1) throw new Error("requirements version must be 1");
  if (
    state.revision !== undefined &&
    (!Number.isInteger(state.revision) || state.revision < 1)
  )
    throw new Error("requirements revision must be a positive integer");
  if (typeof state.intent !== "string" || state.intent.length === 0)
    throw new Error("requirements state requires intent");
  if (!new Set(["direct", "open-spec"]).has(state.route))
    throw new Error("requirements route must be direct or open-spec");
  if (!Array.isArray(state.decisions))
    throw new Error("requirements decisions must be an array");
  const ids = new Set();
  for (const decision of state.decisions) {
    for (const key of Object.keys(decision))
      if (!allowedDecisionFields.has(key))
        throw new Error(`decision field ${key} is not allowed`);
    if (typeof decision.id !== "string" || decision.id.length === 0)
      throw new Error("decision requires id");
    if (ids.has(decision.id))
      throw new Error(`duplicate decision ${decision.id}`);
    ids.add(decision.id);
    if (!decisionOwners.has(decision.owner))
      throw new Error(`decision ${decision.id} has invalid owner`);
    if (!decisionStatuses.has(decision.status))
      throw new Error(`decision ${decision.id} has invalid status`);
    if (typeof decision.blocking !== "boolean")
      throw new Error(`decision ${decision.id} blocking must be boolean`);
    assertProvenance(decision.provenance, `decision ${decision.id}`);
    if (decision.status === "delegated" && decision.owner !== "agent")
      throw new Error(`delegated decision ${decision.id} must be agent-owned`);
    if (
      decision.status === "delegated" &&
      decision.provenance.kind !== "user-delegation"
    )
      throw new Error(
        `delegated decision ${decision.id} requires user-delegation provenance`,
      );
  }
  if (state.route === "open-spec") {
    if (
      !state.openSpec ||
      typeof state.openSpec.change !== "string" ||
      !new Set(["pending", "synthesized"]).has(state.openSpec.status) ||
      Object.keys(state.openSpec).some(
        (key) => !["change", "status"].includes(key),
      )
    )
      throw new Error("open-spec route requires compact OpenSpec linkage");
    if (
      !state.authorization ||
      !authorizationStatuses.has(state.authorization.status)
    )
      throw new Error("open-spec route requires execution authorization");
    assertProvenance(state.authorization.provenance, "authorization");
    if (
      Object.keys(state.authorization).some(
        (key) => !["status", "provenance"].includes(key),
      )
    )
      throw new Error("authorization contains unsupported fields");
  }
  return state;
}

export function requirementsStatus(state) {
  validateRequirementsState(state);
  const unresolvedBlocking = state.decisions
    .filter(
      (decision) =>
        decision.owner === "user" &&
        decision.blocking &&
        decision.status === "unresolved",
    )
    .map(({ id }) => id);
  const readyForSpec = unresolvedBlocking.length === 0;
  const authorized = ["pre-authorized", "approved"].includes(
    state.authorization?.status,
  );
  return {
    route: state.route,
    unresolvedBlocking,
    readyForSpec,
    readyForPlanning:
      state.route === "direct" ||
      (readyForSpec && state.openSpec.status === "synthesized" && authorized),
    authorization: state.authorization?.status ?? "not-required",
  };
}

const requirementsRevision = (state) => state.revision ?? 1;

function assertPlanRequirements(
  subject,
  requirementsState,
  minimumRevision = subject.requirementsRevision ?? 1,
) {
  if (subject.requirementsGate !== "required") return;
  if (!requirementsState)
    throw new Error("requirements-gated work requires readiness state");
  const expectedChange = subject.openSpecChange;
  if (!expectedChange)
    throw new Error("requirements-gated work requires openSpecChange");
  if (requirementsState.openSpec?.change !== expectedChange)
    throw new Error(
      `requirements state links ${requirementsState.openSpec?.change ?? "no change"}, expected ${expectedChange}`,
    );
  if (requirementsRevision(requirementsState) < minimumRevision)
    throw new Error(
      `requirements revision ${requirementsRevision(requirementsState)} is stale; expected at least ${minimumRevision}`,
    );
  const status = requirementsStatus(requirementsState);
  if (!status.readyForPlanning)
    throw new Error(
      `requirements are not ready: ${status.unresolvedBlocking.join(", ") || status.authorization}`,
    );
}

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
  if (!plan.classification?.size)
    throw new Error("plan requires classification.size");
  if (
    plan.requirementsGate === "required" &&
    (typeof plan.openSpecChange !== "string" ||
      plan.openSpecChange.length === 0)
  )
    throw new Error("requirements-gated plan requires openSpecChange");
  if (
    plan.requirementsGate === "required" &&
    (!Number.isInteger(plan.requirementsRevision) ||
      plan.requirementsRevision < 1)
  )
    throw new Error("requirements-gated plan requires requirementsRevision");
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

export function createPlan(assessment, config, requirementsState = null) {
  if (
    !assessment.id ||
    !Array.isArray(assessment.workUnits) ||
    assessment.workUnits.length === 0
  )
    throw new Error("assessment requires id and semantic workUnits");
  assertPlanRequirements(assessment, requirementsState);
  const classification = classify(assessment, config);
  const regroupRequired =
    (assessment.openSpecTaskCount ?? 0) > config.sizing.taskRegroupThreshold ||
    assessment.signals.independentWorkUnits > 1 ||
    assessment.signals.sharedSeams > 0;
  const plan = {
    version: 1,
    id: assessment.id,
    baseline: assessment.baseline ?? null,
    ...(assessment.requirementsGate === "required"
      ? {
          requirementsGate: "required",
          openSpecChange: assessment.openSpecChange,
          requirementsRevision: requirementsRevision(requirementsState),
        }
      : {}),
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
    else source += pattern[index].replace(/[.+^$()|[\]\\]/g, String.raw`\$&`);
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
  ].sort((a, b) => a.localeCompare(b));
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
        (!state?.packets ||
          (state.packets[packet.id]?.status ?? "pending") === "pending") &&
        packet.dependencies.every((id) => completed.has(id)),
    )
    .map(({ id, objective, preferredExecutionMode }) => ({
      id,
      objective,
      preferredExecutionMode,
    }));
}

export function validateHandoff(value, plan) {
  const allowed = new Set([
    "completedPacket",
    "completedPackets",
    "changed",
    "provenChecks",
    "settledDecisions",
    "unresolvedFindings",
    "nextPacket",
    "invalidatedAssumptions",
  ]);
  for (const key of Object.keys(value))
    if (!allowed.has(key))
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
    ...(plan.requirementsGate === "required"
      ? { requirementsRevision: plan.requirementsRevision }
      : {}),
    packets: Object.fromEntries(
      plan.packets.map(({ id }) => [id, { status: "pending" }]),
    ),
    handoffs: {},
  };
}

export function claimPacket(
  plan,
  state,
  packetId,
  session,
  requirementsState = null,
) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  if (!session) throw new Error("claim requires session");
  if (!readyPackets(plan, state).some(({ id }) => id === packetId))
    throw new Error(`packet ${packetId} is not ready or already claimed`);
  state.packets[packetId] = { status: "claimed", session };
  return state;
}

export function pausePacket(plan, state, packetId, requirementsState) {
  if (plan.requirementsGate !== "required")
    throw new Error("only requirements-gated plans can pause for requirements");
  if (requirementsState.openSpec?.change !== plan.openSpecChange)
    throw new Error(
      "requirements state does not match the plan OpenSpec change",
    );
  const readiness = requirementsStatus(requirementsState);
  if (readiness.readyForPlanning)
    throw new Error("packet pause requires a closed requirements gate");
  const current = state.packets[packetId];
  if (current?.status !== "claimed")
    throw new Error(`packet ${packetId} must be claimed before pause`);
  const nextRevision = requirementsRevision(requirementsState);
  const currentRevision =
    state.requirementsRevision ?? plan.requirementsRevision;
  if (nextRevision <= currentRevision)
    throw new Error(
      `requirements pause requires a revision newer than ${currentRevision}`,
    );
  state.requirementsRevision = nextRevision;
  state.packets[packetId] = {
    ...current,
    status: "paused",
    requirementsRevision: nextRevision,
  };
  return state;
}

export function resumePacket(
  plan,
  state,
  packetId,
  session,
  requirementsState,
) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  if (!session) throw new Error("resume requires session");
  const current = state.packets[packetId];
  if (current?.status !== "paused")
    throw new Error(`packet ${packetId} must be paused before resume`);
  const completed = new Set(
    Object.entries(state.packets)
      .filter(([, value]) => value.status === "completed")
      .map(([id]) => id),
  );
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet.dependencies.every((id) => completed.has(id)))
    throw new Error(`packet ${packetId} dependencies are not complete`);
  state.packets[packetId] = {
    status: "claimed",
    session,
    requirementsRevision: state.requirementsRevision,
  };
  return state;
}

export function completePacket(plan, state, handoff, requirementsState = null) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
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

export function relevantValidationFiles(files, target, config) {
  const definition = config.validationTargets[target];
  if (!definition) throw new Error(`unknown validation target ${target}`);
  const relevant = files.filter(
    (file) =>
      definition.fingerprintPatterns.some((pattern) =>
        matchesPattern(file, pattern),
      ) &&
      !(definition.fingerprintIgnorePatterns ?? []).some((pattern) =>
        matchesPattern(file, pattern),
      ),
  );
  if (relevant.length === 0)
    throw new Error(
      `no changed files are relevant to validation target ${target}`,
    );
  return relevant;
}

export function fingerprint(files, contentsByFile = {}) {
  const hash = createHash("sha256");
  for (const file of [...files].sort((a, b) => a.localeCompare(b))) {
    const content = contentsByFile[file] ?? "";
    hash.update(`${file}\0`);
    if (content?.state === "deleted") hash.update("deleted\0");
    else hash.update(`present\0${content}\0`);
  }
  return hash.digest("hex");
}

export async function fingerprintFiles(files, repoRoot) {
  const realRoot = await realpath(repoRoot);
  const contents = Object.fromEntries(
    await Promise.all(
      files.map(async (file) => {
        const target = path.resolve(repoRoot, file);
        if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
          throw new Error(`validation file escapes repository: ${file}`);
        let realTarget;
        try {
          realTarget = await realpath(target);
        } catch (error) {
          if (error.code === "ENOENT") return [file, { state: "deleted" }];
          throw error;
        }
        if (
          realTarget !== realRoot &&
          !realTarget.startsWith(`${realRoot}${path.sep}`)
        )
          throw new Error(
            `validation file resolves outside repository: ${file}`,
          );
        return [file, await readFile(realTarget)];
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
  const duplicate = ledger.some(
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
    files: [...files].sort((a, b) => a.localeCompare(b)),
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

export function resolveReviewFindings(state, ids, head) {
  if (!ids.length || !head)
    throw new Error("review resolution requires ids and head");
  const selected = new Set(ids);
  for (const finding of state.findings)
    if (selected.has(finding.id)) {
      finding.status = "resolved";
      finding.resolvedAtHead = head;
      selected.delete(finding.id);
    }
  if (selected.size)
    throw new Error(`unknown review findings: ${[...selected].join(",")}`);
  return state;
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
  if (typeof base !== "string" || !base.trim())
    throw new Error("git evidence requires a base revision");
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
    ].sort((a, b) => a.localeCompare(b)),
    workingTree,
    collectedAt: new Date().toISOString(),
    mutatesRepository: false,
  };
}

export async function gitRouteSurfaces(repoRoot, base, files) {
  const options = { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 };
  const { stdout: rawStatuses } = await exec(
    "git",
    ["diff", "--name-status", base, "--"],
    options,
  );
  const statuses = new Map();
  for (const line of rawStatuses.trim().split("\n").filter(Boolean)) {
    const [rawStatus, ...paths] = line.split("\t");
    const file = paths.at(-1);
    const status = rawStatus.startsWith("A")
      ? "added"
      : rawStatus.startsWith("D")
        ? "deleted"
        : rawStatus.startsWith("R")
          ? "renamed"
          : "modified";
    statuses.set(file, status);
  }
  return Promise.all(
    files.map(async (file) => {
      const status = statuses.get(file) ?? "added";
      const { stdout: trackedPatch } = await exec(
        "git",
        ["diff", "--unified=0", "--no-color", base, "--", file],
        options,
      );
      let patch = trackedPatch;
      if (status === "added" && !patch) {
        const content = await readFile(path.join(repoRoot, file), "utf8");
        patch = content
          .split("\n")
          .map((line) => `+${line}`)
          .join("\n");
      }
      return { path: file, status, patch };
    }),
  );
}
