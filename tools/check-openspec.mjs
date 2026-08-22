import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
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
const upstreamManagedSkills = [
  "openspec-propose",
  "openspec-apply-change",
  "openspec-update-change",
];
const repoPolicyPattern =
  /requirements-elicitation|pre-authorized|harness pause|without asking the same decision again/;

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
  const content = await readFile(skillFile, "utf8");
  if (upstreamManagedSkills.includes(skill) && repoPolicyPattern.test(content))
    throw new Error(
      `${skillFile} is upstream-managed and must not contain repo-owned requirements policy`,
    );
}

const agentsPath = path.join(repoRoot, "AGENTS.md");
const requirementsPath = path.join(
  repoRoot,
  "docs/requirements-elicitation.md",
);
const [agentsContract, requirementsContract] = await Promise.all([
  readFile(agentsPath, "utf8"),
  readFile(requirementsPath, "utf8"),
]);
if (
  !/generated OpenSpec skills/.test(agentsContract) ||
  !/requirements-elicitation\.md/.test(agentsContract)
)
  throw new Error("AGENTS.md must own the generated-skill integration pointer");
for (const marker of [
  "no unresolved blocking user-owned decisions",
  "pre-authorized",
  "harness -- pause",
  "revision",
])
  if (!requirementsContract.includes(marker))
    throw new Error(`requirements integration is missing marker: ${marker}`);

const upgradeRoot = await mkdtemp(
  path.join(os.tmpdir(), "shlz-openspec-upgrade-"),
);
try {
  await mkdir(path.join(upgradeRoot, "openspec"), { recursive: true });
  await mkdir(path.join(upgradeRoot, "docs"), { recursive: true });
  await cp(path.join(repoRoot, ".agents"), path.join(upgradeRoot, ".agents"), {
    recursive: true,
  });
  await cp(agentsPath, path.join(upgradeRoot, "AGENTS.md"));
  await cp(
    requirementsPath,
    path.join(upgradeRoot, "docs/requirements-elicitation.md"),
  );
  await cp(
    path.join(repoRoot, "openspec/config.yaml"),
    path.join(upgradeRoot, "openspec/config.yaml"),
  );
  await openspec("update", "--force", upgradeRoot);
  const [updatedAgents, updatedRequirements] = await Promise.all([
    readFile(path.join(upgradeRoot, "AGENTS.md"), "utf8"),
    readFile(
      path.join(upgradeRoot, "docs/requirements-elicitation.md"),
      "utf8",
    ),
  ]);
  if (
    updatedAgents !== agentsContract ||
    updatedRequirements !== requirementsContract
  )
    throw new Error("OpenSpec update modified repo-owned integration policy");
  for (const skill of upstreamManagedSkills) {
    const updatedSkill = await readFile(
      path.join(upgradeRoot, ".agents/skills", skill, "SKILL.md"),
      "utf8",
    );
    if (repoPolicyPattern.test(updatedSkill))
      throw new Error(
        `${skill} unexpectedly owns repository policy after update`,
      );
  }

  const doctorProtectedFiles = [
    "AGENTS.md",
    "docs/requirements-elicitation.md",
    ...upstreamManagedSkills.map((skill) => `.agents/skills/${skill}/SKILL.md`),
  ];
  const beforeDoctor = await Promise.all(
    doctorProtectedFiles.map((file) => readFile(path.join(upgradeRoot, file))),
  );
  await exec("openspec", ["doctor", "--json"], {
    cwd: upgradeRoot,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30_000,
  });
  const afterDoctor = await Promise.all(
    doctorProtectedFiles.map((file) => readFile(path.join(upgradeRoot, file))),
  );
  for (const [index, file] of doctorProtectedFiles.entries())
    if (!beforeDoctor[index].equals(afterDoctor[index]))
      throw new Error(`OpenSpec doctor unexpectedly modified ${file}`);
} finally {
  await rm(upgradeRoot, { recursive: true, force: true });
}

const { stdout: doctorOutput } = await openspec("doctor", "--json");
const doctor = JSON.parse(doctorOutput);
if (!doctor.root?.healthy)
  throw new Error("OpenSpec doctor reported an unhealthy root");

console.log(
  `OpenSpec ${version}: spec-driven schema, ${requiredSkills.length} Codex skills, and doctor are healthy.`,
);
