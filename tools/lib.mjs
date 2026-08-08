import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export const kebab = (parts) =>
  parts
    .join("-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase();
export const hash = (value) => createHash("sha256").update(value).digest("hex");

export function flatten(value, path = [], output = {}) {
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith("$")) continue;
    if (item && typeof item === "object") flatten(item, [...path, key], output);
    else output[path.concat(key).join(".")] = item;
  }
  return output;
}

export function resolveAliases(flat) {
  const resolved = {};
  const visit = (key, stack = []) => {
    if (stack.includes(key))
      throw new Error(
        `Circular token alias: ${stack.concat(key).join(" -> ")}`,
      );
    const value = flat[key];
    if (value === undefined) throw new Error(`Unknown token alias: ${key}`);
    const match = typeof value === "string" && value.match(/^\{(.+)\}$/);
    return match ? visit(match[1], stack.concat(key)) : value;
  };
  for (const key of Object.keys(flat)) resolved[key] = visit(key);
  return resolved;
}

export async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export function normalizeMonochromeSvg(svg) {
  return svg
    .replace(/<\?xml[^>]*>\s*/g, "")
    .replace(
      /\s(?:fill|stroke)="(?:#(?:0B1623|231F23|253D98|000000)|black)"/gi,
      (match) => match.replace(/"[^"]+"$/, '"currentColor"'),
    );
}
