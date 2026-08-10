import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const basic = "shlz-design-source/raw/svg/UI Kit – Basic elements.zip";
const interfaceArchive =
  "shlz-design-source/raw/svg/UI Kit – Interface elements.zip";

async function manifest(archive, component) {
  const { stdout } = await execFileAsync("unzip", [
    "-p",
    archive,
    `components/${component}/manifest.json`,
  ]);
  return JSON.parse(stdout);
}

test("choice Component Sets retain their complete source matrices", async () => {
  const [checkbox, radio, switchControl] = await Promise.all([
    manifest(basic, "Checkbox"),
    manifest(basic, "Radio"),
    manifest(basic, "Switch"),
  ]);
  assert.equal(checkbox.variants.length, 20);
  assert.deepEqual(Object.keys(checkbox.componentPropertyDefinitions), [
    "Text#33:0",
    "State",
    "Label",
    "Checked",
    "Size",
    "Indeterminate",
  ]);
  assert.equal(
    checkbox.variants.filter(
      ({ variantProperties }) => variantProperties.Indeterminate === "True",
    ).length,
    4,
  );
  assert.equal(radio.variants.length, 8);
  assert.ok(
    radio.variants.every(({ variantProperties }) => !variantProperties),
  );
  assert.equal(switchControl.variants.length, 12);
  assert.deepEqual(
    new Set(
      switchControl.variants.map(
        ({ variantProperties }) => variantProperties.Size,
      ),
    ),
    new Set(["Meduim", "Small"]),
  );
});

test("Badge and Status remain separate source families", async () => {
  const [count, dot, requests, details] = await Promise.all([
    manifest(basic, "Badge-Count"),
    manifest(basic, "Badge-Dot"),
    manifest(interfaceArchive, "Status Обращения"),
    manifest(interfaceArchive, "Status Детали"),
  ]);
  assert.equal(count.variants.length, 12);
  assert.equal(dot.variants.length, 2);
  assert.equal(requests.variants.length, 9);
  assert.equal(details.variants.length, 6);
});

test("generated references preserve every choice and status source node", async () => {
  const generated = JSON.parse(
    await readFile(
      "apps/showcase/generated/source-references/manifest.json",
      "utf8",
    ),
  );
  for (const [component, count] of [
    ["checkbox", 20],
    ["radio", 8],
    ["switch", 12],
    ["badge-count", 12],
    ["badge-dot", 2],
    ["status-requests", 9],
    ["status-details", 6],
  ]) {
    const entry = generated.find(
      (item) => item.component === component && item.sourceVariantCount,
    );
    assert.equal(entry.sourceVariantCount, count);
    assert.equal(entry.references.length, count);
    assert.equal(
      new Set(entry.references.map(({ sourceNodeId }) => sourceNodeId)).size,
      count,
    );
  }
});

test("production CSS owns native choice appearance and source geometry", async () => {
  const [choice, statusBadge] = await Promise.all([
    readFile("packages/styles/components/choice.css", "utf8"),
    readFile("packages/styles/components/status-badge.css", "utf8"),
  ]);
  assert.match(choice, /appearance: none/);
  assert.match(choice, /inline-size: 20px/);
  assert.match(choice, /inline-size: 16px/);
  assert.match(choice, /--shlz-switch-width: 38px/);
  assert.match(choice, /--shlz-switch-width: 24px/);
  assert.doesNotMatch(choice, /--shlz-switch-width: 52px/);
  assert.match(statusBadge, /block-size: 16px/);
  assert.match(statusBadge, /block-size: 23px/);
  assert.match(statusBadge, /\.shlz-badge-dot/);
  assert.match(statusBadge, /--shlz-source-color-blue-blue-200-15/);
  assert.match(statusBadge, /--shlz-source-color-aditional-green-15/);
  assert.match(statusBadge, /222 117 61 \/ 15%/);
  assert.match(statusBadge, /\.shlz-status[\s\S]*white-space: nowrap/);
});
