import { open, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { runWithNvda, environment } from "./runtime.mjs";
import { workflows } from "./workflows.mjs";
import { assertMatrix, assertBrowser } from "./evidence.mjs";
import { validateSettings } from "./settings.mjs";

if (process.platform !== "win32")
  throw new Error("Run this local AT check with Windows Node.js");
const settingsRoot = path.resolve(
  fileURLToPath(new URL("../../test-results/", import.meta.url)),
);
const settingsPath = path.resolve(process.argv[2] ?? "");
if (
  path.extname(settingsPath) !== ".json" ||
  !settingsPath.startsWith(settingsRoot + path.sep)
)
  throw new Error(
    "Settings must be a JSON file inside this checkout's test-results directory",
  );
const resolvedSettingsPath = await realpath(settingsPath);
if (!resolvedSettingsPath.startsWith(settingsRoot + path.sep))
  throw new Error("Settings path escapes the ignored execution directory");
const settings = JSON.parse(await readFile(resolvedSettingsPath, "utf8"));
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
  for (const row of report.browsers) assertBrowser(row, report.environment);
}
