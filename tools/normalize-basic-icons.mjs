import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.join(
  repositoryRoot,
  "shlz-design-source/raw/svg/UI Kit – Basic elements/icons",
);
const outputRoot = path.join(repositoryRoot, "packages/icons/normalized");

const categoryMap = {
  arrows: "navigation",
  "drag & drop": "actions",
  "file type": "files",
  "icon with container": "actions",
  intarface: "interface",
  priority: "status",
  sidebar: "sidebar",
  "text editor": "editor",
};

const curatedNames = new Map([
  ["filter1", "filter"],
  ["search1", "search"],
  ["flag-1", "flag-alt"],
  ["flagq", "flagq-uncertain"],
  ["minus-1", "minus-alt"],
  ["plus-2", "plus-alt-2"],
  ["plus-4", "plus-alt-4"],
  ["icon20", "icon-20-uncertain"],
  ["icon32", "icon-32-uncertain"],
  ["icon-wrapper-16", "icon-wrapper-16-uncertain"],
  ["icon-wrapper-24", "icon-wrapper-24-uncertain"],
]);

const uncertainNamePattern = /(?:uncertain|flagq|icon-?\d|wrapper)/i;
const semanticSourceCategories = new Set(["file type", "priority"]);
const nearDuplicateGroups = new Map([
  ["flag", "flag-family"],
  ["flag-alt", "flag-family"],
  ["flagq-uncertain", "flag-family"],
  ["minus", "minus-family"],
  ["minus-alt", "minus-family"],
  ["plus-alt-2", "plus-family"],
  ["plus-alt-4", "plus-family"],
  ["user", "user-family"],
  ["user-1", "user-family"],
  ["circle-grid-interface", "circle-grid-family"],
  ["align-left", "align-left-family"],
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.name.toLowerCase().endsWith(".svg")) files.push(entryPath);
  }
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

function rootAttribute(svg, attribute) {
  const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  return root.match(new RegExp(`${attribute}=["']([^"']+)["']`))?.[1] ?? null;
}

function stripDefinitions(svg) {
  return svg.replace(/<defs\b[\s\S]*?<\/defs>/g, "");
}

function paintValues(svg) {
  return [
    ...stripDefinitions(svg).matchAll(
      /(?:fill|stroke)=["'](?!none\b)([^"']+)["']/g,
    ),
  ].map((match) => match[1]);
}

