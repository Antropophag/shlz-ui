import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inventoryPath = "docs/component-audits/project-inventory.json";
const roadmapPath = "docs/component-audit-roadmap.md";

const expectedWaves = new Map([
  [9, "Sidebar / Application Shell"],
  [10, "Card compositions"],
  [11, "Upload / Document compositions"],
  [12, "Messaging / History / Planner compositions"],
]);

const parseRoadmapRows = (roadmap) =>
  [...roadmap.matchAll(/^\|\s+(\d+)\s+\|\s+([^|]+?)\s+\|/gm)].map(
    ([, wave, family]) => [Number(wave), family.trim()],
  );

test("Wave 9+ roadmap assigns every remaining inventory family exactly once", async () => {
  const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
  const roadmap = await readFile(roadmapPath, "utf8");
  const mappedRows = parseRoadmapRows(roadmap);
  const mappedWaveNumbers = mappedRows.map(([wave]) => wave);
  const mappedWaves = new Map(mappedRows);
  const inventoryStatus = new Map(
    inventory.families.map(({ canonical_name: name, audit_status: status }) => [
      name,
      status,
    ]),
  );
  const remainingFamilies = inventory.families
    .filter(({ audit_status: status }) => status !== "VERIFIED")
    .map(({ canonical_name: name }) => name);

  assert.equal(mappedRows.length, expectedWaves.size);
  assert.equal(new Set(mappedWaveNumbers).size, mappedRows.length);
  assert.deepEqual(mappedWaves, expectedWaves);
  assert.deepEqual(
    [...mappedWaves.values()].filter(
      (family) => inventoryStatus.get(family) !== "VERIFIED",
    ),
    remainingFamilies,
  );
  assert.equal(new Set(mappedWaves.values()).size, mappedWaves.size);
});

test("roadmap parser preserves duplicate rows for exact-once validation", async () => {
  const roadmap = await readFile(roadmapPath, "utf8");
  const firstRemainingRow = roadmap
    .split("\n")
    .find((line) => /^\|\s+10\s+\|/.test(line));
  assert.ok(firstRemainingRow);

  const duplicated = roadmap.replace(
    firstRemainingRow,
    `${firstRemainingRow}\n${firstRemainingRow}`,
  );
  assert.equal(parseRoadmapRows(duplicated).length, expectedWaves.size + 1);
});

test("roadmap keeps short-intent and workflow boundaries explicit", async () => {
  const agents = await readFile("AGENTS.md", "utf8");
  const roadmap = await readFile(roadmapPath, "utf8");

  assert.match(agents, /numbered component-audit request/);
  assert.match(agents, /docs\/component-audit-roadmap\.md/);
  assert.match(roadmap, /`Сделай Wave N` selects the complete entry/);
  assert.match(roadmap, /This roadmap selects scope; it does not cache/);
  assert.match(roadmap, /number outside Waves 9–12 is unplanned/);
  assert.doesNotMatch(roadmap, /npm run harness --/);
});
