import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  iconGeometryHash,
  resolveNormalizedIconPath,
} from "../lib/icon-geometry.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");

const typographySourcePaths = [
  "shlz-design-source/raw/typography-UI Kit – Basic elements.json",
  "shlz-design-source/raw/typography-UI Kit – Interface elements.json",
];

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("icon geometry identity preserves clipping geometry but ignores paint", () => {
  const icon = (clipWidth, fill) =>
    `<svg width="24" height="24"><defs><clipPath id="clip"><rect width="${clipWidth}" height="24"/></clipPath></defs><path clip-path="url(#clip)" fill="${fill}" d="M0 0h24v24z"/></svg>`;
  assert.equal(
    iconGeometryHash(icon(12, "red")),
    iconGeometryHash(icon(12, "blue")),
  );
  assert.notEqual(
    iconGeometryHash(icon(12, "red")),
    iconGeometryHash(icon(16, "red")),
  );
});

test("normalized icon paths cannot escape their generated root", () => {
  const normalizedRoot = path.join(repoRoot, "packages/icons/normalized");
  assert.equal(
    resolveNormalizedIconPath(
      repoRoot,
      normalizedRoot,
      "packages/icons/normalized/../../tokens/tokens.json",
    ),
    null,
  );
  assert.ok(
    resolveNormalizedIconPath(
      repoRoot,
      normalizedRoot,
      "packages/icons/normalized/status/priority-high.svg",
    )?.startsWith(normalizedRoot),
  );
});

test("design source index is reproducible and complete", () => {
  const rawHashesBefore = typographySourcePaths.map(sha256);
  execFileSync(process.execPath, ["tools/generate-design-source-index.mjs"]);
  const manifest = JSON.parse(
    readFileSync("design-source-index/manifest.json", "utf8"),
  );
  const components = JSON.parse(
    readFileSync("design-source-index/components.json", "utf8"),
  );
  const foundations = JSON.parse(
    readFileSync("design-source-index/foundations.json", "utf8"),
  );
  const typography = JSON.parse(
    readFileSync("design-source-index/typography.json", "utf8"),
  );
  assert.deepEqual(components.summary, {
    componentSets: 69,
    standaloneComponents: 126,
    variants: 630,
  });
  assert.equal(manifest.corpus.icons.logicalGlyphs, 119);
  assert.equal(manifest.corpus.referenceScreens.total, 34);
  assert.deepEqual(
    foundations.canonical.spacing.valuesPx,
    [4, 8, 16, 24, 32, 40, 48, 56, 64],
  );
  assert.deepEqual(
    foundations.canonical.cornerRadius.values.map(({ valuePx }) => valuePx),
    [8, 12, 16, 48, 100],
  );
  assert.equal(foundations.canonical.colors.count, 40);
  assert.deepEqual(
    foundations.observed.normalizedIconComponentCoverage.records.map(
      ({ name, variants }) => [name, variants.length],
    ),
    [
      ["Priority", 3],
      ["File type icon", 21],
    ],
  );
  assert.ok(
    foundations.observed.normalizedIconComponentCoverage.records.every(
      ({ variants }) =>
        variants.every(
          ({ normalizedPath }) =>
            normalizedPath.startsWith("packages/icons/normalized/") &&
            existsSync(normalizedPath),
        ),
    ),
  );
  assert.deepEqual(
    typography.sourceFiles.map(({ counts }) => counts),
    [
      {
        textNodes: 1480,
        uniqueTypographySignatures: 29,
        referencedTextStyles: 14,
        mixedNodes: 0,
        warnings: 0,
        errors: 0,
      },
      {
        textNodes: 713,
        uniqueTypographySignatures: 19,
        referencedTextStyles: 11,
        mixedNodes: 15,
        warnings: 0,
        errors: 0,
      },
    ],
  );
  assert.equal(typography.summary.mergedSignatures, 36);
  assert.equal(typography.summary.crossPageSignatures, 12);
  assert.equal(typography.summary.referencedTextStyles, 18);
  assert.equal(typography.summary.mixedNodes, 15);
  assert.equal(typography.summary.styledSegmentsInMixedNodes, 43);
  assert.equal(
    typography.textStyles.filter(({ inconsistent }) => inconsistent).length,
    0,
  );
  assert.deepEqual(typographySourcePaths.map(sha256), rawHashesBefore);

  const firstGeneration = readFileSync(
    "design-source-index/typography.json",
    "utf8",
  );
  execFileSync(process.execPath, ["tools/generate-design-source-index.mjs"]);
  assert.equal(
    readFileSync("design-source-index/typography.json", "utf8"),
    firstGeneration,
  );
  assert.deepEqual(typographySourcePaths.map(sha256), rawHashesBefore);
});
