import assert from "node:assert/strict";
import test from "node:test";
import { Linter } from "eslint";
import config from "../../eslint.config.js";

const ruleId = "shlz/no-hardcoded-census-counts";
const lint = (source) =>
  new Linter()
    .verify(source, config, { filename: "tools/tests/example.mjs" })
    .filter((diagnostic) => diagnostic.ruleId === ruleId);

test("lint rejects duplicated numeric census expectations through real configuration", () => {
  for (const source of [
    "expect(manifest.primitiveDependencies).toHaveLength(15);",
    "assert.equal(manifest.primitiveDependencies.length, 15);",
    'expect(manifest["primitiveDependencies"]).toHaveLength(11);',
    "expect(manifest.primitiveDependencies.length).toBe(15);",
    "assert.strictEqual(15, manifest.terminologyCensus.primitiveDependencyPathCount);",
  ]) {
    const diagnostics = lint(source);
    assert.equal(diagnostics.length, 1, source);
    assert.equal(diagnostics[0].severity, 2);
  }
});

test("lint preserves independently measured census checks and actual fixed contracts", () => {
  for (const source of [
    "assert.equal(scannedPaths.size, manifest.terminologyCensus.primitiveDependencyPathCount);",
    "expect(manifest.primitiveDependencies).toHaveLength(scannedPaths.length);",
    "assert.deepEqual(scannedPaths, manifest.primitiveDependencies.map(item => item.path));",
    "expect(manifest.occurrences).toEqual([]);",
    "expect(iconWidth).toBe(38);",
    "expect(states).toHaveLength(3);",
  ]) {
    assert.deepEqual(lint(source), [], source);
  }
});
