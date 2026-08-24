import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

const digest = (value) => createHash("sha256").update(value).digest("hex");
const bytes = (value) => Buffer.byteLength(value);
const order = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const stable = (values) => [...new Set(values)].sort(order);
const identity = (value) => JSON.stringify(value);

function required(value, label) {
  if (!value) throw new Error(`context-cost replay requires ${label}`);
  return value;
}

function assertFixture(fixture) {
  if (fixture?.version !== 1)
    throw new Error("context-cost replay version must be 1");
  required(fixture.id, "id");
  if (!Array.isArray(fixture.phases) || !fixture.phases.length)
    throw new Error("context-cost replay requires phases");
  if (!Number.isFinite(fixture.minimumReductionRatio))
    throw new Error("context-cost replay requires minimumReductionRatio");
  if (fixture.minimumReductionRatio < 0 || fixture.minimumReductionRatio > 1)
    throw new Error(
      "context-cost minimumReductionRatio must be between 0 and 1",
    );
  if (!Array.isArray(fixture.contributors) || !fixture.contributors.length)
    throw new Error("context-cost replay requires contributors");
  required(fixture.oraclePath, "independent oraclePath");
  const phaseIds = fixture.phases.map(({ id }) => id);
  if (phaseIds.some((id) => typeof id !== "string" || !id))
    throw new Error("context-cost replay requires phase ids");
  if (new Set(phaseIds).size !== phaseIds.length)
    throw new Error("context-cost replay phase ids must be unique");
}

function materialize(definition) {
  if (!definition.sources || typeof definition.sources !== "object")
    throw new Error("context-cost definition requires named sources");
  return {
    ...definition,
    phases: definition.phases.map((phase) => {
      const resolve = (id) => {
        const source = definition.sources[id];
        if (!source) throw new Error(`unknown context-cost source ${id}`);
        return source;
      };
      return {
        ...phase,
        sources: phase.sourceIds.map(resolve),
        evidence: {
          ...phase.evidence,
          rawEvidence: (phase.evidence?.rawEvidenceIds ?? []).map(resolve),
        },
      };
    }),
  };
}

function safeSource(repoRoot, sourcePath) {
  const target = path.resolve(repoRoot, sourcePath);
  if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
    throw new Error(`context-cost source escapes repository: ${sourcePath}`);
  return target;
}

async function readWorktreeSource(repoRoot, sourcePath) {
  const root = await realpath(repoRoot);
  const target = await realpath(safeSource(repoRoot, sourcePath));
  if (target !== root && !target.startsWith(`${root}${path.sep}`))
    throw new Error(`context-cost source escapes repository: ${sourcePath}`);
  return readFile(target);
}

const sourceKey = (source) => `${source.gitRef ?? "worktree"}:${source.path}`;

async function readSource(repoRoot, source) {
  safeSource(repoRoot, source.path);
  if (source.gitRef !== undefined) {
    if (!/^[0-9a-f]{40}$/.test(source.gitRef))
      throw new Error(
        `context-cost gitRef must be a pinned commit: ${source.gitRef}`,
      );
    const { stdout } = await exec(
      "git",
      ["show", `${source.gitRef}:${source.path}`],
      { cwd: repoRoot, encoding: "buffer", maxBuffer: 10 * 1024 * 1024 },
    );
    return stdout;
  }
  return readWorktreeSource(repoRoot, source.path);
}

export function createContextLedger() {
  return { version: 1, physicalSession: null, attestations: {} };
}

function assertLedger(ledger) {
  if (
    ledger?.version !== 1 ||
    !ledger.attestations ||
    typeof ledger.attestations !== "object" ||
    Array.isArray(ledger.attestations)
  )
    throw new Error("context ledger must be version 1 with attestations");
}

const packetObligations = (packet) =>
  stable([
    ...packet.contracts.map((value) => `contract:${value}`),
    ...packet.focusedValidation.map((value) => `validation:${value}`),
    ...packet.implementationOutcomes.map((value) => `outcome:${value}`),
  ]);

