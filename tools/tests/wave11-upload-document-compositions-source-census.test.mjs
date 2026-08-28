import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const manifestPath = "docs/component-audits/upload-document-compositions.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceHashes = new Map([
  [
    "shlz-design-source/raw/svg/Documents.svg",
    "b2be2ccea150ae49fb8363eae648bede428cace071d9783ce30f15c9c338bfdb",
  ],
  [
    "shlz-design-source/raw/svg/Detailed appeals.svg",
    "f916402a452edfdb7eee603cc75dc8028e6cf7d28eda13d6058ba488b59830e7",
  ],
]);
const censusRoots = ["apps", "packages", "tools", "docs/components"];
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
const higherLevelPath =
  /(?:^|\/)[^/]*(?:upload(?:-document|-drag)?|document-upload|attached-document|drag-(?:and-)?drop-document)[^/]*\.(?:html|js|jsx|mjs|cjs|ts|tsx|vue|php|css)$/i;
const higherLevelSignatures = [
  /\.(?:shlz-)?(?:upload(?:-document|-drag)?|document-upload|attached-document|drag-(?:and-)?drop-document)\b/i,
  /(?:class|className)\s*=\s*["'][^"']*\b(?:shlz-)?(?:upload(?:-document|-drag)?|document-upload|attached-document|drag-(?:and-)?drop-document)\b/i,
  /data-(?:shlz-)?(?:upload(?:-document)?|document-upload|attached-document|drag-(?:and-)?drop-document)\b/i,
  /customElements\.define\(\s*["'](?:shlz-)?(?:upload|document-upload|attached-document)["']/i,
  /<(?:shlz-)?(?:upload|document-upload|attached-document)\b/i,
  /(?:export\s+(?:default\s+)?)?(?:class|function|const|let|var)\s+(?:Upload|UploadDrag|DocumentUpload|UploadDocument|AttachedDocument|DragAndDropDocument|DragDropDocument)\b/i,
  /export\s*\{[^}]*\b(?:Upload|UploadDrag|DocumentUpload|UploadDocument|AttachedDocument|DragAndDropDocument|DragDropDocument)\b[^}]*\}(?:\s+from\s+["'][^"']+["'])?/i,
];
const primitiveSignature =
  /\bshlz-(?:file|document)-row\b|data-component-audit-id\s*=\s*["'][^"']*(?:file-row|document-row)/i;
const genericTerminology =
  /\b(?:upload|document|attachment|drag[ -]?(?:and[ -]?)?drop)\b/i;
const hasHigherLevelSignature = ({ path, source }) =>
  higherLevelPath.test(path) ||
  higherLevelSignatures.some((signature) => signature.test(source));

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
  new Set(sources.filter((entry) => matcher(entry)).map(({ path }) => path));

test("Wave 11 authoritative sources retain exact hashes and critical composition facts", async () => {
  for (const [path, expected] of sourceHashes) {
    const bytes = await readFile(path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }

  const documents = await readFile(
    "shlz-design-source/raw/svg/Documents.svg",
    "utf8",
  );
  assert.match(documents, /width="700" height="2269" viewBox="0 0 700 2269"/);
  assert.equal(
    (documents.match(/stroke="#253D98" stroke-dasharray="10 5"/g) ?? []).length,
    4,
  );
  assert.equal(
    (
      documents.match(
        /width="467" height="102" rx="11\.5" stroke="#939CA5" stroke-dasharray="8 8"/g,
      ) ?? []
    ).length,
    2,
  );
  assert.deepEqual(
    new Set(
      [
        ...documents.matchAll(
          /x="100\.5" y="(546\.5|641\.5|736\.5|831\.5|926\.5)" width="(?:239|229)" height="54"/g,
        ),
      ].map((match) => match[1]),
    ),
    new Set(["546.5", "641.5", "736.5", "831.5", "926.5"]),
  );
  assert.equal((documents.match(/<image\b/g) ?? []).length, 1);

  const detailedAppeals = await readFile(
    "shlz-design-source/raw/svg/Detailed appeals.svg",
    "utf8",
  );
  assert.match(
    detailedAppeals,
    /width="873" height="4163" viewBox="0 0 873 4163"/,
  );
  assert.equal(
    (detailedAppeals.match(/stroke="#253D98" stroke-dasharray="10 5"/g) ?? [])
      .length,
    3,
  );
  assert.equal((detailedAppeals.match(/<image\b/g) ?? []).length, 5);
  assert.equal(
    (detailedAppeals.match(/data:image\/png;base64/g) ?? []).length,
    2,
  );

  for (const ledger of Object.values(manifest.stateLedgers)) {
    if (!ledger.source) continue;
    const source = ledger.source.endsWith("Documents.svg")
      ? documents
      : detailedAppeals;
    for (const frame of [ledger.frame, ...(ledger.frames ?? [])].filter(
      Boolean,
    )) {
      const attributes = Object.fromEntries(
        frame.split(" ").map((entry) => entry.split("=")),
      );
      const framePattern = new RegExp(
        `<rect[^>]*x="${attributes.x}"[^>]*y="${attributes.y}"[^>]*width="${attributes.width}"[^>]*height="${attributes.height}"${attributes.rx ? `[^>]*rx="${attributes.rx}"` : ""}[^>]*stroke="#253D98"[^>]*stroke-dasharray="10 5"`,
      );
      assert.match(source, framePattern);
    }
  }
});

test("Wave 11 manifest records independent source and primitive-boundary ledgers", () => {
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
  assert.equal(manifest.component, "upload-document-compositions");
  assert.equal(
    manifest.authoritativeSource,
    "shlz-design-source/raw/svg/Documents.svg",
  );
  assert.deepEqual(manifestSourcePaths, expectedSourcePaths);
  assert.deepEqual(sourceFactEvidence, expectedSourcePaths);
  assert.deepEqual(manifest.implementation, []);
  assert.deepEqual(manifest.occurrences, []);
  assert.equal(manifest.primitiveDependencies.length, 10);
  assert.deepEqual(Object.keys(manifest.stateLedgers).sort(), [
    "attachedDocument",
    "descriptionFiles",
    "document",
    "dragAndDropDocument",
    "smallDocument",
    "uploadDrag",
  ]);
  for (const nestedVariant of ["attachedDocument", "dragAndDropDocument"]) {
    assert.equal(
      manifest.stateLedgers[nestedVariant].source,
      manifest.authoritativeSource,
    );
    assert.equal(
      manifest.stateLedgers[nestedVariant].frame,
      manifest.stateLedgers.uploadDrag.frame,
    );
    assert.equal(
      manifest.stateLedgers[nestedVariant].parentComposition,
      "uploadDrag",
    );
    assert.ok(manifest.stateLedgers[nestedVariant].represented.length >= 2);
  }
  assert.deepEqual(manifest.findings, []);
  for (const level of [
    "runtime-browser",
    "accessibility",
    "focused-visual",
    "consumer-integration",
    "responsive-content-stress",
  ])
    assert.match(manifest.evidence[level], /^not-applicable:\s+\S/);
});

test("Wave 11 census proves higher-level absence and classifies primitive surfaces", async () => {
  const files = (await Promise.all(censusRoots.map(filesBelow))).flat();
  const sources = await Promise.all(
    files
      .filter((path) => relative(".", path) !== currentTestPath)
      .map(async (path) => ({
        path: relative(".", path),
        source: await readFile(path, "utf8"),
      })),
  );

  const auditEvidencePaths = new Set(
    manifest.terminologyCensus.auditEvidencePaths,
  );
  assert.deepEqual(
    [
      ...matchingPaths(
        sources.filter(({ path }) => !auditEvidencePaths.has(path)),
        hasHigherLevelSignature,
      ),
    ],
    [],
  );
  assert.deepEqual(
    [
      ...matchingPaths(sources, ({ source }) =>
        primitiveSignature.test(source),
      ),
    ].sort(),
    manifest.primitiveDependencies.map(({ path }) => path).sort(),
  );

  const terminologyPaths = matchingPaths(sources, ({ source }) =>
    genericTerminology.test(source),
  );
  const primitivePaths = new Set(
    manifest.primitiveDependencies.map(({ path }) => path),
  );
  const unrelatedTerminologyPaths = [...terminologyPaths].filter(
    (path) => !primitivePaths.has(path) && !auditEvidencePaths.has(path),
  );
  assert.equal(
    terminologyPaths.size,
    manifest.terminologyCensus.totalPathCount,
  );
  assert.equal(
    primitivePaths.size,
    manifest.terminologyCensus.primitiveDependencyPathCount,
  );
  assert.equal(
    unrelatedTerminologyPaths.length,
    manifest.terminologyCensus.unrelatedTerminologyPathCount,
  );
});

test("Wave 11 census rejects synthetic higher-level Upload / Document surfaces", () => {
  const syntheticImplementations = [
    {
      path: "packages/styles/components/upload.css",
      source: ".shlz-upload { border: 1px dashed; }",
    },
    {
      path: "packages/react/Upload.jsx",
      source: "export default function Upload() { return null; }",
    },
    {
      path: "packages/vue/AttachedDocument.js",
      source: "export const AttachedDocument = {};",
    },
    {
      path: "apps/example/upload.html",
      source: "<shlz-upload></shlz-upload>",
    },
    {
      path: "packages/index.js",
      source: 'export { Upload } from "./upload.js";',
    },
    {
      path: "apps/example/controller.js",
      source: "function DocumentUpload() {}",
    },
    {
      path: "apps/example/upload-document.js",
      source: "export default {};",
    },
    {
      path: "packages/vue/Upload.vue",
      source: "<template><div /></template>",
    },
    {
      path: "packages/components/upload.js",
      source: "export default {};",
    },
    {
      path: "packages/components/drag-and-drop-document.js",
      source: "export default {};",
    },
  ];
  const found = matchingPaths(
    syntheticImplementations,
    hasHigherLevelSignature,
  );
  assert.deepEqual(
    [...found],
    syntheticImplementations.map(({ path }) => path),
  );
});
