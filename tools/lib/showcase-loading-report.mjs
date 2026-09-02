import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const digest = (value) => createHash("sha256").update(value).digest("hex");

const reportDigest = (assets) =>
  digest(
    assets
      .map(
        ({ file, bytes, sha256, phase }) =>
          `${file}\0${bytes}\0${sha256}\0${phase}`,
      )
      .join("\n"),
  );

const assetType = (file) => {
  const extension = path.extname(file).slice(1).toLowerCase();
  if (extension === "js") return "javascript";
  if (extension === "css") return "css";
  if (["woff", "woff2", "ttf", "otf"].includes(extension)) return "font";
  if (["svg", "png", "jpg", "jpeg", "webp", "avif"].includes(extension))
    return "image";
  return extension || "other";
};

const walk = async (root, directory = root) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, absolute)));
    else files.push(path.relative(root, absolute).split(path.sep).join("/"));
  }
  return files.sort();
};

const referencedAssets = (html) =>
  [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1].replace(/^\//, ""))
    .filter((file) => !file.startsWith("http"));

const referencedCssAssets = (css, cssFile) =>
  [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
    .map((match) => match[1])
    .filter((file) => !file.startsWith("data:") && !file.startsWith("http"))
    .map((file) =>
      file.startsWith("/")
        ? file.slice(1)
        : path.posix.normalize(
            path.posix.join(path.posix.dirname(cssFile), file),
          ),
    );

export async function createShowcaseLoadingReport({ dist, commit }) {
  if (!commit) throw new Error("commit is required");
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  const initialFiles = new Set(["index.html", ...referencedAssets(html)]);
  const files = await walk(dist);
  const pendingCss = [...initialFiles].filter((file) => file.endsWith(".css"));
  for (const cssFile of pendingCss) {
    const css = await readFile(path.join(dist, cssFile), "utf8");
    for (const referenced of referencedCssAssets(css, cssFile)) {
      if (!files.includes(referenced))
        throw new Error(`missing CSS dependency: ${referenced}`);
      initialFiles.add(referenced);
    }
  }
  const assets = [];
  for (const file of files) {
    const absolute = path.join(dist, file);
    const bytes = await readFile(absolute);
    const size = (await stat(absolute)).size;
    assets.push({
      file,
      type: assetType(file),
      bytes: size,
      gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
      sha256: digest(bytes),
      phase: initialFiles.has(file) ? "initial" : "deferred",
    });
  }
  const sum = (phase, type) =>
    assets
      .filter((asset) => asset.phase === phase && asset.type === type)
      .reduce((total, asset) => total + asset.bytes, 0);
  return {
    version: 1,
    commit,
    build: {
      command: "npm run build -w @shlz/showcase",
      node: process.version,
    },
    entry: [...initialFiles].sort(),
    totals: {
      initialJavaScriptBytes: sum("initial", "javascript"),
      initialCssBytes: sum("initial", "css"),
      initialFontBytes: sum("initial", "font"),
      emittedBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
      initialImageBytes: sum("initial", "image"),
    },
    assets,
    assetsDigest: reportDigest(assets),
  };
}

export function validateShowcaseLoadingReport(report) {
  if (report?.version !== 1)
    throw new Error("unsupported showcase loading report");
  if (
    !report.commit ||
    !Array.isArray(report.entry) ||
    !Array.isArray(report.assets)
  )
    throw new Error("incomplete showcase loading report");
  const files = new Set();
  for (const asset of report.assets) {
    if (files.has(asset.file))
      throw new Error(`duplicate emitted asset: ${asset.file}`);
    files.add(asset.file);
    if (!Number.isInteger(asset.bytes) || asset.bytes < 0)
      throw new Error(`invalid emitted byte count: ${asset.file}`);
    if (!/^[a-f0-9]{64}$/.test(asset.sha256))
      throw new Error(`invalid emitted asset hash: ${asset.file}`);
    if (!new Set(["initial", "deferred"]).has(asset.phase))
      throw new Error(`unclassified emitted asset: ${asset.file}`);
  }
  for (const entry of report.entry) {
    if (!files.has(entry)) throw new Error(`missing entry asset: ${entry}`);
    if (report.assets.find(({ file }) => file === entry)?.phase !== "initial")
      throw new Error(`reclassified entry asset: ${entry}`);
  }
  if (
    report.assetsDigest &&
    report.assetsDigest !== reportDigest(report.assets)
  )
    throw new Error("emitted asset digest mismatch");
  return report;
}

export function compareShowcaseLoadingReports(baseline, candidate) {
  validateShowcaseLoadingReport(baseline);
  validateShowcaseLoadingReport(candidate);
  if (baseline.commit === candidate.commit)
    throw new Error("baseline and candidate commits must differ");
  const ratio = (value, original) => (original ? value / original : 0);
  const checks = {
    initialJavaScriptReduction:
      1 -
      ratio(
        candidate.totals.initialJavaScriptBytes,
        baseline.totals.initialJavaScriptBytes,
      ),
    initialCssGrowth:
      ratio(candidate.totals.initialCssBytes, baseline.totals.initialCssBytes) -
      1,
    initialFontGrowth:
      ratio(
        candidate.totals.initialFontBytes,
        baseline.totals.initialFontBytes,
      ) - 1,
  };
  if (checks.initialJavaScriptReduction < 0.3)
    throw new Error("initial JavaScript reduction is below 30%");
  if (candidate.totals.initialCssBytes > baseline.totals.initialCssBytes * 1.02)
    throw new Error("initial CSS growth exceeds 2%");
  if (
    candidate.totals.initialFontBytes >
    baseline.totals.initialFontBytes * 1.02
  )
    throw new Error("initial font growth exceeds 2%");
  if (candidate.totals.initialImageBytes !== 0)
    throw new Error("initial image or source-reference requests are not zero");
  return {
    version: 1,
    baseline: baseline.commit,
    candidate: candidate.commit,
    checks,
  };
}
