import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export async function registeredWorktreeAtRevision(revision) {
  if (!/^[0-9a-f]{40}$/.test(revision ?? ""))
    throw new Error("fixture revision must be a full Git object id");
  const { stdout } = await exec("git", ["worktree", "list", "--porcelain"]);
  const match = stdout
    .trim()
    .split("\n\n")
    .map((block) =>
      Object.fromEntries(
        block.split("\n").map((line) => {
          const separator = line.indexOf(" ");
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
      ),
    )
    .find(({ HEAD }) => HEAD === revision);
  if (!match?.worktree)
    throw new Error("fixture revision must have a registered Git worktree");
  return match.worktree;
}
