import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const adapterPath = path.join(
  root,
  "tools/tests/fixtures/table-review-baseline.json",
);
const requested = path.resolve(process.argv[2] ?? root);
assert.ok([root, adapterPath].includes(requested), "undeclared oracle target");
const adapter =
  requested === adapterPath
    ? JSON.parse(await readFile(adapterPath, "utf8"))
    : null;
if (adapter) assert.match(adapter.baselineCommit, /^[a-f0-9]{40}$/);
const sources = new Map();
const readSource = async (relative) => {
  if (!sources.has(relative))
    sources.set(
      relative,
      adapter
        ? execFileSync(
            "git",
            ["show", `${adapter.baselineCommit}:${relative}`],
            { cwd: root, encoding: "utf8" },
          )
        : await readFile(path.join(root, relative), "utf8"),
    );
  return sources.get(relative);
};
const server = createServer(async (request, response) => {
  const pathname = new globalThis.URL(request.url, "http://localhost").pathname;
  if (pathname === "/") {
    response.setHeader("Content-Type", "text/html");
    response.end(
      '<!doctype html><html><body><script type="module">import {wave3Markup, enhanceTableDemo} from "/apps/showcase/src/wave3.js"; document.body.insertAdjacentHTML("beforeend", wave3Markup(() => "")); enhanceTableDemo(); window.ready = true;</script></body></html>',
    );
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (
    !file.startsWith(path.join(root, "apps/showcase/src/")) ||
    !file.endsWith(".js")
  ) {
    response.writeHead(404).end();
    return;
  }
  try {
    response.setHeader("Content-Type", "text/javascript");
    response.end(await readSource(path.relative(root, file)));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => window.ready);
  const demo = page.locator("#table-demo");
  await demo.getByRole("textbox", { name: "Edit name" }).fill("Alpha edited");
  await demo.locator("[data-table-demo-filter]").click();
  assert.equal(
    await demo.locator("tbody tr:visible").count(),
    2,
    "filter must include the edited Alpha row",
  );
  await demo.locator("[data-table-demo-filter]").click();
  await demo.getByRole("textbox", { name: "Edit name" }).fill("Gamma edited");
  await demo.locator("[data-table-demo-filter]").click();
  assert.equal(await demo.locator("tbody tr:visible").count(), 1);
  console.log("PASS: filtering reads current editable values");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
