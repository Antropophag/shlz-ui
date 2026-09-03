import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const exec = promisify(execFile);
const workflow = (name) =>
  readFile(path.join(root, ".github", "workflows", name), "utf8");

test("release preparation can only create a reviewable version PR", async () => {
  const source = await workflow("release-prepare.yml");
  assert.match(source, /push:\s*\n\s*branches: \[main\]/);
  assert.match(
    source,
    /changesets\/action@8488615a623b1b9c987934bb89eae8af6a946ac1/,
  );
  assert.match(source, /version-script: npm run release:version/);
  assert.doesNotMatch(source, /release:registry|npm publish|packages: write/);
});

test("package publication and rollback require protected manual authority", async () => {
  const source = await workflow("release.yml");
  assert.match(source, /workflow_dispatch:/);
  assert.doesNotMatch(source, /pull_request:|push:/);
  assert.match(source, /environment:\s*release/);
  assert.match(source, /refs\/heads\/main/);
  assert.match(source, /cancel-in-progress: false/);
  assert.match(source, /release-registry\.mjs publish/);
  assert.match(source, /release-registry\.mjs verify/);
  assert.match(source, /release-registry\.mjs promote/);
  assert.match(source, /release-registry\.mjs rollback/);
  assert.doesNotMatch(source, /npm unpublish|release-registry\.mjs delete/);
});

test("pull-request CI validates release policy and intent without credentials", async () => {
  const source = await workflow("ci.yml");
  assert.match(source, /npm run release:policy/);
  assert.match(source, /npm run release:intent/);
  assert.match(source, /github\.event_name == 'pull_request'/);
  assert.doesNotMatch(source, /GITLAB_NPM_PUBLISH_TOKEN/);
});

test("registry consumer mode fails before network access without configuration", async () => {
  await assert.rejects(
    exec(
      "node",
      ["tools/package-consumer-smoke.mjs", "--manifest", "missing.json"],
      {
        cwd: root,
        env: { PATH: process.env.PATH },
      },
    ),
    (error) =>
      /registry configuration is missing/.test(error.stderr) &&
      /GITLAB_NPM_READ_TOKEN/.test(error.stderr) &&
      !/ENOTFOUND|ECONNREFUSED/.test(error.stderr),
  );
});
