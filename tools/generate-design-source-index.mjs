import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTypographyIndex } from "./lib/typography-index.mjs";
import { listZipEntries, readZipEntry } from "./lib/source-zip.mjs";
import {
  iconGeometryHash,
  resolveNormalizedIconPath,
} from "./lib/icon-geometry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = path.join(root, "shlz-design-source/raw/svg");
const output = path.join(root, "design-source-index");
const normalizedRoot = path.join(root, "packages/icons/normalized");
const relative = (value) =>
  path.relative(root, value).split(path.sep).join("/");
const readJson = (value) => JSON.parse(readFileSync(value, "utf8"));
const sha256 = (value) =>
  createHash("sha256").update(readFileSync(value)).digest("hex");
const zipSources = new Map();
const zipSource = (zip) => {
  if (!zipSources.has(zip)) zipSources.set(zip, readFileSync(zip));
  return zipSources.get(zip);
};
const zipText = (zip, entry) =>
  readZipEntry(zipSource(zip), entry).toString("utf8");
const zipJson = (zip, entry) => JSON.parse(zipText(zip, entry));
const zipEntries = (zip) => listZipEntries(zipSource(zip));
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const rootAttribute = (svg, name) =>
  svg.match(new RegExp(`<svg\\b[^>]*\\b${name}=["']([^"']+)["']`))?.[1] ?? null;

const archiveNames = [
  "UI Kit – Basic elements.zip",
  "UI Kit – Interface elements.zip",
];
const archives = archiveNames.map((name) => {
  const sourcePath = path.join(raw, name);
  const archiveManifest = zipJson(sourcePath, "manifest.json");
  const componentEntries = zipEntries(sourcePath).filter((entry) =>
    /^components\/[^/]+\/manifest\.json$/.test(entry),
  );
  const components = componentEntries.map((entry) => ({
    ...zipJson(sourcePath, entry),
    archiveEntry: entry,
  }));
  return {
    name,
    sourcePath,
    sha256: sha256(sourcePath),
    archiveManifest,
    components,
  };
});

const catalog = archives.flatMap((archive) =>
  archive.components.map((component) => ({
    sourcePage: archive.archiveManifest.source,
    sourceArchive: relative(archive.sourcePath),
    archiveEntry: component.archiveEntry,
    kind: component.kind,
    name: component.originalName,
    figmaNodeId: component.figmaNodeId,
    hierarchyPath: component.hierarchyPath,
    dimensions: { width: component.width, height: component.height },
    description: component.description,
    propertyDefinitions: component.componentPropertyDefinitions,
    extractionWarnings: component.extractionWarnings ?? [],
    hasSourceErrors: component.hasSourceErrors ?? false,
    errors: component.errors ?? [],
    variants: (component.variants ?? []).map((variant) => ({
      index: variant.index,
      sourceOrder: variant.sourceOrder,
      name: variant.originalName,
      figmaNodeId: variant.figmaNodeId,
      hierarchyPath: variant.hierarchyPath,
      dimensions: { width: variant.width, height: variant.height },
      description: variant.description,
      properties: variant.variantProperties,
      archivePath: `${path.posix.dirname(component.archiveEntry)}/${variant.filename}`,
      exported: variant.exported,
      extractionWarnings: variant.extractionWarnings ?? [],
    })),
  })),
);

const nameGroups = new Map();
for (const component of catalog) {
  const key = component.name.trim().toLocaleLowerCase("ru-RU");
  nameGroups.set(key, [...(nameGroups.get(key) ?? []), component]);
}
const duplicateNames = [...nameGroups.entries()]
  .filter(([, items]) => items.length > 1)
  .map(([normalizedName, items]) => ({
    normalizedName,
    occurrences: items.map(
      ({ name, kind, sourceArchive, figmaNodeId, hierarchyPath }) => ({
        name,
        kind,
        sourceArchive,
        figmaNodeId,
        hierarchyPath,
      }),
    ),
    classification: "AMBIGUOUS",
    note: "A repeated name does not establish geometric or semantic identity.",
  }));