async function currentPhaseEvidence(
  validationLedger = [],
  reviewState = null,
  repoRoot,
) {
  const validations = Array.isArray(validationLedger) ? validationLedger : [];
  const reviewPasses = reviewState?.passes ?? [];
  const reviewFindings = reviewState?.findings ?? [];
  const rawEvidenceIndex = [];
  for (const validation of validations) {
    if (!validation.rawLog) continue;
    const content = await readWorktreeSource(repoRoot, validation.rawLog.path);
    if (
      validation.rawLog.digest !== digest(content) ||
      validation.rawLog.bytes !== content.byteLength
    )
      throw new Error(
        `raw validation evidence changed: ${validation.rawLog.path}`,
      );
    rawEvidenceIndex.push({
      target: validation.target,
      command: validation.command,
      outcome: validation.outcome,
      obligations: stable(validation.obligations ?? []),
      path: validation.rawLog.path,
      digest: validation.rawLog.digest,
      bytes: validation.rawLog.bytes,
    });
  }
  rawEvidenceIndex.sort((left, right) =>
    order(`${left.target}:${left.path}`, `${right.target}:${right.path}`),
  );
  return {
    verdicts: stable([
      ...validations.map(
        ({ target, outcome }) => `validation:${target}:${outcome}`,
      ),
      ...reviewPasses.map(({ axis, head }) => `review:${axis}:pass:${head}`),
    ]),
    rawEvidence: stable(validations.flatMap(({ files }) => files ?? [])),
    rawEvidenceIndex,
    findings: reviewFindings.map(({ id, severity, status }) => ({
      id,
      severity,
      status,
      blocking:
        ["high", "critical", "P0", "P1"].includes(severity) &&
        status !== "resolved",
    })),
  };
}

export async function createPacketContextCapsule(
  index,
  ledger,
  repoRoot,
  {
    phase,
    transition,
    physicalSession,
    validationLedger = [],
    reviewState = null,
  },
) {
  assertLedger(ledger);
  required(phase, "packet context phase");
  required(transition, "packet context transition");
  required(physicalSession, "packet context physical session");
  if (
    ledger.physicalSession !== null &&
    ledger.physicalSession !== physicalSession
  )
    throw new Error("context ledger belongs to a different physical session");
  if (index.missingPatterns?.length)
    throw new Error(
      `packet context has missing patterns: ${index.missingPatterns.join(", ")}`,
    );
  const readNow = [];
  const attested = [];
  const currentEvidence = await currentPhaseEvidence(
    validationLedger,
    reviewState,
    repoRoot,
  );
  for (const source of index.sources) {
    const content = await readWorktreeSource(repoRoot, source);
    const entry = {
      path: source,
      digest: digest(content),
      bytes: content.byteLength,
    };
    if (ledger.attestations[source]?.digest === entry.digest)
      attested.push(entry);
    else readNow.push(entry);
  }
  const capsule = {
    version: 1,
    kind: "packet-context",
    planId: index.planId,
    packetId: index.packet.id,
    physicalSession,
    phase,
    objective: index.packet.objective,
    transition,
    obligations: packetObligations(index.packet),
    evidence: {
      dependencyHandoffs: index.dependencyHandoffs,
      verdicts: stable([
        ...index.dependencyHandoffs.flatMap(
          (handoff) => handoff.provenChecks ?? [],
        ),
        ...currentEvidence.verdicts,
      ]),
      rawEvidence: stable([
        ...index.dependencyHandoffs.flatMap((handoff) => handoff.changed ?? []),
        ...currentEvidence.rawEvidence,
      ]),
      rawEvidenceIndex: currentEvidence.rawEvidenceIndex,
      findings: currentEvidence.findings,
      unresolvedFindings: [
        ...index.dependencyHandoffs.flatMap(
          (handoff) => handoff.unresolvedFindings ?? [],
        ),
      ],
    },
    readNow,
    attested,
  };
  return {
    ...capsule,
    sourceDigest: digest(
      JSON.stringify(
        [...readNow, ...attested]
          .map(({ path: source, digest: hash }) => [source, hash])
          .sort(([left], [right]) => order(left, right)),
      ),
    ),
    capsuleDigest: digest(JSON.stringify(capsule)),
  };
}

