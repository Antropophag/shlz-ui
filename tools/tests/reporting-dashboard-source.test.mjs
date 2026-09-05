import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ledgerPath =
  "docs/component-audits/reporting-dashboard-source-ledger.json";
const expectedSources = new Set([
  "Dashboard.svg",
  "Дашборды.svg",
  "Редактирование дашборда.svg",
  "Список отчетов.svg",
  "Создание отчета.svg",
  "Детальная отчета.svg",
  "Уведомления для отчетов.svg",
  "Reports card.svg",
]);

test("reporting/dashboard ledger accounts for exact authoritative sources", async () => {
  const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
  assert.equal(ledger.sources.length, 8);
  assert.deepEqual(
    new Set(ledger.sources.map(({ file }) => file)),
    expectedSources,
  );
  const ids = [];
  for (const source of ledger.sources) {
    assert.ok(expectedSources.has(source.file));
    assert.doesNotMatch(source.file, /[/\\]|\.\./);
    const bytes = await readFile(`shlz-design-source/raw/svg/${source.file}`);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      source.sha256,
    );
    assert.ok(source.regions.length > 0);
    for (const region of source.regions) {
      ids.push(region.id);
      assert.ok(
        [
          "existing-family",
          "new-family",
          "application-owned",
          "unresolved",
        ].includes(region.classification),
      );
      assert.ok(region.owner);
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ledger.unsupported.includes("a separate Metric Card family"));
});

test("only source-proven dashboard composition boundaries become public", async () => {
  const [ledger, css, docs, showcase] = await Promise.all([
    readFile(ledgerPath, "utf8"),
    readFile("packages/styles/components/reporting-dashboard.css", "utf8"),
    readFile("docs/components/reporting-dashboard.md", "utf8"),
    readFile("apps/showcase/src/reporting-dashboard-showcase.js", "utf8"),
  ]);
  assert.match(css, /\.shlz-dashboard/);
  assert.match(css, /\.shlz-chart-widget/);
  assert.doesNotMatch(`${css}${docs}${showcase}`, /shlz-metric-card/);
  assert.doesNotMatch(css, /cursor:\s*pointer|<canvas|<svg/);
  const plotRegions = [
    ...showcase.matchAll(
      /class="shlz-chart-widget__plot">([\s\S]*?)<\/article>/g,
    ),
  ].map((match) => match[1]);
  assert.equal(plotRegions.length, 3);
  for (const plot of plotRegions)
    assert.doesNotMatch(plot, /<canvas\b|<svg\b|cursor:\s*pointer/i);
  assert.match(ledger, /"owner": "Bar Chart"/);
  assert.match(showcase, /data-shlz-bar-chart/);
  assert.match(showcase, /class="shlz-dashboard"/);
  assert.match(showcase, /<article class="shlz-chart-widget"/);
});
