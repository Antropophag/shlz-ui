import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const manifestPath = "docs/component-audits/sidebar-application-shell.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceHashes = new Map([
  [
    "shlz-design-source/raw/svg/Sidebar.svg",
    "92ec7b5992b3f05548f5bb937f856746c4abbd27c675bff3ea37e8ddbdfc96a0",
  ],
  [
    "shlz-design-source/raw/svg/Header.svg",
    "8af415f1b5a499d89b189372837c4a6c584b05471753688550187832ca672392",
  ],
]);
const executableRoots = ["apps", "packages", "tools/fixtures"];
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
  ".css",
]);
const shellSignature =
  /shlz-docs-shell|shlz-docs-sidebar|data-shlz-shell-search|application[-_ ]shell|app[-_ ]shell|\bsidebar\b|<aside\b/i;
const classifiedSourceFiles = new Set(
  manifest.sourceOccurrences.map(({ path }) => path),
);

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else if (executableExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

function matchingPaths(sources) {
  return new Set(
    sources
      .filter(({ source }) => shellSignature.test(source))
      .map(({ path }) => path),
  );
}

function unclassifiedPaths(found) {
  return [...found].filter((path) => !classifiedSourceFiles.has(path));
}

function countToken(source, token) {
  return source.split(token).length - 1;
}

test("Wave 9 authoritative sources retain exact hashes and critical geometry", async () => {
  for (const [path, expected] of sourceHashes) {
    const bytes = await readFile(path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }

  const sidebar = await readFile(
    "shlz-design-source/raw/svg/Sidebar.svg",
    "utf8",
  );
  assert.match(sidebar, /width="914" height="1604" viewBox="0 0 914 1604"/);
  assert.match(
    sidebar,
    /width="72" height="1000" transform="translate\(421 500\)" fill="#0B1623"/,
  );
  assert.match(
    sidebar,
    /width="301" height="1000" transform="translate\(100 500\)" fill="#0B1623"/,
  );
  assert.match(
    sidebar,
    /x="113" y="1144" width="275" height="48" rx="8" fill="white" fill-opacity="0\.1"/,
  );

  const header = await readFile(
    "shlz-design-source/raw/svg/Header.svg",
    "utf8",
  );
  assert.match(header, /width="1528" height="724" viewBox="0 0 1528 724"/);
  assert.match(header, /x="1173" y="504" width="48" height="48" rx="24"/);
  assert.match(header, /x="80" y="596" width="48" height="48" rx="24"/);
});

test("Wave 9 schema-v2 manifest records the bounded source-census contract", async () => {
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.component, "sidebar-application-shell");
  assert.deepEqual(Object.keys(manifest.stateLedgers).sort(), [
    "header",
    "sidebar",
  ]);
  assert.deepEqual(manifest.stateLedgers.sidebar, [
    "opened",
    "closed",
    "active-item",
    "default-item",
  ]);
  assert.deepEqual(manifest.stateLedgers.header, [
    "default",
    "hover",
    "typing",
    "filled",
  ]);
  assert.deepEqual(manifest.occurrences, [
    {
      id: "sidebar-application-shell-showcase",
      kind: "live-consumer",
    },
  ]);
  assert.deepEqual(
    manifest.sourceOccurrences.map(({ path }) => path).sort(),
    [...classifiedSourceFiles].sort(),
  );
  assert.equal(manifest.diagnosticOccurrenceCount, 0);
  assert.deepEqual(Object.keys(manifest.evidence).sort(), [
    "accessibility",
    "consumer-integration",
    "focused-visual",
    "responsive-content-stress",
    "runtime-browser",
    "source-integrity",
    "structural-contract",
  ]);
  for (const status of Object.values(manifest.evidence))
    assert.match(status, /^(?:pass|not-applicable):\s+\S/);
  assert.deepEqual(
    new Set(manifest.sourceClaims.map(({ classification }) => classification)),
    new Set([
      "source-fact",
      "derived-pattern",
      "repository-decision",
      "assumption",
    ]),
  );
});

test("Wave 9 repository census classifies every bounded executable shell", async () => {
  const files = (await Promise.all(executableRoots.map(filesBelow))).flat();
  const sources = await Promise.all(
    files.map(async (path) => ({
      path: relative(".", path),
      source: await readFile(path, "utf8"),
    })),
  );
  const found = matchingPaths(sources);
  assert.deepEqual(unclassifiedPaths(found), []);
  assert.deepEqual(
    [...classifiedSourceFiles].filter((path) => !found.has(path)),
    [],
  );

  const liveConsumer = await readFile("apps/showcase/src/main.js", "utf8");
  assert.equal(countToken(liveConsumer, 'className = "shlz-docs-shell"'), 1);
  assert.equal(countToken(liveConsumer, 'className = "shlz-docs-sidebar"'), 1);
  assert.equal(countToken(liveConsumer, '<header class="shlz-hero">'), 1);
});

test("Wave 9 repository census rejects a synthetic unclassified shell", () => {
  const found = matchingPaths([
    {
      path: "apps/third-consumer/shell.php",
      source: '<aside class="third-party-sidebar">Navigation</aside>',
    },
  ]);
  assert.deepEqual(unclassifiedPaths(found), ["apps/third-consumer/shell.php"]);
});

test("Wave 9 built-DOM census is exact and mutation-sensitive", async () => {
  await execFileAsync("npm", ["run", "build", "-w", "@shlz/showcase"], {
    maxBuffer: 10 * 1024 * 1024,
  });
  const builtFiles = await filesBelow("apps/showcase/dist");
  const builtSource = (
    await Promise.all(builtFiles.map((path) => readFile(path, "utf8")))
  ).join("\n");
  const assertBuiltCensus = (source) => {
    assert.equal(countToken(source, 'className="shlz-docs-shell"'), 1);
    assert.equal(countToken(source, 'className="shlz-docs-sidebar"'), 1);
    assert.equal(countToken(source, '<header class="shlz-hero">'), 1);
  };

  assertBuiltCensus(builtSource);
  assert.throws(
    () =>
      assertBuiltCensus(
        `${builtSource}<div className="shlz-docs-shell"></div>`,
      ),
    assert.AssertionError,
  );
});