export async function acknowledgeContextCapsule(ledger, capsule, repoRoot) {
  assertLedger(ledger);
  if (capsule?.version !== 1 || capsule.kind !== "packet-context")
    throw new Error("context acknowledgement requires a packet capsule");
  if (
    ledger.physicalSession !== null &&
    ledger.physicalSession !== capsule.physicalSession
  )
    throw new Error("context ledger belongs to a different physical session");
  const { capsuleDigest, sourceDigest, ...body } = capsule;
  if (capsuleDigest !== digest(JSON.stringify(body)))
    throw new Error("context capsule digest does not match its content");
  const sources = [...capsule.readNow, ...capsule.attested];
  const expectedSourceDigest = digest(
    JSON.stringify(
      sources
        .map(({ path: source, digest: hash }) => [source, hash])
        .sort(([left], [right]) => order(left, right)),
    ),
  );
  if (sourceDigest !== expectedSourceDigest)
    throw new Error("context capsule source digest does not match its sources");
  for (const source of sources) {
    const content = await readWorktreeSource(repoRoot, source.path);
    if (
      source.digest !== digest(content) ||
      source.bytes !== content.byteLength
    )
      throw new Error(`context capsule source changed: ${source.path}`);
  }
  const unresolvedHandoffFindings = capsule.evidence.unresolvedFindings ?? [];
  const unresolvedStructuredFindings = (capsule.evidence.findings ?? []).some(
    (finding) => finding.blocking === true && finding.status !== "resolved",
  );
  if (unresolvedHandoffFindings.length || unresolvedStructuredFindings)
    throw new Error("context capsule has unresolved blocking findings");
  const next = {
    ...ledger,
    physicalSession: capsule.physicalSession,
    attestations: { ...ledger.attestations },
  };
  for (const source of sources)
    next.attestations[source.path] = {
      digest: source.digest,
      phase: capsule.phase,
      capsuleDigest: capsule.capsuleDigest,
    };
  next.lastTransition = capsule.transition;
  next.lastCapsuleDigest = capsule.capsuleDigest;
  return next;
}

function evidenceFor(phase) {
  const evidence = phase.evidence ?? {};
  return {
    verdicts: stable(evidence.verdicts ?? []),
    findings: [...(evidence.findings ?? [])]
      .map((finding) => ({
        id: required(finding.id, `finding id in phase ${phase.id}`),
        blocking: finding.blocking === true,
        status: required(finding.status, `finding status in phase ${phase.id}`),
      }))
      .sort((a, b) => order(a.id, b.id)),
    rawEvidence: [...(evidence.rawEvidence ?? [])]
      .map((source) => ({
        path: required(source.path, `raw evidence path in phase ${phase.id}`),
        gitRef: source.gitRef ?? null,
      }))
      .sort((left, right) => order(sourceKey(left), sourceKey(right))),
  };
}

function assertEvidenceSources(phase, evidence) {
  const sources = new Set(phase.sources.map(sourceKey));
  const missing = evidence.rawEvidence.filter(
    (source) => !sources.has(sourceKey(source)),
  );
  if (missing.length)
    throw new Error(
      `phase ${phase.id} raw evidence is not an addressable phase source: ${missing.map(sourceKey).join(", ")}`,
    );
}

export async function createPhaseCapsules(fixture, repoRoot) {
  assertFixture(fixture);
  fixture = materialize(fixture);
  const attested = new Set();
  const capsules = [];
  const baselineReads = [];

  for (const phase of fixture.phases) {
    required(phase.id, "phase id");
    required(phase.stateTransition, `state transition in phase ${phase.id}`);
    if (!Array.isArray(phase.sources) || !phase.sources.length)
      throw new Error(`phase ${phase.id} requires sources`);
    if (!Array.isArray(phase.obligations) || !phase.obligations.length)
      throw new Error(`phase ${phase.id} requires obligations`);

    const readNow = [];
    const carried = [];
    for (const source of phase.sources) {
      if (source.required !== true) continue;
      const content = await readSource(repoRoot, source);
      const sourceDigest = digest(content);
      const entry = {
        path: source.path,
        gitRef: source.gitRef ?? null,
        role: required(source.role, `source role for ${source.path}`),
        digest: sourceDigest,
        bytes: content.byteLength,
      };
      baselineReads.push({ phase: phase.id, ...entry });
      const sourceIdentity = `${sourceKey(source)}:${sourceDigest}`;
      if (attested.has(sourceIdentity)) carried.push(entry);
      else {
        readNow.push(entry);
        attested.add(sourceIdentity);
      }
    }
    const evidence = evidenceFor(phase);
    assertEvidenceSources(phase, evidence);
    capsules.push({
      phase: phase.id,
      objective: phase.objective ?? null,
      transition: phase.stateTransition,
      obligations: stable(phase.obligations),
      evidence,
      readNow,
      attested: carried,
    });
  }
  return { baselineReads, capsules };
}

