import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const manifestPath = "docs/component-audits/card-compositions.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceHashes = new Map([
  [
    "shlz-design-source/raw/svg/Card with button.svg",
    "01abde3b045ab0c36160e5e71a829bffc37d2bb3bbafaadac3a04e350b064719",
  ],
  [
    "shlz-design-source/raw/svg/Reports card.svg",
    "e28cb879e2a2e577154cfa3caf541de020431ef8ba6e44550ad0e54bddf63c4f",
  ],
  [
    "shlz-design-source/raw/svg/Cover.svg",
    "c857eb75fe105238c2a0d222a5dd27fae74006cf6db43488fa4d9bbe77feb612",
  ],
]);
const boundedCensusRoots = [
  "apps",
  "packages",
  "tools/fixtures",
  "tools/playwright",
  "tools/tests",
  "docs/components",
];
const terminologyCensusRoots = [
  "apps",
  "packages",
  "tools/fixtures",
  "tools/playwright",
];
const sourceExtensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".php",
  ".css",
  ".md",
]);
const currentTestPath = relative(".", fileURLToPath(import.meta.url));
const boundedSignatures = [
  /\.(?:shlz-(?:report-)?card|shlz-cover)\b/i,
  /(?:class|className)\s*=\s*["'][^"']*\b(?:shlz-(?:report-)?card|shlz-cover)\b/i,
  /data-(?:shlz-(?:report-)?card|shlz-cover)\b/i,
  /customElements\.define\(\s*["'](?:shlz-(?:report-)?card|shlz-cover)["']/i,
  /<(?:shlz-(?:report-)?card|shlz-cover)\b/i,
  /export\s+(?:default\s+)?(?:class|function|const)\s+(?:Reports?Card|Card|Cover)\b/i,
  /(?:const|let|var)\s+(Reports?Card|Card|Cover)\b[\s\S]*\bexport\s+default\s+\1\b/i,
];
const hasBoundedSignature = (source) =>
  boundedSignatures.some((signature) => signature.test(source));
const terminology = /\bcard(?:s)?\b|cover/i;
const classifiedTerminology = new Set(
  manifest.sourceOccurrences.map(({ path }) => path),
);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else if (sourceExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const matchingPaths = (sources, matcher) =>
  new Set(
    sources.filter(({ source }) => matcher(source)).map(({ path }) => path),
  );

test("Wave 10 authoritative sources retain exact hashes and critical composition facts", async () => {
  for (const [path, expected] of sourceHashes) {
    const bytes = await readFile(path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }

  const card = await readFile(
    "shlz-design-source/raw/svg/Card with button.svg",
    "utf8",
  );
  assert.match(card, /width="314" height="230" viewBox="0 0 314 230"/);
  assert.match(
    card,
    /<rect width="314" height="230" rx="16" fill="#DFE2F0"\/>/,
  );
  assert.match(
    card,
    /x="24" y="166" width="137" height="40" rx="20" fill="#253D98"/,
  );
  assert.doesNotMatch(card, /<image\b/);

  const reports = await readFile(
    "shlz-design-source/raw/svg/Reports card.svg",
    "utf8",
  );
  assert.match(reports, /width="354" height="810" viewBox="0 0 354 810"/);
  assert.equal(
    (reports.match(/width="314" height="230" rx="16"/g) ?? []).length,
    3,
  );
  assert.equal(
    (reports.match(/width="18\.5" height="18\.5" rx="5\.25"/g) ?? []).length,
    3,
  );
  assert.doesNotMatch(reports, /<image\b/);

  const cover = await readFile("shlz-design-source/raw/svg/Cover.svg", "utf8");
  assert.match(cover, /width="874" height="400" viewBox="0 0 874 400"/);
  assert.equal((cover.match(/<path\b/g) ?? []).length, 6);
  assert.doesNotMatch(cover, /<(?:image|filter)\b/);
});

test("Wave 10 manifest records a source-only contract with independent ledgers", () => {
  const expectedSourcePaths = [...sourceHashes.keys()].sort();
  const manifestSourcePaths = [
    manifest.authoritativeSource,
    ...manifest.referenceSources.filter((path) => sourceHashes.has(path)),
  ].sort();
  const sourceFactEvidence = manifest.sourceClaims
    .filter(({ classification }) => classification === "source-fact")
    .map(({ evidence }) => evidence)
    .sort();

  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.component, "card-compositions");
  assert.deepEqual(manifestSourcePaths, expectedSourcePaths);
  assert.deepEqual(sourceFactEvidence, expectedSourcePaths);
  assert.deepEqual(manifest.implementation, []);
  assert.deepEqual(manifest.occurrences, []);
  assert.deepEqual(manifest.browserTests, [
    "tools/playwright/card-compositions-wave10.spec.js",
  ]);
  assert.deepEqual(manifest.visualSnapshots, []);
  assert.deepEqual(Object.keys(manifest.stateLedgers).sort(), [
    "cardWithButton",
    "cover",
    "reportsCard",
  ]);
  for (const level of [
    "runtime-browser",
    "accessibility",
    "focused-visual",
    "consumer-integration",
    "responsive-content-stress",
  ])
    assert.match(manifest.evidence[level], /^not-applicable:\s+\S/);
});

test("Wave 10 repository census proves bounded absence and classifies terminology collisions", async () => {
  const boundedFiles = (
    await Promise.all(boundedCensusRoots.map(filesBelow))
  ).flat();
  const boundedSources = await Promise.all(
    boundedFiles
      .filter((path) => relative(".", path) !== currentTestPath)
      .map(async (path) => ({
        path: relative(".", path),
        source: await readFile(path, "utf8"),
      })),
  );
  assert.deepEqual([...matchingPaths(boundedSources, hasBoundedSignature)], []);

  const terminologyFiles = (
    await Promise.all(terminologyCensusRoots.map(filesBelow))
  ).flat();
  const terminologySources = await Promise.all(
    terminologyFiles.map(async (path) => ({
      path: relative(".", path),
      source: await readFile(path, "utf8"),
    })),
  );
  assert.deepEqual(
    [
      ...matchingPaths(terminologySources, (source) =>
        terminology.test(source),
      ),
    ].sort(),
    [...classifiedTerminology].sort(),
  );
});

test("Wave 10 absence census rejects a synthetic production Card composition", () => {
  const syntheticImplementations = [
    {
      path: "packages/styles/components/card.css",
      source: ".shlz-card { border-radius: 16px; }",
    },
    {
      path: "packages/react/Card.jsx",
      source: "export default function Card() { return null; }",
    },
    {
      path: "packages/vue/Card.js",
      source: "const Card = {};\nexport default Card;",
    },
    {
      path: "apps/example/card.html",
      source: "<shlz-card></shlz-card>",
    },
  ];
  const found = matchingPaths(syntheticImplementations, hasBoundedSignature);
  assert.deepEqual(
    [...found],
    syntheticImplementations.map(({ path }) => path),
  );
});
