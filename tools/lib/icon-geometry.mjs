import { createHash } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

export function resolveNormalizedIconPath(
  repositoryRoot,
  normalizedRoot,
  repositoryPath,
) {
  const target = path.resolve(repositoryRoot, repositoryPath);
  const resolvedRoot = realpathSync(normalizedRoot);
  if (
    !target.startsWith(`${path.resolve(normalizedRoot)}${path.sep}`) ||
    !existsSync(target)
  )
    return null;
  const resolvedTarget = realpathSync(target);
  return resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)
    ? resolvedTarget
    : null;
}

export function stripSvgDefinitions(svg) {
  return svg.replace(/<defs\b[^>]*>[\s\S]*?<\/defs>/g, "");
}

export function iconGeometryFingerprint(svg) {
  return svg
    .replace(/<(linearGradient|radialGradient|filter)\b[\s\S]*?<\/\1>/g, "")
    .replace(/<defs\b[^>]*>\s*<\/defs>/g, "")
    .replace(/<svg\b[^>]*>/, "<svg>")
    .replace(
      /\s(?:fill|stroke|id|class|style|opacity|fill-opacity|stroke-opacity|stop-color|stop-opacity|flood-color|flood-opacity)=["'][^"']*["']/g,
      "",
    )
    .replace(/url\(#[^)]+\)/g, "url(#reference)")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

export function iconGeometryHash(svg) {
  return createHash("sha256")
    .update(iconGeometryFingerprint(svg))
    .digest("hex");
}
