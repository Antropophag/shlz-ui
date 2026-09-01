import { realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export const dispositions = [
  "implemented",
  "evidence-only",
  "intentionally-excluded",
  "unresolved",
];

export const ownershipBoundaries = ["consumer application"];

const keyOf = ({ sourceArchive, figmaNodeId }) =>
  `${sourceArchive}#${figmaNodeId}`;

const assert = (condition, errorText) => {
  if (!condition) throw new Error(errorText);
};

const percentage = (count, total) =>
  total === 0 ? 0 : Number(((count / total) * 100).toFixed(2));

const compareStrings = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

async function validatePath(repoRoot, reference, label, identity) {
  assert(
    typeof reference === "string" && reference.length > 0,
    `${identity}: ${label} contains an empty path`,
  );
  assert(
    !path.isAbsolute(reference) && !reference.split("/").includes(".."),
    `${identity}: ${label} must be a repository-relative path: ${reference}`,
  );
  let resolvedRoot;
  let resolvedReference;
  try {
    [resolvedRoot, resolvedReference] = await Promise.all([
      realpath(repoRoot),
      realpath(path.join(repoRoot, reference)),
    ]);
  } catch {
    throw new Error(`${identity}: ${label} path is invalid: ${reference}`);
  }
  assert(
    resolvedReference === resolvedRoot ||
      resolvedReference.startsWith(`${resolvedRoot}${path.sep}`),
    `${identity}: ${label} path resolves outside the repository: ${reference}`,
  );
  return resolvedReference;
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
      Array.isArray(decision[field]),
      `${identity}: ${field} must be an array`,
    );

  const requireEmpty = (fields) => {
    for (const field of fields)
      assert(
        decision[field].length === 0,
        `${identity}: ${decision.disposition} forbids ${field}`,
      );
  };

  if (decision.disposition === "implemented") {
    requireEmpty(["exclusionEvidence"]);
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
    requireEmpty(["implementation", "exclusionEvidence"]);
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
    requireEmpty(["families", "implementation", "evidence"]);
    assert(decision.reason?.trim(), `${identity}: exclusion needs a reason`);
    assert(
      ownershipBoundaries.includes(decision.ownership),
      `${identity}: exclusion needs a valid ownership boundary`,
    );
    assert(
      decision.exclusionEvidence.length > 0,
      `${identity}: exclusion needs supporting evidence`,
    );
  }
  if (decision.disposition === "unresolved") {
    requireEmpty([
      "families",
      "implementation",
      "evidence",
      "exclusionEvidence",
    ]);
    assert(
      decision.reason?.trim(),
      `${identity}: unresolved needs the missing decision or evidence`,
    );
  }
}

function validateReview(review, identity, episodesById) {
  if (review === undefined) return;
  assert(
    review && typeof review === "object" && !Array.isArray(review),
    `${identity}: review must be an object`,
  );
  const episode = episodesById.get(review.episode);
  assert(
    episode,
    `${identity}: unknown classification episode: ${review.episode}`,
  );
  assert(
    episode.allowedCohorts.includes(review.cohort),
    `${identity}: invalid review cohort: ${review.cohort}`,
  );
  assert(review.boundary?.trim(), `${identity}: review boundary is required`);
}

