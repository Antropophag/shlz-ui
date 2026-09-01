import { access } from "node:fs/promises";
import path from "node:path";

export const dispositions = [
  "implemented",
  "evidence-only",
  "intentionally-excluded",
  "unresolved",
];

const keyOf = ({ sourceArchive, figmaNodeId }) =>
  `${sourceArchive}#${figmaNodeId}`;

const assert = (condition, errorText) => {
  if (!condition) throw new Error(errorText);
};

const percentage = (count, total) =>
  total === 0 ? 0 : Number(((count / total) * 100).toFixed(2));

async function validatePath(repoRoot, reference, label, identity) {
  assert(
    typeof reference === "string" && reference.length > 0,
    `${identity}: ${label} contains an empty path`,
  );
  assert(
    !path.isAbsolute(reference) && !reference.split("/").includes(".."),
    `${identity}: ${label} must be a repository-relative path: ${reference}`,
  );
  try {
    await access(path.join(repoRoot, reference));
  } catch {
    throw new Error(`${identity}: ${label} path does not exist: ${reference}`);
  }
}

function validateDecisionShape(decision, identity) {
  assert(
    dispositions.includes(decision.disposition),
    `${identity}: invalid disposition`,
  );
  for (const field of [
    "families",
    "implementation",
    "evidence",
    "exclusionEvidence",
  ])
    assert(
      Array.isArray(decision[field] ?? []),
      `${identity}: ${field} must be an array`,
    );

  if (decision.disposition === "implemented") {
    assert(
      decision.families.length > 0,
      `${identity}: implemented needs a family`,
    );
    assert(
      decision.implementation.length > 0,
      `${identity}: implemented needs production paths`,
    );
    assert(
      decision.evidence.length > 0,
      `${identity}: implemented needs evidence paths`,
    );
  }
  if (decision.disposition === "evidence-only") {
    assert(
      decision.families.length > 0,
      `${identity}: evidence-only needs a family`,
    );
    assert(
      decision.evidence.length > 0,
      `${identity}: evidence-only needs evidence paths`,
    );
  }
  if (decision.disposition === "intentionally-excluded") {
    assert(decision.reason?.trim(), `${identity}: exclusion needs a reason`);
    assert(
      decision.ownership?.trim(),
      `${identity}: exclusion needs an ownership boundary`,
    );
    assert(
      decision.exclusionEvidence.length > 0,
      `${identity}: exclusion needs supporting evidence`,
    );
  }
  if (decision.disposition === "unresolved")
    assert(
      decision.reason?.trim(),
      `${identity}: unresolved needs the missing decision or evidence`,
    );
}

function summarize(records, variants, families) {
  const count = (items, disposition) =>
    items.filter((item) => item.disposition === disposition).length;
  const unit = (items) => ({
    denominator: items.length,
    dispositions: Object.fromEntries(
      dispositions.map((disposition) => {
        const value = count(items, disposition);
        return [
          disposition,
          { count: value, percentage: percentage(value, items.length) },
        ];
      }),
    ),
  });
  return {
    records: unit(records),
    variants: unit(variants),
    referencedFamilies: {
      denominator: families.length,
      implementationStatuses: Object.fromEntries(
        [...new Set(families.map((family) => family.implementation_status))]
          .sort()
          .map((status) => [
            status,
            families.filter((family) => family.implementation_status === status)
              .length,
          ]),
      ),
      auditStatuses: Object.fromEntries(
        [...new Set(families.map((family) => family.audit_status))]
          .sort()
          .map((status) => [
            status,
            families.filter((family) => family.audit_status === status).length,
          ]),
      ),
    },
  };
}

