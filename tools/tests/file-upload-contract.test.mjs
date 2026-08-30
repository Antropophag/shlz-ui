import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

const read = (path) =>
  readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("File Upload publishes native markup, style and behavior contracts", async () => {
  const [css, source, index, packageJson, docs, fixture] = await Promise.all([
    read("packages/styles/components/file-upload.css"),
    read("packages/behaviors/src/file-upload.ts"),
    read("packages/behaviors/src/index.ts"),
    read("packages/behaviors/package.json"),
    read("docs/components/file-upload.md"),
    read("tools/fixtures/file-upload.html"),
  ]);
  assert.match(css, /\.shlz-file-upload/);
  assert.match(css, /data-drag-active/);
  assert.match(source, /shlz:file-upload-files/);
  assert.match(source, /DataTransfer/);
  assert.match(index, /FileUploadController/);
  assert.match(packageJson, /\.\/file-upload/);
  assert.match(docs, /consumer-owned/i);
  assert.match(fixture, /type="file"/);
  assert.match(fixture, /<label class="shlz-file-upload__surface"/);
  assert.match(fixture, /shlz-file-upload__icon/);
  assert.match(fixture, /Нажмите или перетащите файл в эту область/);
  assert.doesNotMatch(fixture, /shlz-file-upload__trigger/);
  assert.match(fixture, /aria-describedby="fixture-upload-error"/);
});

test("the raw Documents authority is locked and never generated", async () => {
  const report = await read("docs/component-audits/file-upload.json");
  assert.match(
    report,
    /b2be2ccea150ae49fb8363eae648bede428cace071d9783ce30f15c9c338bfdb/,
  );
  assert.match(report, /source-fact/);
  assert.match(report, /repository-decision/);
  const generator = await read("tools/generate.mjs");
  assert.doesNotMatch(generator, /writeFile\([^\n]*shlz-design-source/);
});
