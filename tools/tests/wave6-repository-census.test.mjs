import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import test from "node:test";

const roots = ["apps", "packages", "tools/fixtures"];
const executableExtensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".vue",
  ".php",
]);
const wave6Markup =
  /shlz-(?:dropdown|tooltip|popover|calendar|date-picker)|data-shlz-(?:tooltip|popover|calendar|date-picker)(?:-trigger)?|type\s*=\s*["']date["']|\stitle\s*=\s*["']/;
const classifiedFiles = new Set([
  "apps/showcase/src/fidelity.js",
  "apps/showcase/src/content-states.js",
  "apps/showcase/src/date-picker-consumer.js",
  "apps/showcase/src/date-picker-showcase.js",
  "apps/showcase/src/main.js",
  "packages/behaviors/src/calendar.ts",
  "packages/behaviors/src/date-picker.ts",
  "packages/behaviors/src/dropdown.ts",
  "packages/behaviors/src/popover.ts",
  "packages/behaviors/src/tooltip.ts",
  "tools/fixtures/plain-html.html",
]);

async function executableFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await executableFiles(path)));
    else if (executableExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

test("Wave 6 repository census rejects new unclassified executable markup", async () => {
  const files = (await Promise.all(roots.map(executableFiles))).flat();
  const matches = [];
  for (const path of files) {
    if (wave6Markup.test(await readFile(path, "utf8")))
      matches.push(relative(".", path));
  }
  const found = new Set(matches);
  assert.deepEqual(
    [...found].filter((path) => !classifiedFiles.has(path)),
    [],
    "unclassified Wave 6 markup found",
  );
  assert.deepEqual(
    [...classifiedFiles].filter((path) => !found.has(path)),
    [],
    "classified file no longer contains Wave 6 markup",
  );

  const showcase = await readFile("apps/showcase/src/main.js", "utf8");
  const fixture = await readFile("tools/fixtures/plain-html.html", "utf8");
  for (const id of [
    "dropdown-showcase-actions",
    "dropdown-modal-consumer",
    "tooltip-showcase-top",
    "popover-showcase-bottom",
  ])
    assert.match(showcase, new RegExp(`data-component-audit-id=["']${id}["']`));
  for (const id of [
    "dropdown-plain-html-consumer",
    "tooltip-plain-html-consumer",
    "popover-plain-html-consumer",
  ])
    assert.match(fixture, new RegExp(`data-component-audit-id=["']${id}["']`));
  assert.doesNotMatch(showcase + fixture, /type\s*=\s*["']date["']/);
});
