import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildDiagnosticClassification } from "../lib/source-extraction-diagnostics.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(repoRoot, relative), "utf8"));
const issues = await readJson("design-source-index/source-issues.json");
const ledger = await readJson(
  "docs/component-audits/source-extraction-diagnostics-ledger.json",
);
const clone = (value) => JSON.parse(JSON.stringify(value));
const build = (candidate = ledger) =>
  buildDiagnosticClassification({ issues, ledger: candidate, repoRoot });

test("classification reconciles node diagnostics and skipped cohorts", async () => {
  const result = await build();
  assert.deepEqual(result.summary, {
    classificationUnits: 46,
    reportedInstances: 91,
    errors: 9,
    warnings: 35,
    skippedInstances: 47,
  });
  assert.equal(
    result.units.filter(({ granularity }) => granularity === "node").length,
    44,
  );
  assert.equal(
    result.units.filter(({ granularity }) => granularity === "archive-cohort")
      .length,
    2,
  );
  assert.equal(JSON.stringify(await build()), JSON.stringify(result));
});

test("classification fails closed on incomplete and duplicate cohorts", async () => {
  const missing = clone(ledger);
  missing.classifications.pop();
  await assert.rejects(build(missing), /unclassified diagnostic/);

  const duplicate = clone(ledger);
  duplicate.classifications.push(clone(duplicate.classifications[0]));
  duplicate.classifications.at(-1).id = "duplicate";
  await assert.rejects(build(duplicate), /multiple classifications/);

  const stale = clone(ledger);
  stale.classifications[0].selector.component = "Invented component";
  await assert.rejects(
    build(stale),
    /unclassified diagnostic|unused classification/,
  );
});

test("classification fails closed on stale counts and unsupported claims", async () => {
  const stale = clone(ledger);
  stale.classifications.find(
    ({ selector }) => selector.kind === "skipped-instance",
  ).selector.multiplicity += 1;
  await assert.rejects(build(stale), /multiplicity/);

  const unknown = clone(ledger);
  unknown.classifications[0].disposition = "invented";
  await assert.rejects(build(unknown), /unknown disposition/);

  const contradictory = clone(ledger);
  contradictory.classifications[0].disposition = "harmless-diagnostic";
  contradictory.classifications[0].coverageImpact = "limits-conclusion";
  await assert.rejects(build(contradictory), /contradictory/);

  const escaping = clone(ledger);
  escaping.classifications[0].evidence = ["../outside.md"];
  await assert.rejects(build(escaping), /escapes repository/);
});
