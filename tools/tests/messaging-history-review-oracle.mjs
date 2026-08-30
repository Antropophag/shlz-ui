import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const target = path.resolve(process.argv[2]);
const targetStats = await stat(target);
const source = targetStats.isDirectory()
  ? await Promise.all(
      [
        "apps/showcase/src/main.js",
        "apps/showcase/src/consumer-workspace.js",
        "apps/showcase/src/messaging-history-showcase.js",
      ].map((file) => readFile(path.join(target, file), "utf8")),
    ).then((parts) => parts.join("\n"))
  : await readFile(target, "utf8");

assert.doesNotMatch(source, /replaceAll\(["']shlz-(?:link|button)/);
assert.match(source, /role=["']status["']/);
assert.match(source, /href=["']#[^"']+["']/);
assert.match(source, /id=["'][^"']*period[^"']*["']/);
assert.match(source, /aria-describedby=["'][^"']*period[^"']*["']/);
