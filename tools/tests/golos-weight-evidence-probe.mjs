import { readFile } from "node:fs/promises";

const [evidencePath, setId, member] = process.argv.slice(2);
if (setId !== "golos-text-weights" || !/^\d+$/.test(member)) process.exit(1);

const source = await readFile(evidencePath, "utf8");
const lists = [...source.matchAll(/\[(\s*\d+(?:\s*,\s*\d+)*)\]/g)].map(
  ([, values]) => values.split(",").map((value) => value.trim()),
);
const loadMatrix = lists.find((members) => members.length >= 1);
const assertionMatrix = lists.find(
  (members, index) => index > lists.indexOf(loadMatrix) && members.length >= 1,
);

process.exit(
  loadMatrix?.includes(member) && assertionMatrix?.includes(member) ? 0 : 1,
);
