import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const manifestPath =
  "docs/component-audits/messaging-history-planner-compositions.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sourceHashes = new Map([
  [
    "shlz-design-source/raw/svg/Messages.svg",
    "b61167bf011d15e5956d409d6746b5440cf4417522f1f14d6d27084bfb4b5357",
  ],
  [
    "shlz-design-source/raw/svg/History of changes.svg",
    "83d8c9ab89fa7c3677ed6d4105a150f55676bcf732160892b06773d6d4ac0e76",
  ],
  [
    "shlz-design-source/raw/svg/Planner.svg",
    "3f23135cbccf6cd8d1054feef90990d94ec647d8ef12de091ee6b76a022f2ed7",
  ],
]);
const censusRoots = ["apps", "packages", "tools", "docs/components"];
const sourceExtensions = new Set([
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
  ".md",
]);
const currentTestPath = relative(".", fileURLToPath(import.meta.url));
const scopeMatchers = {
  messaging:
    /(?:shlz-(?:messaging|messages|message-thread|conversation)|data-(?:shlz-)?(?:messaging|messages|message-thread)|customElements\.define\(\s*["']shlz-(?:messaging|messages|message-thread)|<(?:shlz-)?(?:messaging|messages|message-thread)\b|(?:class|function|const|let|var)\s+(?:Messaging|Messages|MessageThread|Conversation)\b|export\s*\{[^}]*\b(?:Messaging|Messages|MessageThread|Conversation)\b|(?:^|\/)(?:messaging|messages|message-thread|conversation)\.(?:html|js|jsx|mjs|cjs|ts|tsx|vue|php|css)$)/i,
  history:
    /(?:shlz-(?:change-history|history-of-changes|audit-history)|data-(?:shlz-)?(?:change-history|history-of-changes|audit-history)|customElements\.define\(\s*["']shlz-(?:change-history|history-of-changes|audit-history)|<(?:shlz-)?(?:change-history|history-of-changes|audit-history)\b|(?:class|function|const|let|var)\s+(?:ChangeHistory|HistoryOfChanges|AuditHistory)\b|export\s*\{[^}]*\b(?:ChangeHistory|HistoryOfChanges|AuditHistory)\b|(?:^|\/)(?:change-history|history-of-changes|audit-history)\.(?:html|js|jsx|mjs|cjs|ts|tsx|vue|php|css)$)/i,
  planner:
    /(?:shlz-(?:planner|event-planner|schedule-planner)|data-(?:shlz-)?(?:planner|event-planner|schedule-planner)|customElements\.define\(\s*["']shlz-(?:planner|event-planner|schedule-planner)|<(?:shlz-)?(?:planner|event-planner|schedule-planner)\b|(?:class|function|const|let|var)\s+(?:Planner|EventPlanner|SchedulePlanner)\b|export\s*\{[^}]*\b(?:Planner|EventPlanner|SchedulePlanner)\b|(?:^|\/)(?:planner|event-planner|schedule-planner)\.(?:html|js|jsx|mjs|cjs|ts|tsx|vue|php|css)$)/i,
};
const primitiveSignature =
  /\bshlz-(?:notification|snackbar|file-row|document-row|avatar)\b|data-component-audit-id\s*=\s*["'][^"']*(?:notification|snackbar|file-row|document-row|avatar)/i;
const genericTerminology =
  /\b(?:messaging|messages?|conversation|change history|history of changes|planner|scheduling|employees?|events?|attachments?|text editor)\b/i;

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else if (sourceExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const validateSubscopes = (candidate) => {
  for (const name of ["messaging", "history", "planner"]) {
    const scope = candidate.subscopes?.[name];
    for (const key of [
      "authority",
      "occurrences",
      "evidence",
      "limitations",
      "findings",
      "disposition",
    ])
      assert.ok(
        scope && Object.hasOwn(scope, key),
        `${name}.${key} is required`,
      );
  }
};

test("Wave 12 authoritative sources retain exact hashes and frame geometry", async () => {
  const expectedFrames = { messaging: 5, history: 1, planner: 7 };
  for (const [name, scope] of Object.entries(manifest.subscopes)) {
    const bytes = await readFile(scope.authority.source);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      sourceHashes.get(scope.authority.source),
    );
    const source = bytes.toString("utf8");
    assert.match(
      source,
      new RegExp(
        `width="${scope.authority.canvas.width}" height="${scope.authority.canvas.height}" viewBox="0 0 ${scope.authority.canvas.width} ${scope.authority.canvas.height}"`,
      ),
    );
    assert.equal(
      (source.match(/stroke="#253D98" stroke-dasharray="10 5"/g) ?? []).length,
      expectedFrames[name],
    );
    for (const frame of scope.authority.frames) {
      assert.match(
        source,
        new RegExp(
          `<rect[^>]*x="${frame.x}"[^>]*y="${frame.y}"[^>]*width="${frame.width}"[^>]*height="${frame.height}"[^>]*stroke="#253D98"[^>]*stroke-dasharray="10 5"`,
        ),
      );
    }
  }
});

test("Wave 12 manifest requires independent complete sub-scope ledgers", () => {
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.component, "messaging-history-planner-compositions");
  validateSubscopes(manifest);
  for (const name of ["messaging", "history", "planner"]) {
    const scope = manifest.subscopes[name];
    assert.deepEqual(scope.occurrences, []);
    assert.deepEqual(scope.findings, []);
    assert.equal(scope.disposition, "VERIFIED");
    for (const level of [
      "runtime-browser",
      "accessibility",
      "focused-visual",
      "consumer-integration",
      "responsive-content-stress",
    ])
      assert.match(scope.evidence[level], /^not-applicable:\s+\S/);
    const incomplete = JSON.parse(JSON.stringify(manifest));
    delete incomplete.subscopes[name].disposition;
    assert.throws(
      () => validateSubscopes(incomplete),
      new RegExp(`${name}\\.disposition`),
    );
  }
});

test("Wave 12 census proves independent higher-level absence", async () => {
  const files = (await Promise.all(censusRoots.map(filesBelow))).flat();
  const sources = await Promise.all(
    files
      .filter((path) => relative(".", path) !== currentTestPath)
      .map(async (path) => ({
        path: relative(".", path),
        source: await readFile(path, "utf8"),
      })),
  );
  const auditPaths = new Set(manifest.terminologyCensus.auditEvidencePaths);
  for (const [name, matcher] of Object.entries(scopeMatchers)) {
    const found = sources
      .filter(
        ({ path, source }) =>
          !auditPaths.has(path) && matcher.test(`${path}\n${source}`),
      )
      .map(({ path }) => path);
    assert.deepEqual(found, [], `${name} has unclassified surfaces`);
  }
  const primitivePaths = sources
    .filter(({ source }) => primitiveSignature.test(source))
    .map(({ path }) => path)
    .sort();
  assert.deepEqual(
    primitivePaths,
    manifest.primitiveDependencies.map(({ path }) => path).sort(),
  );
  const terminologyPaths = sources
    .filter(({ source }) => genericTerminology.test(source))
    .map(({ path }) => path);
  const classified = new Set([...auditPaths, ...primitivePaths]);
  assert.equal(
    terminologyPaths.length,
    manifest.terminologyCensus.totalPathCount,
  );
  assert.equal(
    primitivePaths.length,
    manifest.terminologyCensus.primitiveDependencyPathCount,
  );
  assert.equal(
    terminologyPaths.filter((path) => !classified.has(path)).length,
    manifest.terminologyCensus.unrelatedTerminologyPathCount,
  );
});

test("Wave 12 census rejects synthetic surfaces for every sub-scope", () => {
  const synthetic = {
    messaging: [
      "packages/components/messages.js",
      "export class MessageThread {}",
    ],
    history: [
      "apps/example/history-of-changes.vue",
      "export const HistoryOfChanges = {};",
    ],
    planner: [
      "packages/styles/planner.css",
      ".shlz-planner { display: grid; }",
    ],
  };
  for (const [name, [path, source]] of Object.entries(synthetic))
    assert.match(`${path}\n${source}`, scopeMatchers[name]);
});

test("Wave 12 does not inherit nested primitive evidence", () => {
  for (const scope of Object.values(manifest.subscopes)) {
    assert.match(scope.primitiveBoundary, /independent|does not certify/i);
    assert.equal(scope.evidence["source-integrity"].startsWith("pass:"), true);
    assert.equal(
      scope.evidence["structural-contract"].startsWith("pass:"),
      true,
    );
  }
});
