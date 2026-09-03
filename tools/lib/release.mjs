import { createHash } from "node:crypto";
import { URL } from "node:url";
import { valid as validSemver } from "semver";

export const PACKAGE_ORDER = ["tokens", "icons", "styles", "behaviors"];
export const PACKAGE_NAMES = PACKAGE_ORDER.map((name) => `@shlz/${name}`);

const compareText = (left, right) => left.localeCompare(right, "en");

function fail(message) {
  throw new Error(message);
}

const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function isSemver(value) {
  return validSemver(value ?? "") !== null;
}

function validatePackageManifest(shortName, packageJson) {
  const expectedName = `@shlz/${shortName}`;
  if (packageJson?.name !== expectedName)
    fail(`release package must be named ${expectedName}`);
  if (!isSemver(packageJson.version))
    fail(`${expectedName} must have a valid SemVer version`);
  if (packageJson.private === true) fail(`${expectedName} must be publishable`);
  if (packageJson.publishConfig?.access !== "restricted")
    fail(`${expectedName} must declare restricted publication`);
  if (packageJson.publishConfig?.registry)
    fail(`${expectedName} must not embed a corporate registry endpoint`);
  if (
    !packageJson.files?.includes("dist") ||
    !packageJson.files?.includes("CHANGELOG.md")
  )
    fail(`${expectedName} must publish dist and its changelog`);
}

function validateInternalDependencies(packageJson, version) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
    ...packageJson.optionalDependencies,
  };
  for (const [dependency, range] of Object.entries(dependencies)) {
    if (dependency.startsWith("@shlz/") && range !== version)
      fail(`${packageJson.name} must use an exact internal dependency`);
  }
}

export function validatePackageSet(manifests) {
  const keys = Object.keys(manifests).sort(compareText);
  const expectedKeys = [...PACKAGE_ORDER].sort(compareText);
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys))
    fail("release set must contain exactly the four SHLZ packages");

  const packages = PACKAGE_ORDER.map((shortName) => manifests[shortName]);
  packages.forEach((packageJson, index) =>
    validatePackageManifest(PACKAGE_ORDER[index], packageJson),
  );

  const version = packages[0].version;
  if (packages.some((packageJson) => packageJson.version !== version))
    fail("all release packages must use one shared version");
  packages.forEach((packageJson) =>
    validateInternalDependencies(packageJson, version),
  );

  return { packageNames: packages.map(({ name }) => name), version };
}

export function validateChangesetConfig(config) {
  if (config?.access !== "restricted")
    fail("Changesets access must be restricted");
  if (config?.baseBranch !== "main")
    fail("Changesets base branch must be main");
  if (!config?.ignore?.includes("@shlz/showcase"))
    fail("Changesets must ignore the private showcase");
  const fixed = config?.fixed ?? [];
  if (
    fixed.length !== 1 ||
    JSON.stringify([...fixed[0]].sort(compareText)) !==
      JSON.stringify([...PACKAGE_NAMES].sort(compareText))
  )
    fail("Changesets fixed group must contain all four SHLZ packages");
}