export async function buildCoverageMatrix({
  sourceIndex,
  inventory,
  ledger,
  repoRoot,
}) {
  assert(ledger.schemaVersion === 1, "ledger schemaVersion must be 1");
  assert(Array.isArray(ledger.records), "ledger.records must be an array");
  const sourceKeys = sourceIndex.components.map(keyOf);
  assert(
    new Set(sourceKeys).size === sourceKeys.length,
    "source index contains duplicate record identities",
  );
  const familyNames = inventory.families.map((family) => family.canonical_name);
  assert(
    new Set(familyNames).size === familyNames.length,
    "project inventory contains duplicate canonical family names",
  );
  const sourceByKey = new Map(
    sourceIndex.components.map((record) => [keyOf(record), record]),
  );
  const familyByName = new Map(
    inventory.families.map((family) => [family.canonical_name, family]),
  );
  const decisions = new Map();

  const validateReferences = async (decision, identity) => {
    validateDecisionShape(decision, identity);
    for (const familyName of decision.families ?? [])
      assert(
        familyByName.has(familyName),
        `${identity}: unknown family: ${familyName}`,
      );
    for (const [field, label] of [
      ["implementation", "implementation"],
      ["evidence", "evidence"],
      ["exclusionEvidence", "exclusion evidence"],
    ])
      for (const reference of decision[field] ?? []) {
        if (field === "implementation")
          assert(
            !reference.startsWith("shlz-design-source/"),
            `${identity}: source cannot be implementation`,
          );
        await validatePath(repoRoot, reference, label, identity);
      }
  };

  for (const decision of ledger.records) {
    const identity = keyOf(decision);
    assert(!decisions.has(identity), `${identity}: duplicate ledger decision`);
    const source = sourceByKey.get(identity);
    assert(source, `${identity}: stale or invented ledger identity`);
    for (const field of ["kind", "name"])
      assert(decision[field] === source[field], `${identity}: stale ${field}`);
    assert(
      JSON.stringify(decision.hierarchyPath) ===
        JSON.stringify(source.hierarchyPath),
      `${identity}: stale hierarchyPath`,
    );
    await validateReferences(decision, identity);
    assert(
      decision.variantCoverage === "all",
      `${identity}: variantCoverage must be all`,
    );
    assert(
      Array.isArray(decision.variantExceptions ?? []),
      `${identity}: variantExceptions must be an array`,
    );
    const variantIds = new Set(
      source.variants.map((variant) => variant.figmaNodeId),
    );
    const exceptionIds = new Set();
    for (const exception of decision.variantExceptions ?? []) {
      assert(
        variantIds.has(exception.figmaNodeId),
        `${identity}: invented variant exception ${exception.figmaNodeId}`,
      );
      assert(
        !exceptionIds.has(exception.figmaNodeId),
        `${identity}: duplicate variant exception ${exception.figmaNodeId}`,
      );
      exceptionIds.add(exception.figmaNodeId);
      await validateReferences(
        exception,
        `${identity}#${exception.figmaNodeId}`,
      );
    }
    decisions.set(identity, decision);
  }

  for (const identity of sourceByKey.keys())
    assert(decisions.has(identity), `${identity}: missing ledger decision`);
  assert(
    decisions.size === sourceByKey.size,
    "ledger and source record totals differ",
  );

  const records = sourceIndex.components.map((source) => {
    const identity = keyOf(source);
    const decision = decisions.get(identity);
    const familyFacts = (decision.families ?? []).map((name) => {
      const family = familyByName.get(name);
      return {
        canonicalName: name,
        implementationStatus: family.implementation_status,
        auditStatus: family.audit_status,
      };
    });
    const exceptions = new Map(
      (decision.variantExceptions ?? []).map((item) => [
        item.figmaNodeId,
        item,
      ]),
    );
    return {
      identity: {
        sourceArchive: source.sourceArchive,
        figmaNodeId: source.figmaNodeId,
        kind: source.kind,
        name: source.name,
        hierarchyPath: source.hierarchyPath,
      },
      disposition: decision.disposition,
      reason: decision.reason ?? null,
      ownership: decision.ownership ?? null,
      families: familyFacts,
      implementation: decision.implementation ?? [],
      evidence: decision.evidence ?? [],
      exclusionEvidence: decision.exclusionEvidence ?? [],
      sourceDiagnostics: {
        hasSourceErrors: source.hasSourceErrors,
        errors: source.errors,
        extractionWarnings: source.extractionWarnings,
      },
      variants: source.variants.map((variant) => {
        const effective = exceptions.get(variant.figmaNodeId) ?? decision;
        const effectiveFamilyFacts = (effective.families ?? []).map((name) => {
          const family = familyByName.get(name);
          return {
            canonicalName: name,
            implementationStatus: family.implementation_status,
            auditStatus: family.audit_status,
          };
        });
        return {
          figmaNodeId: variant.figmaNodeId,
          name: variant.name,
          hierarchyPath: variant.hierarchyPath,
          disposition: effective.disposition,
          inheritedFromRecord: !exceptions.has(variant.figmaNodeId),
          reason: effective.reason ?? null,
          ownership: effective.ownership ?? null,
          families: effectiveFamilyFacts,
          implementation: effective.implementation ?? [],
          evidence: effective.evidence ?? [],
          exclusionEvidence: effective.exclusionEvidence ?? [],
          sourceDiagnostics: {
            extractionWarnings: variant.extractionWarnings,
          },
        };
      }),
    };
  });
  const variants = records.flatMap((record) => record.variants);
  const referencedNames = new Set(
    records.flatMap((record) => [
      ...record.families.map((family) => family.canonicalName),
      ...record.variants.flatMap((variant) =>
        variant.families.map((family) => family.canonicalName),
      ),
    ]),
  );
  const referencedFamilies = inventory.families.filter((family) =>
    referencedNames.has(family.canonical_name),
  );
  return {
    schemaVersion: 1,
    generatedFrom: {
      sourceIndex: "design-source-index/components.json",
      projectInventory: "docs/component-audits/project-inventory.json",
      decisionLedger:
        "docs/component-audits/source-library-coverage-ledger.json",
    },
    semantics: {
      auditStatusVerified:
        "Declared audit evidence passed; this is not an implementation or transfer disposition.",
      completion:
        "Complete accounting may include unresolved records and does not imply complete implementation.",
    },
    summary: summarize(records, variants, referencedFamilies),
    records,
  };
}
