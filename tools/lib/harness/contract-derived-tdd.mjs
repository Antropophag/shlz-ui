import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const semanticsCategories = new Set([
  "material-behavior",
  "material-state",
  "source-only",
  "absence-only",
  "documentation-only",
]);
const materialCategories = new Set(["material-behavior", "material-state"]);
const validationImpactKinds = new Set([
  "harness",
  "spec",
  "docs",
  "product",
  "browser-contract",
  "browser-executable",
]);

const order = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(target)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(target);
  }
  return files.sort(order);
}

export function parseDeltaScenarioSemantics(
  contracts,
  { requireValidationImpact = false } = {},
) {
  if (!Array.isArray(contracts) || contracts.length === 0)
    throw new Error("OpenSpec change requires at least one delta spec");
  const scenarios = [];
  const validationImpacts = new Set();
  const identities = new Set();
  const normalizedContracts = [...contracts].map((contract) => ({
    ...contract,
    content:
      typeof contract?.content === "string"
        ? contract.content
            .replace(/\r\n?/g, "\n")
            .split("\n")
            .map((line) => line.replace(/\s+$/u, ""))
            .join("\n")
            .trimEnd()
        : contract?.content,
  }));
  for (const contract of normalizedContracts.sort((a, b) =>
    order(a.capability, b.capability),
  )) {
    if (
      !contract ||
      typeof contract.capability !== "string" ||
      !contract.capability ||
      typeof contract.content !== "string"
    )
      throw new Error("delta spec requires capability and content");
    const lines = contract.content.split(/\r?\n/);
    let requirement = null;
    for (let index = 0; index < lines.length; index++) {
      const requirementMatch = lines[index].match(
        /^### Requirement:\s*(.+?)\s*$/,
      );
      if (requirementMatch) {
        requirement = requirementMatch[1];
        continue;
      }
      const scenarioMatch = lines[index].match(/^#### Scenario:\s*(.+?)\s*$/);
      if (!scenarioMatch) continue;
      if (!requirement)
        throw new Error(
          `scenario ${scenarioMatch[1]} in ${contract.capability} has no requirement`,
        );
      const scenario = scenarioMatch[1];
      const declarations = [];
      const impactDeclarations = [];
      let firstContent = null;
      for (let cursor = index + 1; cursor < lines.length; cursor++) {
        if (/^#{3,4}\s/.test(lines[cursor])) break;
        if (firstContent === null && lines[cursor].trim())
          firstContent = lines[cursor].trim();
        const declaration = lines[cursor].match(
          /<!--\s*implementation-semantics:\s*([^\s>]+)\s*-->/g,
        );
        if (declaration)
          declarations.push(
            ...declaration.map(
              (value) =>
                value.match(/implementation-semantics:\s*([^\s>]+)/)[1],
            ),
          );
        const impactDeclaration = lines[cursor].match(
          /<!--\s*validation-impact:\s*([^>]+?)\s*-->/g,
        );
        if (impactDeclaration)
          impactDeclarations.push(
            ...impactDeclaration.map((value) =>
              value
                .match(/validation-impact:\s*([^>]+?)\s*-->/)[1]
                .split(",")
                .map((kind) => kind.trim()),
            ),
          );
      }
      const identity = `${contract.capability}::${requirement}::${scenario}`;
      if (identities.has(identity))
        throw new Error(`duplicate OpenSpec scenario identity: ${identity}`);
      identities.add(identity);
      if (declarations.length !== 1)
        throw new Error(
          `${identity} requires exactly one implementation-semantics declaration`,
        );
      if (!/^<!--\s*implementation-semantics:/.test(firstContent ?? ""))
        throw new Error(
          `${identity} requires an adjacent implementation-semantics declaration`,
        );
      const semantics = declarations[0];
      if (!semanticsCategories.has(semantics))
        throw new Error(
          `${identity} has unknown implementation-semantics: ${semantics}`,
        );
      if (requireValidationImpact && impactDeclarations.length !== 1)
        throw new Error(
          `${identity} requires exactly one validation-impact declaration`,
        );
      scenarios.push({ id: identity, semantics });
      for (const kinds of impactDeclarations) {
        for (const kind of kinds) {
          if (!validationImpactKinds.has(kind))
            throw new Error(
              `${identity} has unknown validation-impact: ${kind}`,
            );
          validationImpacts.add(kind);
        }
      }
    }
  }
  if (scenarios.length === 0)
    throw new Error("OpenSpec delta specs require at least one scenario");
  scenarios.sort((a, b) => order(a.id, b.id));
  return {
    version: 1,
    contractDigest: digest(
      normalizedContracts.map(({ capability, content }) => ({
        capability,
        content,
      })),
    ),
    scenarios,
    requiredScenarioIds: scenarios
      .filter(({ semantics }) => materialCategories.has(semantics))
      .map(({ id }) => id),
    validationImpact:
      validationImpacts.size === 0
        ? null
        : {
            version: 1,
            kinds: [...validationImpacts].sort(order),
            browserExecutable: [...validationImpacts].some((kind) =>
              ["product", "browser-contract", "browser-executable"].includes(
                kind,
              ),
            ),
          },
  };
}

export async function loadChangeScenarioSemantics(
  repoRoot,
  change,
  options = {},
) {
  if (
    typeof change !== "string" ||
    !change ||
    change.includes("/") ||
    change.includes("\\") ||
    change === "." ||
    change === ".."
  )
    throw new Error("requirements-selected OpenSpec change is invalid");
  const specsRoot = path.join(repoRoot, "openspec", "changes", change, "specs");
  let files;
  try {
    files = await markdownFiles(specsRoot);
  } catch (error) {
    throw new Error(
      `cannot read OpenSpec delta specs for ${change}: ${error.message}`,
    );
  }
  const contracts = await Promise.all(
    files.map(async (file) => ({
      capability: path
        .relative(specsRoot, path.dirname(file))
        .split(path.sep)
        .join("/"),
      content: await readFile(file, "utf8"),
    })),
  );
  const parsed = parseDeltaScenarioSemantics(contracts, options);
  return { ...parsed, change };
}

export async function assertCurrentContractDerivedTdd(repoRoot, plan) {
  if (plan.contractDerivedTdd === undefined) return plan;
  const current = await loadChangeScenarioSemantics(
    repoRoot,
    plan.openSpecChange,
  );
  const binding = contractDerivedTddBinding(current);
  if (
    binding.contractDigest !== plan.contractDerivedTdd.contractDigest ||
    JSON.stringify(binding.requiredScenarioIds) !==
      JSON.stringify(plan.contractDerivedTdd.requiredScenarioIds)
  )
    throw new Error(
      `contract-derived TDD obligation is stale for ${plan.openSpecChange}`,
    );
  return plan;
}

export function contractDerivedTddBinding(classification) {
  return {
    version: 1,
    openSpecChange: classification.change,
    contractDigest: classification.contractDigest,
    requiredScenarioIds: [...classification.requiredScenarioIds],
  };
}
