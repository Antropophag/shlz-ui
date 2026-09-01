import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildCoverageMatrix } from "../lib/source-library-coverage.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(repoRoot, relative), "utf8"));
const sourceIndex = await readJson("design-source-index/components.json");
const inventory = await readJson(
  "docs/component-audits/project-inventory.json",
);
const ledger = await readJson(
  "docs/component-audits/source-library-coverage-ledger.json",
);
const clone = (value) => JSON.parse(JSON.stringify(value));
const build = (candidate) =>
  buildCoverageMatrix({ sourceIndex, inventory, ledger: candidate, repoRoot });

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
});
