import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import { buildCoverageMatrix } from "./lib/source-library-coverage.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(repoRoot, relative), "utf8"));
const outputPath = "docs/component-audits/source-library-coverage.json";
const matrix = await buildCoverageMatrix({
  sourceIndex: await readJson("design-source-index/components.json"),
  inventory: await readJson("docs/component-audits/project-inventory.json"),
  ledger: await readJson(
    "docs/component-audits/source-library-coverage-ledger.json",
  ),
  repoRoot,
});
const serialized = await prettier.format(JSON.stringify(matrix), {
  filepath: outputPath,
});

if (process.argv.includes("--check")) {
  const committed = await readFile(path.join(repoRoot, outputPath), "utf8");
  if (committed !== serialized)
    throw new Error(
      `${outputPath} is stale; run npm run generate:source-coverage`,
    );
  console.log(
    `Validated ${matrix.summary.records.denominator} records and ${matrix.summary.variants.denominator} variants.`,
  );
} else {
  await writeFile(path.join(repoRoot, outputPath), serialized);
  console.log(
    `Generated ${outputPath} with ${matrix.summary.records.denominator} records and ${matrix.summary.variants.denominator} variants.`,
  );
}
