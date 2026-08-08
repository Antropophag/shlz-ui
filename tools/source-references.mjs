import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const specifications = [
  ["button", "Buttons.svg", 360],
  ["input", "Select.svg", 360],
  ["textarea", "Textarea.svg", 360],
  ["checkbox", "Checkbox.svg", 360],
  ["radio", "Radio.svg", 340],
  ["switch", "Switch.svg", 360],
  ["status", "Status.svg", 360],
  ["badge", "Bage.svg", 340],
  ["dropdown", "Dropdown menu.svg", 800],
  ["popover", "Popover.svg", 360],
  ["tooltip", "Tooltip.svg", 440],
  ["tabs", "Tabs.svg", 360],
  ["pagination", "Pagination.svg", 360],
  ["pagination-compact", "Pagination (1).svg", 360],
  ["pagination-wide", "Pagination (2).svg", 300],
  ["tag", "Tag.svg", 340],
  ["segment", "Segment.svg", 340],
  ["notification", "Notification.svg", 460],
  ["modal", "Modal.svg", 360],
  ["drawer", "Drawer.svg", 360],
].map(([component, sourceFile, cropTop]) => ({
  component,
  sourceFile,
  cropTop,
  reason:
    "Exclude the sheet title/index area above the component matrix; retain the complete matrix width and all geometry below it.",
}));

const digest = (value) => createHash("sha256").update(value).digest("hex");

export async function generateSourceReferences(root = process.cwd()) {
  const sourceRoot = path.join(root, "shlz-design-source/raw/svg");
  const targetRoot = path.join(
    root,
    "apps/showcase/generated/source-references",
  );
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });
  const manifest = [];

  for (const { component, sourceFile, cropTop, reason } of specifications) {
    const source = await readFile(path.join(sourceRoot, sourceFile), "utf8");
    const rootTag = source.match(/<svg\b[^>]*>/)?.[0];
    const viewBox = rootTag?.match(/viewBox="([^"]+)"/)?.[1];
    if (!rootTag || !viewBox)
      throw new Error(`Missing SVG viewBox: ${sourceFile}`);
    const [, , sourceWidth, sourceHeight] = viewBox.split(/\s+/).map(Number);
    const y = Math.min(cropTop, sourceHeight);
    const height = sourceHeight - y;
    const cropViewBox = `0 ${y} ${sourceWidth} ${height}`;
    const file = `${component}.svg`;
    const replacement = rootTag
      .replace(/\bwidth="[^"]*"/, `width="${sourceWidth}"`)
      .replace(/\bheight="[^"]*"/, `height="${height}"`)
      .replace(/\bviewBox="[^"]*"/, `viewBox="${cropViewBox}"`);
    await writeFile(
      path.join(targetRoot, file),
      source.replace(rootTag, replacement),
    );

    manifest.push({
      component,
      sourceFile,
      originalViewBox: viewBox,
      sourceSha256: digest(source),
      references: [
        {
          file,
          kind: "component-sheet-crop",
          cropViewBox,
          reason,
          method: "root viewBox crop; SVG geometry is otherwise byte-preserved",
        },
      ],
    });
  }

  await writeFile(
    path.join(targetRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`)
  await generateSourceReferences();
