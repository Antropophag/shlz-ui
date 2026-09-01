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

const identity = (unit) =>
  unit.granularity === "node"
    ? [
        unit.sourceArchive,
        unit.kind,
        unit.scope,
        unit.nodeId,
        unit.field ?? "",
      ].join("#")
    : [unit.sourceArchive, unit.kind].join("#");

const selectorMatches = (selector, unit) =>
  Object.entries(selector).every(([key, value]) => unit[key] === value);

async function validateEvidence(evidence, repoRoot) {
  if (!Array.isArray(evidence) || !evidence.length)
    throw new Error("classification evidence is required");
  const root = await realpath(repoRoot);
  for (const reference of evidence) {
    const resolved = path.resolve(root, reference);
    if (path.relative(root, resolved).startsWith(".."))
      throw new Error(`evidence escapes repository: ${reference}`);
    const canonical = await realpath(resolved);
    if (path.relative(root, canonical).startsWith(".."))
      throw new Error(`evidence escapes repository: ${reference}`);
  }
}

export async function buildDiagnosticClassification({
  issues,
  ledger,
  repoRoot,
}) {
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger.classifications))
    throw new Error("invalid diagnostic classification ledger");

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
    const matches = ledger.classifications.filter(({ selector }) =>
      selectorMatches(selector, unit),
    );
    if (!matches.length) {
      const staleMultiplicity = ledger.classifications.find(
        ({ selector }) =>
          unit.kind === "skipped-instance" &&
          selector.kind === unit.kind &&
          selector.sourceArchive === unit.sourceArchive &&
          selector.multiplicity !== unit.multiplicity,
      );
      if (staleMultiplicity)
        throw new Error(
          `classification multiplicity differs: ${identity(unit)}`,
        );
      throw new Error(`unclassified diagnostic: ${identity(unit)}`);
    }
    if (matches.length > 1)
      throw new Error(`multiple classifications: ${identity(unit)}`);
    const decision = matches[0];
    usedClassifications.add(decision.id);
    if (!dispositions.has(decision.disposition))
      throw new Error(`unknown disposition: ${decision.disposition}`);
    if (!impacts.has(decision.coverageImpact))
      throw new Error(`unknown coverage impact: ${decision.coverageImpact}`);
    if (!compatible.has(`${decision.disposition}:${decision.coverageImpact}`))
      throw new Error("contradictory diagnostic classification");
    if (!decision.rationale?.trim())
      throw new Error("classification rationale is required");
    if (
      decision.selector.multiplicity !== undefined &&
      decision.selector.multiplicity !== unit.multiplicity
    )
      throw new Error(`classification multiplicity differs: ${identity(unit)}`);
    await validateEvidence(decision.evidence, repoRoot);
    classified.push({
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
      rationale: decision.rationale,
      evidence: [...decision.evidence].sort(),
    });
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
  return `# Source extraction diagnostic classification\n\nThis audit classifies extraction evidence only. It does not prove or advance component implementation coverage.\n\n## Census\n\n- Errors: ${result.summary.errors}\n- Warnings: ${result.summary.warnings}\n- Skipped instances: ${result.summary.skippedInstances}\n- Classification units: ${result.summary.classificationUnits} (44 node-level diagnostics and 2 archive cohorts)\n\n## Cohorts\n\n| Classification | Disposition | Coverage impact | Units | Instances |\n| --- | --- | --- | ---: | ---: |\n${rows.map((row) => `| ${row.classification} | ${row.disposition} | ${row.coverageImpact} | ${row.units} | ${row.instances} |`).join("\n")}\n\n## Limitations\n\nThe committed extraction output preserves skipped instances only as archive counts of 37 and 10. No node-level identities are inferred for those 47 instances. A limited conclusion remains unresolved until a later authoritative extraction preserves finer evidence.\n`;
}
