import { createHash } from "node:crypto";
import { createSpecDrivenTdd } from "./spec-driven-tdd.mjs";
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
import { contractDerivedTddBinding } from "./contract-derived-tdd.mjs";

const exec = promisify(execFile);
const order = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const modes = new Set([
  "continue",
  "fresh-session",
  "isolated-subagent",
  "parallelizable-subagent",
]);
const guardedModes = new Set([
  "fresh-session",
  "isolated-subagent",
  "parallelizable-subagent",
]);
const isolationFallbacks = new Set(["stop", "continue"]);
const eventTypes = new Set([
  "command",
  "context-read",
  "validation",
  "review",
  "scope-addition",
  "remediation",
  "usage",
  "execution-boundary",
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
const tddApplicabilityReasons = new Set([
  "baseline-already-green",
  "no-deterministic-seam",
  "unsafe-destructive-execution",
  "unavailable-controlled-dependency",
  "subjective-only-acceptance",
]);

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
  if (!Array.isArray(execution.preImplementationChanges))
    throw new Error("execution state requires preImplementationChanges");
  if (execution.baselineKind === "existing-pull-request") {
    if (execution.preImplementationChanges.length)
      throw new Error(
        "existing pull-request baseline requires a clean working tree",
      );
    const pullRequest = execution.pullRequest;
    if (!pullRequest || pullRequest.state !== "OPEN")
      throw new Error(
        "existing pull-request baseline requires an open pull request",
      );
    if (pullRequest.baseRefName !== execution.defaultBranch)
      throw new Error("existing pull request must target the default branch");
    if (
      pullRequest.headRefName !== execution.currentBranch ||
      execution.upstreamBranch !== execution.currentBranch
    )
      throw new Error(
        "existing pull-request baseline branch does not match current branch",
      );
    if (
      execution.localHead !== execution.upstreamHead ||
      execution.localHead !== pullRequest.headRefOid
    )
      throw new Error(
        "existing pull-request baseline must be clean, fully pushed, and current",
      );
    return;
  }
  if (execution.baselineKind !== "mainline")
    throw new Error(
      "execution state requires mainline or existing-pull-request baselineKind",
    );
  if (execution.baseCurrent !== true || execution.startedAtCurrentBase !== true)
    throw new Error(
      "implementation branch must start from current origin/default branch",
    );
}

export function validateExecutionBaseline(baseline) {
  if (!baseline || baseline.version !== 1)
    throw new Error("execution baseline version must be 1");
  if (!new Set(["mainline", "existing-pull-request"]).has(baseline.kind))
    throw new Error("execution baseline kind is invalid");
  for (const field of ["commit", "branch", "defaultBranch"])
    if (typeof baseline[field] !== "string" || !baseline[field])
      throw new Error(`execution baseline requires ${field}`);
  if (!/^[0-9a-f]{40}$/.test(baseline.commit))
    throw new Error("execution baseline commit must be a full Git object id");
  if (
    baseline.kind === "existing-pull-request" &&
    (typeof baseline.pullRequestUrl !== "string" || !baseline.pullRequestUrl)
  )
    throw new Error("existing pull-request baseline requires pullRequestUrl");
  return baseline;
}

export function assertExecutionBaselineState(baseline, actual) {
  validateExecutionBaseline(baseline);
  if (!actual || actual.branch !== baseline.branch)
    throw new Error("execution baseline belongs to a different task branch");
  if (actual.isAncestor !== true)
    throw new Error("execution baseline is not an ancestor of current HEAD");
  return { allowed: true, commit: baseline.commit, branch: baseline.branch };
}

export function evaluateExecutionStrategy({
  eligibility,
  classification,
  contextGrowthUncertain = false,
  reviewRisk = false,
}) {
  if (!eligibility?.eligible)
    throw new Error("execution strategy requires eligible semantic routing");
  const semanticRoute = eligibility.selectedRoute;
  const size = classification?.size;
  if (!new Set(["direct", "open-spec"]).has(semanticRoute))
    throw new Error("execution strategy requires a selected semantic route");
  if (!new Set(["S", "M", "L", "XL"]).has(size))
    throw new Error("execution strategy requires S, M, L, or XL size");
  const material = semanticRoute === "open-spec";
  return {
    semanticRoute,
    specification: material ? "requirements-and-open-spec" : "none",
    size,
    orchestration:
      size === "S" && !contextGrowthUncertain ? "inline" : "adaptive-plan",
    review:
      material || size !== "S" || reviewRisk ? "independent" : "target-diff",
  };
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
  const baseline = validateExecutionBaseline({
    version: 1,
    kind: execution.baselineKind,
    commit: execution.localHead,
    branch: execution.currentBranch,
    defaultBranch: execution.defaultBranch,
    ...(execution.baselineKind === "existing-pull-request"
      ? { pullRequestUrl: execution.pullRequest.url }
      : {}),
  });
  return { allowed: true, route: assessment.route, baseline };
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
  const declaredFiles = [...new Set(discovered.changedFiles)].sort(order);
  const actualFiles = [...new Set(surfaces.map(({ path }) => path))].sort(
    order,
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
      .map(({ indent, text }) => `${indent}:${text}`);
  return (
    JSON.stringify(normalized("removed")) !==
    JSON.stringify(normalized("added"))
  );
}

function workflowConstructs(surface) {
  const constructs = [];
  for (const line of changedPatchLines(surface.patch)) {
    const normalized = line.text.replace(/\s+/g, " ");
    if (/^permissions:\s*write-all\b/.test(normalized))
      constructs.push({
        direction: line.direction,
        key: `permissions:${line.indent}:write-all`,
        signals: ["permissionsOrSecurity"],
        alwaysMaterial: true,
      });
    const directGrant = normalized.match(
      /^(contents|pages|id-token|packages|deployments):\s*write\b/,
    );
    const inlinePermissions = /^permissions:\s*\{.*\}(?:\s+#.*)?$/.test(
      normalized,
    );
    const grants = directGrant
      ? [directGrant[1]]
      : inlinePermissions
        ? [
            ...normalized.matchAll(
              /\b(contents|pages|id-token|packages|deployments)\s*:\s*write\b/g,
            ),
          ].map((match) => match[1])
        : [];
    for (const grant of grants)
      constructs.push({
        direction: line.direction,
        key: `permission:${line.indent}:${grant}:write`,
        signals: ["permissionsOrSecurity"],
        alwaysMaterial: true,
      });
    if (
      /^uses:\s*(actions\/(configure-pages|upload-pages-artifact|deploy-pages|create-release)|softprops\/action-gh-release)@/.test(
        normalized,
      )
    )
      constructs.push({
        direction: line.direction,
        key: normalized,
        signals: ["publishingOrRelease", "externalAutomation"],
      });
    if (/^run:\s*npm publish\b/.test(normalized))
      constructs.push({
        direction: line.direction,
        key: normalized,
        signals: ["publishingOrRelease", "externalAutomation"],
      });
  }
  return constructs;
}

function changedWorkflowConstructSignals(surface) {
  const constructs = workflowConstructs(surface);
  const counts = new Map();
  for (const { direction, key } of constructs) {
    const delta = direction === "added" ? 1 : -1;
    counts.set(key, (counts.get(key) ?? 0) + delta);
  }
  const signals = new Set();
  for (const construct of constructs)
    if (construct.alwaysMaterial || counts.get(construct.key) !== 0)
      construct.signals.forEach((signal) => signals.add(signal));
  return signals;
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
    changedWorkflowConstructSignals(surface).forEach((signal) =>
      signals.add(signal),
    );
  }
  return [...signals].sort(order);
}

const incompleteDeliveryPackets = (plan, state) =>
  plan.packets
    .filter(({ id }) => {
      if (state.packets?.[id]?.status !== "completed") return true;
      try {
        return (
          validateHandoff(state.handoffs?.[id], plan).completedPacket !== id
        );
      } catch {
        return true;
      }
    })
    .map(({ id }) => id);

function assertDeliveryPacketEvidence(plan, state, telemetryEvents) {
  if (!Array.isArray(telemetryEvents))
    throw new Error("planned delivery requires trusted packet telemetry");
  const boundaries = telemetryEvents.filter(
    ({ type, executionSource }) =>
      type === "execution-boundary" && executionSource === "codex-exec-jsonl",
  );
  for (const { id } of plan.packets) {
    const packet = state.packets?.[id];
    const packetBoundaries = boundaries.filter((event) => event.packet === id);
    if (packet?.status !== "completed") {
      if (packetBoundaries.length)
        throw new Error(
          `ERR_DELIVERY_PACKET_EVIDENCE ${id} telemetry exists without canonical completion`,
        );
      continue;
    }
    const handoff = validateHandoff(state.handoffs?.[id], plan);
    for (const [field, expected, actual] of [
      ["claimId", packet.claimId, handoff.claimId],
      ["briefDigest", packet.briefDigest, handoff.briefDigest],
      [
        "workerReportDigest",
        packet.launch?.workerReportDigest,
        handoff.workerReportDigest,
      ],
    ])
      if (expected !== actual)
        throw new Error(`ERR_DELIVERY_PACKET_EVIDENCE ${id} ${field}`);
    if (
      packet.launch?.terminalStatus !== "completed" ||
      packet.execution?.source !== "codex-exec-jsonl" ||
      packet.launch?.launchId !== packet.execution?.launchId
    )
      throw new Error(`ERR_DELIVERY_PACKET_EVIDENCE ${id} launchId`);
    const matchingBoundary = packetBoundaries.some(
      (event) =>
        event.session === packet.session &&
        event.runtimeId === packet.execution.runtimeId,
    );
    if (!matchingBoundary) {
      const fields = ["session", "runtimeId"];
      const field = fields.find((candidate) =>
        packetBoundaries.some(
          (event) =>
            event[candidate] !==
            (candidate === "session"
              ? packet.session
              : packet.execution[candidate]),
        ),
      );
      throw new Error(
        `ERR_DELIVERY_PACKET_EVIDENCE ${id} ${field ?? "execution-boundary"}`,
      );
    }
    const knownAttempts = [packet, ...(packet.attemptHistory ?? [])];
    if (
      packetBoundaries.some(
        (event) =>
          !knownAttempts.some(
            (attempt) =>
              attempt.execution?.runtimeId === event.runtimeId &&
              attempt.session === event.session,
          ),
      )
    )
      throw new Error(
        `ERR_DELIVERY_PACKET_EVIDENCE ${id} detached-execution-boundary`,
      );
  }
}

function assertDeliveryReview(review, candidateHead, tddBinding) {
  if (!review || review.version !== 1)
    throw new Error("delivery requires current independent review evidence");
  const currentAxes = new Set(
    (review.passes ?? [])
      .filter(({ head }) => head === candidateHead)
      .map(({ axis }) => axis),
  );
  if (!currentAxes.has("Standards") || !currentAxes.has("Spec"))
    throw new Error(
      "delivery requires current Standards and Spec review passes",
    );
  if ((review.findings ?? []).some(({ status }) => status !== "resolved"))
    throw new Error("delivery review has unresolved findings");
  if (review.failurePathConcerns?.length) {
    if (!review.failurePathProof)
      throw new Error("delivery requires executable failure-path proof");
    if (review.failurePathProof.reviewedHead !== candidateHead)
      throw new Error("delivery failure-path proof is stale");
    const proofValidation = stableValue(review);
    const proof = proofValidation.failurePathProof;
    delete proofValidation.failurePathProof;
    recordFailurePathProof(proofValidation, proof);
  }
  if (
    tddBinding &&
    valueDigest(review.specDrivenTdd) !== valueDigest(tddBinding)
  )
    throw new Error("delivery review has stale spec-driven TDD evidence");
}

export function assertImplementationDelivery(delivery, execution = null) {
  if (!delivery || typeof delivery !== "object")
    throw new Error("implementation delivery evidence is required");
  const actual = delivery.actual;
  if (!actual || typeof actual !== "object")
    throw new Error(
      "implementation delivery requires actual repository evidence",
    );
  if (execution) {
    const {
      plan,
      state,
      requirementsState = null,
      reviewState = null,
      telemetryEvents,
    } = execution;
    if (!plan || !state)
      throw new Error("delivery execution evidence requires plan and state");
    if (state.planId !== plan.id)
      throw new Error("delivery execution state belongs to a different plan");
    if (plan.requirementsGate === "required") {
      assertPlanRequirements(
        plan,
        requirementsState,
        state.requirementsRevision ?? plan.requirementsRevision,
      );
      if (state.requirementsRevision !== plan.requirementsRevision)
        throw new Error(
          `delivery execution state revision ${state.requirementsRevision ?? "missing"} does not match plan revision ${plan.requirementsRevision}`,
        );
    }
    const planIds = new Set(plan.packets.map(({ id }) => id));
    const unknown = Object.keys(state.packets ?? {}).filter(
      (id) => !planIds.has(id),
    );
    if (unknown.length)
      throw new Error(
        `delivery execution state has unknown packets: ${unknown.join(", ")}`,
      );
    assertDeliveryPacketEvidence(plan, state, telemetryEvents);
    const incomplete = incompleteDeliveryPackets(plan, state);
    if (incomplete.length)
      throw new Error(
        `delivery requires completed mandatory packets: ${incomplete.join(", ")}`,
      );
    const tddBinding = createTddReviewBinding(plan, state, actual.localHead);
    assertDeliveryReview(reviewState, actual.localHead, tddBinding);
  }
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
  {
    defaultBranch = "main",
    baseRef = "origin/main",
    pullRequestUrl = null,
  } = {},
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
  const state = {
    currentBranch: branch.trim(),
    defaultBranch,
    baselineKind: pullRequestUrl ? "existing-pull-request" : "mainline",
    localHead: head.trim(),
    baseCurrent: head.trim() === base.trim(),
    startedAtCurrentBase: mergeBase.trim() === base.trim(),
    preImplementationChanges,
    baseRef,
  };
  if (!pullRequestUrl) return state;
  const [
    { stdout: upstream },
    { stdout: upstreamHead },
    { stdout: pullRequest },
  ] = await Promise.all([
    exec("git", ["rev-parse", "--abbrev-ref", "@{upstream}"], options),
    exec("git", ["rev-parse", "@{upstream}"], options),
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
  return {
    ...state,
    upstreamBranch: upstream.trim().split("/").slice(1).join("/"),
    upstreamHead: upstreamHead.trim(),
    pullRequest: JSON.parse(pullRequest),
  };
}

export async function gitExecutionBaselineState(repoRoot, baseline) {
  validateExecutionBaseline(baseline);
  const options = { cwd: repoRoot };
  const [{ stdout: branch }, ancestor] = await Promise.all([
    exec("git", ["branch", "--show-current"], options),
    exec(
      "git",
      ["merge-base", "--is-ancestor", baseline.commit, "HEAD"],
      options,
    )
      .then(() => true)
      .catch((error) => {
        if (error.code === 1) return false;
        throw error;
      }),
  ]);
  return { branch: branch.trim(), isAncestor: ancestor };
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
  if (
    Number.isInteger(subject.requirementsRevision) &&
    subject.requirementsRevision !== requirementsRevision(requirementsState)
  )
    throw new Error(
      `execution plan revision ${subject.requirementsRevision} is stale; expected ${requirementsRevision(requirementsState)}`,
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

function surfacesOverlap(left, right) {
  return left.some((leftPattern) =>
    right.some(
      (rightPattern) =>
        matchesPattern(leftPattern, rightPattern) ||
        matchesPattern(rightPattern, leftPattern),
    ),
  );
}

function assertSliceScenarios(slice) {
  if (!Array.isArray(slice.scenarioIds) || !slice.scenarioIds.length)
    throw new Error(
      `spec-driven TDD slice ${slice.id} requires scenario identities`,
    );
  if (new Set(slice.scenarioIds).size !== slice.scenarioIds.length)
    throw new Error(
      `spec-driven TDD slice ${slice.id} has duplicate scenarios`,
    );
}

function assertSliceSurfaces(slice) {
  for (const field of [
    "acceptanceSurface",
    "fixtureSurface",
    "productionSurface",
  ])
    if (!Array.isArray(slice[field]) || !slice[field].length)
      throw new Error(`spec-driven TDD slice ${slice.id} requires ${field}`);
  if (
    surfacesOverlap(slice.productionSurface, slice.acceptanceSurface) ||
    surfacesOverlap(slice.productionSurface, slice.fixtureSurface)
  )
    throw new Error(
      `spec-driven TDD slice ${slice.id} production and acceptance surfaces overlap`,
    );
}

function assertSliceAuthorities(slice) {
  const mappings = new Map(
    (slice.authorities ?? []).map((authority) => [
      authority.scenarioId,
      authority,
    ]),
  );
  if (
    mappings.size !== slice.scenarioIds.length ||
    slice.scenarioIds.some((id) => {
      const authority = mappings.get(id);
      return !authority?.source || !authority?.ref;
    })
  )
    throw new Error(
      `spec-driven TDD slice ${slice.id} requires one scenario authority mapping per scenario`,
    );
}

function assertSliceSeam(slice) {
  if (
    typeof slice.seam !== "string" ||
    !slice.seam ||
    !Array.isArray(slice.command) ||
    !slice.command.length ||
    !slice.command.every((value) => typeof value === "string" && value) ||
    !path.isAbsolute(slice.command[0]) ||
    !slice.controls ||
    !Number.isInteger(slice.repeatCount) ||
    slice.repeatCount < 2
  )
    throw new Error(
      `spec-driven TDD slice ${slice.id} requires a deterministic executable seam with an absolute command`,
    );
}

function validateSpecDrivenTdd(contract, packets, executionIsolation) {
  if (
    !contract ||
    ![1, 2].includes(contract.version) ||
    !Array.isArray(contract.slices)
  )
    throw new Error("spec-driven TDD contract version must be 1 or 2");
  if (!contract.slices.length)
    throw new Error("spec-driven TDD contract requires slices");
  const packetIds = new Set(packets.map(({ id }) => id));
  const packetById = new Map(packets.map((packet) => [packet.id, packet]));
  const dependsOn = (packetId, ancestorId, seen = new Set()) => {
    if (seen.has(packetId)) return false;
    seen.add(packetId);
    const dependencies = packetById.get(packetId)?.dependencies ?? [];
    return (
      dependencies.includes(ancestorId) ||
      dependencies.some((id) => dependsOn(id, ancestorId, seen))
    );
  };
  const sliceIds = new Set();
  let hasEnforcedSlice = false;
  for (const slice of contract.slices) {
    if (!slice?.id || sliceIds.has(slice.id))
      throw new Error("spec-driven TDD slice ids must be unique and non-empty");
    sliceIds.add(slice.id);
    assertSliceScenarios(slice);
    if (slice.applicability === "inapplicable") {
      if (
        !tddApplicabilityReasons.has(slice.reason) ||
        typeof slice.evidence !== "string" ||
        !slice.evidence.trim()
      )
        throw new Error(
          `spec-driven TDD slice ${slice.id} requires a bounded inapplicability reason and evidence`,
        );
      continue;
    }
    if (slice.applicability !== "enforced")
      throw new Error(
        `spec-driven TDD slice ${slice.id} applicability is invalid`,
      );
    hasEnforcedSlice = true;
    assertSliceSurfaces(slice);
    assertSliceAuthorities(slice);
    if (
      !packetIds.has(slice.testDesignPacket) ||
      !packetIds.has(slice.implementationPacket) ||
      slice.testDesignPacket === slice.implementationPacket
    )
      throw new Error(
        `spec-driven TDD slice ${slice.id} requires distinct known packets`,
      );
    const implementationPacket = packets.find(
      ({ id }) => id === slice.implementationPacket,
    );
    if (
      contract.version === 1 &&
      !implementationPacket.dependencies.includes(slice.testDesignPacket)
    )
      throw new Error(
        `spec-driven TDD slice ${slice.id} implementation packet must depend on test design`,
      );
    if (contract.version >= 2) {
      const reviewPacket = packets.find(
        ({ id }) => id === slice.testReviewPacket,
      );
      if (
        !reviewPacket ||
        slice.testReviewPacket === slice.testDesignPacket ||
        slice.testReviewPacket === slice.implementationPacket ||
        !reviewPacket.dependencies.includes(slice.testDesignPacket) ||
        !dependsOn(slice.implementationPacket, slice.testReviewPacket) ||
        !guardedModes.has(reviewPacket.preferredExecutionMode)
      )
        throw new Error(
          `spec-driven TDD slice ${slice.id} requires a distinct guarded test review packet between design and implementation`,
        );
      assertTddReviewContext(
        { specDrivenTdd: contract, packets },
        null,
        slice.testReviewPacket,
      );
    }
    assertSliceSeam(slice);
  }
  if (hasEnforcedSlice && executionIsolation?.enforced !== true)
    throw new Error(
      "spec-driven TDD enforced slices requires an executionIsolation policy with enforced=true",
    );
  return contract;
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
    if (packet.maxInitialContextBytes !== undefined) {
      if (
        !guardedModes.has(packet.preferredExecutionMode) ||
        !Number.isInteger(packet.maxInitialContextBytes) ||
        packet.maxInitialContextBytes <= 0
      )
        throw new Error(
          `packet ${packet.id} maxInitialContextBytes must be a positive integer on a guarded packet`,
        );
    }
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
  if (plan.specDrivenTdd !== undefined)
    validateSpecDrivenTdd(
      plan.specDrivenTdd,
      plan.packets,
      plan.executionIsolation,
    );
  if (plan.contractDerivedTdd !== undefined) {
    const obligation = plan.contractDerivedTdd;
    if (
      obligation?.version !== 1 ||
      obligation.openSpecChange !== plan.openSpecChange ||
      typeof obligation.contractDigest !== "string" ||
      !/^[a-f0-9]{64}$/.test(obligation.contractDigest) ||
      !Array.isArray(obligation.requiredScenarioIds) ||
      obligation.requiredScenarioIds.some(
        (id, index) =>
          typeof id !== "string" ||
          !id ||
          obligation.requiredScenarioIds.indexOf(id) !== index,
      )
    )
      throw new Error("plan has invalid contract-derived TDD obligation");
    const coverage = new Map(
      obligation.requiredScenarioIds.map((id) => [id, 0]),
    );
    for (const slice of plan.specDrivenTdd?.slices ?? []) {
      if (slice.applicability !== "enforced") continue;
      for (const id of slice.scenarioIds)
        if (coverage.has(id)) coverage.set(id, coverage.get(id) + 1);
    }
    const uncovered = [...coverage]
      .filter(([, count]) => count === 0)
      .map(([id]) => id);
    const duplicate = [...coverage]
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
    if (uncovered.length)
      throw new Error(
        `contract-derived TDD requires enforced coverage; uncovered: ${uncovered.join(",")}`,
      );
    if (duplicate.length)
      throw new Error(
        `contract-derived TDD requires exact coverage; duplicated: ${duplicate.join(",")}`,
      );
  }
  if (
    plan.version >= 2 &&
    ["L", "XL"].includes(plan.classification.size) &&
    (!plan.executionIsolation ||
      plan.executionIsolation.enforced !== true ||
      plan.executionIsolation.unavailableFallback !== "stop")
  )
    throw new Error(
      `${plan.classification.size} plan requires an executionIsolation policy`,
    );
  if (plan.executionIsolation !== undefined) {
    const isolation = plan.executionIsolation;
    if (
      isolation?.version !== 1 ||
      typeof isolation.enforced !== "boolean" ||
      !isolationFallbacks.has(isolation.unavailableFallback)
    )
      throw new Error("plan has invalid executionIsolation policy");
    if (
      isolation.enforced &&
      ["L", "XL"].includes(plan.classification.size) &&
      !plan.packets.some((packet) =>
        guardedModes.has(packet.preferredExecutionMode),
      )
    )
      throw new Error(
        `${plan.classification.size} execution isolation requires at least one guarded packet`,
      );
  }
  if (
    config.sizing.decompositionRequired.includes(plan.classification.size) &&
    plan.packets.length < 2
  )
    throw new Error(`${plan.classification.size} work requires decomposition`);
  return plan;
}

export function createPlan(
  assessment,
  config,
  requirementsState = null,
  scenarioSemantics = null,
) {
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
    version: 2,
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
    ...(scenarioSemantics
      ? { contractDerivedTdd: contractDerivedTddBinding(scenarioSemantics) }
      : {}),
    ...(assessment.specDrivenTdd
      ? { specDrivenTdd: stableValue(assessment.specDrivenTdd) }
      : {}),
    ...(["L", "XL"].includes(classification.size) ||
    assessment.executionIsolation
      ? {
          executionIsolation: {
            version: 1,
            ...assessment.executionIsolation,
            enforced: ["L", "XL"].includes(classification.size)
              ? true
              : assessment.executionIsolation?.enforced === true,
            unavailableFallback: ["L", "XL"].includes(classification.size)
              ? "stop"
              : (assessment.executionIsolation?.unavailableFallback ?? "stop"),
          },
        }
      : {}),
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
  assertTddReviewContext(plan, state, packetId);
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet) throw new Error(`unknown packet ${packetId}`);
  const allFiles = await walk(repoRoot);
  const sources = [
    ...new Set(
      packet.contextSources.flatMap((pattern) =>
        allFiles.filter((file) => matchesPattern(file, pattern)),
      ),
    ),
  ].sort(order);
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
    planId: plan.id,
    packet,
    sources,
    missingPatterns,
    dependencyHandoffs,
    disclosure: "paths-and-current-handoff-only",
  };
}

const tddSlicesForPacket = (plan, packetId, role) =>
  (plan.specDrivenTdd?.slices ?? []).filter(
    (slice) =>
      slice.applicability === "enforced" &&
      slice[
        role === "implementation"
          ? "implementationPacket"
          : role === "review"
            ? "testReviewPacket"
            : "testDesignPacket"
      ] === packetId,
  );

const assertTddPacketReady = (plan, state, packetId) => {
  for (const slice of tddSlicesForPacket(plan, packetId, "implementation")) {
    if (state.specDrivenTdd?.slices?.[slice.id]?.status !== "red-proven")
      throw new Error(
        `packet ${packetId} requires accepted RED for spec-driven TDD slice ${slice.id}`,
      );
  }
};

const assertTddPacketComplete = (plan, state, packetId) => {
  for (const slice of tddSlicesForPacket(plan, packetId, "implementation")) {
    if (state.specDrivenTdd?.slices?.[slice.id]?.status !== "green-proven")
      throw new Error(
        `packet ${packetId} requires accepted GREEN for spec-driven TDD slice ${slice.id}`,
      );
  }
};

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
        packet.dependencies.every((id) => completed.has(id)) &&
        tddSlicesForPacket(plan, packet.id, "review").every(
          (slice) =>
            state?.specDrivenTdd?.slices?.[slice.id]?.status ===
            "pending-test-review",
        ) &&
        tddSlicesForPacket(plan, packet.id, "implementation").every(
          (slice) =>
            state?.specDrivenTdd?.slices?.[slice.id]?.status === "red-proven",
        ),
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
    "claimId",
    "briefDigest",
    "workerReportDigest",
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
  for (const key of ["claimId", "briefDigest", "workerReportDigest"])
    if (
      value[key] !== undefined &&
      (typeof value[key] !== "string" || value[key].length === 0)
    )
      throw new Error(`handoff ${key} must be a non-empty string`);
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
    ...(plan.specDrivenTdd
      ? {
          specDrivenTdd: {
            version: 1,
            slices: Object.fromEntries(
              plan.specDrivenTdd.slices.map((slice) => [
                slice.id,
                {
                  status:
                    slice.applicability === "inapplicable"
                      ? "inapplicable"
                      : "pending-test-design",
                  ...(slice.applicability === "inapplicable"
                    ? { reason: slice.reason, evidence: slice.evidence }
                    : {}),
                },
              ]),
            ),
          },
        }
      : {}),
  };
}

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  return value;
};

