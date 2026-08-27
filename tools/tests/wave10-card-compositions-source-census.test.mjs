import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
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
const censusRoots = ["apps", "packages", "tools/fixtures", "tools/playwright"];
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
]);
const boundedSignature =
  /\.(?:shlz-(?:report-)?card|shlz-cover)\b|(?:class|className)\s*=\s*["'][^"']*\bshlz-(?:report-)?card\b|(?:class|className)\s*=\s*["'][^"']*\bshlz-cover\b|data-shlz-(?:report-)?card\b|data-shlz-cover\b|customElements\.define\(\s*["']shlz-(?:report-)?card["']|export\s+(?:class|function|const)\s+(?:Reports?Card|Card|Cover)\b/i;
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

const matchingPaths = (sources, pattern) =>
  new Set(
    sources
      .filter(({ source }) => pattern.test(source))
      .map(({ path }) => path),
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
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.component, "card-compositions");
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
  assert.equal(
    manifest.sourceClaims.filter(
      ({ classification }) => classification === "source-fact",
    ).length,
    3,
  );
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
  const files = (await Promise.all(censusRoots.map(filesBelow))).flat();
  const sources = await Promise.all(
    files.map(async (path) => ({
      path: relative(".", path),
      source: await readFile(path, "utf8"),
    })),
  );
  assert.deepEqual([...matchingPaths(sources, boundedSignature)], []);
  assert.deepEqual(
    [...matchingPaths(sources, terminology)].sort(),
    [...classifiedTerminology].sort(),
  );
});

test("Wave 10 absence census rejects a synthetic production Card composition", () => {
  const found = matchingPaths(
    [
      {
        path: "packages/styles/components/card.css",
        source: ".shlz-card { border-radius: 16px; }",
      },
    ],
    boundedSignature,
  );
  assert.deepEqual([...found], ["packages/styles/components/card.css"]);
});
