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

const passes =
  evidence.fieldUsesAccessibleRoles &&
  evidence.modalUsesAccessibleRole &&
  evidence.supporting === "rgb(11 22 35 / 60%)" &&
  evidence.placeholder === "rgb(11 22 35 / 60%)";

if (!passes) process.exitCode = 1;
