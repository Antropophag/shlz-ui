import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import {
  buildDiagnosticClassification,
  renderDiagnosticClassificationMarkdown,
} from "./lib/source-extraction-diagnostics.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(repoRoot, relative), "utf8"));
const outputs = {
  json: "docs/component-audits/source-extraction-diagnostics.json",
  markdown: "docs/component-audits/source-extraction-diagnostics.md",
};
const result = await buildDiagnosticClassification({
  issues: await readJson("design-source-index/source-issues.json"),
  ledger: await readJson(
    "docs/component-audits/source-extraction-diagnostics-ledger.json",
  ),
  repoRoot,
});
const serialized = {
  json: await prettier.format(JSON.stringify(result), {
    filepath: outputs.json,
  }),
  markdown: await prettier.format(
    renderDiagnosticClassificationMarkdown(result),
    { filepath: outputs.markdown },
  ),
};
if (process.argv.includes("--check")) {
  for (const kind of Object.keys(outputs)) {
    if (
      (await readFile(path.join(repoRoot, outputs[kind]), "utf8")) !==
      serialized[kind]
    )
      throw new Error(
        `${outputs[kind]} is stale; run npm run generate:source-diagnostics`,
      );
  }
  console.log(
    `Validated ${result.summary.classificationUnits} units covering ${result.summary.reportedInstances} reported instances.`,
  );
} else {
  for (const kind of Object.keys(outputs))
    await writeFile(path.join(repoRoot, outputs[kind]), serialized[kind]);
  console.log(
    `Generated ${result.summary.classificationUnits} units covering ${result.summary.reportedInstances} reported instances.`,
  );
}