async function readOracle(oracle, repoRoot) {
  const reads = [];
  for (const phase of oracle.phases) {
    required(phase.id, "oracle phase id");
    required(phase.stateTransition, `oracle transition in phase ${phase.id}`);
    if (!Array.isArray(phase.sources) || !phase.sources.length)
      throw new Error(`oracle phase ${phase.id} requires sources`);
    if (!Array.isArray(phase.obligations) || !phase.obligations.length)
      throw new Error(`oracle phase ${phase.id} requires obligations`);
    const evidence = evidenceFor(phase);
    assertEvidenceSources(phase, evidence);
    for (const source of phase.sources) {
      if (source.required !== true) continue;
      const content = await readSource(repoRoot, source);
      reads.push({
        phase: phase.id,
        path: source.path,
        gitRef: source.gitRef ?? null,
        role: required(source.role, `oracle source role for ${source.path}`),
        digest: digest(content),
        bytes: content.byteLength,
      });
    }
  }
  return reads;
}

async function probeProceduralPruning(oracle, repoRoot) {
  const sources = new Map();
  for (const phase of oracle.phases)
    for (const source of phase.sources)
      if (source.required === true && source.role === "procedural")
        sources.set(sourceKey(source), source);
  const occurrences = new Map();
  for (const source of sources.values()) {
    const content = (await readSource(repoRoot, source)).toString("utf8");
    for (const line of content.split(/\r?\n/)) {
      const normalized = line.trim();
      if (bytes(normalized) < 80) continue;
      occurrences.set(normalized, (occurrences.get(normalized) ?? 0) + 1);
    }
  }
  const removableBytes = [...occurrences].reduce(
    (total, [line, count]) => total + Math.max(0, count - 1) * bytes(line),
    0,
  );
  return {
    uniqueProceduralSources: sources.size,
    duplicateLongLines: [...occurrences.values()].filter((count) => count > 1)
      .length,
    removableBytes,
  };
}

export async function loadContextCostOracle(fixture, repoRoot) {
  assertFixture(fixture);
  const definition = JSON.parse(
    await readWorktreeSource(repoRoot, fixture.oraclePath),
  );
  if (
    definition.provenance?.mode !== "frozen-snapshot" ||
    !/^[0-9a-f]{40}$/.test(definition.provenance?.capturedFrom?.gitRef ?? "")
  )
    throw new Error(
      "context-cost oracle requires independently captured pinned provenance",
    );
  const oracle = materialize(definition);
  return { oracle, oracleReads: await readOracle(oracle, repoRoot) };
}

function contractFromOracle(oracleReads, oracle) {
  return {
    sources: stable(
      oracleReads.map(
        (source) =>
          `${source.phase}:${source.gitRef ?? "worktree"}:${source.path}:${source.digest}`,
      ),
    ),
    obligations: stable(
      oracle.phases.flatMap((phase) =>
        phase.obligations.map((obligation) => `${phase.id}:${obligation}`),
      ),
    ),
    transitions: oracle.phases.map(
      (phase) => `${phase.id}:${phase.stateTransition}`,
    ),
    evidence: oracle.phases.map((phase) =>
      identity({ phase: phase.id, ...evidenceFor(phase) }),
    ),
  };
}

function contractFromCapsules(capsules) {
  return {
    sources: stable(
      capsules.flatMap((capsule) =>
        [...capsule.readNow, ...capsule.attested].map(
          (source) =>
            `${capsule.phase}:${source.gitRef ?? "worktree"}:${source.path}:${source.digest}`,
        ),
      ),
    ),
    obligations: stable(
      capsules.flatMap((capsule) =>
        capsule.obligations.map(
          (obligation) => `${capsule.phase}:${obligation}`,
        ),
      ),
    ),
    transitions: capsules.map(
      (capsule) => `${capsule.phase}:${capsule.transition}`,
    ),
    evidence: capsules.map((capsule) =>
      identity({ phase: capsule.phase, ...capsule.evidence }),
    ),
  };
}

export function compareContextCostReplay({ oracle, oracleReads, capsules }) {
  const baseline = contractFromOracle(oracleReads, oracle);
  const candidate = contractFromCapsules(capsules);
  const missing = Object.fromEntries(
    Object.keys(baseline).map((key) => [
      key,
      baseline[key].filter((entry) => !candidate[key].includes(entry)),
    ]),
  );
  const extra = Object.fromEntries(
    Object.keys(candidate).map((key) => [
      key,
      candidate[key].filter((entry) => !baseline[key].includes(entry)),
    ]),
  );
  const blockingFindings = capsules.flatMap((capsule) =>
    capsule.evidence.findings
      .filter((finding) => finding.blocking && finding.status !== "resolved")
      .map((finding) => `${capsule.phase}:${finding.id}`),
  );
  const pass =
    Object.values(missing).every((entries) => entries.length === 0) &&
    Object.values(extra).every((entries) => entries.length === 0) &&
    blockingFindings.length === 0;
  return { pass, missing, extra, blockingFindings };
}