const warningRecords = [];
const errorRecords = [];
for (const component of catalog) {
  for (const warning of component.extractionWarnings)
    warningRecords.push({
      component: component.name,
      figmaNodeId: component.figmaNodeId,
      sourceArchive: component.sourceArchive,
      ...warning,
    });
  for (const error of component.errors)
    errorRecords.push({
      component: component.name,
      figmaNodeId: component.figmaNodeId,
      sourceArchive: component.sourceArchive,
      ...error,
    });
  for (const variant of component.variants)
    for (const warning of variant.extractionWarnings)
      warningRecords.push({
        component: component.name,
        variant: variant.name,
        figmaNodeId: variant.figmaNodeId,
        sourceArchive: component.sourceArchive,
        ...warning,
      });
}

const colorsPath = path.join(
  raw,
  "UI Kit – Basic elements/colors/manifest.json",
);
const colorsManifest = readJson(colorsPath);
const tokenData = readJson(path.join(root, "packages/tokens/tokens.json"));
const tokenProvenance = readJson(
  path.join(root, "packages/tokens/provenance.json"),
);
const typographyLegacyEvidence = readJson(
  path.join(root, "shlz-design-source/tokens/typography-recoverability.json"),
);
const filters = readJson(
  path.join(root, "shlz-design-source/tokens/filters-observed.json"),
);
const iconsPath = path.join(root, "packages/icons/normalized/manifest.json");
const iconAnalysisPath = path.join(
  root,
  "packages/icons/normalized/analysis.json",
);
const icons = readJson(iconsPath);
const iconAnalysis = readJson(iconAnalysisPath);
const normalizedIconOutputsBySourcePath = new Map();
for (const icon of icons) {
  for (const variant of icon.variants) {
    for (const sourcePath of variant.sourcePaths) {
      const matches = normalizedIconOutputsBySourcePath.get(sourcePath) ?? [];
      matches.push(`packages/icons/normalized/${variant.normalizedPath}`);
      normalizedIconOutputsBySourcePath.set(sourcePath, matches);
    }
  }
}
const normalizedIconSourcesByIdentity = new Map();
for (const source of iconAnalysis.sources) {
  const identity = `${source.sourceName}\0${source.width}x${source.height}\0${source.geometryHash}`;
  const matches = normalizedIconSourcesByIdentity.get(identity) ?? [];
  matches.push(source);
  normalizedIconSourcesByIdentity.set(identity, matches);
}
const normalizedIconComponentCoverage = catalog.flatMap((component) => {
  if (
    component.variants.length === 0 ||
    component.variants.some((variant) => !variant.exported)
  )
    return [];
  const variants = component.variants.map((variant) => {
    const svg = zipText(
      path.join(root, component.sourceArchive),
      variant.archivePath,
    );
    const geometryHash = iconGeometryHash(svg);
    const matches = normalizedIconSourcesByIdentity.get(
      `${variant.name}\0${variant.dimensions.width}x${variant.dimensions.height}\0${geometryHash}`,
    );
    const source = matches?.length === 1 ? matches[0] : null;
    const normalizedOutputs = source
      ? [
          ...new Set(
            normalizedIconOutputsBySourcePath.get(source.sourcePath) ?? [],
          ),
        ]
      : [];
    const normalizedPath =
      normalizedOutputs.length === 1 ? normalizedOutputs[0] : null;
    const normalizedAbsolutePath = normalizedPath
      ? resolveNormalizedIconPath(root, normalizedRoot, normalizedPath)
      : null;
    const normalizedSvg = normalizedAbsolutePath
      ? readFileSync(normalizedAbsolutePath, "utf8")
      : null;
    const normalizedOutputIsExact =
      normalizedSvg &&
      iconGeometryHash(normalizedSvg) === geometryHash &&
      Number(rootAttribute(normalizedSvg, "width")) ===
        variant.dimensions.width &&
      Number(rootAttribute(normalizedSvg, "height")) ===
        variant.dimensions.height &&
      rootAttribute(normalizedSvg, "viewBox") === source.viewBox;
    return source && normalizedPath && normalizedOutputIsExact
      ? {
          figmaNodeId: variant.figmaNodeId,
          name: variant.name,
          archivePath: variant.archivePath,
          geometryHash,
          normalizedSourcePath: source.sourcePath,
          normalizedPath,
        }
      : null;
  });
  if (variants.some((variant) => variant === null)) return [];
  return [
    {
      sourceArchive: component.sourceArchive,
      figmaNodeId: component.figmaNodeId,
      name: component.name,
      matchBasis:
        "exact variant name, dimensions, and paint-independent geometry",
      variants,
    },
  ];
});
const typographySourcePaths = [
  path.join(
    root,
    "shlz-design-source/raw/typography-UI Kit – Basic elements.json",
  ),
  path.join(
    root,
    "shlz-design-source/raw/typography-UI Kit – Interface elements.json",
  ),
];
const typography = buildTypographyIndex(
  typographySourcePaths.map((sourcePath) => ({
    path: relative(sourcePath),
    sha256: sha256(sourcePath),
    data: readJson(sourcePath),
  })),
);
const iconCategories = Object.entries(
  Object.groupBy(icons, ({ category }) => category),
).map(([category, items]) => ({ category, count: items.length }));
const emittedIconPaths = [
  ...new Set(
    icons.flatMap(({ variants }) =>
      variants.map(({ normalizedPath }) => normalizedPath),
    ),
  ),
];
const preservedColorIcons = icons
  .filter(({ currentColor }) => !currentColor)
  .map(({ name, category, semanticColors, paintPolicy }) => ({
    name,
    category,
    semanticColors,
    paintPolicy,
  }));
