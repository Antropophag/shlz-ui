import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildCoverageMatrix } from "../lib/source-library-coverage.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(repoRoot, relative), "utf8"));
const sourceIndex = await readJson("design-source-index/components.json");
const sourceFoundations = await readJson(
  "design-source-index/foundations.json",
);
const inventory = await readJson(
  "docs/component-audits/project-inventory.json",
);
const ledger = await readJson(
  "docs/component-audits/source-library-coverage-ledger.json",
);
const clone = (value) => JSON.parse(JSON.stringify(value));
const build = (candidate) =>
  buildCoverageMatrix({
    sourceIndex,
    sourceFoundations,
    inventory,
    ledger: candidate,
    repoRoot,
  });
const buildWith = (overrides) =>
  buildCoverageMatrix({
    sourceIndex,
    sourceFoundations,
    inventory,
    ledger,
    repoRoot,
    ...overrides,
  });

test("coverage matrix accounts for records and variants using separate units", async () => {
  const matrix = await build(ledger);
  assert.equal(
    matrix.records.length,
    sourceIndex.summary.componentSets +
      sourceIndex.summary.standaloneComponents,
  );
  assert.equal(matrix.summary.records.denominator, 195);
  assert.equal(matrix.summary.variants.denominator, 630);
  assert.equal(
    Object.values(matrix.summary.records.dispositions).reduce(
      (sum, item) => sum + item.count,
      0,
    ),
    195,
  );
  assert.equal(
    Object.values(matrix.summary.variants.dispositions).reduce(
      (sum, item) => sum + item.count,
      0,
    ),
    630,
  );
  assert.match(matrix.semantics.auditStatusVerified, /not an implementation/);
  assert.equal(JSON.stringify(await build(ledger)), JSON.stringify(matrix));
});

test("classification episodes account for their exact baseline census", async () => {
  const matrix = await build(ledger);
  const episode = matrix.classificationEpisodes.find(
    ({ id }) => id === "classify-existing-component-records",
  );
  assert.ok(episode);
  assert.equal(episode.expected.records, 140);
  assert.equal(episode.expected.variants, 163);
  assert.equal(episode.actual.records, 140);
  assert.equal(episode.actual.variants, 163);
  assert.equal(
    episode.cohorts.reduce((sum, cohort) => sum + cohort.records, 0),
    140,
  );
  assert.deepEqual(
    episode.cohorts.map(({ cohort, records, variants }) => ({
      cohort,
      records,
      variants,
    })),
    [
      { cohort: "classified-existing-family", records: 10, variants: 49 },
      { cohort: "composition-evidence", records: 4, variants: 11 },
      { cohort: "consumer-composition", records: 9, variants: 31 },
      { cohort: "deferred-component-contract", records: 9, variants: 42 },
      { cohort: "deferred-icon-provenance", records: 103, variants: 0 },
      { cohort: "deferred-shared-model", records: 5, variants: 30 },
    ],
  );
  assert.ok(
    episode.records.every(({ cohort, boundary }) => cohort && boundary),
  );
});

