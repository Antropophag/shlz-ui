import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

test("Tooltip source fixes typography and proves the clipped rotated-square caret", async () => {
  const [components, typography, css, rawVariant] = await Promise.all([
    readJson("design-source-index/components.json"),
    readJson("shlz-design-source/raw/typography-UI Kit – Basic elements.json"),
    readFile("packages/styles/components/tooltip.css", "utf8"),
    readFile(
      "apps/showcase/generated/source-references/tooltip-variants-1.svg",
      "utf8",
    ),
  ]);
  const tooltip = components.components.find(({ name }) => name === "Tooltip");
  assert.equal(tooltip.variants.length, 8);
  assert.deepEqual(Object.keys(tooltip.propertyDefinitions), ["Direction"]);

  const labels = typography.sourceReferences.filter(
    ({ hierarchyPath, characters }) =>
      hierarchyPath?.includes("Tooltip") && characters === "prompt text",
  );
  assert.equal(labels.length, 8);
  assert.ok(
    labels.every(
      ({ fontName, fontSize, lineHeight, letterSpacing, fills }) =>
        fontName.family === "Golos Text" &&
        fontName.style === "Regular" &&
        fontSize === 15 &&
        Math.abs(lineHeight.value - 130) < 0.001 &&
        letterSpacing.value === -1 &&
        fills[0].color.r === 1 &&
        fills[0].color.g === 1 &&
        fills[0].color.b === 1,
    ),
  );
  assert.match(rawVariant, /<rect width="11\.3137" height="5\.655"/);
  assert.match(rawVariant, /L55\.3131 14\.3168L49\.6562 19\.9737/);
  assert.match(css, /padding: 8px/);
  assert.match(css, /font-size: 15px/);
  assert.match(css, /line-height: 1\.3/);
  assert.match(css, /letter-spacing: -0\.01em/);
  assert.match(css, /inline-size: var\(--shlz-source-spacing-8\)/);
  assert.match(css, /transform: rotate\(45deg\)/);
});

test("Link source fixes the complete four-state typography and color contract", async () => {
  const [components, typography, css] = await Promise.all([
    readJson("design-source-index/components.json"),
    readJson("shlz-design-source/raw/typography-UI Kit – Basic elements.json"),
    readFile("packages/styles/components/link.css", "utf8"),
  ]);
  const link = components.components.find(({ name }) => name === "Link");
  assert.deepEqual(
    link.variants.map(({ properties }) => properties.State),
    ["Default", "Hover", "Pressed", "Disabled"],
  );

  const labels = typography.sourceReferences.filter(
    ({ hierarchyPath, characters, fontSize }) =>
      hierarchyPath?.includes("Link") &&
      hierarchyPath?.includes("Frame 1171277888") &&
      characters === "Link" &&
      fontSize === 16,
  );
  assert.equal(labels.length, 4);
  assert.ok(
    labels.every(
      ({ fontName, lineHeight, letterSpacing, textDecoration }) =>
        fontName.family === "Golos Text" &&
        fontName.style === "Regular" &&
        Math.abs(lineHeight.value - 130) < 0.001 &&
        letterSpacing.value === -1 &&
        textDecoration === "NONE",
    ),
  );
  assert.match(css, /font-family: var\(--shlz-semantic-font-family\)/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /font-weight: 400/);
  assert.match(css, /line-height: 21px/);
  assert.match(css, /letter-spacing: -0\.01em/);
});
