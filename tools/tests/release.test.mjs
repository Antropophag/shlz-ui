import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  assertSafeReleaseDocumentation,
  createCandidateManifest,
  executeTagTransaction,
  PACKAGE_ORDER,
  planCandidatePublication,
  planPromotion,
  planRollback,
  requireCleanReleaseState,
  synchronizeWorkspaceConsumer,
  validateRegistryConfiguration,
  validatePackedPackage,
  validateReleaseIntent,
  validateChangesetConfig,
  validatePackageSet,
} from "../lib/release.mjs";

const root = path.resolve(import.meta.dirname, "../..");

const manifests = (overrides = {}) =>
  Object.fromEntries(
    PACKAGE_ORDER.map((shortName) => [
      shortName,
      {
        name: `@shlz/${shortName}`,
        version: "0.1.0",
        files: ["dist", "CHANGELOG.md"],
        publishConfig: { access: "restricted" },
        exports: { ".": "./dist/index.js" },
        ...overrides[shortName],
      },
    ]),
  );

test("release set has exactly four fixed-version private packages", () => {
  assert.deepEqual(validatePackageSet(manifests()), {
    packageNames: PACKAGE_ORDER.map((name) => `@shlz/${name}`),
    version: "0.1.0",
  });

  assert.throws(
    () => validatePackageSet(manifests({ icons: { version: "0.2.0" } })),
    /shared version/,
  );
  assert.throws(
    () =>
      validatePackageSet(
        manifests({ styles: { dependencies: { "@shlz/tokens": "^0.1.0" } } }),
      ),
    /exact internal dependency/,
  );
  assert.throws(
    () =>
      validatePackageSet(
        manifests(
          Object.fromEntries(
            PACKAGE_ORDER.map((name) => [
              name,
              { version: "1.0.0-alpha..invalid" },
            ]),
          ),
        ),
      ),
    /valid SemVer/,
  );
});

test("Changesets config fixes the release set and targets protected main", () => {
  assert.doesNotThrow(() =>
    validateChangesetConfig({
      access: "restricted",
      baseBranch: "main",
      fixed: [PACKAGE_ORDER.map((name) => `@shlz/${name}`)],
      ignore: ["@shlz/showcase"],
    }),
  );
  assert.throws(
    () =>
      validateChangesetConfig({
        access: "restricted",
        baseBranch: "main",
        fixed: [["@shlz/tokens", "@shlz/styles"]],
        ignore: ["@shlz/showcase"],
      }),
    /fixed group/,
  );
});

test("tracked package manifests satisfy the release-set contract", async () => {
  const tracked = {};
  for (const name of PACKAGE_ORDER) {
    tracked[name] = JSON.parse(
      await readFile(path.join(root, "packages", name, "package.json"), "utf8"),
    );
  }
  assert.equal(validatePackageSet(tracked).version, tracked.tokens.version);
});

test("release documentation uses placeholders and contains no credentials", async () => {
  const documentation = await readFile(
    path.join(root, "docs/releasing.md"),
    "utf8",
  );
  assert.doesNotThrow(() => assertSafeReleaseDocumentation(documentation));
});

test("package-affecting diffs require consistent release intent", () => {
  assert.throws(
    () =>
      validateReleaseIntent({
        changedPaths: ["packages/icons/src/index.ts"],
        changesets: [],
      }),
    /changeset/,
  );
  assert.doesNotThrow(() =>
    validateReleaseIntent({
      changedPaths: [".changeset/icons.md", "packages/icons/src/index.ts"],
      changesets: [
        {
          id: "icons",
          summary: "Add an icon export for consumers.",
          releases: [{ name: "@shlz/icons", type: "minor" }],
        },
      ],
    }),
  );
  assert.throws(
    () =>
      validateReleaseIntent({
        changedPaths: [".changeset/wrong.md", "packages/icons/src/index.ts"],
        changesets: [
          {
            id: "wrong",
            summary: "Wrong package for consumers.",
            releases: [{ name: "@other/icons", type: "patch" }],
          },
        ],
      }),
    /SHLZ package/,
  );
  assert.throws(
    () =>
      validateReleaseIntent({
        changedPaths: ["packages/icons/src/index.ts"],
        changesets: [
          {
            id: "stale-on-main",
            summary: "Unrelated pending change.",
            releases: [{ name: "@shlz/icons", type: "patch" }],
          },
        ],
      }),
    /current diff/,
  );
  assert.throws(
    () =>
      validateReleaseIntent({
        changedPaths: [".changeset/mismatch.md", "packages/icons/src/index.ts"],
        changesets: [
          {
            id: "mismatch",
            summary: "Correct a token value for consumers.",
            releases: [{ name: "@shlz/tokens", type: "patch" }],
          },
        ],
      }),
    /affected package/,
  );
  assert.doesNotThrow(() =>
    validateReleaseIntent({
      changedPaths: ["docs/releasing.md"],
      changesets: [],
    }),
  );
  assert.doesNotThrow(() =>
    validateReleaseIntent({
      changedPaths: ["packages/icons/tests/catalog.test.mjs"],
      changesets: [],
    }),
  );
});

