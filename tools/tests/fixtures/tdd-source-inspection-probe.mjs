import { readFile } from "node:fs/promises";
import path from "node:path";

// Known-bad oracle: both the control and decoy deliberately preserve these
// symbols and text, so source inspection cannot observe the behavior change.
const source = await readFile(
  path.join(process.cwd(), process.env.SHLZ_TDD_ORACLE_ADAPTER),
  "utf8",
);
if (
  !source.includes("observedContract") ||
  !source.includes("symmetric-runner-v1")
)
  process.exit(1);