export const classificationIdentityDigest = (records) =>
  createHash("sha256")
    .update(
      JSON.stringify(
        records
          .map((record) => ({
            sourceArchive: record.identity.sourceArchive,
            figmaNodeId: record.identity.figmaNodeId,
          }))
          .sort((left, right) =>
            compareStrings(
              `${left.sourceArchive}#${left.figmaNodeId}`,
              `${right.sourceArchive}#${right.figmaNodeId}`,
            ),
          ),
      ),
    )
    .digest("hex");

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
          .sort(compareStrings)
          .map((status) => [
            status,
            families.filter((family) => family.implementation_status === status)
              .length,
          ]),
      ),
      auditStatuses: Object.fromEntries(
        [...new Set(families.map((family) => family.audit_status))]
          .sort(compareStrings)
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
  sourceFoundations,
  inventory,
  ledger,
  repoRoot,
}) {
  assert(ledger.schemaVersion === 1, "ledger schemaVersion must be 1");
  assert(Array.isArray(ledger.records), "ledger.records must be an array");
  assert(
    Array.isArray(ledger.classificationEpisodes),
    "ledger.classificationEpisodes must be an array",
  );
  const episodesById = new Map(
    ledger.classificationEpisodes.map((episode) => [episode.id, episode]),
  );
  assert(
    episodesById.size === ledger.classificationEpisodes.length,
    "classification episode ids must be unique",
  );
  for (const episode of ledger.classificationEpisodes) {
    assert(episode.id?.trim(), "classification episode id is required");
    assert(
      Array.isArray(episode.allowedCohorts) &&
        episode.allowedCohorts.length > 0,
      `${episode.id}: allowed cohorts are required`,
    );
    assert(
      new Set(episode.allowedCohorts).size === episode.allowedCohorts.length &&
        episode.allowedCohorts.every((cohort) => cohort?.trim()),
      `${episode.id}: allowed cohorts must be unique non-empty strings`,
    );
    assert(
      /^[a-f0-9]{64}$/.test(episode.expectedIdentityDigest),
      `${episode.id}: expected identity digest is required`,
    );
  }
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
  const normalizedIconRecords =
    sourceFoundations?.observed?.normalizedIconComponentCoverage?.records ?? [];
  const normalizedIconKeys = normalizedIconRecords.map(keyOf);
  assert(
    new Set(normalizedIconKeys).size === normalizedIconKeys.length,
    "normalized icon provenance contains duplicate record identities",
  );
  const normalizedIconCoverage = new Map(
    normalizedIconRecords.map((record) => [keyOf(record), record]),
  );

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
        const resolvedReference = await validatePath(
          repoRoot,
          reference,
          label,
          identity,
        );
        if (field === "implementation") {
          const protectedRoot = await realpath(
            path.join(repoRoot, "shlz-design-source"),
          );
          assert(
            resolvedReference !== protectedRoot &&
              !resolvedReference.startsWith(`${protectedRoot}${path.sep}`),
            `${identity}: source cannot be implementation`,
          );
        }
      }
  };

  const validateIconProvenance = async (
    decision,
    identity,
    source,
    requiredVariants,
  ) => {
    assert(
      decision.provenance === "normalized-icon-exact-geometry",
      `${identity}: Icons needs exact normalized icon provenance`,
    );
    const provenance = normalizedIconCoverage.get(keyOf(source));
    assert(provenance, `${identity}: normalized icon provenance is missing`);
    const provenanceVariantIds = provenance.variants.map(
      (variant) => variant.figmaNodeId,
    );
    assert(
      new Set(provenanceVariantIds).size === provenanceVariantIds.length,
      `${identity}: normalized icon provenance contains duplicate variant identities`,
    );
    const provenanceById = new Map(
      provenance.variants.map((variant) => [variant.figmaNodeId, variant]),
    );
    const normalizedRoot = await realpath(
      path.join(repoRoot, "packages/icons/normalized"),
    );
    for (const sourceVariant of requiredVariants) {
      const variant = provenanceById.get(sourceVariant.figmaNodeId);
      assert(
        variant && typeof variant.normalizedPath === "string",
        `${identity}: normalized icon provenance does not cover every variant`,
      );
      const resolved = await validatePath(
        repoRoot,
        variant.normalizedPath,
        "normalized icon provenance",
        identity,
      );
      assert(
        resolved.startsWith(`${normalizedRoot}${path.sep}`),
        `${identity}: normalized icon provenance escapes normalized icons`,
      );
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
    validateReview(decision.review, identity, episodesById);
    if (decision.families.includes("Icons")) {
      await validateIconProvenance(decision, identity, source, source.variants);
    }
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
      if (exception.families.includes("Icons"))
        await validateIconProvenance(
          exception,
          `${identity}#${exception.figmaNodeId}`,
          source,
          source.variants.filter(
            (variant) => variant.figmaNodeId === exception.figmaNodeId,
          ),
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
      provenance: decision.provenance ?? null,
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
          provenance: effective.provenance ?? null,
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
  const classificationEpisodes = ledger.classificationEpisodes.map(
    (episode) => {
      assert(
        Number.isInteger(episode.expectedRecords) &&
          Number.isInteger(episode.expectedVariants),
        `${episode.id}: expected census totals must be integers`,
      );
      const reviewed = records.filter(
        (record) =>
          decisions.get(keyOf(record.identity)).review?.episode === episode.id,
      );
      const reviewedVariants = reviewed.flatMap((record) => record.variants);
      const actualIdentityDigest = classificationIdentityDigest(reviewed);
      assert(
        reviewed.length === episode.expectedRecords,
        `${episode.id}: reviewed record total ${reviewed.length} does not match ${episode.expectedRecords}`,
      );
      assert(
        reviewedVariants.length === episode.expectedVariants,
        `${episode.id}: reviewed variant total ${reviewedVariants.length} does not match ${episode.expectedVariants}`,
      );
      assert(
        actualIdentityDigest === episode.expectedIdentityDigest,
        `${episode.id}: reviewed source identities do not match the baseline census`,
      );
      const cohortNames = [
        ...new Set(
          reviewed.map(
            (record) => decisions.get(keyOf(record.identity)).review.cohort,
          ),
        ),
      ].sort(compareStrings);
      return {
        id: episode.id,
        baseline: episode.baseline,
        identityDigest: actualIdentityDigest,
        expected: {
          records: episode.expectedRecords,
          variants: episode.expectedVariants,
        },
        actual: {
          records: reviewed.length,
          variants: reviewedVariants.length,
        },
        cohorts: cohortNames.map((cohort) => {
          const cohortRecords = reviewed.filter(
            (record) =>
              decisions.get(keyOf(record.identity)).review.cohort === cohort,
          );
          return {
            cohort,
            records: cohortRecords.length,
            variants: cohortRecords.flatMap((record) => record.variants).length,
          };
        }),
        records: reviewed.map((record) => ({
          ...record.identity,
          disposition: record.disposition,
          cohort: decisions.get(keyOf(record.identity)).review.cohort,
          boundary: decisions.get(keyOf(record.identity)).review.boundary,
          sourceDiagnosticsBoundary:
            decisions.get(keyOf(record.identity)).review
              .sourceDiagnosticsBoundary ?? null,
        })),
      };
    },
  );
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
      sourceFoundations: "design-source-index/foundations.json",
    },
    semantics: {
      auditStatusVerified:
        "Declared audit evidence passed; this is not an implementation or transfer disposition.",
      completion:
        "Complete accounting may include unresolved records and does not imply complete implementation.",
    },
    summary: summarize(records, variants, referencedFamilies),
    classificationEpisodes,
    records,
  };
}
