import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import test from "node:test";

const {
  baseline,
  delivery,
  digest,
  materialSignals,
  receipt,
  repository,
  route,
} = await import(
  pathToFileURL(
    process.env.SHLZ_IDENTITY_CORE ??
      path.resolve(import.meta.dirname, "../lib/harness/core.mjs"),
  )
);
const exec = promisify(execFile);
const git = async (cwd, ...args) =>
  (await exec("git", args, { cwd })).stdout.trim();

async function checkout(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "shlz-identity-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, "checkout");
  await mkdir(root);
  await git(root, "init", "-b", "main");
  await git(root, "remote", "add", "origin", "https://example.test/repo.git");
  return { dir, root };
}

test("repository emits stable version 2 identities without raw coordinates", async (t) => {
  const { root } = await checkout(t);
  for (const origin of [
    "https://private-user:private-token@example.test/repo.git",
    path.join(root, "local-origin.git"),
  ]) {
    await git(root, "remote", "set-url", "origin", origin);
    const value = await repository(root);
    assert.equal(value.version, 2);
    assert.deepEqual(Object.keys(value).sort(), [
      "checkoutDigest",
      "digest",
      "originDigest",
      "version",
    ]);
    for (const key of ["checkoutDigest", "originDigest", "digest"])
      assert.match(value[key], /^[0-9a-f]{64}$/);
    assert.equal(JSON.stringify(value).includes(root), false);
    assert.equal(JSON.stringify(value).includes(origin), false);
    assert.equal(JSON.stringify(value).includes("private-token"), false);
    assert.deepEqual(await repository(root), value);
  }
});

async function episode(t) {
  const { dir, root } = await checkout(t);
  const remote = path.join(dir, "origin.git");
  await git(dir, "init", "--bare", remote);
  await git(root, "remote", "set-url", "origin", remote);
  await git(
    root,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.test",
    "commit",
    "--allow-empty",
    "-m",
    "initial",
  );
  await git(root, "push", "origin", "main");
  await git(root, "switch", "-c", "task");
  await git(root, "push", "-u", "origin", "task");
  const head = await git(root, "rev-parse", "HEAD");
  const bin = path.join(dir, "bin");
  await mkdir(bin);
  const pr = {
    state: "OPEN",
    headRefName: "task",
    headRefOid: head,
    baseRefName: "main",
    url: "https://example.test/pull/1",
    isDraft: false,
  };
  // GitHub is the external boundary; Git and the complete delivery chain are real.
  await writeFile(
    path.join(bin, "gh"),
    `#!${process.execPath}\nprocess.stdout.write(${JSON.stringify(JSON.stringify(pr))});\n`,
    { mode: 0o755 },
  );
  const originalPath = process.env.PATH;
  process.env.PATH = `${bin}${path.delimiter}${originalPath}`;
  t.after(() => {
    process.env.PATH = originalPath;
  });
  const routeReceipt = route({
    version: 1,
    intent: "identity integration fixture",
    route: "direct",
    materialSignals: Object.fromEntries(
      materialSignals.map((name) => [name, false]),
    ),
  });
  const base = await baseline({ repoRoot: root, routeReceipt });
  const deliver = (baseReceipt = base, repoRoot = root) =>
    delivery({
      repoRoot,
      routeReceipt,
      baselineReceipt: baseReceipt,
      conformanceReceipt: receipt(
        "conformance",
        { candidateHead: head },
        {
          routeReceiptDigest: routeReceipt.digest,
          baselineReceiptDigest: baseReceipt.digest,
        },
      ),
      validationReceipts: [
        receipt("validation", { candidateHead: head, outcome: "pass" }),
      ],
      pullRequestUrl: pr.url,
    });
  const withIdentity = (identity) =>
    receipt(
      "baseline",
      {
        ...base.payload,
        repository: identity,
      },
      { routeDigest: routeReceipt.digest },
    );
  const coordinates = {
    root: await git(root, "rev-parse", "--show-toplevel"),
    remote,
  };
  const legacy = { ...coordinates, digest: digest(coordinates) };
  return { dir, root, remote, base, deliver, withIdentity, legacy };
}

test("baseline and delivery minimize identity while preserving legacy receipt bytes and references", async (t) => {
  const { dir, root, remote, base, deliver, withIdentity, legacy } =
    await episode(t);
  assert.equal(base.version, 1);
  assert.equal(base.payload.repository.version, 2);
  for (const initial of [base, withIdentity(legacy)]) {
    const file = path.join(dir, "baseline.json");
    const original = JSON.stringify(initial, null, 2) + "\n";
    await writeFile(file, original);
    const result = await deliver(JSON.parse(await readFile(file, "utf8")));
    assert.equal(result.version, 1);
    assert.equal(result.payload.repository.version, 2);
    assert.equal(
      JSON.stringify(result.payload.repository).includes(root),
      false,
    );
    assert.equal(
      JSON.stringify(result.payload.repository).includes(remote),
      false,
    );
    assert.ok(result.payload.receiptDigests.includes(initial.digest));
    assert.equal(await readFile(file, "utf8"), original);
  }
});