const valueDigest = (value) =>
  createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");

const {
  assertTddReviewContext,
  createTddReentryEvidence,
  createTddDesignEvidence,
  runTddAcceptance,
  recordTddDesign,
  recordTddReview,
  recordTddRed,
  authorizeTddImplementation,
  recordTddGreen,
  tddRetentionIdentity,
} = createSpecDrivenTdd({
  stableValue,
  valueDigest,
  fingerprintFiles,
  walk,
  matchesPattern,
  validateExecutionBaseline,
  assertExecutionBaselineState,
  gitExecutionBaselineState,
});

export {
  createTddReentryEvidence,
  createTddDesignEvidence,
  runTddAcceptance,
  recordTddDesign,
  recordTddReview,
  recordTddRed,
  authorizeTddImplementation,
  recordTddGreen,
};

const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
};

const dependencySnapshot = (packet, state) =>
  Object.fromEntries(
    packet.dependencies.map((id) => {
      const handoff = state.handoffs[id];
      if (!handoff)
        throw new Error(`packet ${packet.id} dependency ${id} has no handoff`);
      return [id, valueDigest(handoff)];
    }),
  );

const packetContractDigest = (packet) =>
  valueDigest(
    Object.fromEntries(
      requiredPacketFields.map((field) => [field, packet[field]]),
    ),
  );

