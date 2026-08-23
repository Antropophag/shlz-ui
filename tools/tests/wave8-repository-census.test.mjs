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
const feedbackMarkup =
  /shlz-(?:notification|snackbar)|data-(?:notification|snackbar)/;
const classifiedFiles = new Set([
  "apps/showcase/src/component-docs.js",
  "apps/showcase/src/fidelity.js",
  "apps/showcase/src/main.js",
  "apps/showcase/src/notification-consumer.js",
  "apps/showcase/src/snackbar-contours.js",
  "tools/fixtures/plain-html.html",
]);
const auditIdsByFile = new Map([
  [
    "apps/showcase/src/notification-consumer.js",
    [
      "notification-showcase-dismissible",
      "notification-showcase-action",
      "notification-content-stress",
      "snackbar-showcase-action",
      "snackbar-content-stress",
    ],
  ],
  ["tools/fixtures/plain-html.html", ["notification-plain-html"]],
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
const matchingPaths = (sources) =>
  new Set(
    sources
      .filter(({ source }) => feedbackMarkup.test(source))
      .map(({ path }) => path),
  );
const unclassifiedPaths = (found) =>
  [...found].filter((path) => !classifiedFiles.has(path));

test("Wave 8 repository census rejects unclassified executable feedback markup", async () => {
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
    "unclassified Wave 8 feedback markup found",
  );
  assert.deepEqual(
    [...classifiedFiles].filter((path) => !found.has(path)),
    [],
    "classified file no longer contains Wave 8 feedback markup",
  );
  for (const [path, auditIds] of auditIdsByFile) {
    const source = await readFile(path, "utf8");
    for (const id of auditIds)
      assert.match(source, new RegExp(`data-component-audit-id=["']${id}["']`));
  }
});

test("Wave 8 repository census fails for an unclassified consumer", () => {
  const found = matchingPaths([
    {
      path: "apps/third-consumer/toast.php",
      source: '<div class="shlz-notification">Saved</div>',
    },
  ]);
  assert.deepEqual(unclassifiedPaths(found), ["apps/third-consumer/toast.php"]);
});
