import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const packages = ["tokens", "icons", "styles", "behaviors"];
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "shlz-package-consumer-"),
);
const tarballDirectory = path.join(temporaryDirectory, "tarballs");
const consumerDirectory = path.join(temporaryDirectory, "consumer");

async function run(command, args, cwd = root) {
  return exec(command, args, { cwd, maxBuffer: 10 * 1024 * 1024 });
}

try {
  await run("npm", ["run", "build:packages"]);
  await mkdir(tarballDirectory);

  const tarballs = [];
  for (const packageName of packages) {
    const packageDirectory = path.join(root, "packages", packageName);
    const packageJson = JSON.parse(
      await readFile(path.join(packageDirectory, "package.json"), "utf8"),
    );
    const { stdout } = await run(
      "npm",
      ["pack", ".", "--json", "--pack-destination", tarballDirectory],
      packageDirectory,
    );
    const packResult = JSON.parse(stdout);
    const [{ filename, files }] = Array.isArray(packResult)
      ? packResult
      : Object.values(packResult);
    if (!files.some(({ path: file }) => file.startsWith("dist/"))) {
      throw new Error(`@shlz/${packageName} tarball has no dist files`);
    }
    const packedFiles = files.map(({ path: file }) => file);
    for (const exported of Object.values(packageJson.exports).flatMap(
      (target) =>
        typeof target === "string" ? [target] : Object.values(target),
    )) {
      const packedTarget = exported.replace(/^\.\//, "");
      const matches = packedTarget.includes("*")
        ? packedFiles.some((file) =>
            file.startsWith(packedTarget.slice(0, packedTarget.indexOf("*"))),
          )
        : packedFiles.includes(packedTarget);
      if (!matches) {
        throw new Error(
          `${packageJson.name} export ${exported} is absent from its tarball`,
        );
      }
    }
    tarballs.push(path.join(tarballDirectory, filename));
  }

  await mkdir(consumerDirectory);
  await writeFile(
    path.join(consumerDirectory, "package.json"),
    `${JSON.stringify({ name: "shlz-package-consumer-smoke", private: true, type: "module" }, null, 2)}\n`,
  );
  await run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
      ...tarballs,
    ],
    consumerDirectory,
  );

  await writeFile(
    path.join(consumerDirectory, "verify.mjs"),
    `import { access, readFile } from "node:fs/promises";

const moduleExports = ${JSON.stringify([
      "@shlz/tokens",
      "@shlz/icons",
      "@shlz/behaviors",
      "@shlz/behaviors/dropdown",
      "@shlz/behaviors/popover",
      "@shlz/behaviors/tooltip",
      "@shlz/behaviors/tabs",
      "@shlz/behaviors/modal",
      "@shlz/behaviors/drawer",
      "@shlz/behaviors/file-upload",
      "@shlz/behaviors/browser",
    ])};
for (const specifier of moduleExports) await import(specifier);

const assetExports = ${JSON.stringify([
      "@shlz/tokens/tokens.json",
      "@shlz/tokens/tokens.css",
      "@shlz/tokens/provenance.json",
      "@shlz/icons/manifest.json",
      "@shlz/icons/compatibility-aliases.json",
      "@shlz/icons/sprite.svg",
      "@shlz/styles",
      "@shlz/styles/shlz.css",
    ])};
for (const specifier of assetExports) {
  await access(new URL(import.meta.resolve(specifier)));
}

const manifestPath = new URL(import.meta.resolve("@shlz/icons/manifest.json"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const representativeFiles = ["icons/", "file-types/"].map((prefix) =>
  manifest.find(({ file }) => file.startsWith(prefix))?.file,
);
if (representativeFiles.some((file) => !file)) {
  throw new Error("Packed icon manifest lacks an exported wildcard family");
}
for (const file of representativeFiles) {
  await access(new URL(import.meta.resolve(\`@shlz/icons/\${file}\`)));
}
`,
  );
  await run("node", ["verify.mjs"], consumerDirectory);

  console.log(
    `Installed and consumed ${packages.length} packed SHLZ packages from a clean project.`,
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
