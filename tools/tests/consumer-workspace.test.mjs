import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("consumer workspace keeps Select native and application-owned", async () => {
  const [workspace, behaviorExports, behaviorPackage] = await Promise.all([
    read("apps/showcase/src/consumer-workspace.js"),
    read("packages/behaviors/src/index.ts"),
    read("packages/behaviors/package.json"),
  ]);

  assert.match(workspace, /<select class="shlz-select"/);
  assert.match(workspace, /data-workspace-status-filter/);
  assert.match(workspace, /addEventListener\("input"/);
  assert.match(workspace, /addEventListener\(\s*"click"/);
  assert.match(workspace, /window\.AbortController/);
  assert.doesNotMatch(workspace, /role="(?:combobox|listbox|option)"/);
  assert.doesNotMatch(workspace, /enhanceSelect|SelectController/);
  assert.doesNotMatch(behaviorExports, /from "\.\/select/);
  assert.equal(JSON.parse(behaviorPackage).exports["./select"], undefined);
});

test("ServiceDesk evidence remains non-authoritative and verifiable", async () => {
  const [documentation, manifestSource] = await Promise.all([
    read("docs/consumer-evidence/servicedesk/README.md"),
    read("docs/consumer-evidence/servicedesk/manifest.json"),
  ]);
  const manifest = JSON.parse(manifestSource);

  assert.match(documentation, /not.*design authority/i);
  assert.match(documentation, /must not be copied/i);
  assert.equal(manifest.classification, "consumer-evidence-non-authoritative");
  assert.equal(manifest.hashAlgorithm, "sha256");
  assert.equal(Object.keys(manifest.files).length, 12);
  for (const hash of Object.values(manifest.files)) {
    assert.match(hash, /^[a-f0-9]{64}$/);
  }
});
