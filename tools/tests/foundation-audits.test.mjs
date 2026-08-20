import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const families = [
  "tokens",
  "colors",
  "spacing",
  "radii",
  "effects",
  "typography",
  "icons",
];
const evidenceLevels = [
  "source-integrity",
  "structural-contract",
  "runtime-browser",
  "accessibility",
  "focused-visual",
  "consumer-integration",
  "responsive-content-stress",
];

test("Wave 1 has a complete manifest for every foundation family", async () => {
  for (const family of families) {
    const manifest = JSON.parse(
      await readFile(`docs/foundation-audits/${family}.json`, "utf8"),
    );
    assert.equal(manifest.foundation, family);
    assert.ok(["VERIFIED", "FINDINGS"].includes(manifest.status));
    assert.deepEqual(
      Object.keys(manifest.evidence).sort(),
      evidenceLevels.sort(),
    );
    for (const status of Object.values(manifest.evidence))
      assert.ok(
        status === "pass" ||
          status.startsWith("pass:") ||
          status.startsWith("not-applicable:"),
      );
    for (const path of [
      ...manifest.authoritativeSource,
      ...(manifest.referenceSources ?? []),
      ...manifest.derivedArtifacts,
      ...manifest.implementation,
      ...manifest.consumers,
      ...manifest.sourceClaims.map(({ evidence }) => evidence),
    ])
      await access(path);
    for (const claim of manifest.sourceClaims)
      assert.ok(
        [
          "source-fact",
          "derived-pattern",
          "repository-decision",
          "assumption",
        ].includes(claim.classification),
      );
    if (manifest.status === "FINDINGS") assert.ok(manifest.findings.length);
  }
});

test("source token layers preserve exact foundation facts", async () => {
  const tokens = JSON.parse(
    await readFile("packages/tokens/tokens.json", "utf8"),
  );
  const colors = Object.values(tokens.source.color).flatMap((group) =>
    Object.values(group),
  );
  assert.equal(colors.length, 40);
  assert.deepEqual(Object.values(tokens.source.spacing), [
    "4px",
    "8px",
    "16px",
    "24px",
    "32px",
    "40px",
    "48px",
    "56px",
    "64px",
  ]);
  assert.deepEqual(Object.values(tokens.source.radius), [
    "8px",
    "12px",
    "16px",
    "48px",
    "100px",
  ]);
  assert.equal(colors.filter((value) => value.includes(" / ")).length, 16);
  assert.equal(
    Object.keys(tokens).filter(
      (key) => !["$schema", "source", "semantic"].includes(key),
    ).length,
    0,
  );
});

test("semantic color aliases resolve to source facts and generated CSS is exact", async () => {
  const authored = JSON.parse(
    await readFile("packages/tokens/tokens.json", "utf8"),
  );
  const generated = JSON.parse(
    await readFile("packages/tokens/dist/tokens.json", "utf8"),
  );
  assert.deepEqual(generated, authored);
  const sourceValues = new Set(
    Object.values(authored.source.color).flatMap((group) =>
      Object.values(group),
    ),
  );
  const colorAliases = [];
  const collectAliases = (node) => {
    for (const value of Object.values(node)) {
      if (typeof value === "string") colorAliases.push(value);
      else collectAliases(value);
    }
  };
  collectAliases(authored.semantic.color);
  assert.equal(colorAliases.length, 11);
  for (const alias of colorAliases) {
    const value = alias
      .slice(1, -1)
      .split(".")
      .reduce((node, key) => node[key], authored);
    assert.ok(sourceValues.has(value));
  }
  const css = await readFile("packages/tokens/dist/tokens.css", "utf8");
  const leafCount = (node) =>
    Object.values(node).reduce(
      (count, value) =>
        count + (typeof value === "object" ? leafCount(value) : 1),
      0,
    );
  assert.equal((css.match(/--shlz-/g) ?? []).length, leafCount(authored) - 1);
  assert.doesNotMatch(css, /\{source\./);
});

test("production foundation code has no approximate pill radius", async () => {
  const files = [
    "packages/styles/foundation.css",
    ...(await readdir("packages/styles/components"))
      .filter((name) => name.endsWith(".css"))
      .map((name) => `packages/styles/components/${name}`),
  ];
  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.doesNotMatch(css, /border-radius:\s*999(?:9+)?px/);
  }
});

test("typography source profile and icon corpus retain audited counts", async () => {
  const typography = JSON.parse(
    await readFile("design-source-index/typography.json", "utf8"),
  );
  assert.equal(typography.summary.textNodes, 2193);
  assert.equal(typography.summary.mergedSignatures, 36);
  const iconAnalysis = JSON.parse(
    await readFile("packages/icons/normalized/analysis.json", "utf8"),
  );
  assert.equal(iconAnalysis.summary.sourceSvgCount, 133);
  assert.equal(iconAnalysis.summary.uniqueLogicalGlyphs, 119);
  assert.equal(iconAnalysis.summary.currentColorIcons, 97);
  assert.equal(iconAnalysis.summary.preservedColorIcons, 22);
});
