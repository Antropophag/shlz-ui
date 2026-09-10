import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { tableFilter, tableSorter } from "../apps/showcase/src/table-parts.js";

// The same public HTML contract is rendered with candidate CSS or immutable
// pre-transfer CSS. Expected paint/geometry comes from Table Cell.svg.
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const baselineRelative = "tools/tests/fixtures/table-baseline.json";
const baselinePath = path.join(repoRoot, baselineRelative);
const requested = process.argv[2] ?? ".";
const candidateTargets = new Set([".", repoRoot]);
const baselineTargets = new Set([baselineRelative, baselinePath]);
assert.ok(
  candidateTargets.has(requested) || baselineTargets.has(requested),
  "Only this checkout or its declared baseline adapter is an oracle target",
);
const stylesheet = "packages/styles/components/table.css";
let css;
if (baselineTargets.has(requested)) {
  const adapter = JSON.parse(await readFile(baselinePath, "utf8"));
  assert.match(adapter.baselineCommit, /^[a-f0-9]{40}$/);
  assert.equal(adapter.stylesheet, stylesheet);
  const gitExecutable =
    process.platform === "win32"
      ? String.raw`C:\Program Files\Git\cmd\git.exe`
      : "/usr/bin/git";
  css = execFileSync(
    gitExecutable,
    ["show", `${adapter.baselineCommit}:${stylesheet}`],
    { cwd: repoRoot, encoding: "utf8" },
  );
} else {
  css = await readFile(
    new globalThis.URL(
      "../packages/styles/components/table.css",
      import.meta.url,
    ),
    "utf8",
  );
}
const tokens = await readFile(
  new globalThis.URL("../packages/tokens/dist/tokens.css", import.meta.url),
  "utf8",
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(
    `<style>${tokens}\n${css}</style><table class="shlz-table"><thead class="shlz-table__head"><tr><th class="shlz-table__cell" aria-sort="ascending"><span class="shlz-table__heading"><span>Номер</span><span class="shlz-table__actions">${tableSorter("Sort")}${tableFilter("Filter", 'aria-pressed="true"')}</span></span></th></tr></thead></table>`,
  );
  const actual = await page.evaluate(() => {
    const prop = (selector, name) =>
      window.getComputedStyle(document.querySelector(selector))[name];
    return {
      up: prop(".shlz-table__sort-up", "fill"),
      down: prop(".shlz-table__sort-down", "fill"),
      filter: prop(".shlz-table__filter path", "fill"),
      width: prop(".shlz-table__filter svg", "width"),
      height: prop(".shlz-table__filter svg", "height"),
    };
  });
  assert.deepEqual(actual, {
    up: "rgb(37, 61, 152)",
    down: "rgb(147, 156, 165)",
    filter: "rgb(37, 61, 152)",
    width: "16px",
    height: "18px",
  });
  console.log("PASS: independent two-tone sorter and active funnel geometry");
} finally {
  await browser.close();
}