function geometryFingerprint(svg) {
  return stripDefinitions(svg)
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function kebabCase(value) {
  return value
    .normalize("NFKD")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function sourceMetadata(relativePath) {
  const parsed = path.parse(relativePath);
  const sourceCategory = path.dirname(relativePath);
  const assignments = Object.fromEntries(
    parsed.name.split(/,\s*/).flatMap((part) => {
      const separator = part.indexOf("=");
      return separator === -1
        ? []
        : [[part.slice(0, separator).trim(), part.slice(separator + 1).trim()]];
    }),
  );
  return { parsed, sourceCategory, assignments };
}

function logicalIdentity(relativePath, geometryHash) {
  const { parsed, sourceCategory, assignments } = sourceMetadata(relativePath);
  if (sourceCategory === "arrows") {
    return {
      baseName: assignments.Type === "Closed" ? "arrow-closed" : "arrow-opened",
      family: `arrows:${assignments.Type}`,
      state: assignments.State?.toLowerCase() ?? null,
      declaredSize: Number(assignments.Size),
    };
  }
  if (sourceCategory === "drag & drop") {
    return {
      baseName: "six-dot-grid",
      family: "six-dot-grid",
      categoryOverride: "interface",
      state: assignments.State?.toLowerCase() ?? null,
      declaredSize: null,
    };
  }
  if (sourceCategory === "icon with container") {
    return {
      baseName: "delete-contained",
      family: "delete-contained",
      state: assignments.State?.toLowerCase() ?? null,
      declaredSize: Number(assignments.Size),
    };
  }
  if (sourceCategory === "file type") {
    const type = kebabCase(assignments.Type ?? parsed.name);
    if (type === "pdf" || type === "pdf-gray") {
      return {
        baseName: "file-pdf",
        family: "file:pdf",
        variantName: type === "pdf-gray" ? "gray" : "default",
        state: null,
        declaredSize: null,
      };
    }
    return {
      baseName: type === "file" ? "file-generic" : `file-${type}`,
      family: `file:${type}`,
      state: null,
      declaredSize: null,
    };
  }
  if (sourceCategory === "priority") {
    const priorityNames = {
      Высокий: "priority-high",
      Средний: "priority-medium",
      Низкий: "priority-low",
    };
    const variantName =
      priorityNames[assignments["Property 1"]]?.replace("priority-", "") ??
      "uncertain";
    return {
      baseName: "priority",
      family: "priority",
      state: null,
      declaredSize: null,
      variantName,
    };
  }

  const rawName = kebabCase(parsed.name);
  if (sourceCategory === "intarface" && rawName === "menu") {
    return {
      baseName: "six-dot-grid",
      family: "six-dot-grid",
      categoryOverride: "interface",
      state: null,
      declaredSize: null,
    };
  }
  const baseName = curatedNames.get(rawName) ?? rawName;
  return {
    baseName,
    family: `geometry:${geometryHash}`,
    state: null,
    declaredSize: null,
  };
}

function normalizeCurrentColor(svg, preservedPaints = []) {
  const definitions = [];
  const withoutDefinitions = svg.replace(
    /<defs\b[\s\S]*?<\/defs>/g,
    (value) => {
      definitions.push(value);
      return `__SHLZ_DEFS_${definitions.length - 1}__`;
    },
  );
  const normalized = withoutDefinitions.replace(
    /(fill|stroke)=["'](?!none\b)([^"']+)["']/g,
    (attribute, kind, paint) =>
      preservedPaints.includes(paint) ? attribute : `${kind}="currentColor"`,
  );
  return normalized.replace(
    /__SHLZ_DEFS_(\d+)__/g,
    (_, index) => definitions[index],
  );
}

function unique(values) {
  return [...new Set(values)];
}

async function json(value) {
  return format(JSON.stringify(value), { parser: "json" });
}

function variantFileName(icon, variant, variants) {
  if (variants.length === 1) return `${icon.name}.svg`;
  const qualifiers = [];
  if (variant.width && variants.some((item) => item.width !== variant.width))
    qualifiers.push(`${variant.width}`);
  if (
    variant.state &&
    variants.some((item) => item.geometryHash !== variant.geometryHash)
  )
    qualifiers.push(variant.state);
  if (variant.variantName) qualifiers.push(variant.variantName);
  return `${icon.name}${qualifiers.length ? `-${qualifiers.join("-")}` : ""}.svg`;
}

async function analyze() {
  const sources = [];
  for (const absolutePath of await walk(sourceRoot)) {
    const svg = await readFile(absolutePath, "utf8");
    const relativePath = path.relative(sourceRoot, absolutePath);
    const width = rootAttribute(svg, "width");
    const height = rootAttribute(svg, "height");
    const viewBox = rootAttribute(svg, "viewBox");
    const colors = unique(paintValues(svg));
    const elementMatches = [
      ...stripDefinitions(svg).matchAll(
        /<(path|rect|circle|ellipse|line|polyline|polygon|use|image)\b/g,
      ),
    ];
    const geometry = geometryFingerprint(svg);
    const geometryHash = sha256(geometry);
    const identity = logicalIdentity(relativePath, geometryHash);
    const sourceCategory = path.dirname(relativePath);
    const semanticColors =
      semanticSourceCategories.has(sourceCategory) ||
      (sourceCategory === "intarface" &&
        identity.baseName === "file-type-icon");
    const monochrome = colors.length <= 1;
    sources.push({
      absolutePath,
      relativePath,
      sourcePath: path.posix.join(
        "shlz-design-source/raw/svg/UI Kit – Basic elements/icons",
        relativePath.split(path.sep).join("/"),
      ),
      sourceName: path.basename(relativePath, ".svg"),
      sourceCategory,
      width: width === null ? null : Number(width),
      height: height === null ? null : Number(height),
      viewBox,
      rootFill: rootAttribute(svg, "fill"),
      rootStroke: rootAttribute(svg, "stroke"),
      fills: unique(
        [
          ...stripDefinitions(svg).matchAll(/fill=["'](?!none\b)([^"']+)["']/g),
        ].map((match) => match[1]),
      ),
      strokes: unique(
        [
          ...stripDefinitions(svg).matchAll(
            /stroke=["'](?!none\b)([^"']+)["']/g,
          ),
        ].map((match) => match[1]),
      ),
      colors,
      elementCount: elementMatches.length,
      elementTypes: Object.fromEntries(
        unique(elementMatches.map((match) => match[1])).map((type) => [
          type,
          elementMatches.filter((match) => match[1] === type).length,
        ]),
      ),
      monochrome,
      semanticColors,
      is40Container:
        Number(width) === 40 &&
        Number(height) === 40 &&
        sourceCategory !== "file type",
      fortyByFortyKind:
        Number(width) === 40 && Number(height) === 40
          ? sourceCategory === "file type"
            ? "semantic-file-glyph"
            : "container"
          : null,
      sourceSha256: sha256(svg),
      geometryHash,
      svg,
      ...identity,
    });
  }

  const families = Map.groupBy(sources, (source) => source.family);
  const icons = [];
  for (const familySources of families.values()) {
    const geometryGroups = Map.groupBy(
      familySources,
      (source) =>
        `${source.geometryHash}:${source.width}x${source.height}:${source.variantName ?? ""}`,
    );
    const sourceStates = unique(
      familySources.map((source) => source.state).filter(Boolean),
    );
    const statesDifferGeometrically =
      sourceStates.length > 1 &&
      unique(familySources.map((source) => source.geometryHash)).length >
        unique(
          familySources.map((source) => `${source.width}x${source.height}`),
        ).length;

    const variants = [];
    for (const group of geometryGroups.values()) {
      const preferred =
        group.find((source) => source.state === "default") ?? group[0];
      variants.push({
        source: preferred,
        sources: group,
        width: preferred.width,
        height: preferred.height,
        viewBox: preferred.viewBox,
        state: statesDifferGeometrically ? preferred.state : null,
        variantName: preferred.variantName ?? null,
        geometryHash: preferred.geometryHash,
      });
    }

    const first = familySources[0];
    let name = first.baseName;
    if (icons.some((icon) => icon.name === name)) {
      name = `${name}-${categoryMap[first.sourceCategory]}`;
    }
    const emittedSources = variants.map((variant) => variant.source);
    const hasCurrentColorGlyph =
      first.baseName === "delete-contained" ||
      emittedSources.every(
        (source) => source.monochrome && !source.semanticColors,
      );
    icons.push({
      name,
      category: first.categoryOverride ?? categoryMap[first.sourceCategory],
      sourceCategory: first.sourceCategory,
      variants,
      sourceStates,
      statesDifferGeometrically,
      monochrome: emittedSources.every((source) => source.monochrome),
      semanticColors: unique(
        familySources
          .filter((source) => source.semanticColors)
          .flatMap((source) => source.colors),
      ),
      useCurrentColor: hasCurrentColorGlyph,
      paintPolicy:
        first.baseName === "delete-contained"
          ? "currentColor-glyph-preserved-border"
          : hasCurrentColorGlyph
            ? "currentColor"
            : "preserved-source-colors",
      nearDuplicateGroup: nearDuplicateGroups.get(first.baseName) ?? null,
      comment:
        name === "six-dot-grid"
          ? "Одна точная геометрия экспортирована как drag & drop и Menu; нейтральное имя сохраняет семантическую неоднозначность."
          : uncertainNamePattern.test(name)
            ? "Назначение или различие glyph не подтверждено; имя намеренно консервативно."
            : statesDifferGeometrically
              ? "Default/Hover имеют различную геометрию и сохранены отдельно."
              : sourceStates.length > 1
                ? "Default/Hover объединены: геометрия совпадает, состояние задаётся цветом."
                : null,
    });
  }

  icons.sort((left, right) => left.name.localeCompare(right.name, "en"));
  const exactGroups = Map.groupBy(
    sources,
    (source) => `${source.geometryHash}:${source.width}x${source.height}`,
  );
  for (const source of sources) {
    const familySources = families.get(source.family);
    source.hasDefaultHoverVariants =
      unique(familySources.map((item) => item.state).filter(Boolean)).length >
      1;
    source.hasSizeVariants =
      unique(familySources.map((item) => `${item.width}x${item.height}`))
        .length > 1;
    source.exactGeometryDuplicates = exactGroups
      .get(`${source.geometryHash}:${source.width}x${source.height}`)
      .filter((item) => item.relativePath !== source.relativePath)
      .map((item) => item.sourcePath);
    source.nearDuplicateGroup =
      nearDuplicateGroups.get(source.baseName) ?? null;
  }
  return { sources, icons };
}

function publicSource(source) {
  const record = { ...source };
  delete record.absolutePath;
  delete record.svg;
  delete record.family;
  delete record.baseName;
  return record;
}

function summary(analysis) {
  const variantSources = analysis.sources.length - analysis.icons.length;
  const exactDuplicateFamilies = analysis.icons.filter((icon) =>
    icon.variants.some((variant) => variant.sources.length > 1),
  ).length;
  return {
    sourceSvgCount: analysis.sources.length,
    uniqueLogicalGlyphs: analysis.icons.length,
    collapsedVariantOrDuplicateFiles: variantSources,
    exactGeometryDuplicateFamilies: exactDuplicateFamilies,
    crossNameExactGeometryGroups: unique(
      analysis.sources
        .filter((source) => source.exactGeometryDuplicates.length > 0)
        .map(
          (source) => `${source.geometryHash}:${source.width}x${source.height}`,
        ),
    ).length,
    nearDuplicateGroups: unique(
      analysis.sources
        .map((source) => source.nearDuplicateGroup)
        .filter(Boolean),
    ),
    monochromeSources: analysis.sources.filter((source) => source.monochrome)
      .length,
    ordinaryMonochromeSources: analysis.sources.filter(
      (source) => source.monochrome && !source.semanticColors,
    ).length,
    semanticOrMulticolorSources: analysis.sources.filter(
      (source) => source.semanticColors || !source.monochrome,
    ).length,
    semanticColorSources: analysis.sources.filter(
      (source) => source.semanticColors,
    ).length,
    multicolorSources: analysis.sources.filter((source) => !source.monochrome)
      .length,
    currentColorIcons: analysis.icons.filter((icon) => icon.useCurrentColor)
      .length,
    preservedColorIcons: analysis.icons.filter((icon) => !icon.useCurrentColor)
      .length,
    sizes: Object.fromEntries(
      Object.entries(
        Object.groupBy(
          analysis.sources,
          (source) => `${source.width}x${source.height}`,
        ),
      ).map(([size, sources]) => [size, sources.length]),
    ),
    sourceCategories: Object.fromEntries(
      Object.entries(
        Object.groupBy(analysis.sources, (source) => source.sourceCategory),
      ).map(([category, sources]) => [category, sources.length]),
    ),
    stateFamilies: analysis.icons
      .filter((icon) => icon.sourceStates.length > 1)
      .map((icon) => ({
        name: icon.name,
        states: icon.sourceStates,
        geometryDiffers: icon.statesDifferGeometrically,
      })),
    uncertainNames: analysis.icons
      .filter((icon) => icon.comment?.includes("консервативно"))
      .map((icon) => icon.name),
  };
}

async function generate(analysis) {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const manifest = [];
  for (const icon of analysis.icons) {
    const variants = [];
    for (const variant of icon.variants) {
      const fileName = variantFileName(icon, variant, icon.variants);
      const normalizedPath = path.posix.join(icon.category, fileName);
      await mkdir(path.join(outputRoot, icon.category), { recursive: true });
      const svg = icon.useCurrentColor
        ? normalizeCurrentColor(
            variant.source.svg,
            icon.paintPolicy === "currentColor-glyph-preserved-border"
              ? ["#D1D8DF"]
              : [],
          )
        : variant.source.svg;
      await writeFile(path.join(outputRoot, normalizedPath), svg);
      variants.push({
        normalizedPath,
        size: { width: variant.width, height: variant.height },
        viewBox: variant.viewBox,
        state: variant.state,
        geometrySha256: variant.geometryHash,
        sourcePaths: variant.sources.map((source) => source.sourcePath),
        sourceNames: variant.sources.map((source) => source.sourceName),
        sources: variant.sources.map((source) => ({
          path: source.sourcePath,
          name: source.sourceName,
          sha256: source.sourceSha256,
          state: source.state,
          declaredSize: source.declaredSize,
          colors: source.colors,
        })),
      });
    }
    manifest.push({
      name: icon.name,
      category: icon.category,
      normalizedPath: variants[0].normalizedPath,
      sourceFigmaPaths: unique(
        icon.variants.flatMap((variant) =>
          variant.sources.map((source) => source.sourcePath),
        ),
      ),
      sourceNames: unique(
        icon.variants.flatMap((variant) =>
          variant.sources.map((source) => source.sourceName),
        ),
      ),
      size: variants[0].size,
      viewBox: variants[0].viewBox,
      monochrome: icon.monochrome,
      currentColor: icon.useCurrentColor,
      paintPolicy: icon.paintPolicy,
      semanticColors: icon.useCurrentColor ? [] : icon.semanticColors,
      nearDuplicateGroup: icon.nearDuplicateGroup,
      mergedVariants: unique([
        ...icon.sourceStates,
        ...icon.variants.map((variant) => variant.variantName).filter(Boolean),
      ]),
      variants,
      comment: icon.comment,
    });
  }

  await writeFile(path.join(outputRoot, "manifest.json"), await json(manifest));
  await writeFile(
    path.join(outputRoot, "analysis.json"),
    await json({
      generatedFrom: "shlz-design-source/raw/svg/UI Kit – Basic elements/icons",
      summary: summary(analysis),
      sources: analysis.sources.map(publicSource),
    }),
  );
  await writeFile(
    path.join(outputRoot, "README.md"),
    `# Normalized Figma basic icons\n\n` +
      `Generated by \`node tools/normalize-basic-icons.mjs\` from the read-only Figma export. ` +
      `Repository policy forbids writing under \`shlz-design-source/\`, so the requested normalized catalog lives here instead. ` +
      `It is deliberately not exported by \`@shlz/icons\` and is not integrated into the UI.\n\n` +
      `## Inventory\n\n` +
      `- 133 source SVG files become 119 logical glyphs and 125 emitted SVG variants.\n` +
      `- Source dimensions: 100 × 24×24, 21 × 40×40, 6 × 20×20, 5 × 24×25 and 1 × 16×16.\n` +
      `- All 21 40×40 files are semantic file-type glyphs; this export contains no 40×40 interface container around a smaller glyph.\n` +
      `- 101 source files use one paint; 32 are multicolor. Twenty-five carry intentional semantic colors.\n\n` +
      `## Rules\n\n` +
      `- Geometry, viewBox and path data are preserved; no SVG optimizer is used.\n` +
      `- Ordinary monochrome glyph paints become \`currentColor\`.\n` +
      `- File-type and priority colors are preserved as semantic source colors. The interface source named \`File type icon\` is classified the same way from its multicolor file-badge geometry.\n` +
      `- Default/Hover sources are collapsed only when geometry is identical; CSS owns color-only states.\n` +
      `- Arrow state sources emit Default geometry with \`currentColor\`; their authored container background/opacity is a CSS state concern. Delete containers use \`currentColor\` for the glyph while retaining the independent source border paint.\n` +
      `- Source-authored size variants remain separate files under one logical manifest icon.\n` +
      `- Exact geometry duplicates are represented by one logical icon with all source paths retained.\n` +
      `- Ambiguous names keep conservative \`-uncertain\` or \`-alt\` qualifiers pending manual review.\n\n` +
      `## Collapsed sources\n\n` +
      `- Arrow Closed/Open: Default and Hover collapse per 20/24 size because geometry is identical.\n` +
      `- Delete contained: Default and Hover collapse per 20/24 size because only glyph paint changes.\n` +
      `- Drag & drop Default/Hover and the exact duplicate \`intarface/Menu.svg\` become \`six-dot-grid\`; the purpose remains ambiguous.\n` +
      `- PDF/PDF Gray become two semantic color variants of \`file-pdf\`.\n` +
      `- High/Medium/Low priority become three semantic color variants of one \`priority\` geometry.\n\n` +
      `## Categories\n\n` +
      `Normalized files are grouped into \`actions\`, \`navigation\`, \`interface\`, \`status\`, \`sidebar\`, \`editor\` and \`files\`. ` +
      `The Figma folder typo \`intarface\` is corrected only in normalized paths; source paths remain literal.\n\n` +
      `## Traceability\n\n` +
      `\`manifest.json\` maps every logical icon and emitted variant to all contributing source paths. ` +
      `\`analysis.json\` records width, height, viewBox, fills, strokes, colors, element counts, source SHA-256, geometry SHA-256, state and container classification for every one of the 133 raw files.\n\n` +
      `## Manual review required\n\n` +
      `The following source names do not establish a reliable purpose: ${
        summary(analysis)
          .uncertainNames.map((name) => `\`${name}\``)
          .join(", ") || "none"
      }. ` +
      `The \`-alt\` variants are retained because their geometry differs; their more specific semantics are UNKNOWN. ` +
      `\`nearDuplicateGroup\` is a review hint, never an automatic merge rule.\n`,
  );
}

const analysis = await analyze();
if (process.argv.includes("--analyze")) {
  process.stdout.write(`${JSON.stringify(summary(analysis), null, 2)}\n`);
} else {
  await generate(analysis);
  process.stdout.write(`${JSON.stringify(summary(analysis), null, 2)}\n`);
}
