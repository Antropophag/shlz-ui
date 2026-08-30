import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Planner Schedule publishes source-backed framework-neutral styles", async () => {
  const [css, docs, sourceContract] = await Promise.all([
    readFile("packages/styles/components/planner-schedule.css", "utf8"),
    readFile("docs/components/planner-schedule.md", "utf8"),
    readFile("docs/component-audits/planner-schedule-contract.md", "utf8"),
  ]);
  assert.match(css, /--shlz-planner-slot-height/);
  assert.match(css, /--shlz-planner-lane-count/);
  assert.match(css, /position: sticky/);
  assert.match(css, /overflow: auto/);
  assert.match(css, /data-shlz-planner-unavailable/);
  assert.match(css, /\.shlz-planner-detail/);
  assert.match(docs, /Consumers own day and time labels/);
  assert.match(docs, /existing Popover interface/);
  assert.match(sourceContract, /30-minute top\/bottom/);
  assert.match(sourceContract, /repository-decision/);
});

test("Planner sources retain their attested integrity", async () => {
  for (const [path, expected] of [
    [
      "shlz-design-source/raw/svg/Planner.svg",
      "3f23135cbccf6cd8d1054feef90990d94ec647d8ef12de091ee6b76a022f2ed7",
    ],
    [
      "shlz-design-source/raw/svg/Планировщик для сотрудника.svg",
      "fd681f4338fb2b4850e2516f3856fee6813e4faaaae9baedac562405a6412af5",
    ],
  ]) {
    const source = await readFile(path);
    assert.equal(createHash("sha256").update(source).digest("hex"), expected);
  }
});

test("generated distribution contains Planner Schedule styles", async () => {
  const bundle = await readFile("packages/styles/dist/shlz.css", "utf8");
  assert.match(bundle, /\.shlz-planner-schedule/);
  assert.match(bundle, /--shlz-planner-slot-height/);
});
