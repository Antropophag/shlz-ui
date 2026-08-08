import { access, readFile, readdir } from "node:fs/promises";
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
if (!tokens.color || !tokens.semantic || !tokens.control)
  throw new Error("Token groups are incomplete");
const manifest = await json("packages/icons/dist/manifest.json");
if (new Set(manifest.map(({ name }) => name)).size !== manifest.length)
  throw new Error("Icon names are not unique");
for (const icon of manifest) {
  const svg = await readFile(
    path.join("packages/icons/dist", icon.file),
    "utf8",
  );
  if (!svg.includes("<svg") || !svg.includes("</svg>"))
    throw new Error(`Broken SVG: ${icon.file}`);
  if (icon.colorMode === "currentColor" && !svg.includes("currentColor"))
    throw new Error(`Non-themable icon: ${icon.file}`);
}
if ((await readdir("packages/icons/dist/icons")).length !== 104)
  throw new Error("Expected 104 core manifest entries");
if (
  manifest.filter(({ colorMode }) => colorMode === "multicolor").length !== 22
)
  throw new Error("Expected 21 file-type palettes and one colored XLS glyph");
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
  `Validated ${sourceInventory.length} source SVGs, ${Object.keys(tokens).length} token groups and ${manifest.length} icons.`,
);