test("classification episode validation fails closed", async () => {
  const missingReview = clone(ledger);
  delete missingReview.records.find(
    ({ review }) => review?.episode === "classify-existing-component-records",
  ).review;
  await assert.rejects(build(missingReview), /reviewed record total/);

  const unknownEpisode = clone(ledger);
  unknownEpisode.records[0].review = {
    episode: "invented-episode",
    cohort: "candidate",
    boundary: "Missing evidence.",
  };
  await assert.rejects(build(unknownEpisode), /unknown classification episode/);

  const unnamedBoundary = clone(ledger);
  const reviewed = unnamedBoundary.records.find(
    ({ review }) => review?.episode === "classify-existing-component-records",
  );
  reviewed.review.boundary = "";
  await assert.rejects(build(unnamedBoundary), /review boundary/);

  const inventedCohort = clone(ledger);
  inventedCohort.records.find(
    ({ review }) => review?.episode === "classify-existing-component-records",
  ).review.cohort = "invented-cohort";
  await assert.rejects(build(inventedCohort), /invalid review cohort/);

  const swappedIdentity = clone(ledger);
  const sourceVariants = new Map(
    sourceIndex.components.map((record) => [
      `${record.sourceArchive}#${record.figmaNodeId}`,
      record.variants.length,
    ]),
  );
  const reviewedRecord = swappedIdentity.records.find(
    ({ review }) => review?.episode === "classify-existing-component-records",
  );
  const reviewedVariantCount = sourceVariants.get(
    `${reviewedRecord.sourceArchive}#${reviewedRecord.figmaNodeId}`,
  );
  const replacement = swappedIdentity.records.find(
    (record) =>
      !record.review &&
      sourceVariants.get(`${record.sourceArchive}#${record.figmaNodeId}`) ===
        reviewedVariantCount,
  );
  assert.ok(replacement);
  replacement.review = reviewedRecord.review;
  delete reviewedRecord.review;
  await assert.rejects(
    build(swappedIdentity),
    /reviewed source identities do not match the baseline census/,
  );
});

test("coverage validation fails closed on incomplete or stale identities", async () => {
  const missing = clone(ledger);
  missing.records.pop();
  await assert.rejects(build(missing), /missing ledger decision/);

  const duplicate = clone(ledger);
  duplicate.records.push(clone(duplicate.records[0]));
  await assert.rejects(build(duplicate), /duplicate ledger decision/);

  const stale = clone(ledger);
  stale.records[0].name = "Invented name";
  await assert.rejects(build(stale), /stale name/);

  const duplicateSource = clone(sourceIndex);
  duplicateSource.components.push(clone(duplicateSource.components[0]));
  await assert.rejects(
    buildWith({ sourceIndex: duplicateSource }),
    /duplicate record identities/,
  );

  const duplicateFamily = clone(inventory);
  duplicateFamily.families.push(clone(duplicateFamily.families[0]));
  await assert.rejects(
    buildWith({ inventory: duplicateFamily }),
    /duplicate canonical family names/,
  );
});

test("coverage validation rejects unsupported claims and references", async () => {
  const unknownFamily = clone(ledger);
  unknownFamily.records[0].families = ["Unknown family"];
  await assert.rejects(build(unknownFamily), /unknown family/);

  const missingEvidence = clone(ledger);
  missingEvidence.records[0].evidence = [];
  await assert.rejects(
    build(missingEvidence),
    /implemented needs evidence paths/,
  );

  const sourceImplementation = clone(ledger);
  sourceImplementation.records[0].implementation = [
    sourceImplementation.records[0].sourceArchive,
  ];
  await assert.rejects(
    build(sourceImplementation),
    /source cannot be implementation/,
  );

  const normalizedSourceImplementation = clone(ledger);
  normalizedSourceImplementation.records[0].implementation = [
    `./${normalizedSourceImplementation.records[0].sourceArchive}`,
  ];
  await assert.rejects(
    build(normalizedSourceImplementation),
    /source cannot be implementation/,
  );

  const sourceRootImplementation = clone(ledger);
  sourceRootImplementation.records[0].implementation = ["shlz-design-source"];
  await assert.rejects(
    build(sourceRootImplementation),
    /source cannot be implementation/,
  );

  for (const [disposition, field] of [
    ["evidence-only", "implementation"],
    ["intentionally-excluded", "families"],
    ["unresolved", "evidence"],
  ]) {
    const contradictory = clone(ledger);
    Object.assign(contradictory.records[0], {
      disposition,
      families: [],
      implementation: [],
      evidence: [],
      exclusionEvidence: [],
      reason: "Deliberate regression fixture.",
      ownership: "consumer application",
    });
    contradictory.records[0][field] =
      field === "families"
        ? [inventory.families[0].canonical_name]
        : ["docs/component-audits/project-inventory.json"];
    await assert.rejects(build(contradictory), new RegExp(`forbids ${field}`));
  }

  const escapeDirectory = await mkdtemp(
    path.join(repoRoot, ".coverage-path-test-"),
  );
  const outsideDirectory = await mkdtemp(
    path.join(path.dirname(repoRoot), ".coverage-outside-test-"),
  );
  const outsideFile = path.join(outsideDirectory, "evidence.json");
  const escapeLink = path.join(escapeDirectory, "escape.json");
  try {
    await writeFile(outsideFile, "{}\n");
    await symlink(outsideFile, escapeLink);
    const escapingEvidence = clone(ledger);
    escapingEvidence.records[0].evidence = [
      path.relative(repoRoot, escapeLink),
    ];
    await assert.rejects(build(escapingEvidence), /outside the repository/);
  } finally {
    await rm(escapeDirectory, { recursive: true });
    await rm(outsideDirectory, { recursive: true });
  }

  const unsupportedExclusion = clone(ledger);
  Object.assign(unsupportedExclusion.records[0], {
    disposition: "intentionally-excluded",
    families: [],
    implementation: [],
    evidence: [],
    exclusionEvidence: [],
    reason: "Application-owned screen composition.",
    ownership: "consumer application",
  });
  await assert.rejects(
    build(unsupportedExclusion),
    /exclusion needs supporting evidence/,
  );

  const inventedOwnership = clone(ledger);
  inventedOwnership.records.find(
    ({ disposition }) => disposition === "intentionally-excluded",
  ).ownership = "library core";
  await assert.rejects(build(inventedOwnership), /valid ownership boundary/);
});

