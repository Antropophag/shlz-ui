import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, URL } from "node:url";

const oracle = fileURLToPath(
  new URL("./screen-reader-failure-oracle.mjs", import.meta.url),
);
const root = fileURLToPath(new URL("../../", import.meta.url));
const bad = fileURLToPath(
  new URL("./fixtures/screen-reader-known-bad.json", import.meta.url),
);
for (const invariant of [
  "missing-speech-cannot-pass",
  "foreign-foreground-rejects-input",
]) {
  test(invariant + " discriminates the unsafe adapter", () => {
    const invoke = (target) =>
      spawnSync(process.execPath, [oracle, target, invariant], {
        encoding: "utf8",
        timeout: 10000,
      });
    const candidate = invoke(root);
    const mutant = invoke(bad);
    assert.equal(candidate.status, 0, candidate.stderr);
    assert.equal(mutant.status, 1, mutant.stdout + mutant.stderr);
  });
}
