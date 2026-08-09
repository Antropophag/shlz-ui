import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const normalizedRoot = path.join(root, "packages/icons/normalized");

const hash = (value) => createHash("sha256").update(value).digest("hex");
const geometryHash = (svg) =>
  hash(
    svg
      .replace(/<defs\b[\s\S]*?<\/defs>/g, "")
      .replace(/<svg\b[^>]*>/, "<svg>")
      .replace(
        /\s(?:fill|stroke|id|class|style|opacity|fill-opacity|stroke-opacity)=["'][^"']*["']/g,
        "",
      )
      .replace(/url\(#[^)]+\)/g, "url(#reference)")
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .trim(),
  );

const paintedElements = (svg) =>
  [
    ...svg.matchAll(
      /<(svg|g|path|rect|circle|ellipse|line|polyline|polygon|use)\b([^>]*)>/g,
    ),
  ].map(([, tag, source]) => ({
    tag,
    attributes: Object.fromEntries(
      [...source.matchAll(/([:\w-]+)=["']([^"']*)["']/g)].map(
        ([, name, value]) => [name, value],
      ),
    ),
  }));

async function filesBelow(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await filesBelow(entryPath)));
    else result.push(entryPath);
  }
  return result.sort();
}

test("basic icon normalization covers all raw sources with intact hashes", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(normalizedRoot, "manifest.json"), "utf8"),
  );
  const analysis = JSON.parse(
    await readFile(path.join(normalizedRoot, "analysis.json"), "utf8"),
  );

  assert.equal(analysis.summary.sourceSvgCount, 133);
  assert.equal(manifest.length, 119);

  const manifestedSources = manifest
    .flatMap((icon) => icon.variants)
    .flatMap((variant) => variant.sources);
  assert.equal(manifestedSources.length, 133);
  assert.equal(
    new Set(manifestedSources.map((source) => source.path)).size,
    133,
  );

  for (const source of analysis.sources) {
    const absolutePath = path.join(root, source.sourcePath);
    assert.equal(hash(await readFile(absolutePath)), source.sourceSha256);
  }
});

test("normalized SVG paints follow manifest policy", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(normalizedRoot, "manifest.json"), "utf8"),
  );
  for (const icon of manifest) {
    for (const variant of icon.variants) {
      const svg = await readFile(
        path.join(normalizedRoot, variant.normalizedPath),
        "utf8",
      );
      assert.equal(geometryHash(svg), variant.geometrySha256);
      if (icon.currentColor)
        assert.match(svg, /(?:fill|stroke)="currentColor"/);
      for (const source of variant.sources) {
        assert.ok(source.sha256, `${source.path} lacks source SHA-256`);
      }
    }
  }

  const svgFiles = (await filesBelow(normalizedRoot)).filter((file) =>
    file.endsWith(".svg"),
  );
  assert.equal(svgFiles.length, 125);
});

test("all normalized variants preserve source paint semantics element by element", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(normalizedRoot, "manifest.json"), "utf8"),
  );
  const semanticAttributes = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-dasharray",
    "stroke-dashoffset",
    "fill-rule",
    "clip-rule",
    "opacity",
    "fill-opacity",
    "stroke-opacity",
    "mask",
    "clip-path",
  ];
  for (const icon of manifest) {
    for (const variant of icon.variants) {
      const source = await readFile(
        path.join(root, variant.sourcePaths[0]),
        "utf8",
      );
      const normalized = await readFile(
        path.join(normalizedRoot, variant.normalizedPath),
        "utf8",
      );
      const definitions = [];
      const expectedSvg = source
        .replace(/<defs\b[\s\S]*?<\/defs>/g, (value) => {
          definitions.push(value);
          return `__DEFS_${definitions.length - 1}__`;
        })
        .replace(
          /(fill|stroke)=["'](?!none\b)([^"']+)["']/g,
          (attribute, kind, paint) =>
            icon.currentColor &&
            !(
              icon.paintPolicy === "currentColor-glyph-preserved-border" &&
              paint === "#D1D8DF"
            )
              ? `${kind}="currentColor"`
              : attribute,
        )
        .replace(/__DEFS_(\d+)__/g, (_, index) => definitions[index]);
      const sourceElements = paintedElements(expectedSvg);
      const normalizedElements = paintedElements(normalized);
      assert.equal(normalizedElements.length, sourceElements.length, icon.name);
      sourceElements.forEach((sourceElement, index) => {
        const normalizedElement = normalizedElements[index];
        assert.equal(normalizedElement.tag, sourceElement.tag, icon.name);
        for (const attribute of semanticAttributes) {
          const sourceValue = sourceElement.attributes[attribute];
          assert.equal(
            normalizedElement.attributes[attribute],
            sourceValue,
            `${icon.name}/${variant.normalizedPath} ${sourceElement.tag}[${index}] ${attribute}`,
          );
        }
      });
    }
  }
});
