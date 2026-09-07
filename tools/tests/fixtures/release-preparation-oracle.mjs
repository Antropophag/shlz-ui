// Explicit live-operation evidence; never run as an offline unit test.
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const failedFixture = new URL(
  "./release-preparation-failed.json",
  import.meta.url,
);
const target = path.resolve(process.argv[2] ?? "");
assert(
  target === path.resolve(root) || target === fileURLToPath(failedFixture),
  "target must be this checkout or the fixed failed-attempt fixture",
);
const candidate = target === path.resolve(root);
const selection = candidate
  ? {
      run: 33957916744,
      attempt: 2,
      source: "b1cef24b70822c01de9a84a4f3bc14a09c12feaf",
    }
  : JSON.parse(readFileSync(failedFixture, "utf8"));
const api = (path) =>
  JSON.parse(
    execFileSync("/usr/bin/gh", ["api", `repos/Antropophag/shlz-ui/${path}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );

const run = api(`actions/runs/${selection.run}/attempts/${selection.attempt}`);
assert.equal(run.id, 33957916744);
assert.equal(run.run_attempt, selection.attempt);
assert.equal(run.head_sha, selection.source);
assert.equal(run.path, ".github/workflows/release-prepare.yml");
assert.equal(run.conclusion, "success", "preparation attempt must succeed");

const permissions = api("actions/permissions/workflow");
assert.equal(permissions.default_workflow_permissions, "read");
assert.equal(permissions.can_approve_pull_request_reviews, true);
const pr = api("pulls/80");
assert.equal(pr.base.ref, "main");
assert.equal(pr.head.ref, "changeset-release/main");
assert.equal(pr.state, "open");
assert.equal(pr.merged, false);
const head = "847b9e16ee4eb75dfa6607cbd0e3dca6dcbc2b4f";
assert.equal(
  pr.head.sha,
  head,
  "re-assess evidence if the version PR advances",
);
for (const name of ["tokens", "icons", "styles", "behaviors"]) {
  const file = (path) =>
    Buffer.from(
      api(`contents/${path}?ref=${head}`).content,
      "base64",
    ).toString();
  const manifest = JSON.parse(file(`packages/${name}/package.json`));
  assert.equal(manifest.name, `@shlz/${name}`);
  assert.equal(manifest.version, "0.1.1");
  for (const [dependency, version] of Object.entries(
    manifest.dependencies ?? {},
  ))
    if (dependency.startsWith("@shlz/")) assert.equal(version, "0.1.1");
  assert.match(file(`packages/${name}/CHANGELOG.md`), /## 0\.1\.1\b/);
}
console.log(
  "PASS: exact preparation attempt, read defaults and unmerged coherent version PR",
);
