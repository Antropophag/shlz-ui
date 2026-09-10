import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import assert from "node:assert/strict";
import { flatten, kebab, resolveAliases } from "../lib.mjs";

// dist is untracked: reconstruct baseline CSS from its tracked token source.
export async function loadTableOracleStyles(repoRoot, adapter = null) {
  const stylesheet = "packages/styles/components/table.css";
  if (!adapter) {
    const [css, tokens] = await Promise.all([
      readFile(path.join(repoRoot, stylesheet), "utf8"),
      readFile(path.join(repoRoot, "packages/tokens/dist/tokens.css"), "utf8"),
    ]);
    return { css, tokens };
  }
  assert.match(adapter.baselineCommit, /^[a-f0-9]{40}$/);
  assert.equal(adapter.stylesheet, stylesheet);
  const gitExecutable =
    process.platform === "win32"
      ? String.raw`C:\Program Files\Git\cmd\git.exe`
      : "/usr/bin/git";
  const pinned = (file) =>
    execFileSync(gitExecutable, ["show", `${adapter.baselineCommit}:${file}`], {
      cwd: repoRoot,
      encoding: "utf8",
    });
  const definitions = JSON.parse(pinned("packages/tokens/tokens.json"));
  const tokens = `:root {\n${Object.entries(
    resolveAliases(flatten(definitions)),
  )
    .map(([key, value]) => `  --shlz-${kebab(key.split("."))}: ${value};`)
    .join("\n")}\n}\n`;
  return { css: pinned(stylesheet), tokens };
}
