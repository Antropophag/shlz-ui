import path from "node:path";
import { pathToFileURL } from "node:url";

if (process.env.SHLZ_TDD_PROBE_MODE === "nondeterministic") {
  process.stderr.write(`ERR_NONDETERMINISTIC_${process.pid}\n`);
  process.exit(1);
}

const adapter = path.join(
  process.cwd(),
  "tools/tests/fixtures/tdd-production-adapter.mjs",
);

try {
  const { observedContract } = await import(pathToFileURL(adapter));
  if (observedContract() !== "symmetric-runner-v1")
    throw new Error("ERR_CONTRACT_INCORRECT");
} catch (error) {
  if (error?.code === "ERR_MODULE_NOT_FOUND") {
    process.stderr.write("ERR_CONTRACT_MISSING\n");
    process.exit(1);
  }
  throw error;
}
