import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";

const digest = (value) => createHash("sha256").update(value).digest("hex");
const bytes = (value) => Buffer.byteLength(value);
const stable = (values) => [...new Set(values)].sort();
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
  const phaseIds = fixture.phases.map(({ id }) => id);
  if (phaseIds.some((id) => typeof id !== "string" || !id))
    throw new Error("context-cost replay requires phase ids");
  if (new Set(phaseIds).size !== phaseIds.length)
    throw new Error("context-cost replay phase ids must be unique");
}

function safeSource(repoRoot, sourcePath) {
  const target = path.resolve(repoRoot, sourcePath);
  if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
    throw new Error(`context-cost source escapes repository: ${sourcePath}`);
  return target;
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
      .sort((a, b) => a.id.localeCompare(b.id)),
    rawEvidence: stable(evidence.rawEvidence ?? []),
  };
}

function assertEvidenceSources(phase, evidence) {
  const sources = new Set(phase.sources.map(({ path: source }) => source));
  const missing = evidence.rawEvidence.filter((source) => !sources.has(source));
  if (missing.length)
    throw new Error(
      `phase ${phase.id} raw evidence is not an addressable phase source: ${missing.join(", ")}`,
    );
}

export async function createPhaseCapsules(fixture, repoRoot) {
  assertFixture(fixture);
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
      const content = await readFile(safeSource(repoRoot, source.path));
      const sourceDigest = digest(content);
      const entry = {
        path: source.path,
        role: required(source.role, `source role for ${source.path}`),
        digest: sourceDigest,
        bytes: content.byteLength,
      };
      baselineReads.push({ phase: phase.id, ...entry });
      const sourceIdentity = `${source.path}:${sourceDigest}`;
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

function contractFromBaseline(baselineReads, fixture) {
  return {
    sources: stable(
      baselineReads.map(
        (source) => `${source.phase}:${source.path}:${source.digest}`,
      ),
    ),
    obligations: stable(
      fixture.phases.flatMap((phase) =>
        phase.obligations.map((obligation) => `${phase.id}:${obligation}`),
      ),
    ),
    transitions: fixture.phases.map(
      (phase) => `${phase.id}:${phase.stateTransition}`,
    ),
    evidence: fixture.phases.map((phase) =>
      identity({ phase: phase.id, ...evidenceFor(phase) }),
    ),
  };
}

function contractFromCapsules(capsules) {
  return {
    sources: stable(
      capsules.flatMap((capsule) =>
        [...capsule.readNow, ...capsule.attested].map(
          (source) => `${capsule.phase}:${source.path}:${source.digest}`,
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

export function compareContextCostReplay({ fixture, baselineReads, capsules }) {
  const baseline = contractFromBaseline(baselineReads, fixture);
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
  const { baselineReads, capsules } = await createPhaseCapsules(
    fixture,
    repoRoot,
  );
  const equivalence = compareContextCostReplay({
    fixture,
    baselineReads,
    capsules,
  });
  const baselineSourceBytes = baselineReads.reduce(
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
  const uniqueSources = new Set(
    baselineReads.map((source) => `${source.path}:${source.digest}`),
  );
  const obligations = new Set(
    fixture.phases.flatMap((phase) =>
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
        fixture.phases
          .filter((phase) => phaseIds.some((id) => phase.id.includes(id)))
          .map((phase) => ({ phase: phase.id, ...evidenceFor(phase) })),
      ),
    );
  const transitionBytes = bytes(
    JSON.stringify(
      fixture.phases.map((phase) => [phase.id, phase.stateTransition]),
    ),
  );
  const delta = (baseline, optimized) => ({
    baselineBytes: baseline,
    optimizedBytes: optimized,
    reductionBytes: baseline - optimized,
  });
  const firstPhaseBytes = baselineReads
    .filter((source) => source.phase === fixture.phases[0].id)
    .reduce((total, source) => total + source.bytes, 0);
  const repeatedBytes = baselineSourceBytes - readNowBytes;

  return {
    version: 1,
    replay: fixture.id,
    runtimeObservation: fixture.runtimeObservation ?? null,
    contributors: fixture.contributors,
    contributorDeltas: {
      discovery: delta(firstPhaseBytes, firstPhaseBytes),
      proceduralContext: delta(
        roleBytes(baselineReads, "procedural"),
        roleBytes(uniqueReadNow, "procedural"),
      ),
      validationOutput: delta(
        evidenceBytes(["validation"]),
        evidenceBytes(["validation"]),
      ),
      reviewOutput: delta(evidenceBytes(["review"]), evidenceBytes(["review"])),
      repeatedReads: delta(repeatedBytes, 0),
      stateOrchestration: delta(transitionBytes, transitionBytes),
    },
    sourceDigest: digest(
      JSON.stringify(
        baselineReads.map(({ path: source, digest: hash }) => [source, hash]),
      ),
    ),
    capsules,
    baseline: {
      totalBytes: baselineSourceBytes,
      sourceReads: baselineReads.length,
      authoritativeSourceCount: uniqueSources.size,
      obligationCount: obligations.size,
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
      authoritativeSourceCount: uniqueSources.size,
      obligationCount: obligations.size,
    },
    equivalence,
    improvement: {
      pass: equivalence.pass && thresholdMet,
      threshold: fixture.minimumReductionRatio,
      thresholdMet,
      reductionBytes,
      reductionRatio,
    },
    metricLimitations: [
      "The runtime observation is reported only with fixture provenance; replay bytes are never converted to tokens.",
      "Source and capsule bytes are deterministic context-cost proxies, not runtime usage.",
      "Content identity proves source currency and equivalence, not model comprehension.",
      "The replay represents the declared workflow shape rather than a raw session transcript.",
    ],
  };
}
