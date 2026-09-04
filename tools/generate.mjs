import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { flatten, json, kebab, resolveAliases } from "./lib.mjs";
import { generateSourceReferences } from "./source-references.mjs";

const root = process.cwd();
const tokenRoot = path.join(root, "packages/tokens");
const tokenDist = path.join(tokenRoot, "dist");
const iconRoot = path.join(root, "packages/icons");
const iconDist = path.join(iconRoot, "dist");
const styleRoot = path.join(root, "packages/styles");

await generateSourceReferences(root);

await rm(tokenDist, { recursive: true, force: true });
await mkdir(tokenDist, { recursive: true });
const sourceTokens = await json(path.join(tokenRoot, "tokens.json"));
const flat = flatten(sourceTokens);
const resolved = resolveAliases(flat);
const css = `/* Generated from packages/tokens/tokens.json. */\n:root {\n${Object.entries(
  resolved,
)
  .map(([key, value]) => `  --shlz-${kebab(key.split("."))}: ${value};`)
  .join("\n")}\n}\n`;
await writeFile(path.join(tokenDist, "tokens.css"), css);
await writeFile(
  path.join(tokenDist, "tokens.json"),
  `${JSON.stringify(sourceTokens, null, 2)}\n`,
);
await cp(
  path.join(tokenRoot, "provenance.json"),
  path.join(tokenDist, "provenance.json"),
);

