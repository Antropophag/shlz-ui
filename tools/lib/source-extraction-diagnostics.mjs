import { realpath } from "node:fs/promises";
import path from "node:path";

const dispositions = new Set([
  "extraction-defect",
  "source-ambiguity",
  "harmless-diagnostic",
  "product-gap-evidence",
]);
const impacts = new Set([
  "no-coverage-effect",
  "limits-conclusion",
  "invalidates-current-claim",
]);
const compatible = new Set([
  "extraction-defect:no-coverage-effect",
  "extraction-defect:limits-conclusion",
  "source-ambiguity:limits-conclusion",
  "harmless-diagnostic:no-coverage-effect",
  "product-gap-evidence:limits-conclusion",
  "product-gap-evidence:invalidates-current-claim",
]);
const claimAuthorities = new Set(["FACT", "DERIVED", "DECISION", "UNKNOWN"]);
const selectorFields = new Set([
  "kind",
  "component",
  "sourceArchive",
  "multiplicity",
]);
const evidencePathMatches = {
  "source-index": (name) => name === "design-source-index/source-issues.json",
  "source-manifest": (name) => name === "design-source-index/manifest.json",
  "source-methodology": (name) => name === "design-source-index/README.md",
  "audit-contract": (name) =>
    /^docs\/component-audits\/[^/]+\.json$/.test(name) &&
    !name.endsWith("-ledger.json"),
  "coverage-ledger": (name) =>
    name === "docs/component-audits/source-library-coverage-ledger.json",
};
const requiredEvidenceKinds = {
  "extraction-defect": ["source-index", "source-methodology"],
  "source-ambiguity": ["source-index"],
  "harmless-diagnostic": ["source-index", "coverage-ledger"],
  "product-gap-evidence": ["source-index", "audit-contract"],
};

const identity = (unit) =>
  unit.granularity === "node"
    ? JSON.stringify([
        unit.sourceArchive,
        unit.kind,
        unit.component,
        unit.variant ?? null,
        unit.scope,
        unit.figmaNodeId,
        unit.ownerId ?? null,
        unit.nodeId,
        unit.nodeName,
        unit.field ?? "",
        unit.message,
      ])
    : JSON.stringify([unit.sourceArchive, unit.kind]);

const selectorMatches = (selector, unit) =>
  Object.entries(selector).every(([key, value]) => unit[key] === value);

function validateSelector(classification) {
  const { selector } = classification;
  if (
    !classification.id?.trim() ||
    !selector ||
    !Object.keys(selector).every((key) => selectorFields.has(key)) ||
    !["error", "warning", "skipped-instance"].includes(selector.kind)
  )
    throw new Error(`invalid classification selector: ${classification.id}`);
  if (
    selector.kind === "skipped-instance" &&
    (!selector.sourceArchive ||
      !Number.isInteger(selector.multiplicity) ||
      selector.multiplicity <= 0)
  )
    throw new Error(`invalid skipped-instance selector: ${classification.id}`);
}

async function validateEvidence(decision, repoRoot) {
  const { evidence } = decision;
  if (!Array.isArray(evidence) || !evidence.length)
    throw new Error("classification evidence is required");
  const root = await realpath(repoRoot);
  const kinds = new Set();
  for (const reference of evidence) {
    const name = reference?.path;
    const resolved = path.resolve(root, name ?? "");
    if (path.relative(root, resolved).startsWith(".."))
      throw new Error(`evidence escapes repository: ${name}`);
    if (!reference || !evidencePathMatches[reference.kind]?.(name))
      throw new Error(`evidence path does not match evidence kind: ${name}`);
    kinds.add(reference.kind);
    const canonical = await realpath(resolved);
    if (path.relative(root, canonical).startsWith(".."))
      throw new Error(`evidence escapes repository: ${name}`);
  }
  for (const required of requiredEvidenceKinds[decision.disposition])
    if (!kinds.has(required))
      throw new Error(`classification lacks required evidence: ${required}`);
  if (
    decision.disposition === "source-ambiguity" &&
    !kinds.has("audit-contract") &&
    !kinds.has("source-manifest")
  )
    throw new Error("classification lacks ambiguity boundary evidence");
}

function staleMultiplicityExists(classifications, unit) {
  return classifications.some(
    ({ selector }) =>
      unit.kind === "skipped-instance" &&
      selector.kind === unit.kind &&
      selector.sourceArchive === unit.sourceArchive &&
      selector.multiplicity !== unit.multiplicity,
  );
}

async function classifyUnit(unit, classifications, repoRoot) {
  if (!Number.isInteger(unit.multiplicity) || unit.multiplicity <= 0)
    throw new Error(
      `diagnostic multiplicity must be positive: ${identity(unit)}`,
    );
  const matches = classifications.filter(({ selector }) =>
    selectorMatches(selector, unit),
  );
  if (!matches.length) {
    if (staleMultiplicityExists(classifications, unit))
      throw new Error(`classification multiplicity differs: ${identity(unit)}`);
    throw new Error(`unclassified diagnostic: ${identity(unit)}`);
  }
  if (matches.length > 1)
    throw new Error(`multiple classifications: ${identity(unit)}`);
  const decision = matches[0];
  if (!dispositions.has(decision.disposition))
    throw new Error(`unknown disposition: ${decision.disposition}`);
  if (!impacts.has(decision.coverageImpact))
    throw new Error(`unknown coverage impact: ${decision.coverageImpact}`);
  if (!compatible.has(`${decision.disposition}:${decision.coverageImpact}`))
    throw new Error("contradictory diagnostic classification");
  if (!decision.rationale?.trim())
    throw new Error("classification rationale is required");
  if (!claimAuthorities.has(decision.claimAuthority))
    throw new Error(`unknown claim authority: ${decision.claimAuthority}`);
  await validateEvidence(decision, repoRoot);
  return decision;
}

