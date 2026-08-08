import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  flatten,
  json,
  kebab,
  normalizeMonochromeSvg,
  resolveAliases,
} from "./lib.mjs";

const root = process.cwd();
const tokenRoot = path.join(root, "packages/tokens");
const tokenDist = path.join(tokenRoot, "dist");
const iconRoot = path.join(root, "packages/icons");
const iconDist = path.join(iconRoot, "dist");
const sourceRoot = path.join(root, "shlz-design-source");

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
const sourceManifest = await json(
  path.join(sourceRoot, "assets/icon-manifest.json"),
);
const manifest = [];
for (const entry of sourceManifest) {
  const isFileType = entry.category === "file-types";
  const isRecoveredCalendar =
    entry.name === "calendar" && entry.category === "sidebar";
  const name = isRecoveredCalendar ? "calendar-sidebar-uncertain" : entry.name;
  const sourceDir = isFileType ? "file-types" : "icons";
  const source = isRecoveredCalendar
    ? path.join(iconRoot, "source", "calendar-sidebar-uncertain.svg")
    : path.join(sourceRoot, "assets", sourceDir, `${entry.name}.svg`);
  const targetDir = isFileType ? "file-types" : "icons";
  let svg = await readFile(source, "utf8");
  const hasPreservedPalette =
    isFileType || /(?:fill|stroke)="(?:#(?:DBDBDB|D4D4D8|079455))"/i.test(svg);
  if (!hasPreservedPalette) svg = normalizeMonochromeSvg(svg);
  await writeFile(path.join(iconDist, targetDir, `${name}.svg`), svg);
  manifest.push({
    ...entry,
    name,
    file: `${targetDir}/${name}.svg`,
    colorMode: hasPreservedPalette ? "multicolor" : "currentColor",
    provenance: {
      classification: isRecoveredCalendar ? "FACT" : "DERIVED",
      source: `raw/svg/${entry.source}`,
      sourceIds: entry.source_ids,
      ...(isRecoveredCalendar
        ? {
            recovery:
              "Exact path geometry recovered from the sidebar section; translated from the 24px cell at (454, 490).",
          }
        : {}),
    },
    uncertainty: isRecoveredCalendar
      ? "The source category is sidebar, but a more specific semantic meaning is not recoverable from static SVG."
      : null,
  });
}
const symbols = [];
for (const entry of manifest) {
  const svg = await readFile(path.join(iconDist, entry.file), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
  const body = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1] ?? "";
  symbols.push(
    `<symbol id="shlz-icon-${entry.name}" viewBox="${viewBox}">${body.replace(/<defs[\s\S]*?<\/defs>/, "")}</symbol>`,
  );
}
await writeFile(
  path.join(iconDist, "sprite.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbols.join("")}</defs></svg>\n`,
);
await writeFile(
  path.join(iconDist, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
const names = manifest.map(({ name }) => `'${name}'`).join(" | ");
await writeFile(
  path.join(iconDist, "index.d.ts"),
  `export type IconName = ${names};\nexport interface IconRecord { name: IconName; file: string; colorMode: 'currentColor' | 'multicolor'; }\nexport const iconNames: readonly IconName[];\n`,
);
await writeFile(
  path.join(iconDist, "index.js"),
  `export const iconNames = ${JSON.stringify(manifest.map(({ name }) => name))};\n`,
);
