import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("Dropdown menu families stay separate from Select", async () => {
  const { components } = JSON.parse(
    await readFile("design-source-index/components.json", "utf8"),
  );
  const ids = ["43:769", "45:1204", "110:15065"];
  const families = ids.map((id) =>
    components.find(({ figmaNodeId }) => figmaNodeId === id),
  );
  assert.deepEqual(
    families.map(({ variants }) => variants.length),
    [16, 10, 2],
  );
  assert.ok(
    families.every(({ extractionWarnings }) => extractionWarnings.length === 0),
  );
  assert.equal(
    components.find(({ figmaNodeId }) => figmaNodeId === "36:1106").variants
      .length,
    52,
  );
});

test("Dropdown exposes the authoritative Items=Srollbar composition", async () => {
  const [{ components }, css, docs, showcase] = await Promise.all([
    readFile("design-source-index/components.json", "utf8").then(JSON.parse),
    readFile("packages/styles/components/dropdown.css", "utf8"),
    readFile("docs/components/dropdown-source.md", "utf8"),
    readFile("apps/showcase/src/main.js", "utf8"),
  ]);
  const dropdown = components.find(
    ({ figmaNodeId }) => figmaNodeId === "45:1204",
  );
  const scrollbar = dropdown.variants.find(
    ({ figmaNodeId }) => figmaNodeId === "45:1203",
  );
  assert.deepEqual(scrollbar.properties, { Items: "Srollbar" });
  assert.equal(
    scrollbar.archivePath,
    "components/Dropdown 2/variants/Items=Srollbar.svg",
  );

  assert.match(css, /\.shlz-dropdown__menu--scrollable/);
  assert.match(css, /block-size: 340px/);
  assert.match(css, /max-block-size: 340px/);
  assert.match(css, /\.shlz-dropdown__scroll-region/);
  assert.match(css, /overflow-y: auto/);
  assert.match(css, /\.shlz-dropdown__scrollbar/);
  assert.match(css, /inline-size: 6px/);
  assert.match(css, /block-size: 80px/);
  assert.match(css, /inset-inline-end: 4px/);
  assert.match(css, /border-radius: 3px/);
  assert.match(docs, /Items=Srollbar.*45:1203/);
  assert.match(showcase, /data-shlz-dropdown-scrollable-fixture/);
  assert.match(showcase, /shlz-dropdown__menu--scrollable/);
  assert.match(showcase, /shlz-dropdown__scroll-region/);
  assert.match(showcase, /shlz-dropdown__scrollbar/);
});