export function createWorkerBrief(
  plan,
  state,
  packetId,
  { baseline, requirementsState = null, claimId, contextCapsule = null },
) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet) throw new Error(`unknown packet ${packetId}`);
  assertTddReviewContext(plan, state, packetId, contextCapsule);
  if (!readyPackets(plan, state).some(({ id }) => id === packetId))
    throw new Error(`packet ${packetId} is not ready for a worker brief`);
  if (!claimId) throw new Error("worker brief requires claimId");
  const baselineDigest = valueDigest(validateExecutionBaseline(baseline));
  const requirementsRevisionValue =
    state.requirementsRevision ?? plan.requirementsRevision ?? null;
  const body = {
    version: 1,
    planId: plan.id,
    packet: stableValue(
      Object.fromEntries(
        requiredPacketFields.map((field) => [field, packet[field]]),
      ),
    ),
    claimId,
    baseline: stableValue(baseline),
    baselineDigest,
    requirements: {
      revision: requirementsRevisionValue,
      openSpecChange: plan.openSpecChange ?? null,
    },
    dependencyDigests: dependencySnapshot(packet, state),
    packetDigest: packetContractDigest(packet),
    contextIndex: [...packet.contextSources],
    allowedImplementationSurface: [...packet.implementationSurface],
    focusedValidation: [...packet.focusedValidation],
    ...(contextCapsule ? { phaseInput: stableValue(contextCapsule) } : {}),
    lifecycle: {
      completion:
        "perform only this packet and report results; after the subprocess exits, the root orchestrator binds the runtime claim, validates the result, and writes the durable handoff",
      pause:
        "pause through a newer requirements revision on material ambiguity",
      failure: "report partial work; never fabricate completion",
    },
  };
  return deepFreeze({ ...body, briefDigest: valueDigest(body) });
}