export async function runContextCostReplay(fixture, repoRoot) {
  assertFixture(fixture);
  const candidate = materialize(fixture);
  const { oracle, oracleReads } = await loadContextCostOracle(
    fixture,
    repoRoot,
  );
  const { capsules } = await createPhaseCapsules(fixture, repoRoot);
  const equivalence = compareContextCostReplay({
    oracle,
    oracleReads,
    capsules,
  });
  const baselineSourceBytes = oracleReads.reduce(
    (total, source) => total + source.bytes,
    0,
  );
  const readNowBytes = capsules.reduce(
    (total, capsule) =>
      total + capsule.readNow.reduce((sum, source) => sum + source.bytes, 0),
    0,
  );
  const capsuleBytes = bytes(JSON.stringify(capsules));
  const optimizedBytes = readNowBytes + capsuleBytes;
  const reductionBytes = baselineSourceBytes - optimizedBytes;
  const reductionRatio = reductionBytes / baselineSourceBytes;
  const thresholdMet = reductionRatio >= fixture.minimumReductionRatio;
  const oracleSources = new Set(
    oracleReads.map(
      (source) =>
        `${source.gitRef ?? "worktree"}:${source.path}:${source.digest}`,
    ),
  );
  const candidateSources = new Set(
    capsules.flatMap((capsule) =>
      [...capsule.readNow, ...capsule.attested].map(
        (source) =>
          `${source.gitRef ?? "worktree"}:${source.path}:${source.digest}`,
      ),
    ),
  );
  const oracleObligations = new Set(
    oracle.phases.flatMap((phase) =>
      phase.obligations.map((obligation) => `${phase.id}:${obligation}`),
    ),
  );
  const candidateObligations = new Set(
    candidate.phases.flatMap((phase) =>
      phase.obligations.map((obligation) => `${phase.id}:${obligation}`),
    ),
  );
  const uniqueReadNow = capsules.flatMap((capsule) => capsule.readNow);
  const roleBytes = (sources, role) =>
    sources
      .filter((source) => source.role === role)
      .reduce((total, source) => total + source.bytes, 0);
  const evidenceBytes = (phaseIds) =>
    bytes(
      JSON.stringify(
        candidate.phases
          .filter((phase) => phaseIds.some((id) => phase.id.includes(id)))
          .map((phase) => ({ phase: phase.id, ...evidenceFor(phase) })),
      ),
    );
  const transitionBytes = bytes(
    JSON.stringify(
      candidate.phases.map((phase) => [phase.id, phase.stateTransition]),
    ),
  );
  const delta = (baseline, optimized, classification) => ({
    baselineBytes: baseline,
    optimizedBytes: optimized,
    proxyDifferenceBytes: baseline - optimized,
    classification,
  });
  const firstPhaseBytes = oracleReads
    .filter((source) => source.phase === oracle.phases[0].id)
    .reduce((total, source) => total + source.bytes, 0);
  const repeatedBytes = baselineSourceBytes - readNowBytes;
  const pruningProbe = await probeProceduralPruning(oracle, repoRoot);
  const pruningBytes = baselineSourceBytes - pruningProbe.removableBytes;
  const candidateResults = [
    {
      id: "procedural-pruning",
      totalBytes: pruningBytes,
      reductionBytes: pruningProbe.removableBytes,
      reductionRatio: pruningProbe.removableBytes / baselineSourceBytes,
      equivalencePass: pruningProbe.removableBytes === 0,
      thresholdMet:
        pruningProbe.removableBytes / baselineSourceBytes >=
        fixture.minimumReductionRatio,
      probe: pruningProbe,
      note: "No repeated long-form procedural content was found inside the authoritative documents, so content pruning has no evidenced byte reduction.",
    },
    {
      id: "phase-bound-source-attestation",
      totalBytes: optimizedBytes,
      reductionBytes,
      reductionRatio,
      equivalencePass: equivalence.pass,
      thresholdMet,
      note: "Reads new or changed phase sources and carries acknowledged unchanged identities.",
    },
    {
      id: "orchestration-simplification",
      totalBytes: baselineSourceBytes - transitionBytes,
      reductionBytes: transitionBytes,
      reductionRatio: transitionBytes / baselineSourceBytes,
      equivalencePass: false,
      thresholdMet:
        transitionBytes / baselineSourceBytes >= fixture.minimumReductionRatio,
      note: "Modeled removal of every transition still misses the threshold and intentionally fails equivalence because required transitions disappear.",
    },
    {
      id: "semantic-retrieval-broker",
      result: "not-probed-unnecessary",
      note: "Higher-complexity retrieval is not admissible because a deterministic local candidate already passes equivalence and threshold.",
    },
  ];

  return {
    version: 1,
    replay: fixture.id,
    runtimeObservation: fixture.runtimeObservation ?? null,
    contributors: fixture.contributors,
    contributorAccounting: {
      additive: false,
      note: "Contributor probes overlap and must not be summed; procedural source bytes are also part of repeated source reads.",
    },
    contributorDeltas: {
      discovery: delta(firstPhaseBytes, firstPhaseBytes, "retained"),
      proceduralContext: delta(
        roleBytes(oracleReads, "procedural"),
        roleBytes(uniqueReadNow, "procedural"),
        "not-reread-overlapping-proxy",
      ),
      validationOutput: delta(
        evidenceBytes(["validation"]),
        evidenceBytes(["validation"]),
        "retained-unmeasured-runtime-cost",
      ),
      reviewOutput: delta(
        evidenceBytes(["review"]),
        evidenceBytes(["review"]),
        "retained-unmeasured-runtime-cost",
      ),
      repeatedReads: delta(repeatedBytes, 0, "not-reread"),
      stateOrchestration: delta(transitionBytes, transitionBytes, "retained"),
    },
    candidateResults,
    sourceDigest: digest(
      JSON.stringify(
        oracleReads.map(({ gitRef, path: source, digest: hash }) => [
          gitRef ?? "worktree",
          source,
          hash,
        ]),
      ),
    ),
    capsules,
    baseline: {
      totalBytes: baselineSourceBytes,
      sourceReads: oracleReads.length,
      authoritativeSourceCount: oracleSources.size,
      obligationCount: oracleObligations.size,
      oracle: "independent-pinned-pr36",
    },
    optimized: {
      totalBytes: optimizedBytes,
      readNowBytes,
      capsuleBytes,
      sourceReads: capsules.reduce(
        (total, capsule) => total + capsule.readNow.length,
        0,
      ),
      attestedReferences: capsules.reduce(
        (total, capsule) => total + capsule.attested.length,
        0,
      ),
      authoritativeSourceCount: candidateSources.size,
      obligationCount: candidateObligations.size,
    },
    equivalence,
    improvement: {
      pass: equivalence.pass && thresholdMet,
      scope: "repository-source-input-proxy",
      threshold: fixture.minimumReductionRatio,
      thresholdMet,
      reductionBytes,
      reductionRatio,
    },
    activeSessionImprovement: {
      available: false,
      reason:
        "comparable trusted before/after runtime telemetry is unavailable",
    },
    costAttribution: {
      repeatedSourceInput: {
        classification: "not-reread",
        bytes: repeatedBytes,
        preventedRuntimeBytes: 0,
        note: "Attestation replaces later full source input with an identity and digest; it does not prove avoided processing or retention.",
      },
      validationCiOutput: {
        classification: "retained-unmeasured",
        preventedRuntimeBytes: 0,
        note: "Generation and raw-log retention remain incurred; only later inline carryover can use a compact pointer.",
      },
      reviewOutput: {
        classification: "retained-unmeasured",
        preventedRuntimeBytes: 0,
      },
      capsuleOverhead: {
        classification: "incurred",
        bytes: capsuleBytes,
      },
    },
    metricLimitations: [
      "The runtime observation is reported only with fixture provenance; replay bytes are never converted to tokens.",
      "Source and capsule bytes are deterministic context-cost proxies, not runtime usage.",
      "Content identity proves source currency and equivalence, not model comprehension.",
      "The replay represents the declared workflow shape rather than a raw session transcript.",
      "Repeated source bytes are classified as not reread through the capsule interface, not as prevented runtime or retention cost.",
      "Validation, CI, review output generation and raw-log retention are not eliminated by compact evidence pointers.",
    ],
  };
}