test("normalized icon claims require exact provenance for every indexed variant", async () => {
  const priorityIndex = ledger.records.findIndex(
    ({ figmaNodeId }) => figmaNodeId === "254:18239",
  );
  const missingMarker = clone(ledger);
  delete missingMarker.records[priorityIndex].provenance;
  await assert.rejects(
    build(missingMarker),
    /Icons needs exact normalized icon provenance/,
  );

  const incompleteFoundations = clone(sourceFoundations);
  incompleteFoundations.observed.normalizedIconComponentCoverage.records[0].variants.pop();
  await assert.rejects(
    buildWith({ sourceFoundations: incompleteFoundations }),
    /does not cover every variant/,
  );

  const duplicateRecord = clone(sourceFoundations);
  duplicateRecord.observed.normalizedIconComponentCoverage.records.push(
    clone(duplicateRecord.observed.normalizedIconComponentCoverage.records[0]),
  );
  await assert.rejects(
    buildWith({ sourceFoundations: duplicateRecord }),
    /duplicate record identities/,
  );

  const duplicateVariant = clone(sourceFoundations);
  duplicateVariant.observed.normalizedIconComponentCoverage.records[0].variants.push(
    clone(
      duplicateVariant.observed.normalizedIconComponentCoverage.records[0]
        .variants[0],
    ),
  );
  await assert.rejects(
    buildWith({ sourceFoundations: duplicateVariant }),
    /duplicate variant identities/,
  );

  const missingNormalizedOutput = clone(sourceFoundations);
  delete missingNormalizedOutput.observed.normalizedIconComponentCoverage
    .records[0].variants[0].normalizedPath;
  await assert.rejects(
    buildWith({ sourceFoundations: missingNormalizedOutput }),
    /does not cover every variant/,
  );

  const staleNormalizedOutput = clone(sourceFoundations);
  staleNormalizedOutput.observed.normalizedIconComponentCoverage.records[0].variants[0].normalizedPath =
    "packages/icons/normalized/missing-output.svg";
  await assert.rejects(
    buildWith({ sourceFoundations: staleNormalizedOutput }),
    /normalized icon provenance path is invalid/,
  );

  const escapingNormalizedOutput = clone(sourceFoundations);
  escapingNormalizedOutput.observed.normalizedIconComponentCoverage.records[0].variants[0].normalizedPath =
    "packages/icons/normalized/../../tokens/tokens.json";
  await assert.rejects(
    buildWith({ sourceFoundations: escapingNormalizedOutput }),
    /must be a repository-relative path/,
  );

  const arrowsIndex = ledger.records.findIndex(
    ({ figmaNodeId }) => figmaNodeId === "440:21412",
  );
  const unsupported = clone(ledger);
  Object.assign(unsupported.records[arrowsIndex], {
    disposition: "implemented",
    families: ["Icons"],
    implementation: ["packages/icons/normalized/"],
    evidence: ["design-source-index/foundations.json"],
    exclusionEvidence: [],
    provenance: "normalized-icon-exact-geometry",
  });
  delete unsupported.records[arrowsIndex].reason;
  await assert.rejects(
    build(unsupported),
    /normalized icon provenance is missing/,
  );

  const result = await build(ledger);
  const priority = result.records.find(
    ({ identity }) => identity.figmaNodeId === "254:18239",
  );
  assert.equal(priority.provenance, "normalized-icon-exact-geometry");
  assert.ok(
    priority.variants.every(
      ({ provenance }) => provenance === "normalized-icon-exact-geometry",
    ),
  );
  assert.equal(
    result.generatedFrom.sourceFoundations,
    "design-source-index/foundations.json",
  );
});

