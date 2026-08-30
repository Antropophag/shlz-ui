import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const knownBadTarget = path.join(
  repoRoot,
  "tools/tests/fixtures/file-upload-fidelity-known-bad.txt",
);
const target = path.resolve(process.argv[2]);
if (target !== repoRoot && target !== knownBadTarget) {
  throw new Error("target must be the candidate root or the known-bad fixture");
}
const targetStat = await stat(target);
const knownBad = targetStat.isDirectory()
  ? null
  : await readFile(target, "utf8");
const [markup, styles, browserTest] = targetStat.isDirectory()
  ? await Promise.all(
      [
        "apps/showcase/src/file-upload-showcase.js",
        "packages/styles/components/file-upload.css",
        "tools/playwright/file-upload.spec.js",
      ].map((file) => readFile(path.join(target, file), "utf8")),
    )
  : [knownBad, knownBad, knownBad];

const markupRequirements = [
  'class="shlz-file-upload__input" id="${id}"',
  'class="shlz-file-upload__surface" for="${id}"',
  'class="shlz-icon shlz-file-upload__icon"',
  '${uploadIcon}<span class="shlz-file-upload__instructions">${instruction}</span>',
  "Нажмите или перетащите файл в эту область",
];
const styleRequirements = [
  "inline-size: min(100%, 467px)",
  "min-block-size: 102px",
  "font-size: 0.875rem",
];

if (
  markupRequirements.some((requirement) => !markup.includes(requirement)) ||
  styleRequirements.some((requirement) => !styles.includes(requirement)) ||
  !browserTest.includes("expect(geometry.instructionFontSize).toBe(28)") ||
  markup.includes('class="shlz-file-upload__trigger"')
) {
  process.exitCode = 1;
}