function classifiedUnit(unit, decision) {
  return {
    identity: identity(unit),
    kind: unit.kind,
    granularity: unit.granularity,
    multiplicity: unit.multiplicity,
    sourceArchive: unit.sourceArchive,
    component: unit.component ?? null,
    nodeId: unit.nodeId ?? null,
    scope: unit.scope ?? null,
    field: unit.field ?? null,
    message: unit.message ?? null,
    classification: decision.id,
    disposition: decision.disposition,
    coverageImpact: decision.coverageImpact,
    claimAuthority: decision.claimAuthority,
    rationale: decision.rationale,
    evidence: [...decision.evidence].sort((left, right) =>
      `${left.kind}:${left.path}`.localeCompare(`${right.kind}:${right.path}`),
    ),
  };
}

export async function buildDiagnosticClassification({
  issues,
  ledger,
  repoRoot,
}) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.classifications))
    throw new Error("invalid diagnostic classification ledger");
  ledger.classifications.forEach(validateSelector);
  if (
    new Set(ledger.classifications.map(({ id }) => id)).size !==
    ledger.classifications.length
  )
    throw new Error("duplicate classification id");

  const units = [
    ...issues.extraction.errors.map((item) => ({
      ...item,
      kind: "error",
      granularity: "node",
      multiplicity: 1,
    })),
    ...issues.extraction.warnings.map((item) => ({
      ...item,
      kind: "warning",
      granularity: "node",
      multiplicity: 1,
    })),
    ...issues.archiveReportedCounts.map(({ sourceArchive, counts }) => ({
      sourceArchive,
      kind: "skipped-instance",
      granularity: "archive-cohort",
      multiplicity: counts.instancesSkipped,
    })),
  ].sort((left, right) => identity(left).localeCompare(identity(right)));

  const classified = [];
  const usedClassifications = new Set();
  for (const unit of units) {
    const decision = await classifyUnit(unit, ledger.classifications, repoRoot);
    usedClassifications.add(decision.id);
    classified.push(classifiedUnit(unit, decision));
  }

  const unused = ledger.classifications.filter(
    ({ id }) => !usedClassifications.has(id),
  );
  if (unused.length)
    throw new Error(
      `unused classification: ${unused.map(({ id }) => id).join(", ")}`,
    );

  const count = (kind) =>
    classified
      .filter((unit) => unit.kind === kind)
      .reduce((sum, unit) => sum + unit.multiplicity, 0);
  const summary = {
    classificationUnits: classified.length,
    reportedInstances: classified.reduce(
      (sum, unit) => sum + unit.multiplicity,
      0,
    ),
    errors: count("error"),
    warnings: count("warning"),
    skippedInstances: count("skipped-instance"),
  };
  if (
    summary.errors !== issues.summary.reportedErrors ||
    summary.warnings !== issues.summary.reportedWarnings ||
    summary.skippedInstances !== issues.summary.instancesSkipped
  )
    throw new Error("diagnostic totals do not reconcile");
  return {
    schemaVersion: 1,
    semantics:
      "Diagnostic classification reports extraction evidence only and never implies component implementation.",
    summary,
    units: classified,
  };
}

export function renderDiagnosticClassificationMarkdown(result) {
  const cohorts = new Map();
  for (const unit of result.units) {
    const key = `${unit.classification}\u0000${unit.disposition}\u0000${unit.coverageImpact}`;
    const current = cohorts.get(key) ?? {
      classification: unit.classification,
      disposition: unit.disposition,
      coverageImpact: unit.coverageImpact,
      units: 0,
      instances: 0,
    };
    current.units += 1;
    current.instances += unit.multiplicity;
    cohorts.set(key, current);
  }
  const rows = [...cohorts.values()].sort((a, b) =>
    a.classification.localeCompare(b.classification),
  );
  const cohortRows = rows
    .map(
      (row) =>
        `| ${row.classification} | ${row.disposition} | ${row.coverageImpact} | ${row.units} | ${row.instances} |`,
    )
    .join("\n");
  return `# Source extraction diagnostic classification\n\nThis audit classifies extraction evidence only. It does not prove or advance component implementation coverage.\n\n## Census\n\n- Errors: ${result.summary.errors}\n- Warnings: ${result.summary.warnings}\n- Skipped instances: ${result.summary.skippedInstances}\n- Classification units: ${result.summary.classificationUnits} (44 node-level diagnostics and 2 archive cohorts)\n\n## Cohorts\n\n| Classification | Disposition | Coverage impact | Units | Instances |\n| --- | --- | --- | ---: | ---: |\n${cohortRows}\n\n## Limitations\n\nThe committed extraction output preserves skipped instances only as archive counts of 37 and 10. No node-level identities are inferred for those 47 instances. A limited conclusion remains unresolved until a later authoritative extraction preserves finer evidence.\n`;
}