const fileTypeIcons = icons
  .filter(({ category }) => category === "files")
  .map(({ name, normalizedPath }) => ({ name, normalizedPath }));

const heightFrequency = new Map();
for (const component of catalog)
  for (const variant of component.variants) {
    if (typeof variant.dimensions.height === "number")
      heightFrequency.set(
        String(variant.dimensions.height),
        (heightFrequency.get(String(variant.dimensions.height)) ?? 0) + 1,
      );
  }
const observedHeights = [...heightFrequency.entries()]
  .map(([value, count]) => ({ value: Number(value), count }))
  .filter(({ count }) => count >= 3)
  .sort((a, b) => b.count - a.count || a.value - b.value);

const foundations = {
  schemaVersion: 1,
  classification: {
    canonical: "Explicitly named by a specialized Figma foundation source.",
    observed:
      "Repeated in component exports but not promoted to a foundation token.",
    unknown: "Not reliably recoverable from the available source.",
  },
  canonical: {
    colors: {
      source: relative(colorsPath),
      sha256: sha256(colorsPath),
      count: colorsManifest.count,
      values: colorsManifest.colors.map(
        ({ name, hex, opacity, figmaNodeId, filename }) => ({
          name,
          hex,
          opacity,
          figmaNodeId,
          sourceAsset: `shlz-design-source/raw/svg/UI Kit – Basic elements/colors/${filename}`,
        }),
      ),
    },
    spacing: {
      sourceSvg: "shlz-design-source/raw/svg/Spacing.svg",
      sourceArchive: relative(archives[0].sourcePath),
      componentManifestEntry: "components/Spacing/manifest.json",
      valuesPx: [4, 8, 16, 24, 32, 40, 48, 56, 64],
      note: "The Figma component metadata preserves all nine values; its individual SVG variant exports failed because the nodes had no visible layers.",
    },
    cornerRadius: {
      source: tokenProvenance.layers.source.groups.radius.source,
      values: [
        { label: "Min", valuePx: 8 },
        { label: "Regular", valuePx: 12 },
        { label: "Medium", valuePx: 16 },
        { label: "Large", valuePx: 48 },
        { label: "Max", valuePx: 100 },
      ],
      note: "Human-verified Figma Corner radius source recorded by the existing foundation provenance; no independent per-value SVG export is present in the two archives.",
    },
  },
  observed: {
    normalizedIconComponentCoverage: {
      classification: "ENGINEERING_DERIVED",
      normalizedManifest: "packages/icons/normalized/manifest.json",
      normalizedAnalysis: "packages/icons/normalized/analysis.json",
      records: normalizedIconComponentCoverage,
    },
    repeatedVariantHeights: observedHeights,
    effects: {
      source: "shlz-design-source/tokens/filters-observed.json",
      classification: "OBSERVED",
      data: filters,
    },
    existingSemanticAliases: {
      source: "packages/tokens/tokens.json",
      classification: "ENGINEERING",
      values: tokenData.semantic,
    },
  },
  unknown: {
    typographySemanticScale:
      "No authoritative semantic typography names or production token mapping are present in source.",
    effects:
      "No specialized, explicitly named effects foundation sheet was found; SVG filter evidence remains observed.",
  },
  typography: {
    source: "Figma Plugin API TEXT nodes",
    sourceFiles: typography.sourceFiles,
    status: typography.coverage.status,
    canonicalSourceFacts: {
      textNodes: typography.summary.textNodes,
      mergedSignatures: typography.summary.mergedSignatures,
      referencedTextStyles: typography.summary.referencedTextStyles,
      mixedNodes: typography.summary.mixedNodes,
      note: "The factual signatures are inventoried in typography.json; this is not a semantic token scale.",
    },
    productObservations: {
      primaryFamily: typography.coverage.primaryProductFamily,
      signatureIds: typography.signatures
        .filter(({ classification }) => classification === "PRODUCT_CANDIDATE")
        .map(({ id }) => id),
    },
    nonProductObservations: Object.fromEntries(
      Object.entries(typography.summary.classificationCounts).filter(
        ([classification]) => classification !== "PRODUCT_CANDIDATE",
      ),
    ),
    unknown: {
      semanticScale:
        "No authoritative semantic typography names or production token mapping are present in source.",
    },
  },
};

