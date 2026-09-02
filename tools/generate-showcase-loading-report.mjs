import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
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
const run = promisify(execFile);
if (!commit) throw new Error("--commit is required");
const { stdout } = await run("git", [
  "rev-parse",
  "--verify",
  `${commit}^{commit}`,
]);
const resolvedCommit = stdout.trim();
if (resolvedCommit !== commit)
  throw new Error("--commit must be a full Git commit identity");
if (baselinePath) {
  const { stdout: headOutput } = await run("git", ["rev-parse", "HEAD"]);
  if (headOutput.trim() !== resolvedCommit)
    throw new Error("candidate commit does not match HEAD");
  try {
    await run("git", [
      "diff",
      "--quiet",
      "HEAD",
      "--",
      "apps/showcase",
      "package.json",
      "package-lock.json",
      "tools/generate-showcase-loading-report.mjs",
      "tools/lib/showcase-loading-report.mjs",
    ]);
  } catch {
    throw new Error("candidate build inputs contain uncommitted changes");
  }
  await run("npm", ["run", "build", "-w", "@shlz/showcase"]);
}
const report = await createShowcaseLoadingReport({
  dist,
  commit: resolvedCommit,
});
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
