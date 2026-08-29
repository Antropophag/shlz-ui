import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const target = process.argv[2];
assert.ok(target, "Planner Schedule oracle requires a target");
const source = await readFile(
  (await stat(target)).isDirectory()
    ? join(target, "packages/styles/components/planner-schedule.css")
    : target,
  "utf8",
);

assert.match(
  source,
  /block-size:\s*calc\([\s\S]*var\(--shlz-planner-end\)\s*-\s*var\(--shlz-planner-start\)/,
  "event height must remain proportional to the declared duration",
);
assert.match(
  source,
  /\.shlz-planner-schedule__event:hover\s*\{[^}]*box-shadow:\s*inset 0 0 0 1px currentcolor/s,
  "every event tone must retain observable hover paint",
);
