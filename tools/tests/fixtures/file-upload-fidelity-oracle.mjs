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
const content = targetStat.isDirectory()
  ? await Promise.all(
      [
        "apps/showcase/src/file-upload-showcase.js",
        "packages/styles/components/file-upload.css",
        "tools/playwright/file-upload.spec.js",
      ].map((file) => readFile(path.join(target, file), "utf8")),
    ).then((parts) => parts.join("\n"))
  : await readFile(target, "utf8");

const requirements = [
  'class="shlz-file-upload__surface"',
  "inline-size: min(100%, 467px)",
  "min-block-size: 102px",
  "font-size: 0.875rem",
  "expect(geometry.instructionFontSize).toBe(28)",
];

if (
  requirements.some((requirement) => !content.includes(requirement)) ||
  content.includes('class="shlz-file-upload__trigger"')
) {
  process.exitCode = 1;
}
