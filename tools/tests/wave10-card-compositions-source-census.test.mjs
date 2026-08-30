import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contracts = [
  ["card-with-action", "Card with button.svg", "card-with-action.css"],
  ["report-card", "Reports card.svg", "report-card.css"],
  ["cover", "Cover.svg", "cover.css"],
];
const hashes = new Map([
  [
    "Card with button.svg",
    "01abde3b045ab0c36160e5e71a829bffc37d2bb3bbafaadac3a04e350b064719",
  ],
  [
    "Reports card.svg",
    "e28cb879e2a2e577154cfa3caf541de020431ef8ba6e44550ad0e54bddf63c4f",
  ],
  [
    "Cover.svg",
    "c857eb75fe105238c2a0d222a5dd27fae74006cf6db43488fa4d9bbe77feb612",
  ],
]);

test("Wave 10 authoritative SVGs retain their exact source facts", async () => {
  for (const [file, expected] of hashes) {
    const bytes = await readFile(`shlz-design-source/raw/svg/${file}`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }
  const card = await readFile(
    "shlz-design-source/raw/svg/Card with button.svg",
    "utf8",
  );
  assert.match(card, /width="314" height="230" viewBox="0 0 314 230"/);
  assert.match(
    card,
    /<rect width="314" height="230" rx="16" fill="#DFE2F0"\/>/,
  );
  assert.match(
    card,
    /x="24" y="166" width="137" height="40" rx="20" fill="#253D98"/,
  );
  const reports = await readFile(
    "shlz-design-source/raw/svg/Reports card.svg",
    "utf8",
  );
  assert.equal(
    (reports.match(/width="314" height="230" rx="16"/g) ?? []).length,
    3,
  );
  assert.match(
    reports,
    /0\.145098[\s\S]*0\.239216[\s\S]*0\.596078[\s\S]*0\.05/,
  );
  const cover = await readFile("shlz-design-source/raw/svg/Cover.svg", "utf8");
  assert.match(cover, /width="874" height="400" viewBox="0 0 874 400"/);
  assert.equal((cover.match(/<path\b/g) ?? []).length, 6);
});

test("Wave 10 exposes three independent presentational contracts", async () => {
  for (const [component, source, stylesheet] of contracts) {
    const manifest = JSON.parse(
      await readFile(`docs/component-audits/${component}.json`, "utf8"),
    );
    const css = await readFile(
      `packages/styles/components/${stylesheet}`,
      "utf8",
    );
    assert.equal(manifest.component, component);
    assert.equal(
      manifest.authoritativeSource,
      `shlz-design-source/raw/svg/${source}`,
    );
    assert.ok(manifest.occurrences.length >= 2);
    assert.match(css, new RegExp(`\\.shlz-${component}`));
    assert.doesNotMatch(css, /cursor:\s*pointer|:hover|:active/);
  }
});

test("Wave 10 markup keeps roots noninteractive and delegates actions", async () => {
  const fixture = await readFile(
    "apps/showcase/src/card-compositions.js",
    "utf8",
  );
  assert.match(fixture, /shlz-card-with-action__actions/);
  assert.match(fixture, /class="shlz-button shlz-button--primary"/);
  assert.match(fixture, /<article class="shlz-report-card/);
  assert.match(fixture, /<div class="shlz-cover/);
});