const layoutPath = path.join(
  root,
  "shlz-design-source/layouts/screen-layout-metrics.json",
);
const layouts = readJson(layoutPath);
const russianServiceDesk = new Set([
  "Автоназначения.svg",
  "Дашборды.svg",
  "Детальная отчета.svg",
  "Заявка на производство.svg",
  "История изменений.svg",
  "Календарь для начальника.svg",
  "Календарь и праздники.svg",
  "Календарь.svg",
  "Комментарии.svg",
  "Обращение по гарантийному обслуживанию.svg",
  "Первичное обращение.svg",
  "Планировщик для сотрудника.svg",
  "Поставщики.svg",
  "Редактирование дашборда.svg",
  "Создание отчета.svg",
  "Сообщения.svg",
  "Список обращений.svg",
  "Список отчетов.svg",
  "Сроки обработки обращений.svg",
  "Уведомления для отчетов.svg",
  "Управление категориями и полями.svg",
  "Управление организациями.svg",
  "Управление полями.svg",
  "Управление статусами обращений.svg",
]);
const referenceScreens = layouts.map((screen) => {
  const sourcePath = path.join(raw, screen.decoded_name);
  return {
    name: screen.decoded_name.replace(/\.svg$/i, ""),
    sourcePath: relative(sourcePath),
    sha256: sha256(sourcePath),
    byteSize: readFileSync(sourcePath).byteLength,
    canvas: screen.canvas,
    classification: russianServiceDesk.has(screen.decoded_name)
      ? "SERVICE_DESK_REFERENCE"
      : "ADDITIONAL_REFERENCE",
    analysisPolicy:
      "Metadata inventory only; the complete large SVG was not semantically interpreted.",
  };
});

const sourceIssues = {
  schemaVersion: 1,
  summary: {
    reportedWarnings: archives.reduce(
      (sum, item) => sum + item.archiveManifest.counts.sourceWarnings,
      0,
    ),
    reportedErrors: archives.reduce(
      (sum, item) => sum + item.archiveManifest.counts.errors,
      0,
    ),
    instancesSkipped: archives.reduce(
      (sum, item) => sum + item.archiveManifest.counts.instancesSkipped,
      0,
    ),
    indexedComponentWarnings: warningRecords.length,
    indexedComponentErrors: errorRecords.length,
    duplicateOrNearDuplicateNameGroups: duplicateNames.length,
  },
  extraction: { warnings: warningRecords, errors: errorRecords },
  archiveReportedCounts: archives.map(({ archiveManifest, sourcePath }) => ({
    sourceArchive: relative(sourcePath),
    counts: archiveManifest.counts,
  })),
  duplicateOrNearDuplicateNames: duplicateNames,
  knownAmbiguities: [
    {
      subject: "Typography semantic scale",
      classification: "UNKNOWN",
      detail:
        "Figma Plugin API recovers factual typography, but source provides no authoritative body/heading token names.",
    },
    {
      subject: "Typography legacy evidence",
      classification: "SUPERSEDED",
      detail: typographyLegacyEvidence.conclusion,
    },
    {
      subject: "Effects",
      classification: "OBSERVED",
      detail:
        "SVG filters exist, but no specialized named effects specification was found.",
    },
    {
      subject: "Component behavior",
      classification: "UNKNOWN",
      detail:
        "Static SVG and extraction metadata do not prove runtime behavior or accessibility contracts.",
    },
    {
      subject: "Standalone icon names",
      classification: "AMBIGUOUS",
      detail: `Uncertain normalized names: ${iconAnalysis.summary.uncertainNames.join(", ")}.`,
    },
  ],
  typography: typography.issues,
};