test("delivery rejects malformed and tampered identities despite valid outer receipt digests", async (t) => {
  const { base, deliver, withIdentity, legacy } = await episode(t);
  const modern = base.payload.repository;
  const malformed = [
    null,
    [],
    {},
    { ...modern, version: 3 },
    { ...modern, version: 1 },
    { ...modern, version: null },
    { ...modern, root: "/extra-coordinate" },
    { ...modern, originDigest: "bad" },
    { ...modern, checkoutDigest: "0".repeat(64) },
    { ...modern, digest: "0".repeat(64) },
    { ...legacy, version: 2 },
    { ...legacy, root: "/tampered-coordinate" },
    { ...legacy, remote: "tampered-origin" },
    { ...legacy, extra: true },
    { ...legacy, digest: null },
  ];
  for (const original of [modern, legacy]) {
    for (const key of Object.keys(original)) {
      const value = { ...original };
      delete value[key];
      malformed.push(value);
    }
  }
  for (const value of malformed) {
    await assert.rejects(
      deliver(withIdentity(value)),
      /repository identity/,
      JSON.stringify(value),
    );
  }
});

test("delivery preserves checkout isolation across clones, worktrees, and relocation", async (t) => {
  const { dir, root, remote, base, deliver, withIdentity, legacy } =
    await episode(t);
  const clone = path.join(dir, "clone");
  const worktree = path.join(dir, "worktree");
  await git(dir, "clone", "-b", "task", remote, clone);
  await git(root, "worktree", "add", "--force", worktree, "task");
  const original = await repository(root);
  for (const other of [clone, worktree]) {
    const identity = await repository(other);
    assert.notEqual(identity.checkoutDigest, original.checkoutDigest);
    assert.equal(identity.originDigest, original.originDigest);
    for (const initial of [base, withIdentity(legacy)])
      await assert.rejects(
        deliver(initial, other),
        /repository differs.*fresh baseline/,
      );
  }
  const moved = path.join(dir, "relocated");
  await rename(root, moved);
  for (const initial of [base, withIdentity(legacy)])
    await assert.rejects(
      deliver(initial, moved),
      /repository differs.*fresh baseline/,
    );
});

test("delivery rejects changed origins including alternate spellings for both identity versions", async (t) => {
  const { root, remote, base, deliver, withIdentity, legacy } =
    await episode(t);
  const original = await repository(root);
  for (const changed of [`${remote}/`, "https://example.test/other.git"]) {
    await git(root, "remote", "set-url", "origin", changed);
    const identity = await repository(root);
    assert.equal(identity.checkoutDigest, original.checkoutDigest);
    assert.notEqual(identity.originDigest, original.originDigest);
    for (const initial of [base, withIdentity(legacy)])
      await assert.rejects(
        deliver(initial),
        /repository differs.*fresh baseline/,
      );
  }
});

test("delivery rejects altered legacy fields with a recomputed outer receipt", async (t) => {
  const { deliver, withIdentity, legacy } = await episode(t);
  await assert.rejects(
    deliver(withIdentity({ ...legacy, remote: "altered-origin" })),
    /repository identity digest is stale/,
  );
});

test("v2 binds raw origin spelling across Git URL rewrites while legacy keeps its algorithm", async (t) => {
  const { root, remote, base, deliver, withIdentity, legacy } =
    await episode(t);
  await git(root, "config", `url.${remote}.insteadOf`, "shlz-origin:");
  await git(root, "remote", "set-url", "origin", "shlz-origin:");
  assert.equal(await git(root, "remote", "get-url", "origin"), remote);
  await assert.rejects(deliver(base), /repository differs.*fresh baseline/);
  const result = await deliver(withIdentity(legacy));
  assert.equal(result.payload.repository.version, 2);
  assert.notEqual(
    result.payload.repository.originDigest,
    base.payload.repository.originDigest,
  );
});

test("v2 also rejects a changed resolved origin when its configured alias stays the same", async (t) => {
  const { root, remote, deliver, withIdentity } = await episode(t);
  await git(root, "config", `url.${remote}.insteadOf`, "shlz-origin:");
  await git(root, "remote", "set-url", "origin", "shlz-origin:");
  const initial = withIdentity(await repository(root));
  await git(root, "config", "--unset", `url.${remote}.insteadOf`);
  await git(
    root,
    "config",
    "url.https://example.test/other.git.insteadOf",
    "shlz-origin:",
  );
  await assert.rejects(deliver(initial), /repository differs.*fresh baseline/);
});
