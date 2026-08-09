import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeFigmaNumber,
  typographySignatureKey,
} from "../lib/typography-index.mjs";

const signature = {
  fontFamily: "Golos Text",
  fontStyle: "Regular",
  fontSize: 15,
  lineHeight: { unit: "PERCENT", value: 130 },
  letterSpacing: { unit: "PERCENT", value: 0 },
  textCase: "ORIGINAL",
  textDecoration: "NONE",
};

test("normalizes only deterministic Figma floating-point noise", () => {
  assert.equal(normalizeFigmaNumber(129.99999523162842), 130);
  assert.equal(normalizeFigmaNumber(139.9999976158142), 140);
  assert.equal(normalizeFigmaNumber(5.400000095367432), 5.400000095367432);
  assert.equal(normalizeFigmaNumber(8.550000190734863), 8.550000190734863);
});

test("signature identity includes line height and letter spacing", () => {
  assert.equal(
    typographySignatureKey(signature),
    typographySignatureKey({
      ...signature,
      lineHeight: { unit: "PERCENT", value: 129.99999523162842 },
    }),
  );
  assert.notEqual(
    typographySignatureKey(signature),
    typographySignatureKey({
      ...signature,
      lineHeight: { unit: "PERCENT", value: 140 },
    }),
  );
  assert.notEqual(
    typographySignatureKey(signature),
    typographySignatureKey({
      ...signature,
      letterSpacing: { unit: "PERCENT", value: 1 },
    }),
  );
});

test("generated classifications retain non-product observations and mixed facts", async () => {
  const { readFile } = await import("node:fs/promises");
  const typography = JSON.parse(
    await readFile("design-source-index/typography.json", "utf8"),
  );
  const byClassification = Object.groupBy(
    typography.signatures,
    ({ classification }) => classification,
  );

  assert.ok(byClassification.PRODUCT_CANDIDATE.length > 0);
  assert.ok(
    byClassification.DOCUMENTATION_SHOWCASE.every(
      ({ classification }) => classification !== "PRODUCT_CANDIDATE",
    ),
  );
  assert.ok(
    byClassification.EMBEDDED_ASSET_TYPOGRAPHY.every(
      ({ normalizedSignature }) => normalizedSignature.fontFamily === "Inter",
    ),
  );
  assert.deepEqual(
    [
      ...new Set(
        byClassification.FOREIGN_LEGACY.map(
          ({ normalizedSignature }) => normalizedSignature.fontFamily,
        ),
      ),
    ].sort(),
    ["Roboto", "SF Pro Display", "Suisse Intl"],
  );
  assert.equal(typography.mixedNodes.length, 15);
  assert.equal(
    typography.mixedNodes.reduce((sum, node) => sum + node.segments.length, 0),
    43,
  );
});
