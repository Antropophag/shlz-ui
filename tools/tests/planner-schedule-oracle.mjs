import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const target = process.argv[2];
assert.ok(target, "Planner Schedule oracle requires a target");
const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const knownBadPath = join(
  repositoryRoot,
  "tools/tests/fixtures/planner-schedule-known-bad.css",
);
assert.ok(
  target === repositoryRoot || target === knownBadPath,
  "Planner Schedule oracle accepts only the repository or its known-bad fixture",
);
const sourcePath =
  target === repositoryRoot
    ? join(repositoryRoot, "packages/styles/components/planner-schedule.css")
    : knownBadPath;
const source = await readFile(sourcePath, "utf8");

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
