import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { chromium } from "@playwright/test";
import {
  emptyVariants,
  expectContrastMember,
  statusPaints,
} from "../../playwright/status-empty-contrast-matrix.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const knownBad = new URL(
  "./status-empty-contrast-known-bad.json",
  import.meta.url,
);
const target = path.resolve(process.argv[2] ?? "");
assert(
  target === path.resolve(root) || target === fileURLToPath(knownBad),
  "target must be the checkout or the fixed baseline-paint adapter",
);
const families = {
  "status-paints": ["status", Object.keys(statusPaints)],
  "empty-compositions": ["empty-state", emptyVariants],
};
const [, , , set, member, evidence] = process.argv;
if (set) {
  assert(Object.hasOwn(families, set), "unknown closed set");
  assert(families[set][1].includes(member), "unknown member");
  assert.equal(
    path.resolve(evidence ?? ""),
    fileURLToPath(
      new URL(
        "../../playwright/status-empty-contrast.spec.js",
        import.meta.url,
      ),
    ),
    "evidence must name the focused browser spec",
  );
}
const css = await readFile(
  new URL("../../../packages/styles/dist/shlz.css", import.meta.url),
  "utf8",
);
const baseline =
  target === fileURLToPath(knownBad)
    ? JSON.parse(await readFile(knownBad, "utf8")).css
    : "";
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route("**/*", (route) => route.abort());
  await page.setContent('<body class="shlz-scope"></body>');
  await page.addStyleTag({ content: css });
  if (baseline) await page.addStyleTag({ content: baseline });
  const selected = set
    ? [[families[set][0], [member]]]
    : Object.values(families);
  for (const [family, members] of selected) {
    for (const name of members) {
      const measurements = await expectContrastMember(page, family, name);
      console.log(
        JSON.stringify({
          family,
          member: name,
          samples: measurements.length,
          minimum: Math.min(...measurements.map((x) => x.ratio)),
          outcome: "pass",
        }),
      );
    }
  }
} finally {
  await browser.close();
}
