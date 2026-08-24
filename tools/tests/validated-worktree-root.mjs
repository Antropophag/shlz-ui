import { execFile } from "node:child_process";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export async function validatedWorktreeRoot(argument) {
  const requested = await realpath(path.resolve(argument ?? process.cwd()));
  const { stdout } = await exec("git", ["worktree", "list", "--porcelain"]);
  const registered = stdout
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length));
  const canonical = await Promise.all(
    registered.map((candidate) => realpath(candidate).catch(() => null)),
  );
  if (!canonical.includes(requested))
    throw new Error("fixture root must be a registered Git worktree");
  return requested;
}
