import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { assertCheckpoint } from "../at/evidence.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const badPath = fileURLToPath(
  new URL("./fixtures/screen-reader-known-bad.json", import.meta.url),
);
const target = path.resolve(process.argv[2]);
const bad = target === badPath;
assert.ok(target === path.resolve(root) || bad, "Unknown oracle target");
if (bad)
  assert.deepEqual(JSON.parse(readFileSync(badPath, "utf8")), {
    adapter: "unsafe-screen-reader-validation",
    missingSpeech: "accept",
    foreground: "inject-before-validation",
  });
const invariants = process.argv[3]
  ? [process.argv[3]]
  : ["missing-speech-cannot-pass", "foreign-foreground-rejects-input"];
for (const invariant of invariants) {
  if (invariant === "missing-speech-cannot-pass") {
    const validate = bad ? (value) => value : assertCheckpoint;
    const value = {
      id: "name-value",
      speech: [],
      inputEventCount: 1,
      actions: [{ kind: "os-keyboard", key: "NVDA+Tab" }],
      foregroundVerified: true,
      assertions: [{ meaning: "browser state", passed: true }],
    };
    assert.throws(() => validate(value), /speech/);
    console.log(invariant + ": rejected browser-only evidence");
  } else if (invariant === "foreign-foreground-rejects-input") {
    const python =
      process.platform === "win32" ? "C:\\Windows\\py.exe" : "/usr/bin/python3";
    const module = bad
      ? fileURLToPath(
          new URL("./fixtures/screen-reader-unsafe-input.py", import.meta.url),
        )
      : fileURLToPath(new URL("../at/windows_input.py", import.meta.url));
    const result = spawnSync(
      python,
      [
        ...(process.platform === "win32" ? ["-3", "-B"] : ["-B"]),
        fileURLToPath(
          new URL("./screen-reader-input-oracle.py", import.meta.url),
        ),
        module,
      ],
      { encoding: "utf8", timeout: 10000, windowsHide: true },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    console.log(invariant + ": no input reached a foreign desktop");
  } else {
    throw new Error("Unknown failure invariant");
  }
}
