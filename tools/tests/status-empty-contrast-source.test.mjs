import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { readZipEntry } from "../lib/source-zip.mjs";

const read = (path) => readFile(path, "utf8");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const basicArchive = "shlz-design-source/raw/svg/UI Kit – Basic elements.zip";
const approvedForegrounds = {
  green: "#3D6940",
  "bright-green": "#1B6D2D",
  orange: "#8A521E",
  cyan: "#2E667D",
  pink: "#90388E",
  neutral: "#676D74",
};

test("Status source paints remain literal raw evidence and source tokens", async () => {
  const [statusBytes, tokensSource] = await Promise.all([
    readFile("shlz-design-source/raw/svg/Status.svg"),
    read("packages/tokens/tokens.json"),
  ]);
  assert.equal(
    sha256(statusBytes),
    "fa0e32fb188e7630fa8a06d566ec1a3d9eea6e1e6cfd8c1a6e8b157cadd5ee1f",
    "Status.svg must retain every source byte, including paint and geometry",
  );
  const status = statusBytes.toString("utf8");
  const tokens = JSON.parse(tokensSource);
  const expectedSources = {
    "Bright green": "#25983E",
    Green: "#57965C",
    Orange: "#D47E2E",
    Turquoise: "#4191B3",
    Pink: "#A942A7",
  };

  for (const value of [...Object.values(expectedSources), "#939CA5"]) {
    assert.match(status, new RegExp(value));
  }
  for (const [name, value] of Object.entries(expectedSources)) {
    assert.equal(tokens.source.color.Aditional[name], value);
  }
  assert.equal(tokens.source.color.Gray["Gray 200"], "#939CA5");
});

test("Empty State source components remain in the Basic-elements archive", async () => {
  const archive = await readFile(basicArchive);
  for (const [component, expectedPaint, expectedDigest] of [
    [
      "Empty-Simple",
      "#939CA5",
      "161d7adc072036cdbd9fc687ea5313f0ae7ceaa035e68625e3a8fe8481de2867",
    ],
    [
      "Empty-Customize",
      "#0B1623",
      "9ec015c55cf9cc56c5802f9636cd3f908ab40fe8901a126646b9646887cecfc0",
    ],
    [
      "Empty-Basic",
      "#939CA5",
      "16534e75d4d5cf67f0aeb81763a0d0a98a568d23463c24abb5991370421e4ec7",
    ],
  ]) {
    const svgBytes = readZipEntry(
      archive,
      `components/${component}/component.svg`,
    );
    assert.equal(sha256(svgBytes), expectedDigest, `${component} source bytes`);
    const svg = svgBytes.toString("utf8");
    assert.match(svg, /<svg\b/);
    assert.match(svg, new RegExp(expectedPaint));
  }
});

test("approved Status foreground decisions are distributed without source rewrites", async () => {
  const [sourceText, distributedText, css] = await Promise.all([
    read("packages/tokens/tokens.json"),
    read("packages/tokens/dist/tokens.json"),
    read("packages/tokens/dist/tokens.css"),
  ]);
  const source = JSON.parse(sourceText);
  const distributed = JSON.parse(distributedText);

  assert.deepEqual(
    source.semantic.color["status-foreground"],
    approvedForegrounds,
  );
  assert.deepEqual(
    distributed.semantic.color["status-foreground"],
    approvedForegrounds,
  );
  for (const [name, value] of Object.entries(approvedForegrounds)) {
    assert.match(
      css,
      new RegExp(`--shlz-semantic-color-status-foreground-${name}: ${value};`),
    );
  }
  assert.equal(source.source.color.Aditional.Green, "#57965C");
  assert.equal(source.source.color.Gray["Gray 200"], "#939CA5");
});

test("Badge retains its established CSS and source-token contract", async () => {
  const [css, tokensText] = await Promise.all([
    read("packages/styles/components/status-badge.css"),
    read("packages/tokens/tokens.json"),
  ]);
  const tokens = JSON.parse(tokensText);

  assert.match(
    css,
    /\.shlz-badge\s*\{[^}]*block-size: 16px[^}]*background: var\(--shlz-semantic-color-action-primary\)/s,
  );
  assert.match(
    css,
    /\.shlz-badge--invert\s*\{[^}]*background: var\(--shlz-source-color-blue-blue-100\)/s,
  );
  assert.match(
    css,
    /\.shlz-badge--neutral\s*\{[^}]*border: 1\.5px solid var\(--shlz-source-color-gray-gray-100\)/s,
  );
  assert.equal(tokens.source.color.Blue["Blue 200"], "#253D98");
  assert.equal(tokens.source.color.Blue["Blue 100"], "#DFE2F0");
  assert.equal(tokens.source.color.Gray["Gray 100"], "#D1D8DF");
});
