import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import test from "node:test";

const roots = ["apps", "packages", "tools/fixtures"];
const extensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".php",
  ".css",
]);
const occurrence = /shlz-planner-schedule|data-shlz-planner-schedule/;

async function executableFiles(...directories) {
  const pending = [...directories];
  const files = [];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === "dist" || entry.name === "node_modules") continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (extensions.has(extname(entry.name))) files.push(path);
    }
  }
  return files;
}

test("Planner Schedule census classifies every executable implementation", async () => {
  const files = await executableFiles(...roots);
  const matches = [];
  for (const path of files)
    if (occurrence.test(await readFile(path, "utf8")))
      matches.push(relative(".", path).replaceAll("\\", "/"));
  assert.deepEqual(matches.sort(), [
    "apps/showcase/src/planner-schedule-showcase.js",
    "packages/styles/components/planner-schedule.css",
    "tools/fixtures/planner-schedule.html",
  ]);

  const manifest = JSON.parse(
    await readFile("docs/component-audits/planner-schedule.json", "utf8"),
  );
  assert.deepEqual(
    manifest.occurrences.map(({ id }) => id),
    [
      "planner-schedule-showcase-source",
      "planner-schedule-data-workspace",
      "planner-schedule-plain-html",
    ],
  );
  assert.equal(manifest.diagnosticOccurrenceCount, 0);
});
