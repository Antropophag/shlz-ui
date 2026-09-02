import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  compareShowcaseLoadingReports,
  createShowcaseLoadingReport,
} from "./lib/showcase-loading-report.mjs";

const value = (flag) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};
const dist = path.resolve(value("--dist") ?? "apps/showcase/dist");
const commit = value("--commit");
const output = value("--out");
const baselinePath = value("--baseline");
const report = await createShowcaseLoadingReport({ dist, commit });
const result = baselinePath
  ? {
      report,
      comparison: compareShowcaseLoadingReports(
        JSON.parse(await readFile(baselinePath, "utf8")),
        report,
      ),
    }
  : report;
const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (output) await writeFile(output, serialized);
else process.stdout.write(serialized);