export function recordWorkerAttempt(
  plan,
  state,
  packetId,
  brief,
  result,
  session,
  requirementsState = null,
) {
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet) throw new Error(`unknown packet ${packetId}`);
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  const reserved = state.packets[packetId];
  if (
    reserved?.status !== "launching" ||
    reserved.claimId !== brief.claimId ||
    reserved.briefDigest !== brief.briefDigest
  )
    throw new Error(`packet ${packetId} does not have this worker reservation`);
  const { briefDigest, ...briefBody } = brief;
  if (brief.packet.id !== packetId || briefDigest !== valueDigest(briefBody))
    throw new Error("worker brief digest is invalid");
  if (
    brief.packetDigest !== packetContractDigest(packet) ||
    brief.requirements.revision !==
      (state.requirementsRevision ?? plan.requirementsRevision ?? null) ||
    valueDigest(brief.dependencyDigests) !==
      valueDigest(dependencySnapshot(packet, state))
  ) {
    state.packets[packetId] = {
      ...reserved,
      status: "failed",
      retryable: true,
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
      failure: {
        terminalStatus: "stale-brief",
        launchId: result?.launchId ?? null,
        reason: "requirements, packet contract, or dependency handoff changed",
      },
    };
    return state;
  }
  if (
    !result?.evidence ||
    result.terminalStatus === "unavailable" ||
    result.terminalStatus === "unattested"
  ) {
    if (
      result?.terminalStatus === "unavailable" &&
      plan.executionIsolation?.unavailableFallback === "continue"
    ) {
      state.packets[packetId] = {
        ...reserved,
        status: "claimed",
        session,
        claimId: brief.claimId,
        briefDigest: brief.briefDigest,
        baselineDigest: brief.baselineDigest,
        dependencyDigests: brief.dependencyDigests,
        packetDigest: brief.packetDigest,
        requirementsRevision: brief.requirements.revision,
        execution: {
          source: "declared-fallback",
          mode: "continue",
          reason:
            result.capability?.reason ?? "codex exec isolation unavailable",
        },
      };
      return state;
    }
    state.packets[packetId] = {
      ...reserved,
      status: "failed",
      retryable: true,
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
      failure: {
        terminalStatus: result?.terminalStatus ?? "launch-failed",
        launchId: result?.launchId ?? null,
        evidenceDigest: result?.evidenceDigest ?? null,
      },
    };
    return state;
  }
  const execution = validateExecutionEvidence(result.evidence);
  const workerReportDigest =
    typeof result.workerReport === "string" && result.workerReport.trim()
      ? createHash("sha256").update(result.workerReport).digest("hex")
      : null;
  if (
    result.terminalStatus === "completed" &&
    (!workerReportDigest || result.workerReportDigest !== workerReportDigest)
  ) {
    state.packets[packetId] = {
      ...reserved,
      status: "failed",
      retryable: true,
      claimId: brief.claimId,
      briefDigest: brief.briefDigest,
      failure: {
        terminalStatus: "invalid-worker-report",
        launchId: result.launchId ?? null,
        reason: "completed worker did not produce a digest-bound final report",
      },
    };
    return state;
  }
  const duplicate = Object.entries(state.packets).find(
    ([id, value]) =>
      id !== packetId && value.execution?.runtimeId === execution.runtimeId,
  );
  if (duplicate)
    throw new Error(
      `guarded execution ${execution.runtimeId} is already bound to packet ${duplicate[0]}`,
    );
  if (result.terminalStatus === "completed")
    for (const slice of tddSlicesForPacket(plan, packetId, "implementation"))
      authorizeTddImplementation(plan, state, slice.id, execution.runtimeId);
  state.packets[packetId] = {
    ...reserved,
    status: "claimed",
    session,
    execution,
    claimId: brief.claimId,
    briefDigest: brief.briefDigest,
    baselineDigest: brief.baselineDigest,
    dependencyDigests: brief.dependencyDigests,
    packetDigest: brief.packetDigest,
    requirementsRevision: brief.requirements.revision,
    launch: {
      terminalStatus: result.terminalStatus,
      launchId: result.launchId,
      usage: result.usage ?? null,
      workerReport: result.workerReport ?? null,
      workerReportDigest,
    },
  };
  if (result.terminalStatus !== "completed") {
    state.packets[packetId].status = "failed";
    state.packets[packetId].retryable = true;
  }
  return state;
}

export function reserveWorkerPacket(
  plan,
  state,
  packetId,
  brief,
  session,
  requirementsState = null,
) {
  const packet = plan.packets.find(({ id }) => id === packetId);
  if (!packet) throw new Error(`unknown packet ${packetId}`);
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  if (!guardedModes.has(packet.preferredExecutionMode))
    throw new Error(`packet ${packetId} does not require a worker`);
  if (!readyPackets(plan, state).some(({ id }) => id === packetId))
    throw new Error(`packet ${packetId} is not ready for reservation`);
  const { briefDigest, ...briefBody } = brief;
  if (
    brief.packet.id !== packetId ||
    briefDigest !== valueDigest(briefBody) ||
    brief.packetDigest !== packetContractDigest(packet) ||
    valueDigest(brief.dependencyDigests) !==
      valueDigest(dependencySnapshot(packet, state))
  )
    throw new Error("worker brief is invalid or stale");
  state.packets[packetId] = {
    attemptHistory: state.packets[packetId]?.attemptHistory ?? [],
    ...(state.packets[packetId]?.attempts !== undefined
      ? { attempts: state.packets[packetId].attempts }
      : {}),
    status: "launching",
    session,
    claimId: brief.claimId,
    briefDigest,
    baselineDigest: brief.baselineDigest,
    dependencyDigests: brief.dependencyDigests,
    packetDigest: brief.packetDigest,
    requirementsRevision: brief.requirements.revision,
  };
  return state;
}

export function retryWorkerPacket(state, packetId) {
  const current = state.packets[packetId];
  if (current?.status !== "failed" || current.retryable !== true)
    throw new Error(`packet ${packetId} is not retryable`);
  state.packets[packetId] = {
    status: "pending",
    attempts: (current.attempts ?? 0) + 1,
    attemptHistory: [
      ...(current.attemptHistory ?? []),
      {
        session: current.session,
        claimId: current.claimId ?? null,
        briefDigest: current.briefDigest ?? null,
        execution: current.execution ?? null,
        launch: current.launch ?? null,
        failure: current.failure ?? null,
      },
    ],
  };
  return state;
}

