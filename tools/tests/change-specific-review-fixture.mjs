import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execFile);
const change = "require-change-specific-failure-invariants";
const knownBadRevision = "fd4f1cfb6f214ee7068160f97e32ac34c4c9404c";
const { stdout } = await exec(
  process.execPath,
  ["tools/tests/pr32-failure-path-fixture.mjs"],
  {
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  },
);
const baseline = JSON.parse(stdout);
const [core, cli, spec] = await Promise.all([
  readFile("tools/lib/harness/core.mjs", "utf8"),
  readFile("tools/harness.mjs", "utf8"),
  readFile(
    `openspec/changes/${change}/specs/harness/change-specific-failure-invariants/spec.md`,
    "utf8",
  ),
]);
const badCore = (
  await exec("git", ["show", `${knownBadRevision}:tools/lib/harness/core.mjs`])
).stdout;
const checks = [
  {
    id: "marked-contracts-require-manifest",
    concern: "state-machine",
    pass:
      cli.includes("material review-init requires --change") &&
      (spec.match(/<!-- failure-invariant:/g) ?? []).length === 5,
    knownBadPass: badCore.includes("loadChangeFailureInvariants"),
  },
  {
    id: "manifest-sources-are-grounded",
    concern: "persistence",
    pass:
      core.includes("change-specific failure invariant is ungrounded") &&
      core.includes("OpenSpec change has no delta specs"),
    knownBadPass: badCore.includes(
      "change-specific failure invariant is ungrounded",
    ),
  },
  {
    id: "marked-contract-coverage-is-complete",
    concern: "persistence",
    pass: core.includes("change-specific failure invariants do not cover"),
    knownBadPass: badCore.includes(
      "change-specific failure invariants do not cover",
    ),
  },
  {
    id: "change-specific-results-discriminate",
    concern: "state-machine",
    pass:
      core.includes("expected.set(`${changeBinding.change}/${invariant.id}`") &&
      core.includes("missingInvariants = [...expected]"),
    knownBadPass: badCore.includes("missingInvariants = [...expected]"),
  },
  {
    id: "contract-edits-stale-proof",
    concern: "persistence",
    pass:
      core.includes("proof.manifestDigest !== changeBinding.manifestDigest") &&
      core.includes("proof.contractDigest !== changeBinding.contractDigest"),
    knownBadPass: badCore.includes(
      "proof.contractDigest !== changeBinding.contractDigest",
    ),
  },
];
baseline.invariants.push(
  ...checks.map(({ id, concern, pass, knownBadPass }) => ({
    id: `${change}/${id}`,
    concern,
    knownBad: knownBadPass ? "pass" : "fail",
    reviewedHead: pass ? "pass" : "fail",
  })),
);
process.stdout.write(`${JSON.stringify(baseline)}\n`);
