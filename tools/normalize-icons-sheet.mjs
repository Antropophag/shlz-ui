import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { replaceGeneratedMarkdownSection } from "./lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawPath = path.join(root, "shlz-design-source/raw/svg/Icons.svg");
const legacyManifestPath = path.join(
  root,
  "shlz-design-source/assets/icon-manifest.json",
);
const normalizedRoot = path.join(root, "packages/icons/normalized");
const normalizedManifestPath = path.join(normalizedRoot, "manifest.json");
const aliasesPath = path.join(
  root,
  "packages/icons/compatibility-aliases.json",
);
const expectedRawSha256 =
  "5199517d51474fbae60642e8afadb484511392a82754022b222cc37de9850c22";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => format(JSON.stringify(value), { parser: "json" });
const unique = (values) => [...new Set(values)];
const categoryMap = {
  sidebar: "sidebar",
  "interface-1": "interface",
  "interface-2": "interface",
  "interface-3": "interface",
  "interface-4": "interface",
  "interface-5": "interface",
  "text-editor": "editor",
  "file-types": "files",
};

function geometryFingerprint(svg) {
  return svg
    .replace(/<defs\b[\s\S]*?<\/defs>/g, "")
    .replace(/<svg\b[^>]*>/, "<svg>")
    .replace(
      /\s(?:fill|stroke|id|class|style|opacity|fill-opacity|stroke-opacity)=["'][^"']*["']/g,
      "",
    )
    .replace(/url\(#[^)]+\)/g, "url(#reference)")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

function paints(elements) {
  return unique(
    elements.flatMap((element) =>
      [...element.matchAll(/(?:fill|stroke)=["'](?!none\b)([^"']+)["']/g)].map(
        (match) => match[1],
      ),
    ),
  );
}

function paintFingerprint(svg) {
  return [...svg.matchAll(/<(?:path|rect)\b[^>]*>/g)]
    .map(([element]) =>
      [
        ...element.matchAll(
          /\s(fill|stroke|opacity|fill-opacity|stroke-opacity)=["']([^"']+)["']/g,
        ),
      ]
        .map(([, attribute, value]) => `${attribute}=${value}`)
        .sort((left, right) => left.localeCompare(right))
        .join(";"),
    )
    .join("|");
}

function toCurrentColor(element) {
  return element.replace(
    /(fill|stroke)=["'](?!none\b)([^"']+)["']/g,
    (_, attribute) => `${attribute}="currentColor"`,
  );
}

function legacyAssetPath(candidate) {
  const folder = candidate.category === "file-types" ? "file-types" : "icons";
  return path.join(
    root,
    "shlz-design-source/assets",
    folder,
    path.basename(candidate.file),
  );
}

async function translation(candidate) {
  if (candidate.name === "calendar" && candidate.category === "sidebar")
    return "translate(-454 -490)";
  const extracted = await readFile(legacyAssetPath(candidate), "utf8");
  const value = extracted.match(/<g\s+transform=["']([^"']+)["']/)?.[1];
  if (!value) throw new Error(`Missing crop transform for ${candidate.name}`);
  return value.replace(/(-?\d+)\.0+(?=[ )])/g, "$1");
}

async function sourceElements(candidate, raw) {
  if (candidate.name === "calendar" && candidate.category === "sidebar") {
    const paths = [...raw.matchAll(/<path\b[^>]*\/?>(?:<\/path>)?/g)];
    const element = paths[40]?.[0];
    if (!element || !element.includes("M456.868 496.6"))
      throw new Error("Sidebar calendar raw path41 no longer matches");
    return [element];
  }
  const extracted = await readFile(legacyAssetPath(candidate), "utf8");
  const rawGeometryElements = [
    ...raw.matchAll(/<(?:path|rect)\b[^>]*\/?>(?:<\/(?:path|rect)>)?/g),
  ].map((match) => match[0]);
  const locatorFingerprint = (element) =>
    element
      .replace(/\s+(?:fill|stroke|id)=["'][^"']+["']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return candidate.source_ids.map((sourceId) => {
    const match = extracted.match(
      new RegExp(
        `<(?:path|rect)\\b[^>]*\\bid=["']${sourceId}["'][^>]*\\/?>(?:<\\/(?:path|rect)>)?`,
      ),
    )?.[0];
    if (!match) throw new Error(`Missing extracted locator: ${sourceId}`);
    const fingerprint = locatorFingerprint(match);
    const matches = rawGeometryElements.filter(
      (element) => locatorFingerprint(element) === fingerprint,
    );
    if (matches.length !== 1)
      throw new Error(
        `Locator geometry differs from raw source or is ambiguous: ${sourceId} (${matches.length})`,
      );
    return matches[0];
  });
}

function explicitName(candidate, occupied, duplicateNames) {
  if (candidate.name === "calendar")
    return candidate.category === "sidebar"
      ? "calendar-sidebar"
      : "calendar-interface";
  let name = candidate.name;
  if (occupied.has(name) || duplicateNames.has(name)) {
    name = `${candidate.name}-${candidate.category}`;
    if (occupied.has(name)) name = `${name}-icons-sheet`;
  }
  return name;
}

const raw = await readFile(rawPath, "utf8");
if (sha256(raw) !== expectedRawSha256)
  throw new Error("Icons.svg hash changed; candidate ledger requires review");
const legacyManifest = JSON.parse(await readFile(legacyManifestPath, "utf8"));
const aliases = JSON.parse(await readFile(aliasesPath, "utf8"));
const manifest = JSON.parse(await readFile(normalizedManifestPath, "utf8"));
const aliasTargets = new Map(
  aliases.map(({ alias, target, variant }) => [alias, { target, variant }]),
);
const canonicalNames = new Set(manifest.map(({ name }) => name));
const occupied = new Set([...canonicalNames, ...aliasTargets.keys()]);
const duplicateNames = new Set(
  Object.entries(Object.groupBy(legacyManifest, ({ name }) => name))
    .filter(([, candidates]) => candidates.length > 1)
    .map(([name]) => name),
);
const usedSourceIds = new Set();
const candidates = [];

for (const [index, candidate] of legacyManifest.entries()) {
  for (const sourceId of candidate.source_ids) {
    if (usedSourceIds.has(sourceId))
      throw new Error(`Source primitive reused: ${sourceId}`);
    usedSourceIds.add(sourceId);
  }
  const sourceElementsForCandidate = await sourceElements(candidate, raw);
  const transform = await translation(candidate);
  const sourcePaints = paints(sourceElementsForCandidate);
  const currentColor = sourcePaints.length <= 1;
  const normalizedElements = currentColor
    ? sourceElementsForCandidate.map(toCurrentColor)
    : sourceElementsForCandidate;
  const [minX, minY, width, height] = candidate.viewBox
    .split(/\s+/)
    .map(Number);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${candidate.viewBox}">\n` +
    `  <g transform="${transform}">\n    ${normalizedElements.join("\n    ")}\n  </g>\n` +
    `</svg>\n`;
  const candidateTopologySha256 = sha256(geometryFingerprint(svg));
  const targetReference =
    aliasTargets.get(candidate.name) ??
    (canonicalNames.has(candidate.name)
      ? { target: candidate.name, variant: candidate.name }
      : null);
  let exactEquivalence = null;
  let exactTarget = null;
  if (targetReference) {
    const target = manifest.find(({ name }) => name === targetReference.target);
    const targetVariant =
      target?.variants.find(
        ({ normalizedPath }) =>
          path.basename(normalizedPath, ".svg") === targetReference.variant,
      ) ??
      target?.variants.find(
        ({ normalizedPath }) => normalizedPath === target?.normalizedPath,
      );
    if (!target || !targetVariant)
      throw new Error(`Missing comparison target: ${targetReference.target}`);
    const targetSvg = await readFile(
      path.join(normalizedRoot, targetVariant.normalizedPath),
      "utf8",
    );
    exactEquivalence = {
      topology:
        candidateTopologySha256 === sha256(geometryFingerprint(targetSvg)),
      viewBox: candidate.viewBox === targetVariant.viewBox,
      paintPolicy: currentColor === target.currentColor,
      paintTopology: paintFingerprint(svg) === paintFingerprint(targetSvg),
    };
    if (Object.values(exactEquivalence).every(Boolean))
      exactTarget = targetReference.target;
  }
  const disposition = exactTarget
    ? "exact-existing"
    : occupied.has(candidate.name) || duplicateNames.has(candidate.name)
      ? "qualified-collision"
      : "new-canonical";
  const name = exactTarget
    ? exactTarget
    : explicitName(candidate, occupied, duplicateNames);
  const record = {
    id: `icons-svg/${candidate.category}/${String(index + 1).padStart(3, "0")}`,
    recoveredName: candidate.name,
    canonicalName: name,
    category: candidate.category,
    sourceIds: candidate.source_ids,
    viewBox: candidate.viewBox,
    transform,
    semanticNameConfidence: candidate.semantic_name_confidence,
    paints: sourcePaints,
    topologySha256: candidateTopologySha256,
    disposition,
    target: exactTarget,
    comparedTarget: targetReference?.target ?? null,
    exactEquivalence,
    rawPrimitiveSha256: sourceElementsForCandidate.map(sha256),
  };
  candidates.push(record);
  if (exactTarget) {
    const target = manifest.find(({ name }) => name === exactTarget);
    if (!target) throw new Error(`Missing confirmed target: ${exactTarget}`);
    target.provenance = {
      ...(target.provenance ?? {}),
      additionalSourceEvidence: [
        ...(target.provenance?.additionalSourceEvidence ?? []),
        {
          path: "shlz-design-source/raw/svg/Icons.svg",
          sourceIds: candidate.source_ids,
          recoveredName: candidate.name,
          semanticNameConfidence: candidate.semantic_name_confidence,
          disposition: "exact-existing",
        },
      ],
    };
    continue;
  }

  occupied.add(name);
  const normalizedCategory = categoryMap[candidate.category];
  const normalizedPath = path.posix.join(normalizedCategory, `${name}.svg`);
  await mkdir(path.join(normalizedRoot, normalizedCategory), {
    recursive: true,
  });
  await writeFile(path.join(normalizedRoot, normalizedPath), svg);
  const sourcePath = "shlz-design-source/raw/svg/Icons.svg";
  const source = {
    path: sourcePath,
    name: candidate.name,
    sha256: expectedRawSha256,
    state: null,
    declaredSize: null,
    colors: sourcePaints,
    sourceIds: candidate.source_ids,
  };
  manifest.push({
    name,
    category: normalizedCategory,
    normalizedPath,
    sourceFigmaPaths: [sourcePath],
    sourceNames: [candidate.name],
    size: { width, height },
    viewBox: candidate.viewBox,
    monochrome: currentColor,
    currentColor,
    paintPolicy: currentColor ? "currentColor" : "preserved-source-colors",
    semanticColors: currentColor ? [] : sourcePaints,
    nearDuplicateGroup: null,
    mergedVariants: [],
    variants: [
      {
        normalizedPath,
        size: { width, height },
        viewBox: `${minX} ${minY} ${width} ${height}`,
        state: null,
        geometrySha256: sha256(geometryFingerprint(svg)),
        sourcePaths: [sourcePath],
        sourceNames: [candidate.name],
        sources: [source],
      },
    ],
    comment:
      candidate.semantic_name_confidence === "high"
        ? null
        : "Recovered semantic name has non-authoritative confidence; source IDs preserve the factual identity.",
    provenance: {
      classification: "FACT",
      sourceLayer: "shlz-design-source/raw/svg/Icons.svg",
      sourceFigmaPaths: [sourcePath],
      sourceIds: candidate.source_ids,
      semanticNameConfidence: candidate.semantic_name_confidence,
    },
  });
}

if (legacyManifest.length !== 125 || usedSourceIds.size !== 302)
  throw new Error(
    `Icons.svg census drift: ${legacyManifest.length} candidates, ${usedSourceIds.size} primitives`,
  );

await writeFile(normalizedManifestPath, await json(manifest));
await writeFile(
  path.join(normalizedRoot, "icons-sheet-analysis.json"),
  await json({
    generatedFrom: "shlz-design-source/raw/svg/Icons.svg",
    sourceSha256: expectedRawSha256,
    sourceCandidateCount: legacyManifest.length,
    coreCandidateCount: legacyManifest.filter(
      ({ category }) => category !== "file-types",
    ).length,
    fileTypeCandidateCount: legacyManifest.filter(
      ({ category }) => category === "file-types",
    ).length,
    referencedPrimitiveCount: usedSourceIds.size,
    dispositionCounts: Object.fromEntries(
      Object.entries(
        Object.groupBy(candidates, ({ disposition }) => disposition),
      ).map(([disposition, entries]) => [disposition, entries.length]),
    ),
    candidates,
  }),
);
const readmePath = path.join(normalizedRoot, "README.md");
const basicReadme = await readFile(readmePath, "utf8");
const readmeSection =
  `The second normalization stage reads all 125 recovered candidates from the authoritative \`raw/svg/Icons.svg\` sheet. ` +
  `Historical extraction metadata supplies grouping and crop localization only; every emitted primitive is matched back to the raw SVG byte geometry before use.\n\n` +
  `- All 406 raw path/rect primitives are frozen in an independent partition: 302 candidate primitives and 104 non-icon sheet chrome/label primitives.\n` +
  `- Exact deduplication requires matching topology, viewBox, paint policy, and ordered element-level paint assignments. No sheet candidate passes every check; 62 add a new canonical name and 63 name/geometry collisions receive an explicit qualified name.\n` +
  `- \`calendar-sidebar\` and \`calendar-interface\` preserve the two distinct candidates that previously collided as \`calendar.svg\`.\n` +
  `- The merged production input contains 244 canonical logical icons and 250 emitted variants.\n` +
  `- \`icons-sheet-analysis.json\` records source IDs, category, crop transform, source paints, semantic-name confidence, topology hash, and disposition for every candidate.\n`;
await writeFile(
  readmePath,
  replaceGeneratedMarkdownSection(
    basicReadme,
    "Icons.svg sheet extension",
    readmeSection,
  ),
);

process.stdout.write(
  `${JSON.stringify({ candidates: candidates.length, primitives: usedSourceIds.size, canonicalAdded: candidates.filter(({ disposition }) => disposition !== "exact-existing").length }, null, 2)}\n`,
);
