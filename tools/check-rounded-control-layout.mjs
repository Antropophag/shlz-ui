import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const knownBad = resolve(
  root,
  "tools/tests/fixtures/rounded-control-known-bad.css",
);
const target = resolve(process.argv[2] ?? root);
if (target !== resolve(root) && target !== knownBad) {
  throw new Error(
    "Expected this checkout or its declared historical CSS adapter",
  );
}
const result = spawnSync(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
    ),
    "test",
    "tools/playwright/rounded-control-alignment.spec.js",
    "--reporter=line,json",
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      SHLZ_ALIGNMENT_KNOWN_BAD_STYLE: target === knownBad ? knownBad : "",
      PLAYWRIGHT_JSON_OUTPUT_NAME: resolve(
        root,
        `node_modules/.cache/rounded-alignment/oracle-${target === knownBad ? "red" : "green"}.json`,
      ),
    },
    stdio: "inherit",
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
