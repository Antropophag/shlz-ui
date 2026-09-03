import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [target, invariant] = process.argv.slice(2);
if (!target || !invariant) process.exit(2);
const targetStat = await stat(target);
const modulePath = targetStat.isDirectory()
  ? path.join(target, "tools/lib/release.mjs")
  : target;
const release = await import(pathToFileURL(modulePath));

const candidate = () =>
  release.createCandidateManifest({
    commit: "a".repeat(40),
    changelogDigests: Object.fromEntries(
      release.PACKAGE_ORDER.map((name) => [
        `@shlz/${name}`,
        `changelog-${name}`,
      ]),
    ),
    packages: release.PACKAGE_ORDER.map((name) => ({
      filename: `shlz-${name}-0.1.0.tgz`,
      files: ["dist/index.js", "package.json"],
      integrity: `sha512-${name}`,
      name: `@shlz/${name}`,
      version: "0.1.0",
    })),
    validation: "pass",
  });

async function rejects(operation) {
  try {
    await operation();
    return false;
  } catch {
    return true;
  }
}

const checks = {
  "missing-registry-config-cannot-mutate": () =>
    rejects(() => release.validateRegistryConfiguration({}, "publish")),
  "partial-release-cannot-promote": () =>
    rejects(() =>
      release.planPromotion({
        candidate: candidate(),
        registry: {
          "@shlz/tokens": {
            integrity: "sha512-tokens",
            version: "0.1.0",
          },
        },
      }),
    ),
  "registry-collision-cannot-overwrite": () =>
    rejects(() =>
      release.planCandidatePublication({
        candidate: candidate(),
        registry: {
          "@shlz/tokens": {
            integrity: "sha512-different",
            version: "0.1.0",
          },
        },
      }),
    ),
  "incomplete-rollback-cannot-mutate": () => {
    const targetCandidate = candidate();
    return rejects(() =>
      release.planRollback({
        currentLatest: {},
        defectiveVersion: "0.2.0",
        reason: "Broken.",
        target: {
          ...targetCandidate,
          packages: targetCandidate.packages.slice(0, 3),
        },
      }),
    );
  },
};

if (!checks[invariant] || !(await checks[invariant]())) process.exit(1);
