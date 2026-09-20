import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Icons.svg candidates are exhaustively dispositioned from raw source IDs", async () => {
  const analysis = await json(
    "packages/icons/normalized/icons-sheet-analysis.json",
  );
  const legacy = await json("shlz-design-source/assets/icon-manifest.json");
  const baseline = await json("tools/fixtures/icon-library-baseline.json");
  const independentCensus = legacy.map(
    ({ name, category, source_ids: sourceIds, viewBox }) => ({
      name,
      category,
      sourceIds,
      viewBox,
    }),
  );
  const independentSourceIds = [
    ...new Set(independentCensus.flatMap(({ sourceIds }) => sourceIds)),
  ].sort();

  assert.equal(
    sha256(independentCensus),
    baseline.iconsSheetCensus.candidateLedgerSha256,
  );
  assert.equal(
    sha256(independentSourceIds),
    baseline.iconsSheetCensus.sourceIdSetSha256,
  );
  assert.equal(
    independentCensus.length,
    baseline.iconsSheetCensus.candidateCount,
  );
  assert.equal(
    independentSourceIds.length,
    baseline.iconsSheetCensus.primitiveCount,
  );
  assert.equal(analysis.sourceCandidateCount, 125);
  assert.equal(analysis.coreCandidateCount, 104);
  assert.equal(analysis.fileTypeCandidateCount, 21);
  assert.equal(analysis.referencedPrimitiveCount, 302);
  assert.equal(new Set(analysis.candidates.map(({ id }) => id)).size, 125);
  assert.ok(
    analysis.candidates.every(({ disposition }) =>
      ["exact-existing", "new-canonical", "qualified-collision"].includes(
        disposition,
      ),
    ),
  );
  assert.equal(
    analysis.candidates.filter(
      ({ disposition }) => disposition !== "exact-existing",
    ).length,
    125,
  );
  const manifest = await json("packages/icons/normalized/manifest.json");
  for (const candidate of analysis.candidates.filter(
    ({ disposition }) => disposition === "exact-existing",
  )) {
    assert.deepEqual(candidate.exactEquivalence, {
      topology: true,
      viewBox: true,
      paintPolicy: true,
    });
    const target = manifest.find(({ name }) => name === candidate.target);
    assert.ok(
      target.provenance.additionalSourceEvidence.some(
        ({ sourceIds }) =>
          JSON.stringify(sourceIds) === JSON.stringify(candidate.sourceIds),
      ),
      `${candidate.id} lacks canonical provenance`,
    );
  }
});

test("both source calendar geometries are canonical and distinct", async () => {
  const manifest = await json("packages/icons/normalized/manifest.json");
  const sidebar = manifest.find(({ name }) => name === "calendar-sidebar");
  const ui = manifest.find(({ name }) => name === "calendar-interface");
  assert.ok(sidebar);
  assert.ok(ui);
  assert.notEqual(
    sidebar.variants[0].geometrySha256,
    ui.variants[0].geometrySha256,
  );
  assert.deepEqual(sidebar.provenance.sourceIds, ["path41"]);
  assert.deepEqual(ui.provenance.sourceIds, [
    "path83",
    "path80",
    "path82",
    "path81",
  ]);
});

test("expanded icon package exposes every normalized canonical glyph", async () => {
  const manifest = await json("packages/icons/dist/manifest.json");
  const runtime = await import("../../packages/icons/dist/index.js");
  const sprite = await readFile("packages/icons/dist/sprite.svg", "utf8");
  assert.equal(manifest.length, 244);
  assert.equal(
    manifest.reduce((count, icon) => count + icon.variants.length, 0),
    250,
  );
  assert.deepEqual(
    runtime.canonicalIconNames,
    manifest.map(({ name }) => name),
  );
  for (const icon of manifest) {
    assert.match(sprite, new RegExp(`id="shlz-icon-${icon.variants[0].name}"`));
    assert.equal(runtime.resolveIconName(icon.name), icon.name);
  }
});