test("variant exceptions must identify indexed variants and satisfy the same contract", async () => {
  const invented = clone(ledger);
  invented.records[0].variantExceptions = [
    {
      figmaNodeId: "invented:variant",
      disposition: "unresolved",
      families: [],
      implementation: [],
      evidence: [],
      exclusionEvidence: [],
      reason: "Evidence is missing.",
    },
  ];
  await assert.rejects(build(invented), /invented variant exception/);

  const unsupportedIconException = clone(ledger);
  const unsupportedIconVariant = sourceIndex.components[0].variants[0];
  unsupportedIconException.records[0].variantExceptions = [
    {
      figmaNodeId: unsupportedIconVariant.figmaNodeId,
      disposition: "implemented",
      families: ["Icons"],
      implementation: ["packages/icons/normalized/"],
      evidence: ["design-source-index/foundations.json"],
      exclusionEvidence: [],
      provenance: "normalized-icon-exact-geometry",
    },
  ];
  await assert.rejects(
    build(unsupportedIconException),
    /normalized icon provenance is missing/,
  );

  const narrowed = clone(ledger);
  const variant = sourceIndex.components[0].variants[0];
  narrowed.records[0].variantExceptions = [
    {
      figmaNodeId: variant.figmaNodeId,
      disposition: "unresolved",
      families: [],
      implementation: [],
      evidence: [],
      exclusionEvidence: [],
      reason: "This variant still needs independent evidence.",
    },
  ];
  const matrix = await build(narrowed);
  const narrowedVariant = matrix.records[0].variants[0];
  assert.equal(narrowedVariant.inheritedFromRecord, false);
  assert.equal(narrowedVariant.disposition, "unresolved");
  assert.deepEqual(narrowedVariant.evidence, []);

  const baseline = await build(ledger);
  const referencedNames = new Set(
    baseline.records.flatMap((record) =>
      record.families.map((family) => family.canonicalName),
    ),
  );
  const exceptionFamily = inventory.families.find(
    (family) => !referencedNames.has(family.canonical_name),
  );
  assert.ok(exceptionFamily);
  const variantFamily = clone(ledger);
  variantFamily.records[0].variantExceptions = [
    {
      figmaNodeId: variant.figmaNodeId,
      disposition: "evidence-only",
      families: [exceptionFamily.canonical_name],
      implementation: [],
      evidence: ["docs/component-audits/project-inventory.json"],
      exclusionEvidence: [],
      reason: "Only family-level evidence is currently available.",
    },
  ];
  const variantFamilyMatrix = await build(variantFamily);
  assert.equal(
    variantFamilyMatrix.summary.referencedFamilies.denominator,
    baseline.summary.referencedFamilies.denominator + 1,
  );
});
