import { pathToFileURL } from "node:url";
import path from "node:path";

const target = path.resolve(process.argv[2]);
const modulePath = target.endsWith(".mjs")
  ? target
  : path.join(target, "tools/lib/harness/core.mjs");
const { assertClosedSetProof } = await import(pathToFileURL(modulePath));
try {
  assertClosedSetProof(
    [{ id: "golos-text-weights", members: ["400", "500", "600", "700"] }],
    [],
  );
  process.exitCode = 1;
} catch {
  process.exitCode = 0;
}
