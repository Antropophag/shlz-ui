import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("repository validation accepts the generated multi-source icon corpus", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    "tools/validate.mjs",
  ]);

  assert.match(stdout, /201 canonical icons and 42 aliases/);
});
