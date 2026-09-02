import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const knownBadTarget = path.join(
  repoRoot,
  "tools/tests/fixtures/accessible-source-contrast-known-bad.json",
);
const target = path.resolve(process.argv[2]);
if (target !== repoRoot && target !== knownBadTarget) {
  throw new Error("target must be the candidate root or known-bad fixture");
}

const targetStat = await stat(target);
let evidence;
if (targetStat.isDirectory()) {
  const [tokens, field, modal] = await Promise.all([
    readFile(path.join(target, "packages/tokens/tokens.json"), "utf8"),
    readFile(path.join(target, "packages/styles/components/field.css"), "utf8"),
    readFile(path.join(target, "packages/styles/components/modal.css"), "utf8"),
  ]);
  const parsed = JSON.parse(tokens);
  evidence = {
    supporting: parsed.semantic.color.text["supporting-accessible"],
    placeholder: parsed.semantic.color.text["placeholder-accessible"],
    fieldUsesAccessibleRoles:
      field.includes("--shlz-semantic-color-text-supporting-accessible") &&
      field.includes("--shlz-semantic-color-text-placeholder-accessible"),
    modalUsesAccessibleRole: modal.includes(
      "--shlz-semantic-color-text-supporting-accessible",
    ),
  };
} else {
  evidence = JSON.parse(await readFile(target, "utf8"));
}

const rgba = (value) => {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) throw new Error(`Not RGB: ${value}`);
  const alpha = channels[3] ?? 1;
  return [
    channels[0],
    channels[1],
    channels[2],
    value.includes("%") ? alpha / 100 : alpha,
  ];
};
const composite = (foreground, background) => {
  const [red, green, blue, alpha] = rgba(foreground);
  return [
    red * alpha + background[0] * (1 - alpha),
    green * alpha + background[1] * (1 - alpha),
    blue * alpha + background[2] * (1 - alpha),
  ];
};
const luminance = (channels) => {
  const linear = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (foreground, background) => {
  const renderedForeground = composite(foreground, background);
  const values = [luminance(renderedForeground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
};

const backgrounds = [
  [255, 255, 255],
  [245, 245, 245],
  [238, 240, 244],
  [244, 246, 249],
];
const passes =
  evidence.fieldUsesAccessibleRoles &&
  evidence.modalUsesAccessibleRole &&
  [evidence.supporting, evidence.placeholder].every((color) =>
    backgrounds.every((background) => contrast(color, background) >= 4.5),
  );

if (!passes) process.exitCode = 1;