export function failWorkerReservation(state, packetId, error, result = null) {
  const current = state.packets[packetId];
  if (current?.status !== "launching")
    throw new Error(`packet ${packetId} does not have a worker reservation`);
  state.packets[packetId] = {
    ...current,
    status: "failed",
    retryable: true,
    failure: {
      terminalStatus: "recording-failed",
      launchId: result?.launchId ?? null,
      runtimeId: result?.evidence?.runtimeId ?? null,
      evidenceDigest: result?.evidence?.evidenceDigest ?? null,
      reason: error instanceof Error ? error.message : String(error),
    },
  };
  return state;
}

function validateExecutionEvidence(evidence) {
  if (
    !evidence ||
    evidence.version !== 1 ||
    evidence.source !== "codex-exec-jsonl" ||
    typeof evidence.runtimeId !== "string" ||
    !evidence.runtimeId ||
    typeof evidence.launchId !== "string" ||
    !evidence.launchId ||
    typeof evidence.startedAt !== "string" ||
    !Number.isFinite(Date.parse(evidence.startedAt)) ||
    typeof evidence.evidenceDigest !== "string" ||
    !/^[0-9a-f]{64}$/.test(evidence.evidenceDigest)
  )
    throw new Error(
      "guarded claim requires runtime-issued codex exec JSONL evidence",
    );
  return evidence;
}

export function claimPacket(
  plan,
  state,
  packetId,
  session,
  requirementsState = null,
  executionEvidence = null,
) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  if (!session) throw new Error("claim requires session");
  assertTddPacketReady(plan, state, packetId);
  if (!readyPackets(plan, state).some(({ id }) => id === packetId))
    throw new Error(`packet ${packetId} is not ready or already claimed`);
  const packet = plan.packets.find(({ id }) => id === packetId);
  const guarded =
    plan.executionIsolation?.enforced === true &&
    guardedModes.has(packet.preferredExecutionMode);
  let execution;
  if (guarded) {
    execution = validateExecutionEvidence(executionEvidence);
    const duplicate = Object.entries(state.packets).find(
      ([id, value]) =>
        id !== packetId && value.execution?.runtimeId === execution.runtimeId,
    );
    if (duplicate)
      throw new Error(
        `guarded execution ${execution.runtimeId} is already bound to packet ${duplicate[0]}`,
      );
  }
  for (const slice of tddSlicesForPacket(plan, packetId, "implementation"))
    authorizeTddImplementation(plan, state, slice.id, execution?.runtimeId);
  state.packets[packetId] = {
    status: "claimed",
    session,
    ...(execution ? { execution } : {}),
  };
  return state;
}

function tddReentryClassifications(
  enforced,
  reentry,
  fromRevision,
  toRevision,
) {
  if (
    reentry?.version !== 1 ||
    reentry.fromRevision !== fromRevision ||
    reentry.toRevision !== toRevision ||
    !Array.isArray(reentry.slices)
  )
    throw new Error(
      "requirements pause for spec-driven TDD requires a revision-bound slice re-entry classification",
    );
  const classifications = new Map();
  for (const item of reentry.slices) {
    if (
      !item?.sliceId ||
      !["affected", "retained"].includes(item.classification) ||
      (item.classification === "retained" && !item.evidence) ||
      classifications.has(item.sliceId)
    )
      throw new Error("spec-driven TDD re-entry classifications are invalid");
    classifications.set(item.sliceId, item);
  }
  if (
    classifications.size !== enforced.length ||
    enforced.some(({ id }) => !classifications.has(id))
  )
    throw new Error(
      "spec-driven TDD re-entry must classify every enforced slice",
    );
  return classifications;
}

function applyTddRequirementsReentry(
  plan,
  state,
  packetId,
  fromRevision,
  toRevision,
  reentry,
) {
  const enforced = (plan.specDrivenTdd?.slices ?? []).filter(
    ({ applicability }) => applicability === "enforced",
  );
  if (!enforced.length) return;
  const classifications = tddReentryClassifications(
    enforced,
    reentry,
    fromRevision,
    toRevision,
  );

  for (const contract of enforced) {
    const lifecycle = state.specDrivenTdd?.slices?.[contract.id];
    const classification = classifications.get(contract.id);
    if (!lifecycle)
      throw new Error(
        `spec-driven TDD slice ${contract.id} retention requires completed digest-identical evidence`,
      );
    if (classification.classification === "retained") {
      const currentIdentity = tddRetentionIdentity(
        plan,
        state,
        contract,
        lifecycle.design ?? {},
      );
      if (
        lifecycle.status !== "green-proven" ||
        lifecycle.sliceContractDigest !== valueDigest(contract) ||
        valueDigest(classification.evidence) !== valueDigest(currentIdentity) ||
        valueDigest(lifecycle.retentionIdentity) !==
          valueDigest(currentIdentity)
      )
        throw new Error(
          `spec-driven TDD slice ${contract.id} retention requires completed digest-identical evidence`,
        );
      lifecycle.retention = {
        classification: "retained",
        fromRevision,
        toRevision,
        sliceContractDigest: lifecycle.sliceContractDigest,
      };
      continue;
    }
    state.specDrivenTdd.slices[contract.id] = {
      status: "pending-test-design",
      invalidation: {
        reason: "requirements revision affects this slice",
        fromRevision,
        toRevision,
        previousDesignDigest: lifecycle.designDigest ?? null,
        previousRedDigest: lifecycle.redDigest ?? null,
        previousGreenDigest: lifecycle.greenDigest ?? null,
      },
    };
    for (const affectedPacket of [
      contract.testDesignPacket,
      ...(contract.testReviewPacket ? [contract.testReviewPacket] : []),
      contract.implementationPacket,
    ]) {
      if (affectedPacket === packetId) continue;
      state.packets[affectedPacket] = { status: "pending" };
      delete state.handoffs[affectedPacket];
    }
  }
}