await rm(iconDist, { recursive: true, force: true });
await mkdir(path.join(iconDist, "icons"), { recursive: true });
await mkdir(path.join(iconDist, "file-types"), { recursive: true });
const normalizedRoot = path.join(iconRoot, "normalized");
const sourceManifest = await json(path.join(normalizedRoot, "manifest.json"));
const compatibilityAliases = await json(
  path.join(iconRoot, "compatibility-aliases.json"),
);
const emittedVariants = new Map();
const toTarget = (category, normalizedPath) => {
  const targetDir = category === "files" ? "file-types" : "icons";
  return `${targetDir}/${path.basename(normalizedPath)}`;
};
const manifest = [];
for (const entry of sourceManifest) {
  const variants = [];
  for (const variant of entry.variants) {
    const name = path.basename(variant.normalizedPath, ".svg");
    const file = toTarget(entry.category, variant.normalizedPath);
    const source = path.join(normalizedRoot, variant.normalizedPath);
    const svg = await readFile(source, "utf8");
    await writeFile(path.join(iconDist, file), svg);
    emittedVariants.set(name, { ...variant, file, name, svg, entry });
    variants.push({
      ...variant,
      name,
      file,
      primary: variant.normalizedPath === entry.normalizedPath,
    });
  }
  const primaryVariant = variants.find(
    ({ normalizedPath }) => normalizedPath === entry.normalizedPath,
  );
  if (!primaryVariant)
    throw new Error(`Missing primary normalized variant: ${entry.name}`);
  const logicalFile = `${entry.category === "files" ? "file-types" : "icons"}/${entry.name}.svg`;
  if (logicalFile !== primaryVariant.file)
    await writeFile(
      path.join(iconDist, logicalFile),
      emittedVariants.get(primaryVariant.name).svg,
    );
  manifest.push({
    ...entry,
    normalizedPath: undefined,
    file: logicalFile,
    colorMode: entry.currentColor ? "currentColor" : "multicolor",
    variants,
    provenance: {
      classification: "FACT",
      sourceLayer: "packages/icons/normalized",
      sourceFigmaPaths: entry.sourceFigmaPaths,
    },
  });
}
const canonicalNames = new Set(manifest.map(({ name }) => name));
const aliasNames = new Set();
for (const alias of compatibilityAliases) {
  if (canonicalNames.has(alias.alias) || aliasNames.has(alias.alias))
    throw new Error(
      `Icon alias collides with a canonical/alias name: ${alias.alias}`,
    );
  const target = emittedVariants.get(alias.variant);
  if (!target || target.entry.name !== alias.target)
    throw new Error(
      `Unknown icon alias target: ${alias.alias} -> ${alias.target}/${alias.variant}`,
    );
  aliasNames.add(alias.alias);
  const targetDir = target.entry.category === "files" ? "file-types" : "icons";
  const file = `${targetDir}/${alias.alias}.svg`;
  await writeFile(path.join(iconDist, file), target.svg);
  alias.file = file;
  alias.colorMode = target.entry.currentColor ? "currentColor" : "multicolor";
}
const symbols = [];
const symbolFromSvg = (name, svg) => {
  const root = svg.match(/<svg\b([^>]*)>/)?.[1] ?? "";
  const viewBox = root.match(/\bviewBox=["']([^"']+)["']/)?.[1] ?? "0 0 24 24";
  const presentationAttributes = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-dasharray",
    "stroke-dashoffset",
    "fill-rule",
    "clip-rule",
    "opacity",
    "fill-opacity",
    "stroke-opacity",
  ]
    .map((attribute) => {
      const value = root.match(
        new RegExp(`\\b${attribute}=["']([^"']+)["']`),
      )?.[1];
      return value === undefined ? "" : ` ${attribute}="${value}"`;
    })
    .join("");
  let body = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1] ?? "";
  const prefix = `shlz-icon-${name}-`;
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body
      .replace(new RegExp(`id=(["'])${escaped}\\1`, "g"), `id="${prefix}${id}"`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${prefix}${id})`)
      .replace(
        new RegExp(`(href|xlink:href)=(["'])#${escaped}\\2`, "g"),
        `$1="#${prefix}${id}"`,
      );
  }
  return `<symbol id="shlz-icon-${name}" viewBox="${viewBox}"${presentationAttributes}>${body}</symbol>`;
};
for (const entry of emittedVariants.values()) {
  const { svg } = entry;
  symbols.push(symbolFromSvg(entry.name, svg));
}
for (const entry of manifest.filter(
  ({ name, variants }) => !variants.some((variant) => variant.name === name),
)) {
  const primary = entry.variants.find(({ primary }) => primary);
  const target = emittedVariants.get(primary.name);
  symbols.push(symbolFromSvg(entry.name, target.svg));
}
for (const alias of compatibilityAliases) {
  const target = emittedVariants.get(alias.variant);
  symbols.push(symbolFromSvg(alias.alias, target.svg));
}
await writeFile(
  path.join(iconDist, "sprite.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbols.join("")}</defs></svg>\n`,
);
await writeFile(
  path.join(iconDist, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
await writeFile(
  path.join(iconDist, "compatibility-aliases.json"),
  `${JSON.stringify(compatibilityAliases, null, 2)}\n`,
);
const canonicalType = manifest.map(({ name }) => `'${name}'`).join(" | ");
const aliasType = compatibilityAliases
  .map(({ alias }) => `'${alias}'`)
  .join(" | ");
await writeFile(
  path.join(iconDist, "index.d.ts"),
  `export type CanonicalIconName = ${canonicalType};\nexport type CompatibilityIconName = ${aliasType};\nexport type IconName = CanonicalIconName | CompatibilityIconName;\nexport interface IconRecord { name: CanonicalIconName; file: string; category: string; colorMode: 'currentColor' | 'multicolor'; }\nexport interface IconAlias { alias: CompatibilityIconName; target: CanonicalIconName; variant: string; file: string; colorMode: 'currentColor' | 'multicolor'; }\nexport const canonicalIconNames: readonly CanonicalIconName[];\nexport const compatibilityAliases: readonly IconAlias[];\nexport const iconNames: readonly IconName[];\nexport function resolveIconName(name: IconName): CanonicalIconName;\nexport function iconViewBox(name: IconName): string;\nexport function iconSymbolId(name: IconName): string;\nexport function iconHref(spriteUrl: string, name: IconName): string;\n`,
);
await writeFile(
  path.join(iconDist, "index.js"),
  `export const canonicalIconNames = ${JSON.stringify(manifest.map(({ name }) => name))};\nexport const compatibilityAliases = ${JSON.stringify(compatibilityAliases)};\nexport const iconNames = [...canonicalIconNames, ...compatibilityAliases.map(({ alias }) => alias)];\nconst aliasTargets = new Map(compatibilityAliases.map(({ alias, target }) => [alias, target]));\nconst viewBoxes = new Map(${JSON.stringify(manifest.map(({ name, viewBox }) => [name, viewBox]))});\nexport const resolveIconName = (name) => aliasTargets.get(name) ?? name;\nexport const iconViewBox = (name) => viewBoxes.get(resolveIconName(name));\nexport const iconSymbolId = (name) => \`shlz-icon-\${name}\`;\nexport const iconHref = (spriteUrl, name) => \`\${spriteUrl}#\${iconSymbolId(name)}\`;\n`,
);

const styleSources = [
  "foundation.css",
  "components/button.css",
  "components/link.css",
  "components/avatar.css",
  "components/table.css",
  "components/field.css",
  "components/date-field.css",
  "components/calendar.css",
  "components/calendar-grid.css",
  "components/planner-schedule.css",
  "components/message-thread.css",
  "components/comment-feed.css",
  "components/history-timeline.css",
  "components/choice.css",
  "components/status-badge.css",
  "components/dropdown.css",
  "components/popover.css",
  "components/tooltip.css",
  "components/tabs.css",
  "components/pagination.css",
  "components/tag.css",
  "components/segment.css",
  "components/notification.css",
  "components/modal.css",
  "components/drawer.css",
  "components/file-row.css",
  "components/document-row.css",
  "components/file-upload.css",
  "components/rich-text-toolbar.css",
  "components/composer.css",
  "components/empty-state.css",
  "components/card-with-action.css",
  "components/report-card.css",
  "components/cover.css",
  "components/reporting-dashboard.css",
  "typography-profiles.css",
];
await rm(path.join(styleRoot, "dist"), { recursive: true, force: true });
await mkdir(path.join(styleRoot, "dist"), { recursive: true });
const bundledStyles = await Promise.all(
  styleSources.map((file) => readFile(path.join(styleRoot, file), "utf8")),
);
await writeFile(
  path.join(styleRoot, "dist/shlz.css"),
  `/* Generated standalone bundle: tokens followed by foundation and components. */\n${css}\n${bundledStyles.join("\n")}`,
);
