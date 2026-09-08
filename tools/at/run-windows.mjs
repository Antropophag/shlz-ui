import { open, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { runWithNvda, environment } from "./runtime.mjs";
import { workflows } from "./workflows.mjs";
import { assertMatrix } from "./evidence.mjs";
import { validateSettings } from "./settings.mjs";

if (process.platform !== "win32")
  throw new Error("Run this local AT check with Windows Node.js");
const settings = JSON.parse(await readFile(process.argv[2], "utf8"));
validateSettings(settings);
for (const field of [
  "tempRoot",
  "chrome",
  "firefox",
  "geckodriver",
  "nvda",
  "sampleFile",
]) {
  settings[field] = await realpath(settings[field]);
}
settings.output = path.join(settings.tempRoot, path.basename(settings.output));
const targets = validateSettings(settings);
// Claim a new result file before opening any desktop application.
const output = await open(settings.output, "wx");
const report = {
  schemaVersion: 1,
  phase: settings.phase ?? "verification",
  sourceCommit: settings.sourceCommit,
  measuredAt: new Date().toISOString(),
  environment: await environment(),
  browsers: [],
};
try {
  for (const browser of targets) {
    console.log("RUN", browser);
    try {
      const result = await runWithNvda(browser, settings, workflows);
      report.browsers.push(result);
      report.environment.nvda ??= result.nvdaVersion;
    } catch (error) {
      report.browsers.push({
        browser,
        workflows: workflows.map(({ id }) => ({
          id,
          status: "blocked",
          checkpoints: [],
          error: error.message,
        })),
      });
      console.log("BLOCKED", browser, error.message);
    }
  }
  await output.writeFile(JSON.stringify(report, null, 2));
} finally {
  await output.close();
}
if (targets.length === 2) {
  console.log("MATRIX", assertMatrix(report), "workflow passes");
} else {
  console.log("PARTIAL MATRIX", targets.join(","));
  if (
    report.browsers.some((row) =>
      row.workflows.some((flow) => flow.status !== "pass"),
    )
  ) {
    process.exitCode = 1;
  }
}