const components = {
  schemaVersion: 1,
  summary: {
    componentSets: catalog.filter(({ kind }) => kind === "COMPONENT_SET")
      .length,
    standaloneComponents: catalog.filter(({ kind }) => kind === "COMPONENT")
      .length,
    variants: catalog.reduce(
      (sum, component) => sum + component.variants.length,
      0,
    ),
  },
  pages: archives.map(({ archiveManifest, sourcePath, sha256: digest }) => ({
    source: archiveManifest.source,
    exportedAt: archiveManifest.exportedAt,
    sourceArchive: relative(sourcePath),
    sha256: digest,
    counts: archiveManifest.counts,
  })),
  components: catalog,
};

const manifest = {
  schemaVersion: 1,
  generatedBy: "tools/generate-design-source-index.mjs",
  authority: [
    "shlz-design-source/raw (primary Figma source: SVG for visuals, Plugin API JSON for TEXT typography facts)",
    "other shlz-design-source extraction data (derived evidence)",
    "packages/icons/normalized (normalized asset inventory)",
  ],
  corpus: {
    archives: components.pages,
    foundations: {
      colors: colorsManifest.count,
      spacing: 9,
      cornerRadius: 5,
      typographySignatures: typography.summary.mergedSignatures,
    },
    components: components.summary,
    icons: {
      logicalGlyphs: icons.length,
      emittedSvgFiles: emittedIconPaths.length,
      currentColor: iconAnalysis.summary.currentColorIcons,
      preservedColor: iconAnalysis.summary.preservedColorIcons,
    },
    referenceScreens: {
      total: referenceScreens.length,
      serviceDesk: referenceScreens.filter(
        ({ classification }) => classification === "SERVICE_DESK_REFERENCE",
      ).length,
    },
    issues: sourceIssues.summary,
  },
  assets: {
    icons: {
      manifest: relative(iconsPath),
      analysis: relative(iconAnalysisPath),
      logicalGlyphs: icons.length,
      emittedSvgFiles: emittedIconPaths.length,
      categories: iconCategories,
      fileTypes: fileTypeIcons,
      semanticOrMulticolor: preservedColorIcons,
    },
  },
  typography: {
    index: "typography.json",
    sourceFiles: typography.sourceFiles,
    summary: typography.summary,
    coverage: typography.coverage,
  },
  coverage: {
    reliableFoundations: [
      "40 explicitly named colors",
      "spacing: 4/8/16/24/32/40/48/56/64 px",
      "corner radius: Min 8 / Regular 12 / Medium 16 / Large 48 / Max 100 px",
    ],
    componentMetadata:
      "All component sets, standalone components and exported variants reported by both archive manifests are indexed with hierarchy, properties, dimensions and diagnostics.",
    referenceUse:
      "Large Service Desk screens are validation references, not foundation-token or component-contract authorities.",
    gapsBeforePortalTransfer: [
      "Typography facts are recovered, but authoritative semantic style names and production mapping are absent.",
      "No specialized named effects foundation specification was found.",
      "Ambiguous duplicate/near-duplicate component names require source-owner review before semantic merging.",
      "Static exports do not define behavior, accessibility contracts or responsive rules.",
      "Archive warnings, failed invisible Spacing exports and skipped instances must remain visible during downstream interpretation.",
    ],
  },
  files: [
    "foundations.json",
    "components.json",
    "source-issues.json",
    "reference-screens.json",
    "typography.json",
    "README.md",
  ],
};

mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, "manifest.json"), json(manifest));
writeFileSync(path.join(output, "foundations.json"), json(foundations));
writeFileSync(path.join(output, "components.json"), json(components));
writeFileSync(path.join(output, "source-issues.json"), json(sourceIssues));
writeFileSync(
  path.join(output, "reference-screens.json"),
  json({
    schemaVersion: 1,
    sourceInventory: relative(layoutPath),
    summary: manifest.corpus.referenceScreens,
    screens: referenceScreens,
  }),
);
writeFileSync(path.join(output, "typography.json"), json(typography));

const readme = `# SHLZ design source index

This directory is a generated, read-only index **of** the design corpus. It is not a replacement for the corpus and contains no frontend implementation.

## Authority

Original Figma exports under \`shlz-design-source/raw/svg/\` are the primary source of truth. The two ZIP archives are read directly by the generator and are never unpacked into or rewritten under \`shlz-design-source/\`. Other extraction files are derived evidence. Existing portals are not design authorities.

## Recovered coverage

- ${components.summary.componentSets} component sets, ${components.summary.standaloneComponents} standalone components and ${components.summary.variants} variants from both UI Kit pages.
- ${colorsManifest.count} explicitly named colors, 9 explicit spacing values and 5 human-verified corner-radius values.
- ${typography.summary.mergedSignatures} merged factual typography signatures from ${typography.summary.textNodes} Figma TEXT nodes; ${typography.summary.referencedTextStyles} opaque referenced text-style IDs are cataloged.
- ${icons.length} normalized logical icons; ${iconAnalysis.summary.currentColorIcons} support \`currentColor\`, while ${iconAnalysis.summary.preservedColorIcons} preserve semantic or multicolor paints.
- ${referenceScreens.length} large reference sheets (${manifest.corpus.referenceScreens.serviceDesk} classified as Service Desk references).

## Reliability

Use \`foundations.json#canonical\` for literal foundation facts. Values observed only in component geometry are under \`observed\` and must not be promoted to tokens without additional evidence. Component records preserve Figma node IDs, hierarchy paths, dimensions, variant properties, warnings and archive paths.

Typography is now read directly from Figma Plugin API exports rather than inferred from outlined SVG glyphs. Golos Text is supported as the primary product family by concrete Interface elements paths, while documentation, embedded assets, foreign/legacy families and local outliers remain separate observations. Not all 29 Basic or 19 Interface signatures are production typography: covers, specification-page headings, file glyph labels and imported component fonts are retained but classified outside product candidates. No semantic names such as \`body-sm\` or \`heading-lg\` are invented.

No specialized named effects specification was found, so SVG filters remain observed evidence. Static SVGs do not establish interaction behavior.

## Known limitations

The extraction reports ${sourceIssues.summary.reportedErrors} errors, ${sourceIssues.summary.reportedWarnings} warnings and ${sourceIssues.summary.instancesSkipped} skipped instances. All nine errors concern invisible \`Spacing\` variant SVG exports; their variant metadata and the full \`Spacing.svg\` remain available. Repeated names are reported as ambiguity, never automatically merged.

Before this corpus can safely drive a portal transfer, typography observations still need an explicit future engineering mapping, named effects need an authoritative source specification, ambiguous duplicate names need design-owner review, and runtime/accessibility/responsive contracts must be engineered separately from the static exports. Large Service Desk screens are useful validation references, but they are not promoted to component or token authority.

## Regeneration

Run:

\`\`\`sh
node tools/generate-design-source-index.mjs
\`\`\`

The command reads ZIP entries through the repository's JavaScript reader after \`npm ci\` and writes only to \`design-source-index/\`; no system \`unzip\` utility is required.
`;
writeFileSync(path.join(output, "README.md"), readme);

execFileSync(
  path.join(root, "node_modules/.bin/prettier"),
  ["--write", output],
  {
    stdio: "ignore",
  },
);

console.log(JSON.stringify(manifest.corpus, null, 2));