test("packed package contains every export and only distributable files", () => {
  const packageJson = manifests().tokens;
  const pack = {
    name: packageJson.name,
    version: packageJson.version,
    filename: "shlz-tokens-0.1.0.tgz",
    integrity: "sha512-approved",
    files: [{ path: "package.json" }, { path: "dist/index.js" }],
  };
  assert.deepEqual(validatePackedPackage(packageJson, pack), {
    filename: pack.filename,
    files: ["dist/index.js", "package.json"],
    integrity: pack.integrity,
    name: packageJson.name,
    version: packageJson.version,
  });
  assert.throws(
    () =>
      validatePackedPackage(packageJson, {
        ...pack,
        files: [{ path: "package.json" }],
      }),
    /export.*absent/,
  );
  assert.throws(
    () =>
      validatePackedPackage(packageJson, {
        ...pack,
        files: [...pack.files, { path: ".env" }],
      }),
    /unexpected tarball file/,
  );
  assert.throws(
    () =>
      validatePackedPackage(packageJson, {
        ...pack,
        files: [...pack.files, { path: "dist/.env" }],
      }),
    /forbidden distributable file/,
  );
  assert.throws(
    () =>
      validatePackedPackage(packageJson, {
        ...pack,
        files: [...pack.files, { path: "dist/notes.txt" }],
      }),
    /forbidden distributable file/,
  );
});

const candidate = () =>
  createCandidateManifest({
    commit: "a".repeat(40),
    changelogDigests: Object.fromEntries(
      PACKAGE_ORDER.map((name) => [`@shlz/${name}`, `changelog-${name}`]),
    ),
    packages: PACKAGE_ORDER.map((name) => ({
      filename: `shlz-${name}-0.1.0.tgz`,
      files: ["dist/index.js", "package.json"],
      integrity: `sha512-${name}`,
      name: `@shlz/${name}`,
      version: "0.1.0",
    })),
    validation: "pass",
  });

test("candidate identity drives collision-safe publication and promotion", () => {
  const release = candidate();
  const partialRegistry = {
    "@shlz/tokens": { integrity: "sha512-tokens", version: "0.1.0" },
  };
  assert.deepEqual(
    planCandidatePublication({ candidate: release, registry: partialRegistry }),
    PACKAGE_ORDER.map((name) => ({
      action: name === "tokens" ? "skip" : "publish",
      name: `@shlz/${name}`,
      version: "0.1.0",
    })),
  );
  assert.throws(
    () =>
      planCandidatePublication({
        candidate: release,
        registry: {
          "@shlz/tokens": { integrity: "sha512-different", version: "0.1.0" },
        },
      }),
    /collision/,
  );
  assert.throws(
    () => planPromotion({ candidate: release, registry: partialRegistry }),
    /complete verified release set/,
  );
  assert.equal(
    planPromotion({
      candidate: release,
      registry: Object.fromEntries(
        release.packages.map(({ name, version, integrity }) => [
          name,
          { version, integrity },
        ]),
      ),
    }).length,
    4,
  );
});