export function pausePacket(
  plan,
  state,
  packetId,
  requirementsState,
  tddReentry = null,
) {
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
  applyTddRequirementsReentry(
    plan,
    state,
    packetId,
    currentRevision,
    nextRevision,
    tddReentry,
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
  if (
    plan.executionIsolation?.enforced &&
    guardedModes.has(packet.preferredExecutionMode)
  ) {
    state.packets[packetId] = {
      status: "pending",
      requirementsRevision: state.requirementsRevision,
      attempts: (current.attempts ?? 0) + 1,
    };
    return state;
  }
  state.packets[packetId] = {
    status: "claimed",
    session,
    requirementsRevision: state.requirementsRevision,
  };
  return state;
}

export function completePacket(
  plan,
  state,
  handoff,
  requirementsState = null,
  completionContext = {},
) {
  assertPlanRequirements(
    plan,
    requirementsState,
    state.requirementsRevision ?? plan.requirementsRevision,
  );
  validateHandoff(handoff, plan);
  const current = state.packets[handoff.completedPacket];
  if (current?.status !== "claimed")
    throw new Error(`packet ${handoff.completedPacket} must be claimed first`);
  assertTddPacketComplete(plan, state, handoff.completedPacket);
  if (current.briefDigest) {
    const packet = plan.packets.find(
      ({ id }) => id === handoff.completedPacket,
    );
    if (
      !completionContext.baseline ||
      valueDigest(validateExecutionBaseline(completionContext.baseline)) !==
        current.baselineDigest
    )
      throw new Error(
        "worker completion rejected because its baseline is stale",
      );
    if (current.packetDigest !== packetContractDigest(packet))
      throw new Error(
        "worker completion rejected because its packet contract is stale",
      );
    if (
      current.requirementsRevision !==
      (state.requirementsRevision ?? plan.requirementsRevision ?? null)
    )
      throw new Error(
        "worker completion rejected because requirements revision is stale",
      );
    const currentDependencies = dependencySnapshot(packet, state);
    if (
      valueDigest(currentDependencies) !==
      valueDigest(current.dependencyDigests)
    )
      throw new Error(
        "worker completion rejected because dependency handoff is stale",
      );
    if (
      handoff.claimId !== current.claimId ||
      handoff.briefDigest !== current.briefDigest
    )
      throw new Error(
        "worker completion does not match the active claim and brief",
      );
    if (current.execution?.source === "codex-exec-jsonl") {
      if (
        !current.launch?.workerReport ||
        !current.launch.workerReportDigest ||
        handoff.workerReportDigest !== current.launch.workerReportDigest
      )
        throw new Error(
          "worker completion requires the adapter-bound worker report digest",
        );
    }
  }
  state.packets[handoff.completedPacket] = {
    ...current,
    status: "completed",
  };
  state.handoffs[handoff.completedPacket] = handoff;
  return state;
}

const validationImpactKinds = new Set([
  "harness",
  "spec",
  "docs",
  "product",
  "browser-contract",
  "browser-executable",
]);

const conservativeBrowserValidation = (config, escalation) => [
  {
    id: "full-browser",
    ...config.validationTargets["full-browser"],
    escalation,
  },
];

export function affectedValidation(files, config, impact = null) {
  const selected = new Set();
  for (const rule of config.validationRules)
    if (
      files.some((file) =>
        rule.patterns.some((pattern) => matchesPattern(file, pattern)),
      )
    )
      for (const target of rule.targets) selected.add(target);
  if (files.length > 0 && selected.size === 0) selected.add("full");
  if (impact !== null) {
    const valid =
      impact?.version === 1 &&
      Array.isArray(impact.kinds) &&
      impact.kinds.length > 0 &&
      impact.kinds.every((kind) => validationImpactKinds.has(kind)) &&
      typeof impact.browserExecutable === "boolean";
    if (!valid) return conservativeBrowserValidation(config, "unknown-impact");
    const selectedBrowser = [...selected].some(
      (id) => config.validationTargets[id]?.browser === true,
    );
    if (!impact.browserExecutable && selectedBrowser)
      return conservativeBrowserValidation(
        config,
        "contradictory-browser-impact",
      );
    if (impact.browserExecutable && !selectedBrowser)
      selected.add("full-browser");
    if (!impact.browserExecutable)
      for (const id of [...selected])
        if (config.validationTargets[id]?.browser === true) selected.delete(id);
  }
  return [...selected]
    .map((id) => ({ id, ...config.validationTargets[id] }))
    .sort((a, b) => a.level - b.level || order(a.id, b.id));
}

export function validationInputFiles(files, target, config) {
  const definition = config.validationTargets[target];
  if (!definition) throw new Error(`unknown validation target ${target}`);
  const patterns = [
    ...definition.fingerprintPatterns,
    ...(config.validationPolicyPatterns ?? []),
    ...(definition.browser ? (config.browserValidationPatterns ?? []) : []),
  ];
  return [...new Set(files)]
    .filter(
      (file) =>
        patterns.some((pattern) => matchesPattern(file, pattern)) &&
        !(definition.fingerprintIgnorePatterns ?? []).some((pattern) =>
          matchesPattern(file, pattern),
        ),
    )
    .sort(order);
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
  for (const file of [...files].sort(order)) {
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
  const entry = ledger.find(
    (entry) =>
      entry.target === target &&
      entry.fingerprint === currentFingerprint &&
      entry.outcome === "pass",
  );
  if (definition.expensive && entry && !reason)
    return { action: "reuse", entry };
  return { action: "run" };
}

export async function recordValidation(
  {
    target,
    files,
    outcome,
    reason,
    packet,
    session,
    obligations = [],
    rawLog = null,
  },
  ledger,
  config,
  repoRoot,
) {
  if (!files.length || !["pass", "fail"].includes(outcome))
    throw new Error("validation record requires files and pass/fail outcome");
  const currentFingerprint = await fingerprintFiles(files, repoRoot);
  const decision = assertValidationRun(
    { target, currentFingerprint, reason },
    ledger,
    config,
  );
  if (decision.action === "reuse") return decision;
  if (!rawLog) throw new Error("validation record requires a retained raw log");
  const root = await realpath(repoRoot);
  const targetPath = await realpath(path.resolve(repoRoot, rawLog));
  if (targetPath !== root && !targetPath.startsWith(`${root}${path.sep}`))
    throw new Error(`validation raw log escapes repository: ${rawLog}`);
  const content = await readFile(targetPath);
  const rawDigest = createHash("sha256").update(content).digest("hex");
  const retainedPath = `docs/exec-plans/raw-logs/${rawDigest}.log`;
  await mkdir(path.dirname(path.join(repoRoot, retainedPath)), {
    recursive: true,
  });
  await writeFile(path.join(repoRoot, retainedPath), content);
  const rawLogEvidence = {
    path: retainedPath,
    digest: rawDigest,
    bytes: content.byteLength,
  };
  ledger.push({
    target,
    command: config.validationTargets[target].command,
    files: [...files].sort(order),
    fingerprint: currentFingerprint,
    outcome,
    obligations: [...new Set(obligations)].sort(order),
    rawLog: rawLogEvidence,
    reason: reason ?? null,
    packet,
    session,
    recordedAt: new Date().toISOString(),
  });
  return { action: "record", entry: ledger.at(-1) };
}

const failurePathConcerns = new Set([
  "state-machine",
  "persistence",
  "subprocess",
]);
const failurePathInvariants = new Map([
  ["launch-recording-is-recoverable", "state-machine"],
  ["declared-fallback-can-complete", "state-machine"],
  ["retry-state-is-monotonic", "persistence"],
  ["persisted-completions-are-report-bound", "persistence"],
  ["stdin-failure-settles-once", "subprocess"],
  ["terminal-events-have-defined-precedence", "subprocess"],
]);

const failureInvariantMarker =
  /^<!-- failure-invariant: ([a-z0-9]+(?:-[a-z0-9]+)*) concern=(state-machine|persistence|subprocess) -->$/;

function assertFailureInvariantManifest(change, manifest) {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(change ?? "") ||
    !manifest ||
    manifest.version !== 1 ||
    manifest.change !== change ||
    !Array.isArray(manifest.invariants) ||
    !manifest.invariants.length
  )
    throw new Error("change-specific failure invariant manifest is invalid");
}

async function findDeltaSpecFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await findDeltaSpecFiles(target)));
    else if (entry.isFile() && entry.name === "spec.md") files.push(target);
  }
  return files;
}

