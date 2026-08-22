import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const requiredSkills = [
  "openspec-apply-change",
  "openspec-archive-change",
  "openspec-explore",
  "openspec-propose",
  "openspec-sync-specs",
  "openspec-update-change",
];

async function openspec(...args) {
  return exec("openspec", args, {
    cwd: repoRoot,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30_000,
  });
}

const config = await readFile(
  path.join(repoRoot, "openspec/config.yaml"),
  "utf8",
);
if (!/^schema:\s*spec-driven\s*$/m.test(config)) {
  throw new Error("openspec/config.yaml must select the spec-driven schema");
}

const { stdout: versionOutput } = await openspec("--version");
const version = versionOutput.trim();
if (!version) throw new Error("OpenSpec CLI did not report a version");

const { stdout: templateOutput } = await openspec(
  "templates",
  "--schema",
  "spec-driven",
  "--json",
);
const templates = JSON.parse(templateOutput);
for (const artifact of ["proposal", "specs", "design", "tasks"]) {
  if (!templates[artifact]?.path) {
    throw new Error(`spec-driven schema did not resolve ${artifact}`);
  }
}

for (const skill of requiredSkills) {
  const skillFile = path.join(repoRoot, ".agents/skills", skill, "SKILL.md");
  const skillFileStats = await stat(skillFile);
  if (!skillFileStats.isFile()) {
    throw new Error(`${skillFile} must be a regular file`);
  }
  await readFile(skillFile);
}

const { stdout: doctorOutput } = await openspec("doctor", "--json");
const doctor = JSON.parse(doctorOutput);
if (!doctor.root?.healthy)
  throw new Error("OpenSpec doctor reported an unhealthy root");

console.log(
  `OpenSpec ${version}: spec-driven schema, ${requiredSkills.length} Codex skills, and doctor are healthy.`,
);