test("rollback targets a complete verified set and never deletes artifacts", () => {
  const release = candidate();
  const rollback = planRollback({
    currentLatest: Object.fromEntries(
      PACKAGE_ORDER.map((name) => [`@shlz/${name}`, "0.2.0"]),
    ),
    defectiveVersion: "0.2.0",
    reason: "Consumer regression; use 0.1.0.",
    target: release,
  });
  assert.equal(rollback.mutations.length, 4);
  assert.equal(rollback.deprecations.length, 4);
  assert.ok(
    rollback.mutations.every(({ operation }) => operation === "dist-tag"),
  );
  assert.ok(
    rollback.deprecations.every(({ operation }) => operation === "deprecate"),
  );
  assert.ok(!JSON.stringify(rollback).includes("unpublish"));
  assert.throws(
    () =>
      planRollback({
        currentLatest: {},
        defectiveVersion: "0.2.0",
        reason: "Broken.",
        target: { ...release, packages: release.packages.slice(0, 3) },
      }),
    /complete verified release set/,
  );
  assert.throws(
    () =>
      planRollback({
        currentLatest: {},
        defectiveVersion: "0.2.0",
        reason: "Broken.",
        target: release,
      }),
    /rollback requires a coherent current stable release set/,
  );
});

test("release state and registry configuration fail closed without secrets", () => {
  assert.doesNotThrow(() => requireCleanReleaseState(""));
  assert.throws(
    () => requireCleanReleaseState(" M packages/icons/dist/index.js\n"),
    /clean generated state/,
  );
  const configuration = {
    SHLZ_GITLAB_REGISTRY_ID: "123",
    SHLZ_NPM_REGISTRY_URL:
      "https://example.invalid/api/v4/projects/123/packages/npm/",
    GITLAB_NPM_READ_TOKEN: "read-secret-value",
  };
  assert.doesNotThrow(() =>
    validateRegistryConfiguration(configuration, "verify"),
  );
  assert.equal(
    validateRegistryConfiguration(
      {
        ...configuration,
        SHLZ_NPM_REGISTRY_URL:
          "https://example.invalid/api/v4/projects/123/packages/npm",
      },
      "verify",
    ).registry,
    "https://example.invalid/api/v4/projects/123/packages/npm/",
  );
  assert.throws(
    () => validateRegistryConfiguration(configuration, "publish"),
    (error) =>
      /GITLAB_NPM_PUBLISH_TOKEN/.test(error.message) &&
      !error.message.includes(configuration.GITLAB_NPM_READ_TOKEN),
  );
});

test("failed stable-tag mutation repairs the prior coherent set", async () => {
  const calls = [];
  const mutations = PACKAGE_ORDER.map((name) => ({
    name: `@shlz/${name}`,
    operation: "dist-tag",
    tag: "latest",
    version: "0.2.0",
  }));
  const previous = Object.fromEntries(
    PACKAGE_ORDER.map((name) => [`@shlz/${name}`, "0.1.0"]),
  );
  await assert.rejects(
    executeTagTransaction({
      mutate: async ({ name, version }) => {
        calls.push(`${name}@${version}`);
        if (name === "@shlz/styles" && version === "0.2.0")
          throw new Error("registry unavailable");
      },
      mutations,
      previous,
      verify: async () => {},
    }),
    /stable-tag transaction failed; repair complete/,
  );
  assert.deepEqual(calls, [
    "@shlz/tokens@0.2.0",
    "@shlz/icons@0.2.0",
    "@shlz/styles@0.2.0",
    "@shlz/icons@0.1.0",
    "@shlz/tokens@0.1.0",
  ]);
});

test("version preparation keeps the private showcase on the fixed package set", () => {
  const packageJson = synchronizeWorkspaceConsumer(
    {
      name: "@shlz/showcase",
      private: true,
      dependencies: {
        "@shlz/tokens": "0.1.0",
        "@shlz/icons": "0.1.0",
        other: "1.0.0",
      },
    },
    "0.2.0",
  );
  assert.equal(packageJson.dependencies["@shlz/tokens"], "0.2.0");
  assert.equal(packageJson.dependencies["@shlz/icons"], "0.2.0");
  assert.equal(packageJson.dependencies.other, "1.0.0");
});
