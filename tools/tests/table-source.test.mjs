import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readZipEntry } from "../lib/source-zip.mjs";

const read = (path) => readFileSync(path, "utf8");
const matrix = JSON.parse(
  read("docs/component-audits/table-source-matrix.json"),
);
const unzipJson = (archive, path) =>
  JSON.parse(readZipEntry(readFileSync(archive), path).toString("utf8"));
const sha256 = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

test("matrix pins both original SVG authorities without modifying their evidence", () => {
  for (const source of Object.values(matrix.authority)) {
    assert.equal(sha256(source.file), source.sha256);
    const root = read(source.file).match(/<svg width="(\d+)" height="(\d+)"/);
    assert.deepEqual(root?.slice(1).map(Number), [source.width, source.height]);
  }
  assert.equal(
    matrix.evidenceClasses["original-svg-fact"].includes("original SVG"),
    true,
  );
  assert.equal(
    matrix.evidenceClasses["derived-extraction"].includes("ZIP manifest"),
    true,
  );
});

test("all 49 cells map exactly to the Basic elements extraction", () => {
  const source = unzipJson(
    "shlz-design-source/raw/svg/UI Kit – Basic elements.zip",
    "components/Table Cell/manifest.json",
  );
  assert.equal(source.figmaNodeId, "52:3360");
  assert.equal(source.variants.length, 49);
  const actual = source.variants.map((variant) => [
    variant.sourceOrder,
    variant.variantProperties.Type,
    variant.variantProperties.State,
    variant.variantProperties.Editable === "True",
    variant.variantProperties.Cell,
    variant.variantProperties.Filled === "True",
    variant.width,
    variant.height,
  ]);
  assert.deepEqual(matrix.cellVariants, actual);
  assert.deepEqual(
    actual.filter((variant) => variant[7] === 154).map((variant) => variant[0]),
    [42, 43, 49],
  );
  assert.equal(new Set(actual.map((variant) => variant[0])).size, 49);
});

test("sorter, filter and pagination preserve exact source axes and geometry", () => {
  const archive = "shlz-design-source/raw/svg/UI Kit – Basic elements.zip";
  const extract = (name) =>
    unzipJson(archive, `components/${name}/manifest.json`);
  const compact = (manifest, property) =>
    manifest.variants.map((variant) => ({
      name: variant.variantProperties[property],
      width: variant.width,
      height: variant.height,
    }));
  assert.deepEqual(matrix.sorter, compact(extract("Sorter"), "Type"));
  assert.deepEqual(matrix.filter, compact(extract("Filter"), "State"));
  const pagination = extract("Pagination Btn");
  assert.equal(pagination.variants.length, 20);
  assert.deepEqual(
    new Set(pagination.variants.map((v) => v.variantProperties.Type)),
    new Set(matrix.pagination.types),
  );
  assert.deepEqual(
    new Set(pagination.variants.map((v) => v.variantProperties.State)),
    new Set(matrix.pagination.states),
  );
  assert.equal(
    pagination.variants.every((v) => v.width === 40 && v.height === 40),
    true,
  );
  const group = extract("Pagination");
  assert.deepEqual(
    [group.width, group.height],
    [matrix.pagination.compositionWidth, matrix.pagination.compositionHeight],
  );
});

test("nine domain families account for all 31 extracted variants", () => {
  const archive = "shlz-design-source/raw/svg/UI Kit – Interface elements.zip";
  let count = 0;
  for (const composition of matrix.domainCompositions) {
    const source = unzipJson(
      archive,
      `components/${composition.sourceName}/manifest.json`,
    );
    assert.equal(source.originalName, composition.sourceName);
    assert.equal(source.variants.length, composition.variantCount);
    assert.deepEqual(
      [...new Set(source.variants.map((v) => v.width))].sort((a, b) => a - b),
      composition.widths,
    );
    count += source.variants.length;
  }
  assert.equal(matrix.domainCompositions.length, 9);
  assert.equal(count, 31);
});

test("showcase specimens transfer source-shaped inert native tables", async () => {
  const { tableCompositionsMarkup } =
    await import("../../apps/showcase/src/table-compositions.js");
  const markup = tableCompositionsMarkup((name) => `/icons/${name}.svg`);
  assert.equal(
    (markup.match(/<table class="shlz-table" inert aria-hidden="true"/g) ?? [])
      .length,
    10,
  );
  assert.equal(
    (markup.match(/data-table-source-scroll tabindex="0"/g) ?? []).length,
    10,
  );
  assert.equal((markup.match(/<table /g) ?? []).length, 10);
  assert.equal(
    (markup.match(/data-component-audit-id="table-composition-/g) ?? []).length,
    10,
  );
  assert.equal(
    (markup.match(/data-table-composition-variant=/g) ?? []).length,
    31,
  );
  assert.match(markup, /№ обращения/);
  assert.match(markup, /Привязанные профили/);
  assert.match(markup, /Максимальная длина/);
  assert.match(markup, /class="shlz-status"/);
  assert.match(markup, /class="shlz-switch__input"/);
  assert.doesNotMatch(markup, /shlz-switch__input--sm/);
  assert.match(markup, /flag-filled/);
  assert.match(markup, /data-source-state="dots-pressed"/);
  assert.match(markup, /class="shlz-table__priority"/);
  for (const composition of matrix.domainCompositions) {
    const selectors = composition.selectors ?? [
      `table-composition-${composition.slug}`,
    ];
    for (const selector of selectors)
      assert.match(markup, new RegExp(selector));
  }
});

test("table companion edit and dots paths retain original Icons.svg geometry", async () => {
  const { tableEditIcon, tableMoreIcon } =
    await import("../../apps/showcase/src/table-parts.js");
  const original = read("shlz-design-source/raw/svg/Icons.svg");
  for (const markup of [tableEditIcon(), tableMoreIcon()]) {
    const paths = [...markup.matchAll(/\bd="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.ok(paths.length > 0);
    for (const geometry of paths)
      assert.ok(original.includes(`d="${geometry}"`));
  }
});

test("visible table typography is 15px, not the hidden checkbox-label 14px signature", () => {
  const inventory = JSON.parse(
    read("shlz-design-source/raw/typography-UI Kit – Basic elements.json"),
  );
  const text = inventory.sourceReferences.filter((node) =>
    node.hierarchyPath.some(
      (part) =>
        part ===
        "Type=Text, State=Default, Editable=False, Cell=Row, Filled=True",
    ),
  );
  assert.equal(text.length, 1);
  assert.equal(text[0].fontSize, 15);
  assert.equal(text[0].fontName.family, "Golos Text");
  assert.equal(text[0].letterSpacing.value, -1);
  assert.ok(Math.abs(text[0].lineHeight.value - 130) < 0.001);
});

test("original table header geometry overrides conflicting Figma metadata", () => {
  const archive = readFileSync(
    "shlz-design-source/raw/svg/UI Kit – Interface elements.zip",
  );
  const manifest = JSON.parse(
    readZipEntry(archive, "components/Table Обращения/manifest.json"),
  );
  const header = manifest.variants[0];
  assert.equal(header.height, 48);
  const exported = readZipEntry(
    archive,
    `components/Table Обращения/${header.filename}`,
  ).toString();
  assert.match(exported, /<svg width="1304" height="50"/);
  assert.match(
    read("shlz-design-source/raw/svg/Table.svg"),
    /M100 545H116V595H100V545Z/,
  );
});
