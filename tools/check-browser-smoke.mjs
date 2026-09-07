import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const target = path.resolve(process.argv[2] ?? repoRoot);
const config = statSync(target).isDirectory()
  ? path.join(target, "playwright.smoke.config.js")
  : target;
const report = JSON.parse(
  execFileSync(
    process.execPath,
    [
      path.join(repoRoot, "node_modules/@playwright/test/cli.js"),
      "test",
      "--config",
      config,
      "--list",
      "--reporter=json",
    ],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  ),
);
const expected = [
  "Input keeps native value, events, focus, disabled and programmatic updates",
  "Checkbox uses one native lifecycle for pointer, Space, mixed and workspace state",
  "Select keyboard lifecycle opens, navigates, selects and restores focus",
  "modal uses native focus containment, Escape and return focus",
  "opens, synchronizes state, dismisses and restores focus",
  "Date Picker passes automated accessibility checks and restores focus after keyboard dismissal and commit",
  "native selection, file drops, filtering, disabled and consumer rendering work",
].sort();
const discovered = new Map();
function visit(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      assert.ok(
        spec.tags.includes("smoke"),
        `untagged smoke test: ${spec.title}`,
      );
      for (const test of spec.tests) {
        const titles = discovered.get(test.projectName) ?? [];
        titles.push(spec.title);
        discovered.set(test.projectName, titles);
      }
    }
    visit(suite.suites ?? []);
  }
}
assert.deepEqual(report.errors, []);
visit(report.suites);
assert.deepEqual([...discovered.keys()].sort(), [
  "chromium",
  "firefox",
  "webkit",
]);
for (const [browser, titles] of discovered) {
  assert.deepEqual(
    titles.sort(),
    expected,
    `smoke scenario identities: ${browser}`,
  );
}
console.log(
  "Smoke discovery passed: 7 shared scenarios × 3 browsers = 21 tests.",
);