export function assertSafeReleaseDocumentation(markdown) {
  for (const required of [
    "<gitlab-host>",
    "<project-or-group-id>",
    "GITLAB_NPM_READ_TOKEN",
    "GITLAB_NPM_PUBLISH_TOKEN",
  ]) {
    if (!markdown.includes(required))
      fail(`release documentation must include ${required}`);
  }
  for (const line of markdown.split(/\r?\n/)) {
    const assignment = line.match(/(?:TOKEN|PASSWORD|SECRET)=([^\s]+)/);
    if (
      assignment &&
      !assignment[1].startsWith("<") &&
      !assignment[1].startsWith("${")
    )
      fail("release documentation contains credential material");
    if (/https?:\/\/(?!<gitlab-host>|example\.)[^/\s]+\/api\/v4\//.test(line))
      fail("release documentation contains a corporate registry coordinate");
  }
}

function packagePath(name) {
  return name.match(/^packages\/(tokens|icons|styles|behaviors)\/(.+)$/);
}

function isPackageAffectingPath(name) {
  const match = packagePath(name);
  if (match) {
    const relative = match[2];
    return (
      !/^(?:test|tests|fixtures)\//.test(relative) &&
      !/(?:^|\.)test\.[^.]+$/.test(relative)
    );
  }
  return /^tools\/(generate|normalize-basic-icons)\.mjs$/.test(name);
}

export function validateReleaseIntent({ changedPaths, changesets }) {
  const affectingPaths = changedPaths.filter(isPackageAffectingPath);
  const affectsPackages = affectingPaths.length > 0;
  if (!affectsPackages) return { required: false };
  const changedChangesets = new Set(
    changedPaths
      .map((name) => name.match(/^\.changeset\/([^/]+)\.md$/)?.[1])
      .filter(Boolean),
  );
  const currentIntent = (changesets ?? []).filter(({ id }) =>
    changedChangesets.has(id),
  );
  if (!currentIntent.length)
    fail("package-affecting changes require a changeset in the current diff");
  for (const changeset of currentIntent) {
    if (
      !changeset.id ||
      !changeset.summary?.trim() ||
      !changeset.releases?.length
    )
      fail("changeset must include an id, summary, and releases");
    if (
      changeset.summary.trim().length < 20 ||
      !/(?:consumer|runtime|migration|breaking|interface|behaviou?r|visual|install|export|package)/i.test(
        changeset.summary,
      )
    )
      fail("changeset summary must describe consumer impact");
    for (const release of changeset.releases) {
      if (!PACKAGE_NAMES.includes(release.name))
        fail(`changeset release must name a SHLZ package: ${release.name}`);
      if (!["patch", "minor", "major"].includes(release.type))
        fail(`changeset has invalid SemVer intent: ${release.type}`);
    }
  }
  const affectedPackages = new Set(
    affectingPaths
      .map((name) => packagePath(name)?.[1])
      .filter(Boolean)
      .map((name) => `@shlz/${name}`),
  );
  const releasedPackages = new Set(
    currentIntent.flatMap(({ releases }) => releases.map(({ name }) => name)),
  );
  for (const name of affectedPackages) {
    if (!releasedPackages.has(name))
      fail(`changeset must name the affected package: ${name}`);
  }
  return { required: true };
}

function exportTargets(value) {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(exportTargets);
}

function matchesExport(files, target) {
  const normalized = target.replace(/^\.\//, "");
  if (!normalized.includes("*")) return files.includes(normalized);
  const [prefix, suffix] = normalized.split("*");
  return files.some(
    (file) => file.startsWith(prefix) && file.endsWith(suffix ?? ""),
  );
}

export function validatePackedPackage(packageJson, pack) {
  if (pack?.name !== packageJson.name || pack?.version !== packageJson.version)
    fail(`${packageJson.name} packed identity differs from its manifest`);
  if (!pack.filename || !pack.integrity)
    fail(`${packageJson.name} pack result lacks filename or integrity`);
  const files = (pack.files ?? []).map(({ path }) => path).sort(compareText);
  for (const file of files) {
    if (
      !["package.json", "README.md", "LICENSE", "CHANGELOG.md"].includes(
        file,
      ) &&
      !file.startsWith("dist/")
    )
      fail(`${packageJson.name} has unexpected tarball file: ${file}`);
    if (
      file.startsWith("dist/") &&
      (file
        .slice("dist/".length)
        .split("/")
        .some((part) => part.startsWith(".")) ||
        (!/\.(?:js|json|css|svg)$/.test(file) && !/\.d\.ts$/.test(file)))
    )
      fail(`${packageJson.name} has forbidden distributable file: ${file}`);
  }
  for (const target of exportTargets(packageJson.exports)) {
    if (!matchesExport(files, target))
      fail(`${packageJson.name} export ${target} is absent from its tarball`);
  }
  return {
    filename: pack.filename,
    files,
    integrity: pack.integrity,
    name: pack.name,
    version: pack.version,
  };
}

function candidatePayload(input) {
  const packages = PACKAGE_NAMES.map((name) =>
    input.packages?.find((item) => item.name === name),
  );
  if (
    packages.some((item) => !item) ||
    input.packages?.length !== PACKAGE_NAMES.length
  )
    fail("candidate must contain a complete verified release set");
  const version = packages[0].version;
  if (!isSemver(version) || packages.some((item) => item.version !== version))
    fail("candidate packages must use one shared SemVer version");
  if (input.validation !== "pass")
    fail("candidate must contain a passing validation result");
  if (!/^[0-9a-f]{40,64}$/.test(input.commit ?? ""))
    fail("candidate must bind an immutable source commit");
  for (const item of packages) {
    if (!item.filename || !item.integrity || !item.files?.length)
      fail(`candidate package identity is incomplete: ${item.name}`);
    if (!input.changelogDigests?.[item.name])
      fail(`candidate changelog identity is incomplete: ${item.name}`);
  }
  return {
    version: 1,
    commit: input.commit,
    releaseVersion: version,
    validation: input.validation,
    changelogDigests: Object.fromEntries(
      PACKAGE_NAMES.map((name) => [name, input.changelogDigests[name]]),
    ),
    packages,
  };
}

export function createCandidateManifest(input) {
  const payload = candidatePayload(input);
  return { ...payload, digest: digest(payload) };
}

export function validateCandidateManifest(candidate) {
  const payload = candidatePayload(candidate);
  if (candidate.digest !== digest(payload)) fail("candidate identity differs");
  return payload;
}

export function planCandidatePublication({ candidate, registry = {} }) {
  const payload = validateCandidateManifest(candidate);
  return payload.packages.map(({ name, version, integrity }) => {
    const existing = registry[name];
    if (!existing) return { action: "publish", name, version };
    if (existing.version !== version || existing.integrity !== integrity)
      fail(`registry collision for ${name}@${version}`);
    return { action: "skip", name, version };
  });
}

export function planPromotion({ candidate, registry = {} }) {
  const payload = validateCandidateManifest(candidate);
  const complete = payload.packages.every(({ name, version, integrity }) => {
    const existing = registry[name];
    return existing?.version === version && existing?.integrity === integrity;
  });
  if (!complete) fail("promotion requires a complete verified release set");
  return payload.packages.map(({ name, version }) => ({
    name,
    operation: "dist-tag",
    tag: "latest",
    version,
  }));
}

export function planRollback({
  currentLatest,
  defectiveVersion,
  reason,
  target,
}) {
  const payload = validateCandidateManifest(target);
  const priorVersions = PACKAGE_NAMES.map((name) => currentLatest?.[name]);
  if (
    priorVersions.some((version) => !version) ||
    new Set(priorVersions).size !== 1
  )
    fail("rollback requires a coherent current stable release set");
  if (!isSemver(defectiveVersion) || !reason?.trim())
    fail("rollback requires a defective version and reason");
  if (priorVersions[0] !== defectiveVersion)
    fail("rollback defective version must be the current stable version");
  if (payload.releaseVersion === defectiveVersion)
    fail("rollback target must differ from the defective version");
  return {
    targetVersion: payload.releaseVersion,
    priorLatest: { ...currentLatest },
    mutations: PACKAGE_NAMES.map((name) => ({
      name,
      operation: "dist-tag",
      tag: "latest",
      version: payload.releaseVersion,
    })),
    deprecations: PACKAGE_NAMES.map((name) => ({
      message: reason,
      name,
      operation: "deprecate",
      version: defectiveVersion,
    })),
  };
}

export function requireCleanReleaseState(status) {
  if (status.trim()) fail("release validation requires clean generated state");
}

export function validateRegistryConfiguration(environment, mode) {
  if (!["verify", "publish", "rollback"].includes(mode))
    fail("registry operation mode is invalid");
  const required = ["SHLZ_NPM_REGISTRY_URL", "SHLZ_GITLAB_REGISTRY_ID"];
  required.push(
    mode === "verify" ? "GITLAB_NPM_READ_TOKEN" : "GITLAB_NPM_PUBLISH_TOKEN",
  );
  const missing = required.filter((name) => !environment[name]?.trim());
  if (missing.length)
    fail(`registry configuration is missing: ${missing.join(", ")}`);
  let registry;
  try {
    registry = new URL(environment.SHLZ_NPM_REGISTRY_URL);
  } catch {
    fail("SHLZ_NPM_REGISTRY_URL must be a valid URL");
  }
  if (
    registry.protocol !== "https:" ||
    !/\/api\/v4\/(?:projects|groups)\/[^/]+\/(?:-\/)?packages\/npm\/?$/.test(
      registry.pathname,
    )
  )
    fail("SHLZ_NPM_REGISTRY_URL must be a corporate GitLab npm endpoint");
  const registryId = environment.SHLZ_GITLAB_REGISTRY_ID;
  if (
    !registry.pathname.includes(`/${registryId}/`) &&
    !registry.pathname.includes(`/${encodeURIComponent(registryId)}/`)
  )
    fail("registry endpoint does not match SHLZ_GITLAB_REGISTRY_ID");
  return {
    mode,
    registryId,
    registry: registry.href,
  };
}

export async function executeTagTransaction({
  mutate,
  mutations,
  previous,
  restore = ({ mutation, previousVersion }) =>
    mutate({ ...mutation, version: previousVersion }),
  verify,
}) {
  const applied = [];
  try {
    for (const mutation of mutations) {
      await mutate(mutation);
      applied.push(mutation);
    }
    await verify(mutations);
    return { applied, outcome: "pass", repaired: [] };
  } catch (cause) {
    const repaired = [];
    const repairFailures = [];
    for (const mutation of [...applied].reverse()) {
      try {
        await restore({
          mutation,
          previousVersion: previous[mutation.name] ?? null,
        });
        repaired.push(mutation.name);
      } catch (error) {
        repairFailures.push({ message: error.message, name: mutation.name });
      }
    }
    const repair = repairFailures.length ? "incomplete" : "complete";
    const error = new Error(`stable-tag transaction failed; repair ${repair}`);
    error.cause = cause;
    error.audit = { applied, repairFailures, repaired };
    throw error;
  }
}

export function synchronizeWorkspaceConsumer(packageJson, version) {
  if (!isSemver(version)) fail("workspace consumer version is invalid");
  const dependencies = { ...packageJson.dependencies };
  for (const name of PACKAGE_NAMES) {
    if (name in dependencies) dependencies[name] = version;
  }
  return { ...packageJson, dependencies };
}
