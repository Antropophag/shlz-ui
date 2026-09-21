import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { replaceGeneratedMarkdownSection } from "../lib.mjs";

const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("generated Icons.svg README section is replace-idempotent", () => {
  const initial = "# Normalized icons\n\nBase contract.\n";
  const section = "Generated facts.\n";
  const once = replaceGeneratedMarkdownSection(
    initial,
    "Icons.svg sheet extension",
    section,
  );
  const twice = replaceGeneratedMarkdownSection(
    once,
    "Icons.svg sheet extension",
    section,
  );

  assert.equal(twice, once);
  assert.equal(twice.match(/^## Icons\.svg sheet extension$/gm)?.length, 1);
  assert.match(twice, /Base contract/);
});

test("Showcase navigation provenance names the tracked JSON contract", async () => {
  const requirements = await readFile(
    "docs/exec-plans/active/complete-icon-library/requirements.json",
    "utf8",
  );
  assert.match(requirements, /apps\/showcase\/src\/showcase-navigation\.json/);
  assert.doesNotMatch(
    requirements,
    /apps\/showcase\/src\/showcase-navigation\.js\b/,
  );
});

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
  const raw = await readFile("shlz-design-source/raw/svg/Icons.svg", "utf8");
  const rawPrimitiveHashes = [
    ...raw.matchAll(/<(?:path|rect)\b[^>]*\/?>(?:<\/(?:path|rect)>)?/g),
  ].map(([element]) => createHash("sha256").update(element).digest("hex"));
  const candidatePrimitiveHashes = new Set(
    analysis.candidates.flatMap(({ rawPrimitiveSha256 }) => rawPrimitiveSha256),
  );
  const excludedPrimitiveHashes = rawPrimitiveHashes.filter(
    (hash) => !candidatePrimitiveHashes.has(hash),
  );

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
  assert.equal(
    rawPrimitiveHashes.length,
    baseline.iconsSheetCensus.rawPrimitiveCount,
  );
  assert.equal(
    sha256(rawPrimitiveHashes),
    baseline.iconsSheetCensus.rawPrimitiveSequenceSha256,
  );
  assert.equal(
    candidatePrimitiveHashes.size,
    baseline.iconsSheetCensus.primitiveCount,
  );
  assert.ok(
    [...candidatePrimitiveHashes].every((hash) =>
      rawPrimitiveHashes.includes(hash),
    ),
  );
  assert.equal(
    excludedPrimitiveHashes.length,
    baseline.iconsSheetCensus.excludedPrimitiveCount,
  );
  assert.equal(
    sha256(excludedPrimitiveHashes),
    baseline.iconsSheetCensus.excludedPrimitiveSequenceSha256,
  );
  assert.equal(
    rawPrimitiveHashes.length,
    candidatePrimitiveHashes.size + excludedPrimitiveHashes.length,
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
      paintTopology: true,
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

test("Icons.svg normalization preserves source paint stacking", async () => {
  const xls = await readFile(
    new globalThis.URL(
      "../../packages/icons/normalized/interface/xls-file.svg",
      import.meta.url,
    ),
    "utf8",
  );
  const sourceOrder = [
    xls.indexOf("M375.617"),
    xls.indexOf("M384.215"),
    xls.indexOf("<rect"),
    xls.indexOf("M372.389"),
  ];
  assert.ok(sourceOrder.every((position) => position >= 0));
  assert.deepEqual(
    sourceOrder,
    [...sourceOrder].sort((a, b) => a - b),
  );
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
