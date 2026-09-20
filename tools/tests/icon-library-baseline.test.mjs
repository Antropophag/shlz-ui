import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const json = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

test("pre-expansion icon contract remains an immutable compatibility subset", async () => {
  const baseline = await json("tools/fixtures/icon-library-baseline.json");
  const manifest = await json("packages/icons/dist/manifest.json");
  const aliases = await json("packages/icons/dist/compatibility-aliases.json");
  const original = manifest.slice(0, baseline.canonicalCount);
  const stableContract = original.map((icon) => ({
    name: icon.name,
    category: icon.category,
    file: icon.file,
    colorMode: icon.colorMode,
    paintPolicy: icon.paintPolicy,
    variants: icon.variants.map((variant) => ({
      name: variant.name,
      file: variant.file,
      geometrySha256: variant.geometrySha256,
    })),
  }));
  const stableAliases = aliases
    .slice(0, baseline.aliasCount)
    .map(({ alias, target, variant }) => ({ alias, target, variant }));

  assert.equal(sha256(JSON.stringify(stableContract)), baseline.contractDigest);
  assert.equal(sha256(JSON.stringify(stableAliases)), baseline.aliasDigest);
  assert.equal(
    sha256(await readFile("shlz-design-source/raw/svg/Icons.svg")),
    baseline.iconsSourceSha256,
  );
});
