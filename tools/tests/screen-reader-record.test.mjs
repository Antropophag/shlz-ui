import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("published Windows NVDA record retains the complete verified matrix", () => {
  const result = spawnSync(
    process.execPath,
    ["tools/check-screen-reader-record.mjs"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
});
