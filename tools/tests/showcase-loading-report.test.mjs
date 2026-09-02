import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  compareShowcaseLoadingReports,
  createShowcaseLoadingReport,
  validateShowcaseLoadingReport,
} from "../lib/showcase-loading-report.mjs";

test("classifies only HTML-linked assets as initial and binds content hashes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "shlz-loading-report-"));
  t.after(() => rm(root, { force: true, recursive: true }));
  await mkdir(path.join(root, "assets"));
  await writeFile(
    path.join(root, "index.html"),
    '<link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script>',
  );
  await writeFile(path.join(root, "assets/app.css"), "body{}", "utf8");
  await writeFile(
    path.join(root, "assets/app.js"),
    "import('./heavy.js')",
    "utf8",
  );
  await writeFile(path.join(root, "assets/heavy.js"), "x".repeat(100), "utf8");
  const report = await createShowcaseLoadingReport({
    dist: root,
    commit: "base",
  });
  assert.equal(report.totals.initialJavaScriptBytes, 20);
  assert.equal(
    report.assets.find(({ file }) => file === "assets/heavy.js").phase,
    "deferred",
  );
  const originalHash = report.assets.find(
    ({ file }) => file === "assets/app.js",
  ).sha256;
  await writeFile(path.join(root, "assets/app.js"), "changed", "utf8");
  const changed = await createShowcaseLoadingReport({
    dist: root,
    commit: "candidate",
  });
  assert.notEqual(
    changed.assets.find(({ file }) => file === "assets/app.js").sha256,
    originalHash,
  );
  assert.doesNotThrow(() => validateShowcaseLoadingReport(changed));
  assert.throws(
    () =>
      validateShowcaseLoadingReport({
        ...changed,
        assets: changed.assets.map((asset, index) =>
          index === 0 ? { ...asset, sha256: "changed" } : asset,
        ),
      }),
    /invalid emitted asset hash/,
  );
  assert.throws(
    () => validateShowcaseLoadingReport({ ...changed, entry: ["missing.js"] }),
    /missing entry asset/,
  );
});

test("enforces the JavaScript, CSS, and font budgets", () => {
  const baseline = {
    version: 1,
    commit: "base",
    entry: [],
    assets: [],
    totals: {
      initialJavaScriptBytes: 1000,
      initialCssBytes: 1000,
      initialFontBytes: 1000,
    },
  };
  const candidate = {
    version: 1,
    commit: "candidate",
    entry: [],
    assets: [],
    totals: {
      initialJavaScriptBytes: 700,
      initialCssBytes: 1020,
      initialFontBytes: 1020,
    },
  };
  assert.doesNotThrow(() => compareShowcaseLoadingReports(baseline, candidate));
  assert.throws(
    () =>
      compareShowcaseLoadingReports(baseline, {
        ...candidate,
        totals: { ...candidate.totals, initialJavaScriptBytes: 701 },
      }),
    /below 30%/,
  );
  assert.throws(
    () =>
      compareShowcaseLoadingReports(baseline, {
        ...candidate,
        totals: { ...candidate.totals, initialCssBytes: 1021 },
      }),
    /CSS growth/,
  );
});
