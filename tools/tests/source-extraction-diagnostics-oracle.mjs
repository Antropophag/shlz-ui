import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { buildDiagnosticClassification } from "../lib/source-extraction-diagnostics.mjs";

const repoRoot = await realpath(path.resolve(import.meta.dirname, "../.."));
const target = await realpath(path.resolve(process.argv[2]));
const knownBadLedger = await realpath(
  path.join(
    repoRoot,
    "tools/tests/fixtures/source-extraction-diagnostics-known-bad/source-extraction-diagnostics-ledger.json",
  ),
);
if (target !== repoRoot && target !== knownBadLedger)
  throw new Error(
    "oracle target is outside the approved candidate/adapter seam",
  );
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
