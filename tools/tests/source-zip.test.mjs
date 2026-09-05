import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { zipSync } from "fflate";
import { listZipEntries, readZipEntry } from "../lib/source-zip.mjs";

test("ZIP lookup preserves Unicode names and exact bytes for stored and deflated entries", () => {
  const name = "components/Статус [1]/вариант.svg";
  const bytes = Buffer.from([0, 13, 10, 255, 128, 42]);
  for (const level of [0, 6]) {
    const archive = zipSync(
      { [name]: bytes, "other.svg": Buffer.from("other") },
      { level },
    );
    assert.deepEqual(readZipEntry(archive, name), bytes);
    assert.deepEqual(listZipEntries(archive), [name, "other.svg"]);
    assert.throws(
      () => readZipEntry(archive, "components/*/вариант.svg"),
      /ZIP entry not found/,
    );
  }
});

test("ZIP lookup rejects invalid archives and missing entries", () => {
  assert.throws(() => readZipEntry(Buffer.from("not a ZIP"), "missing"));
  assert.throws(
    () => readZipEntry(zipSync({}), "missing"),
    /ZIP entry not found: missing/,
  );
});

test("authoritative Cyrillic source manifest and variant retain their byte hashes", async () => {
  const archive = await readFile(
    "shlz-design-source/raw/svg/UI Kit – Interface elements.zip",
  );
  const entry = "components/Status Обращения/manifest.json";
  assert.ok(listZipEntries(archive).includes(entry));
  const bytes = readZipEntry(archive, entry);
  const manifest = JSON.parse(bytes.toString("utf8"));
  assert.equal(manifest.originalName, "Status Обращения");
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "206dfa6c94ae493e717d648f47dd603b15b86ddce273b70a29a950c70d0d9e87",
  );
  const variant = readZipEntry(
    archive,
    `components/Status Обращения/variants/${manifest.variants[0].safeFilename}`,
  );
  assert.equal(
    createHash("sha256").update(variant).digest("hex"),
    "6c13a3a74a4779635905cb757ae5315d7496dce0afc2fd06d5082d08020a85fd",
  );
});
