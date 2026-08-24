import { rm } from "node:fs/promises";

export function createHistoricalWorktreeManager(exec, label) {
  const added = new Set();
  return {
    async add(targetRoot, revision) {
      try {
        await exec(
          "git",
          ["worktree", "add", "--detach", targetRoot, revision],
          { maxBuffer: 10 * 1024 * 1024 },
        );
        added.add(targetRoot);
      } catch (error) {
        throw new Error(
          `historical revision ${revision} is unavailable; fetch full history before running this proof`,
          { cause: error },
        );
      }
    },

    async cleanup(targets) {
      const errors = [];
      for (const target of targets) {
        if (!added.has(target)) {
          await rm(target, { recursive: true, force: true });
          continue;
        }
        const status = await exec("git", [
          "-C",
          target,
          "status",
          "--porcelain",
        ])
          .then(({ stdout }) => stdout)
          .catch(() => null);
        if (status === null || status.trim()) {
          errors.push(new Error(`${label} could not clean worktree ${target}`));
          continue;
        }
        await exec("git", ["worktree", "remove", target]).catch((error) =>
          errors.push(error),
        );
      }
      await exec("git", ["worktree", "prune"]).catch((error) =>
        errors.push(error),
      );
      return errors;
    },
  };
}
