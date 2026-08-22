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
const wave7Markup =
  /shlz-(?:modal|drawer)|data-shlz-(?:modal|drawer)|<dialog(?:\s|>)|HTMLDialogElement|showModal\s*\(/;
const classifiedFiles = new Set([
  "apps/showcase/src/consumer-workspace.js",
  "apps/showcase/src/fidelity.js",
  "apps/showcase/src/main.js",
  "packages/behaviors/src/drawer.ts",
  "packages/behaviors/src/internal/native-dialog.ts",
  "packages/behaviors/src/modal.ts",
  "tools/fixtures/plain-html.html",
]);
const auditIdsByFile = new Map([
  [
    "apps/showcase/src/main.js",
    ["modal-showcase-structured", "modal-showcase-compact", "drawer-showcase"],
  ],
  ["apps/showcase/src/consumer-workspace.js", ["drawer-data-workspace"]],
  ["tools/fixtures/plain-html.html", ["modal-plain-html", "drawer-plain-html"]],
]);

const unclassifiedPaths = (found) =>
  [...found].filter((path) => !classifiedFiles.has(path));
const matchingPaths = (sources) =>
  new Set(
    sources
      .filter(({ source }) => wave7Markup.test(source))
      .map(({ path }) => path),
  );

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

test("Wave 7 repository census rejects unclassified executable overlay markup", async () => {
  const files = (await Promise.all(roots.map(executableFiles))).flat();
  const sources = await Promise.all(
    files.map(async (path) => ({
      path: relative(".", path),
      source: await readFile(path, "utf8"),
    })),
  );
  const found = matchingPaths(sources);
  assert.deepEqual(
    unclassifiedPaths(found),
    [],
    "unclassified Wave 7 overlay markup found",
  );
  assert.deepEqual(
    [...classifiedFiles].filter((path) => !found.has(path)),
    [],
    "classified file no longer contains Wave 7 overlay markup",
  );

  for (const [path, auditIds] of auditIdsByFile) {
    const source = await readFile(path, "utf8");
    for (const id of auditIds)
      assert.match(source, new RegExp(`data-component-audit-id=["']${id}["']`));
  }
  const showcase = await readFile("apps/showcase/src/main.js", "utf8");
  assert.match(showcase, /\["success", "warning", "error"\]/);
  assert.match(
    showcase,
    /data-component-audit-id=\\?"modal-showcase-\$\{state\}\\?"/,
  );
});

test("Wave 7 repository census fails for a third unclassified consumer", () => {
  const found = matchingPaths([
    {
      path: "apps/third-consumer/modal.php",
      source:
        '<dialog data-shlz-modal aria-labelledby="title"><h2 id="title">Third consumer</h2></dialog>',
    },
  ]);
  assert.deepEqual(unclassifiedPaths(found), ["apps/third-consumer/modal.php"]);
});
