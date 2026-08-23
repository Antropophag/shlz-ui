import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const archive = "shlz-design-source/raw/svg/UI Kit – Basic elements.zip";
const unzip = async (entry) =>
  (await execFileAsync("unzip", ["-p", archive, entry], { maxBuffer: 2 ** 20 }))
    .stdout;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

test("Notification raw authority preserves its exact sheet and three variants", async () => {
  const sheet = await readFile("shlz-design-source/raw/svg/Notification.svg");
  assert.equal(
    sha256(sheet),
    "47452a53ea7b6b123de3292d0a0deed656d7f3a5dfa138e7577429ed07abbf05",
  );
  const manifest = JSON.parse(
    await unzip("components/Notification/manifest.json"),
  );
  assert.equal(manifest.originalName, "Notification");
  assert.equal(manifest.figmaNodeId, "89:17043");
  assert.deepEqual(manifest.extractionWarnings, []);
  assert.equal(manifest.hasSourceErrors, false);
  assert.deepEqual(
    manifest.variants.map((variant) => ({
      name: variant.originalName,
      node: variant.figmaNodeId,
      width: variant.width,
      height: variant.height,
    })),
    [
      { name: "Type=Default", node: "89:17164", width: 384, height: 58 },
      { name: "Type=With button", node: "100:21562", width: 384, height: 58 },
      { name: "Type=Error", node: "89:17206", width: 384, height: 58 },
    ],
  );
  const references = JSON.parse(
    await readFile("apps/showcase/generated/source-references/manifest.json"),
  ).find(({ component }) => component === "notification");
  assert.equal(references.sourceSha256, sha256(sheet));
  assert.equal(references.references.length, 1);
  const reference = await readFile(
    `apps/showcase/generated/source-references/${references.references[0].file}`,
    "utf8",
  );
  const expected = sheet
    .toString("utf8")
    .replace(
      '<svg width="584" height="1802" viewBox="0 0 584 1802"',
      '<svg width="584" height="1342" viewBox="0 460 584 1342"',
    );
  assert.equal(
    reference,
    expected,
    "Notification crop must only change root viewport",
  );
});

test("Snackbar raw authority preserves six exact countdown frames", async () => {
  const archiveBytes = await readFile(archive);
  assert.equal(
    sha256(archiveBytes),
    "1c468cc4c1246aabfd0932451dedd5126cce2d24597b3141b50f8437146e3cf8",
  );
  const manifest = JSON.parse(await unzip("components/Snackbar/manifest.json"));
  assert.equal(manifest.originalName, "Snackbar");
  assert.equal(manifest.figmaNodeId, "424:37565");
  assert.deepEqual(manifest.extractionWarnings, []);
  assert.equal(manifest.hasSourceErrors, false);
  assert.deepEqual(
    manifest.variants.map((variant) => ({
      number: variant.variantProperties.Number,
      node: variant.figmaNodeId,
      width: variant.width,
      height: variant.height,
    })),
    [
      { number: "5", node: "424:37566", width: 384, height: 58 },
      { number: "4", node: "424:37572", width: 384, height: 58 },
      { number: "3", node: "424:37578", width: 384, height: 58 },
      { number: "2", node: "424:37584", width: 384, height: 58 },
      { number: "1", node: "424:37590", width: 384, height: 58 },
      { number: "0", node: "424:37596", width: 384, height: 58 },
    ],
  );
  const references = JSON.parse(
    await readFile("apps/showcase/generated/source-references/manifest.json"),
  ).find(({ component }) => component === "snackbar");
  assert.equal(references.sourceArchive, "UI Kit – Basic elements.zip");
  assert.equal(references.sourceArchiveSha256, sha256(archiveBytes));

  for (const [index, variant] of manifest.variants.entries()) {
    const source = await unzip(
      `components/Snackbar/variants/${variant.safeFilename}`,
    );
    const reference = await readFile(
      `apps/showcase/generated/source-references/${references.references[index].file}`,
      "utf8",
    );
    assert.equal(
      reference,
      source,
      `${variant.originalName} must be byte exact`,
    );
    assert.match(source, /^<svg width="384" height="58"/);
    assert.match(
      source,
      /<rect width="384" height="58" rx="29" fill="#0B1623"\/>/,
    );
  }
});
