import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { tmpdir } from "node:os";
import { loadTableOracleStyles } from "../lib/table-oracle-styles.mjs";

test("baseline styles ignore current token and table mutations", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "table-oracle-"));
  try {
    const git = (...args) =>
      execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
    for (const dir of [
      "packages/styles/components",
      "packages/tokens/dist",
      "tools",
    ])
      await mkdir(path.join(root, dir), { recursive: true });
    const stylesheet = "packages/styles/components/table.css";
    const write = (name, value) => writeFile(path.join(root, name), value);
    await write(stylesheet, ".shlz-table { color: var(--shlz-color-active); }");
    await write(
      "packages/tokens/tokens.json",
      JSON.stringify({
        color: { source: "#253d98", active: "{color.source}" },
      }),
    );
    await write(
      "tools/lib.mjs",
      await readFile(new globalThis.URL("../lib.mjs", import.meta.url), "utf8"),
    );
    git("init", "-q");
    git("add", "packages", "tools");
    git(
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.invalid",
      "commit",
      "-qm",
      "baseline",
    );
    const adapter = { baselineCommit: git("rev-parse", "HEAD"), stylesheet };
    const before = await loadTableOracleStyles(root, adapter);
    assert.match(before.tokens, /--shlz-color-active: #253d98;/);
    await write(stylesheet, ".shlz-table { color: red; }");
    await write(
      "packages/tokens/tokens.json",
      JSON.stringify({ color: { source: "red" } }),
    );
    await write(
      "packages/tokens/dist/tokens.css",
      ":root { --shlz-color-active: red; }",
    );
    await write(
      "tools/lib.mjs",
      'throw new Error("candidate helper must not run");',
    );
    assert.deepEqual(await loadTableOracleStyles(root, adapter), before);
    assert.deepEqual(await loadTableOracleStyles(root), {
      css: ".shlz-table { color: red; }",
      tokens: ":root { --shlz-color-active: red; }",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
