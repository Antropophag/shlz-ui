import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { readZipEntry } from "./lib/source-zip.mjs";

const specifications = [
  ["button", "Buttons.svg", 360],
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

const componentSetReferences = [
  {
    component: "snackbar",
    componentSet: "Snackbar",
    representativeVariants: [
      "Number=5.svg",
      "Number=4.svg",
      "Number=3.svg",
      "Number=2.svg",
      "Number=1.svg",
      "Number=0.svg",
    ],
  },
  {
    component: "link",
    componentSet: "Link 2",
    representativeVariants: [
      "State=Default.svg",
      "State=Hover.svg",
      "State=Pressed.svg",
      "State=Disabled.svg",
    ],
  },
  {
    component: "avatar",
    componentSet: "Avatar",
    representativeVariants: [
      "Size=small, Type=text, Shape=circle, Badge=none.svg",
      "Size=small, Type=image, Shape=circle, Badge=none.svg",
      "Size=small, Type=icon, Shape=circle, Badge=none.svg",
      "Size=medium, Type=text, Shape=circle, Badge=none.svg",
      "Size=large, Type=text, Shape=circle, Badge=none.svg",
      "Size=custom, Type=text, Shape=circle, Badge=none.svg",
    ],
  },
  {
    component: "table-cell",
    componentSet: "Table Cell",
    representativeVariants: [
      "Type=Text, State=Default, Editable=False, Cell=Header, Filled=False.svg",
      "Type=Text, State=Both active (ascending), Editable=False, Cell=Header, Filled=False.svg",
      "Type=Text, State=Default, Editable=False, Cell=Row, Filled=True.svg",
      "Type=Status, State=Hover, Editable=False, Cell=Row, Filled=True.svg",
      "Type=Text, State=Typing, Editable=True, Cell=Row, Filled=True.svg",
      "Type=Check, State=Default, Editable=False, Cell=Row, Filled=True.svg",
      "Type=Priority, State=Default, Editable=False, Cell=Row, Filled=True.svg",
      "Type=Switch, State=Default, Editable=True, Cell=Row, Filled=True.svg",
      "Type=Button, State=Hover, Editable=False, Cell=Row, Filled=True.svg",
      "Type=Dropdown, State=Default, Editable=True, Cell=Row, Filled=True.svg",
    ],
  },
  {
    component: "table-sorter",
    componentSet: "Sorter",
    representativeVariants: [
      "Type=Inactive.svg",
      "Type=Ascending.svg",
      "Type=Descending.svg",
    ],
  },
  {
    component: "table-filter",
    componentSet: "Filter",
    representativeVariants: [
      "State=Default.svg",
      "State=Hover.svg",
      "State=Active.svg",
    ],
  },
  {
    component: "checkbox",
    componentSet: "Checkbox",
    representativeVariants: [
      "State=Default, Label=False, Checked=False, Size=Large, Indeterminate=False.svg",
      "State=Default, Label=False, Checked=True, Size=Large, Indeterminate=False.svg",
      "State=Default, Label=False, Checked=True, Size=Large, Indeterminate=True.svg",
      "State=Disabled, Label=False, Checked=True, Size=Large, Indeterminate=False.svg",
      "State=Default, Label=False, Checked=True, Size=Medium, Indeterminate=False.svg",
    ],
  },
  {
    component: "radio",
    componentSet: "Radio",
    representativeVariants: [
      "State=Default, Label=False, Active=False.svg",
      "State=Default, Label=False, Active=True.svg",
      "State=Disabled, Label=False, Active=True.svg",
    ],
  },
  {
    component: "switch",
    componentSet: "Switch",
    representativeVariants: [
      "State=Default, Label=False, Active=False, Size=Meduim.svg",
      "State=Default, Label=False, Active=True, Size=Meduim.svg",
      "State=Disabled, Label=False, Active=True, Size=Meduim.svg",
      "State=Default, Label=False, Active=False, Size=Small.svg",
      "State=Default, Label=False, Active=True, Size=Small.svg",
    ],
  },
  {
    component: "badge-count",
    componentSet: "Badge-Count",
    representativeVariants: [
      "Size=small, Color=blue, Single Digit=true.svg",
      "Size=small, Color=gray, Single Digit=false.svg",
      "Size=medium, Color=blue invert, Single Digit=false.svg",
    ],
  },
  {
    component: "badge-dot",
    componentSet: "Badge-Dot",
    representativeVariants: ["Color=gray.svg", "Color=Blue.svg"],
  },
  {
    component: "status-requests",
    archive: "UI Kit – Interface elements.zip",
    componentSet: "Status Обращения",
    representativeVariants: [
      "Status=Новая.svg",
      "Status=В работе ОКС.svg",
      "Status=Передано в  ОГО.svg",
      "Status=Выполнена.svg",
      "Status=Закрыта.svg",
    ],
  },
  {
    component: "status-details",
    archive: "UI Kit – Interface elements.zip",
    componentSet: "Status Детали",
    representativeVariants: [
      "Status=Производится.svg",
      "Status=Не отгружен.svg",
    ],
  },
  {
    component: "input",
    componentSet: "Input",
    representativeVariants: [
      "Size=Large, State=Default, Filled=False, Type=Default.svg",
      "Size=Medium, State=Default, Filled=True, Type=Default.svg",
      "Size=Large, State=Hover, Filled=True, Type=Default.svg",
      "Size=Large, State=Focused, Filled=True, Type=Advanced.svg",
      "Size=Large, State=Default, Filled=False, Type=Advanced 2.svg",
      "Size=Large, State=Disabled, Filled=False, Type=Default.svg",
    ],
  },
  {
    component: "textarea",
    componentSet: "Textarea",
    representativeVariants: [
      "State=Default, Filled=False, Show Count=False.svg",
      "State=Hover, Filled=True, Show Count=False.svg",
      "State=Focused, Filled=True, Show Count=True.svg",
      "State=Error, Filled=True, Show Count=False.svg",
      "State=Disabled, Filled=False, Show Count=True.svg",
    ],
  },
  {
    component: "select",
    componentSet: "Dropdown",
    representativeVariants: [
      "Size=Large, State=Default, Filled=False, Search=False, Multyselect=False, Status=False.svg",
      "Size=Medium, State=Hover, Filled=True, Search=False, Multyselect=False, Status=False.svg",
      "Size=Large, State=Focused, Filled=False, Search=True, Multyselect=False, Status=False.svg",
      "Size=Large, State=Default, Filled=True, Search=False, Multyselect=True, Status=False.svg",
      "Size=Large, State=Default, Filled=True, Search=False, Multyselect=False, Status=True.svg",
      "Size=Large, State=Disabled, Filled=False, Search=False, Multyselect=False, Status=False.svg",
    ],
  },
  {
    component: "tooltip-variants",
    componentSet: "Tooltip",
    representativeVariants: [
      "Direction=Top↑.svg",
      "Direction=bottom↓.svg",
      "Direction=left←.svg",
      "Direction=right→.svg",
    ],
  },
  {
    component: "popover-variants",
    componentSet: "Popover",
    representativeVariants: [
      "Placement=top.svg",
      "Placement=bottom.svg",
      "Placement=left.svg",
      "Placement=right.svg",
    ],
  },
];

const standaloneComponentReferences = [
  ["empty-customize", "Empty-Customize"],
  ["empty-basic", "Empty-Basic"],
  ["empty-simple", "Empty-Simple"],
  ["modal-basic", ".Modal-Basic(Legacy)"],
  ["modal-info", "Modal-Info"],
  ["modal-success", "Modal-Success"],
  ["modal-warning", "Modal-Warning"],
  ["modal-error", "Modal-Error"],
  ["drawer-source", "Sidebar-Drawer"],
];

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

  for (const {
    component,
    archive: archiveName = "UI Kit – Basic elements.zip",
    componentSet,
    representativeVariants,
  } of componentSetReferences) {
    const archive = path.join(sourceRoot, archiveName);
    const archiveSource = await readFile(archive);
    const manifestSource = readZipEntry(
      archiveSource,
      `components/${componentSet}/manifest.json`,
    ).toString("utf8");
    const componentManifest = JSON.parse(manifestSource);
    const references = [];
    for (const sourceVariant of componentManifest.variants) {
      const entry = `components/${componentSet}/variants/${sourceVariant.safeFilename}`;
      const source = readZipEntry(archiveSource, entry);
      const file = `${component}-${sourceVariant.sourceOrder}.svg`;
      await writeFile(path.join(targetRoot, file), source);
      references.push({
        file,
        kind: "component-set-variant",
        sourceOrder: sourceVariant?.sourceOrder,
        sourceNodeId: sourceVariant?.figmaNodeId,
        rawVariantName: sourceVariant?.originalName,
        variantProperties: sourceVariant?.variantProperties,
        sourceWidth: sourceVariant?.width,
        sourceHeight: sourceVariant?.height,
        representative: representativeVariants.includes(
          sourceVariant.safeFilename,
        ),
        cropViewBox: "complete variant node",
        reason: `Exact ${componentSet} Component Set variant; no geometry or color transformation.`,
        method: "byte-preserved SVG extracted from Full design-system ZIP",
      });
    }
    manifest.push({
      component,
      sourceFile: `${archiveName} · ${componentSet}`,
      sourceArchive: archiveName,
      sourceArchiveSha256: digest(archiveSource),
      sourceManifestPath: `components/${componentSet}/manifest.json`,
      sourceNodeId: componentManifest.figmaNodeId,
      sourceVariantCount: componentManifest.variants.length,
      sourceHasErrors: componentManifest.hasSourceErrors,
      sourceSha256: digest(manifestSource),
      references,
    });
  }

  for (const [component, sourceComponent] of standaloneComponentReferences) {
    const archiveName = "UI Kit – Basic elements.zip";
    const archive = path.join(sourceRoot, archiveName);
    const archiveSource = await readFile(archive);
    const manifestEntry = `components/${sourceComponent}/manifest.json`;
    const manifestSource = readZipEntry(archiveSource, manifestEntry).toString(
      "utf8",
    );
    const componentManifest = JSON.parse(manifestSource);
    const sourceEntry = `components/${sourceComponent}/${componentManifest.safeFilename}`;
    const source = readZipEntry(archiveSource, sourceEntry);
    const file = `${component}.svg`;
    await writeFile(path.join(targetRoot, file), source);
    manifest.push({
      component,
      sourceFile: `${archiveName} · ${sourceComponent}`,
      sourceArchive: archiveName,
      sourceArchiveSha256: digest(archiveSource),
      sourceManifestPath: manifestEntry,
      sourceNodeId: componentManifest.figmaNodeId,
      sourceVariantCount: 1,
      sourceHasErrors: componentManifest.hasSourceErrors,
      sourceSha256: digest(manifestSource),
      references: [
        {
          file,
          kind: "standalone-component",
          sourceOrder: 1,
          sourceNodeId: componentManifest.figmaNodeId,
          rawVariantName: componentManifest.originalName,
          variantProperties: null,
          sourceWidth: componentManifest.width,
          sourceHeight: componentManifest.height,
          representative: true,
          cropViewBox: "complete component node",
          reason: `Exact ${sourceComponent} standalone component; no geometry or color transformation.`,
          method: "byte-preserved SVG extracted from Full design-system ZIP",
        },
      ],
    });
  }

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
