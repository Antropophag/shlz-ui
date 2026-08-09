import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { hash, json } from "./lib.mjs";

const sourceInventory = await json(
  "shlz-design-source/inventory/source-inventory.json",
);
for (const source of sourceInventory) {
  const raw = await readFile(
    path.join("shlz-design-source/raw/svg", source.decoded_name),
  );
  if (hash(raw) !== source.sha256)
    throw new Error(`Design source changed: ${source.decoded_name}`);
}

const tokens = await json("packages/tokens/dist/tokens.json");
const sourceReferences = await json(
  "apps/showcase/generated/source-references/manifest.json",
);
if (
  !tokens.source?.color ||
  !tokens.source?.spacing ||
  !tokens.source?.radius ||
  !tokens.semantic
)
  throw new Error("Token groups are incomplete");
if (
  Object.keys(tokens).some(
    (key) => !["$schema", "source", "semantic"].includes(key),
  )
)
  throw new Error("Tokens must use only source and semantic layers");
for (const reference of sourceReferences) {
  const sourcePath = reference.sourceArchive ?? reference.sourceFile;
  const raw = await readFile(
    path.join("shlz-design-source/raw/svg", sourcePath),
  );
  const expectedHash = reference.sourceArchiveSha256 ?? reference.sourceSha256;
  if (hash(raw) !== expectedHash)
    throw new Error(`Stale source reference: ${reference.sourceFile}`);
  if (!reference.originalViewBox && !reference.sourceArchive)
    throw new Error(`Missing original viewBox: ${reference.sourceFile}`);
  for (const crop of reference.references) {
    if (!crop.cropViewBox || !crop.reason)
      throw new Error(`Incomplete crop provenance: ${crop.file}`);
    await access(`apps/showcase/generated/source-references/${crop.file}`);
  }
}
const manifest = await json("packages/icons/dist/manifest.json");
const aliases = await json("packages/icons/dist/compatibility-aliases.json");
if (new Set(manifest.map(({ name }) => name)).size !== manifest.length)
  throw new Error("Icon names are not unique");
for (const icon of manifest) {
  const primary = icon.variants.find(({ primary }) => primary);
  if (!primary) throw new Error(`Missing primary icon variant: ${icon.name}`);
  if (
    (await readFile(path.join("packages/icons/dist", icon.file), "utf8")) !==
    (await readFile(path.join("packages/icons/dist", primary.file), "utf8"))
  )
    throw new Error(`Canonical icon file differs from primary: ${icon.name}`);
  for (const variant of icon.variants) {
    const svg = await readFile(
      path.join("packages/icons/dist", variant.file),
      "utf8",
    );
    if (!svg.includes("<svg") || !svg.includes("</svg>"))
      throw new Error(`Broken SVG: ${variant.file}`);
    if (icon.colorMode === "currentColor" && !svg.includes("currentColor"))
      throw new Error(`Non-themable icon: ${variant.file}`);
    const normalized = await readFile(
      path.join("packages/icons/normalized", variant.normalizedPath),
      "utf8",
    );
    if (svg !== normalized)
      throw new Error(`Normalized geometry/paint changed: ${variant.file}`);
  }
}
if (manifest.length !== 119)
  throw new Error("Expected 119 normalized logical icons");
if (manifest.reduce((count, icon) => count + icon.variants.length, 0) !== 125)
  throw new Error("Expected 125 normalized emitted variants");
if (
  manifest.filter(({ colorMode }) => colorMode === "currentColor").length !== 97
)
  throw new Error("Expected 97 currentColor logical icons");
if (
  manifest.filter(({ colorMode }) => colorMode === "multicolor").length !== 22
)
  throw new Error("Expected 22 preserved-paint logical icons");
if (new Set(aliases.map(({ alias }) => alias)).size !== aliases.length)
  throw new Error("Compatibility aliases are not unique");
for (const alias of aliases) {
  const target = manifest
    .find(({ name }) => name === alias.target)
    ?.variants.find(({ name }) => name === alias.variant);
  if (!target) throw new Error(`Broken icon alias: ${alias.alias}`);
  if (
    (await readFile(path.join("packages/icons/dist", alias.file), "utf8")) !==
    (await readFile(path.join("packages/icons/dist", target.file), "utf8"))
  )
    throw new Error(`Alias does not use normalized SVG: ${alias.alias}`);
}
for (const pkg of ["tokens", "icons", "styles", "behaviors"]) {
  const packageJson = await json(`packages/${pkg}/package.json`);
  for (const target of Object.values(packageJson.exports)) {
    const files = typeof target === "string" ? [target] : Object.values(target);
    for (const file of files) {
      if (typeof file === "string" && !file.includes("*"))
        await access(path.join(`packages/${pkg}`, file));
    }
  }
}
console.log(
  `Validated ${sourceInventory.length} source SVGs, ${Object.keys(tokens).length} token groups, ${manifest.length} canonical icons and ${aliases.length} aliases.`,
);
