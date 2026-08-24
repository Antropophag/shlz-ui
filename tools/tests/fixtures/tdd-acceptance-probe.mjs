import path from "node:path";
import { pathToFileURL } from "node:url";
import { lstat, writeFile } from "node:fs/promises";

if (process.env.SHLZ_TDD_PROBE_MODE === "nondeterministic") {
  process.stderr.write(`ERR_NONDETERMINISTIC_${process.pid}\n`);
  process.exit(1);
}

if (
  process.env.SHLZ_TDD_PROBE_MODE === "dirty" &&
  (await lstat(path.join(process.cwd(), ".git"))).isFile()
)
  await writeFile(
    path.join(process.cwd(), "tdd-dirty-evidence.txt"),
    "dirty\n",
  );

const adapter = path.join(
  process.cwd(),
  process.env.SHLZ_TDD_ORACLE_ADAPTER ??
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