function parseFailureInvariantSources(
  text,
  file,
  repoRoot,
  sources,
  identities,
) {
  const lines = text.split(/\r?\n/);
  let requirement = null;
  let requirementContract = null;
  for (let index = 0; index < lines.length; index += 1) {
    const requirementMatch = lines[index].match(/^### Requirement: (.+)$/);
    if (requirementMatch) {
      requirement = requirementMatch[1];
      const sectionEnd = lines.findIndex(
        (line, candidate) =>
          candidate > index && /^### Requirement:/.test(line),
      );
      const contractEnd = lines.findIndex(
        (line, candidate) =>
          candidate > index &&
          (sectionEnd === -1 || candidate < sectionEnd) &&
          (failureInvariantMarker.test(line) || /^#### Scenario:/.test(line)),
      );
      requirementContract = lines
        .slice(index, contractEnd === -1 ? sectionEnd : contractEnd)
        .join("\n")
        .trim();
    }
    const marker = lines[index].match(failureInvariantMarker);
    if (!marker) continue;
    let scenarioIndex = index + 1;
    while (lines[scenarioIndex] === "") scenarioIndex += 1;
    const scenarioMatch = lines[scenarioIndex]?.match(/^#### Scenario: (.+)$/);
    if (!requirement || !scenarioMatch)
      throw new Error(
        `failure invariant marker is not adjacent to a scenario: ${path.relative(repoRoot, file)}:${index + 1}`,
      );
    const [, id, concern] = marker;
    if (sources.has(id))
      throw new Error(`duplicate failure invariant marker: ${id}`);
    const identity = `${requirement}\0${scenarioMatch[1]}`;
    if (identities.has(identity))
      throw new Error(
        `duplicate failure invariant contract identity: ${requirement} / ${scenarioMatch[1]}`,
      );
    identities.add(identity);
    const end = lines.findIndex(
      (line, candidate) =>
        candidate > scenarioIndex &&
        /^(### Requirement:|#### Scenario:)/.test(line),
    );
    sources.set(id, {
      id,
      concern,
      requirement,
      scenario: scenarioMatch[1],
      spec: path.relative(repoRoot, file).split(path.sep).join("/"),
      contract: {
        requirement: requirementContract,
        scenario: lines
          .slice(scenarioIndex, end === -1 ? lines.length : end)
          .join("\n")
          .trim(),
      },
    });
  }
}

function normalizeFailureInvariantManifest(manifest, sources) {
  const ids = new Set();
  const normalized = manifest.invariants.map((item) => {
    if (
      !item ||
      typeof item.id !== "string" ||
      ids.has(item.id) ||
      !failurePathConcerns.has(item.concern) ||
      typeof item.requirement !== "string" ||
      typeof item.scenario !== "string"
    )
      throw new Error("change-specific failure invariant entry is invalid");
    ids.add(item.id);
    const source = sources.get(item.id);
    if (
      !source ||
      source.concern !== item.concern ||
      source.requirement !== item.requirement ||
      source.scenario !== item.scenario
    )
      throw new Error(
        `change-specific failure invariant is ungrounded: ${item.id}`,
      );
    return {
      id: source.id,
      concern: source.concern,
      requirement: source.requirement,
      scenario: source.scenario,
      spec: source.spec,
    };
  });
  const uncovered = [...sources.keys()].filter((id) => !ids.has(id));
  if (uncovered.length)
    throw new Error(
      `change-specific failure invariants do not cover: ${uncovered.join(", ")}`,
    );
  return normalized;
}

export async function loadChangeFailureInvariants(change, manifest, repoRoot) {
  assertFailureInvariantManifest(change, manifest);
  const changeRoot = path.resolve(repoRoot, "openspec/changes", change);
  const specsRoot = path.join(changeRoot, "specs");
  const resolvedRoot = path.resolve(repoRoot);
  if (
    changeRoot !== resolvedRoot &&
    !changeRoot.startsWith(`${resolvedRoot}${path.sep}`)
  )
    throw new Error(
      "change-specific failure invariant change escapes repository",
    );
  let files;
  try {
    files = (await findDeltaSpecFiles(specsRoot)).sort(order);
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error(`OpenSpec change has no delta specs: ${change}`);
    throw error;
  }
  const sources = new Map();
  const identities = new Set();
  for (const file of files) {
    parseFailureInvariantSources(
      await readFile(file, "utf8"),
      file,
      repoRoot,
      sources,
      identities,
    );
  }
  const normalized = normalizeFailureInvariantManifest(manifest, sources);
  const contractDigest = valueDigest({
    sources: [...sources.values()].map(({ contract, ...source }) => ({
      ...source,
      contract,
    })),
  });
  const binding = {
    version: 1,
    change,
    invariants: stableValue(normalized),
    contractDigest,
  };
  binding.manifestDigest = valueDigest(binding);
  return binding;
}

export function createReviewState(
  base,
  concerns = [],
  changeBinding = null,
  tddBinding = null,
) {
  if (!base) throw new Error("review base is required");
  if (
    !Array.isArray(concerns) ||
    new Set(concerns).size !== concerns.length ||
    concerns.some((concern) => !failurePathConcerns.has(concern))
  )
    throw new Error("review failure-path concerns are invalid");
  return {
    version: 1,
    base,
    passes: [],
    findings: [],
    ...(concerns.length ? { failurePathConcerns: concerns } : {}),
    ...(changeBinding
      ? { changeFailureInvariants: stableValue(changeBinding) }
      : {}),
    ...(tddBinding ? { specDrivenTdd: stableValue(tddBinding) } : {}),
  };
}

export function createTddReviewBinding(plan, state, candidateHead) {
  const enforced = (plan.specDrivenTdd?.slices ?? []).filter(
    ({ applicability }) => applicability === "enforced",
  );
  if (!enforced.length) return null;
  if (!/^[0-9a-f]{40}$/.test(candidateHead ?? ""))
    throw new Error("spec-driven TDD review requires a candidate head");
  const currentRevision =
    state.requirementsRevision ?? plan.requirementsRevision ?? 1;
  const slices = enforced.map((contract) => {
    const lifecycle = state.specDrivenTdd?.slices?.[contract.id];
    if (lifecycle?.status !== "green-proven")
      throw new Error(
        `spec-driven TDD slice ${contract.id} requires accepted GREEN`,
      );
    if (
      plan.specDrivenTdd.version >= 2 &&
      (!lifecycle.reviewDigest ||
        lifecycle.retentionIdentity?.reviewDigest !== lifecycle.reviewDigest)
    )
      throw new Error(
        `spec-driven TDD slice ${contract.id} test-contract approval evidence is stale`,
      );
    if (lifecycle.sliceContractDigest !== valueDigest(contract))
      throw new Error(
        `spec-driven TDD slice ${contract.id} contract evidence is stale`,
      );
    const retained = lifecycle.retention?.toRevision === currentRevision;
    if (lifecycle.design.requirementsRevision !== currentRevision && !retained)
      throw new Error(
        `spec-driven TDD slice ${contract.id} requirements evidence is stale`,
      );
    if (lifecycle.green.candidateHead !== candidateHead)
      throw new Error(
        `spec-driven TDD slice ${contract.id} candidate head is stale`,
      );
    return {
      id: contract.id,
      designDigest: lifecycle.designDigest,
      ...(lifecycle.reviewDigest
        ? { testReviewDigest: lifecycle.reviewDigest }
        : {}),
      redDigest: lifecycle.redDigest,
      greenDigest: lifecycle.greenDigest,
      sliceContractDigest: lifecycle.sliceContractDigest,
      requirementsRevision: currentRevision,
      candidateHead,
      ...(retained ? { retention: lifecycle.retention } : {}),
    };
  });
  const binding = { version: 1, candidateHead, slices: stableValue(slices) };
  return { ...binding, evidenceDigest: valueDigest(binding) };
}

export const failurePathResultDigest = (proof) =>
  valueDigest({
    version: proof.version,
    reviewBase: proof.reviewBase,
    knownBadRevision: proof.knownBadRevision,
    reviewedHead: proof.reviewedHead,
    invariants: proof.invariants,
    command: proof.command,
    openSpecChange: proof.openSpecChange,
    manifestDigest: proof.manifestDigest,
    contractDigest: proof.contractDigest,
  });

export function recordFailurePathProof(state, proof) {
  const concerns = state.failurePathConcerns ?? [];
  const changeBinding = state.changeFailureInvariants ?? null;
  if (!concerns.length)
    throw new Error("review does not require a failure-path proof");
  if (
    !proof ||
    proof.version !== 1 ||
    !Array.isArray(proof.command) ||
    !proof.command.length ||
    proof.command.some((part) => typeof part !== "string" || !part) ||
    proof.reviewBase !== state.base ||
    !/^[0-9a-f]{64}$/.test(proof.resultDigest ?? "") ||
    proof.resultDigest !== failurePathResultDigest(proof) ||
    !/^[0-9a-f]{40}$/.test(proof.knownBadRevision ?? "") ||
    !/^[0-9a-f]{40}$/.test(proof.reviewedHead ?? "") ||
    proof.knownBadRevision === proof.reviewedHead ||
    !Array.isArray(proof.invariants) ||
    !proof.invariants.length ||
    (changeBinding &&
      (proof.openSpecChange !== changeBinding.change ||
        proof.manifestDigest !== changeBinding.manifestDigest ||
        proof.contractDigest !== changeBinding.contractDigest))
  )
    throw new Error("failure-path proof contract is invalid");
  const covered = new Set();
  const ids = new Set();
  const expected = new Map(
    [...failurePathInvariants].filter(([, concern]) =>
      concerns.includes(concern),
    ),
  );
  for (const invariant of changeBinding?.invariants ?? [])
    expected.set(`${changeBinding.change}/${invariant.id}`, invariant.concern);
  for (const invariant of proof.invariants) {
    if (
      typeof invariant.id !== "string" ||
      !invariant.id ||
      ids.has(invariant.id) ||
      expected.get(invariant.id) !== invariant.concern ||
      !concerns.includes(invariant.concern) ||
      invariant.knownBad !== "fail" ||
      invariant.reviewedHead !== "pass"
    )
      throw new Error(
        "failure-path proof must discriminate known-bad and reviewed revisions",
      );
    ids.add(invariant.id);
    covered.add(invariant.concern);
  }
  const missing = concerns.filter((concern) => !covered.has(concern));
  const missingInvariants = [...expected].filter(([id]) => !ids.has(id));
  if (missing.length || missingInvariants.length)
    throw new Error(
      `failure-path proof does not cover: ${[
        ...missing,
        ...missingInvariants.map(([id]) => id),
      ].join(", ")}`,
    );
  if (state.passes.some(({ head }) => head !== proof.reviewedHead)) {
    const invalidated = new Set(state.passes.map(({ pass }) => pass));
    state.passes = [];
    for (const finding of state.findings)
      if (invalidated.has(finding.introducedPass))
        finding.introducedPass = null;
  }
  delete state.failurePathDegradation;
  state.failurePathProof = stableValue(proof);
  return state;
}

export function recordFailurePathDegradation(state, capability, reason) {
  if (!state.failurePathConcerns?.length)
    throw new Error("review does not require failure-path capability");
  if (!new Set(["execution", "independent-method"]).has(capability) || !reason)
    throw new Error("failure-path degradation requires capability and reason");
  state.failurePathDegradation = {
    status: "unavailable",
    capability,
    reason,
    recordedAt: new Date().toISOString(),
  };
  delete state.failurePathProof;
  return state;
}

export function recordReview(
  state,
  { axis, head, findings, tddEvidence = null, tddPlan = null, tddState = null },
) {
  if (
    !["Standards", "Spec"].includes(axis) ||
    !head ||
    !Array.isArray(findings)
  )
    throw new Error(
      "review record requires Standards/Spec axis, head, and findings",
    );
  if (
    state.specDrivenTdd &&
    (!tddEvidence ||
      tddEvidence.evidenceDigest !== state.specDrivenTdd.evidenceDigest ||
      tddEvidence.candidateHead !== head)
  )
    throw new Error("review requires current spec-driven TDD evidence");
  const completesAxes =
    new Set([...state.passes.map((pass) => pass.axis), axis]).size === 2;
  if (
    completesAxes &&
    state.failurePathConcerns?.length &&
    !state.failurePathProof
  )
    throw new Error(
      "independent review requires executable failure-path proof",
    );
  if (state.failurePathProof && head !== state.failurePathProof.reviewedHead)
    throw new Error("failure-path proof is stale for the reviewed head");
  const reentries = findings.filter(
    ({ invalidatesTestContract }) => invalidatesTestContract === true,
  );
  if (reentries.length) {
    if (axis !== "Spec" || !tddPlan || !tddState)
      throw new Error(
        "approval-invalidating Spec findings require TDD test-design re-entry",
      );
    for (const finding of reentries) {
      const contract = tddPlan.specDrivenTdd?.slices.find(
        ({ id }) => id === finding.sliceId,
      );
      const lifecycle = tddState.specDrivenTdd?.slices?.[finding.sliceId];
      if (!contract || !lifecycle || finding.reentry !== "test-design")
        throw new Error(
          "approval-invalidating Spec findings require a valid test-design re-entry",
        );
      tddState.specDrivenTdd.slices[finding.sliceId] = {
        status: "pending-test-design",
        invalidation: {
          reason: `final Spec finding ${finding.id} invalidated test-contract approval`,
          previousDesignDigest: lifecycle.designDigest ?? null,
          previousRedDigest: lifecycle.redDigest ?? null,
          previousGreenDigest: lifecycle.greenDigest ?? null,
        },
      };
      for (const packetId of [
        contract.testDesignPacket,
        contract.testReviewPacket,
        contract.implementationPacket,
      ].filter(Boolean)) {
        tddState.packets[packetId] = { status: "pending" };
        delete tddState.handoffs[packetId];
      }
    }
  }
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
    failurePathProof: {
      required: (state.failurePathConcerns?.length ?? 0) > 0,
      concerns: state.failurePathConcerns ?? [],
      complete: Boolean(state.failurePathProof),
      degradation: state.failurePathDegradation ?? null,
      ...(state.changeFailureInvariants
        ? {
            change: state.changeFailureInvariants.change,
            manifestDigest: state.changeFailureInvariants.manifestDigest,
            contractDigest: state.changeFailureInvariants.contractDigest,
            invariants: state.changeFailureInvariants.invariants,
          }
        : {}),
    },
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

export async function recordEvent(
  file,
  event,
  { trustedRuntime = false } = {},
) {
  if (!eventTypes.has(event.type))
    throw new Error(`unknown telemetry event ${event.type}`);
  if (!event.packet || !event.session || !event.agent || !event.phase)
    throw new Error("telemetry requires packet/session/agent/phase");
  if (("tokens" in event || "contextTokens" in event) && !event.usageSource)
    throw new Error("token/context usage requires usageSource");
  if (
    !trustedRuntime &&
    (event.type === "execution-boundary" ||
      "tokens" in event ||
      "contextTokens" in event ||
      "inputTokens" in event ||
      "cachedInputTokens" in event ||
      "outputTokens" in event)
  )
    throw new Error(
      "runtime identity and usage must be imported from adapter-bound execution state",
    );
  if (
    event.type === "execution-boundary" &&
    (event.executionSource !== "codex-exec-jsonl" ||
      typeof event.runtimeId !== "string" ||
      !event.runtimeId)
  )
    throw new Error(
      "execution boundary requires runtime-issued codex exec JSONL identity",
    );
  await mkdir(path.dirname(file), { recursive: true });
  await appendFile(
    file,
    `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`,
  );
}

export function workerTelemetryEvents(state) {
  const events = [];
  for (const [packet, value] of Object.entries(state.packets ?? {})) {
    if (value.execution?.source !== "codex-exec-jsonl") continue;
    const base = {
      packet,
      session: value.session,
      agent: "codex-worker",
      phase: value.status === "completed" ? "completed" : "execution",
    };
    events.push({
      ...base,
      type: "execution-boundary",
      executionSource: "codex-exec-jsonl",
      runtimeId: value.execution.runtimeId,
    });
    const usage = value.launch?.usage;
    if (usage)
      events.push({
        ...base,
        type: "usage",
        usageSource: "codex-exec-jsonl:turn.completed",
        tokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
        contextTokens: usage.input_tokens,
        ...(Number.isFinite(usage.input_tokens)
          ? { inputTokens: usage.input_tokens }
          : {}),
        ...(Number.isFinite(usage.cached_input_tokens)
          ? { cachedInputTokens: usage.cached_input_tokens }
          : {}),
        ...(Number.isFinite(usage.output_tokens)
          ? { outputTokens: usage.output_tokens }
          : {}),
      });
  }
  return events;
}

export function summarizeEvents(events) {
  const result = {
    events: events.length,
    commands: 0,
    contextReads: 0,
    uniqueReads: 0,
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
    peakActiveContext: "unavailable",
    physicalBoundaries: "unavailable",
    handoffBytes: 0,
    contextRelevance: "unavailable",
    rediscoveryProxies: {
      repeatedReads: 0,
      repeatedDiscoveryCommands: 0,
    },
    logicalSessions: [],
    runtimeUsage: {
      inputTokens: "unavailable",
      cachedInputTokens: "unavailable",
      uncachedInputTokens: "unavailable",
      outputTokens: "unavailable",
      source: "unavailable",
    },
    byPacket: {},
    bySession: {},
    byPhase: {},
  };
  const reads = new Set();
  const discoveryCommands = new Set();
  const runtimeIds = new Set();
  const logicalSessions = new Set();
  let tokens = 0,
    contextTokens = 0,
    usageSeen = false,
    contextSeen = false,
    classifiedReads = 0,
    relevantReads = 0;
  const attempts = new Map();
  const rawUsage = [];
  for (const event of events) {
    logicalSessions.add(event.session);
    if (event.type === "command") {
      result.commands += 1;
      if (event.discovery === true && typeof event.command === "string") {
        if (discoveryCommands.has(event.command))
          result.rediscoveryProxies.repeatedDiscoveryCommands += 1;
        discoveryCommands.add(event.command);
      }
    }
    if (event.type === "context-read") {
      result.contextReads += 1;
      if (reads.has(event.path)) result.repeatedReads += 1;
      reads.add(event.path);
      if (typeof event.relevant === "boolean") {
        classifiedReads += 1;
        if (event.relevant) relevantReads += 1;
      }
    }
    if (event.type === "execution-boundary") {
      runtimeIds.add(event.runtimeId);
      const packetAttempts = attempts.get(event.packet) ?? [];
      packetAttempts.push({
        packet: event.packet,
        session: event.session,
        phase: event.phase,
        attempt: packetAttempts.length + 1,
        runtimeId: event.runtimeId,
      });
      attempts.set(event.packet, packetAttempts);
    }
    if (Number.isFinite(event.handoffBytes))
      result.handoffBytes += event.handoffBytes;
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
    if (event.type === "usage" && Number.isFinite(event.inputTokens))
      rawUsage.push(event);
  }
  result.uniqueReads = reads.size;
  result.logicalSessions = [...logicalSessions].sort(order);
  result.rediscoveryProxies.repeatedReads = result.repeatedReads;
  if (runtimeIds.size)
    result.physicalBoundaries = {
      count: runtimeIds.size,
      runtimeIds: [...runtimeIds].sort(order),
      source: "codex-exec-jsonl",
    };
  if (classifiedReads)
    result.contextRelevance = {
      kind: "observed-read-ratio",
      relevantReads,
      classifiedReads,
      ratio: relevantReads / classifiedReads,
    };
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
  if (contextSeen) result.peakActiveContext = result.contextUsage;
  if (rawUsage.length) {
    const allCached = rawUsage.every((event) =>
      Number.isFinite(event.cachedInputTokens),
    );
    const allOutput = rawUsage.every((event) =>
      Number.isFinite(event.outputTokens),
    );
    const inputTokens = rawUsage.reduce(
      (total, event) => total + event.inputTokens,
      0,
    );
    const cachedInputTokens = allCached
      ? rawUsage.reduce((total, event) => total + event.cachedInputTokens, 0)
      : "unavailable";
    result.runtimeUsage = {
      inputTokens,
      cachedInputTokens,
      uncachedInputTokens: allCached
        ? inputTokens - cachedInputTokens
        : "unavailable",
      outputTokens: allOutput
        ? rawUsage.reduce((total, event) => total + event.outputTokens, 0)
        : "unavailable",
      source:
        rawUsage.length &&
        rawUsage.every((event) => event.usageSource === rawUsage[0].usageSource)
          ? rawUsage[0].usageSource
          : "mixed",
    };
  }
  for (const [packet, packetAttempts] of [...attempts].sort(([left], [right]) =>
    order(left, right),
  )) {
    const usage = rawUsage.filter((event) => event.packet === packet);
    const allCached =
      usage.length > 0 &&
      usage.every((event) => Number.isFinite(event.cachedInputTokens));
    const allOutput =
      usage.length > 0 &&
      usage.every((event) => Number.isFinite(event.outputTokens));
    const inputTokens = usage.length
      ? usage.reduce((total, event) => total + event.inputTokens, 0)
      : "unavailable";
    const cachedInputTokens = allCached
      ? usage.reduce((total, event) => total + event.cachedInputTokens, 0)
      : "unavailable";
    result.byPacket[packet] = {
      attempts: packetAttempts.length,
      physicalBoundaries: packetAttempts.length,
      sessions: packetAttempts.map(({ session }) => session),
      inputTokens,
      cachedInputTokens,
      uncachedInputTokens: allCached
        ? inputTokens - cachedInputTokens
        : "unavailable",
      outputTokens: allOutput
        ? usage.reduce((total, event) => total + event.outputTokens, 0)
        : "unavailable",
    };
    for (const attempt of packetAttempts) {
      const event = usage.find(({ session }) => session === attempt.session);
      const cached = Number.isFinite(event?.cachedInputTokens);
      result.bySession[attempt.session] = {
        packet: attempt.packet,
        phase: attempt.phase,
        attempt: attempt.attempt,
        runtimeId: attempt.runtimeId,
        inputTokens: event?.inputTokens ?? "unavailable",
        cachedInputTokens: cached ? event.cachedInputTokens : "unavailable",
        uncachedInputTokens: cached
          ? event.inputTokens - event.cachedInputTokens
          : "unavailable",
        outputTokens: Number.isFinite(event?.outputTokens)
          ? event.outputTokens
          : "unavailable",
      };
      const phase = (result.byPhase[attempt.phase] ??= {
        attempts: 0,
        physicalBoundaries: 0,
        sessions: [],
      });
      phase.attempts += 1;
      phase.physicalBoundaries += 1;
      phase.sessions.push(attempt.session);
    }
  }
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
    ].sort(order),
    workingTree,
    collectedAt: new Date().toISOString(),
    mutatesRepository: false,
  };
}

export async function gitRouteSurfaces(repoRoot, base, files) {
  const options = { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 };
  const { stdout: mergeBase } = await exec(
    "git",
    ["merge-base", base, "HEAD"],
    options,
  );
  const diffBase = mergeBase.trim();
  const { stdout: rawStatuses } = await exec(
    "git",
    ["diff", "--name-status", diffBase, "--"],
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
        ["diff", "--unified=0", "--no-color", diffBase, "--", file],
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
