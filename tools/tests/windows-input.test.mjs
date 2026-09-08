import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

test("Windows input policy rejects foreign windows and preserves modal ownership", () => {
  const python =
    process.platform === "win32" ? "C:\\Windows\\py.exe" : "/usr/bin/python3";
  const args = process.platform === "win32" ? ["-3", "-B"] : ["-B"];
  args.push(fileURLToPath(new URL("./windows-input.test.py", import.meta.url)));
  const result = spawnSync(python, args, {
    encoding: "utf8",
    timeout: 10000,
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
