import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildDiagnosticClassification } from "../lib/source-extraction-diagnostics.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const target = path.resolve(process.argv[2]);
const ledgerPath =
  target === repoRoot
    ? path.join(
        repoRoot,
        "docs/component-audits/source-extraction-diagnostics-ledger.json",
      )
    : target;
const readJson = async (name) => JSON.parse(await readFile(name, "utf8"));

await buildDiagnosticClassification({
  issues: await readJson(
    path.join(repoRoot, "design-source-index/source-issues.json"),
  ),
  ledger: await readJson(ledgerPath),
  repoRoot,
});
