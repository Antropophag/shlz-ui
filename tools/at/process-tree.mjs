import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

async function failedStartup(primary, close) {
  try {
    await close();
  } catch (cleanup) {
    throw new Error(`${primary.message}; cleanup: ${cleanup.message}`, {
      cause: primary,
    });
  }
  throw primary;
}

export async function startGeckoJob(executable, args) {
  const child = spawn(
    String.raw`C:\Windows\py.exe`,
    ["-3", "-B", fileURLToPath(new URL("./owned_gecko.py", import.meta.url))],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true },
  );
  const observations = [];
  let failure;
  child.on("error", (error) => {
    failure = error;
  });
  child.stdin.on("error", (error) => {
    failure = error;
  });
  child.stderr.on("data", () => {});
  const lines = createInterface({ input: child.stdout });
  lines.on("line", (line) => {
    try {
      observations.push(JSON.parse(line));
    } catch {
      failure = new Error("Invalid process supervisor output");
    }
  });
  child.stdin.write(JSON.stringify({ executable, args }) + "\n");
  const close = async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const ended = once(child, "close");
      child.stdin.end("stop\n");
      await Promise.race([ended, pause(5000)]);
    }
    if (
      !observations.some(
        (item) => item.kind === "closed" && item.activeProcesses === 0,
      )
    ) {
      child.kill();
      throw new Error("Owned process-tree cleanup was not verified");
    }
    lines.close();
  };
  for (let attempt = 0; attempt < 100; attempt++) {
    const ready = observations.find((item) => item.kind === "ready");
    if (ready) return { child, pid: ready.pid, close };
    const error = observations.find((item) => item.kind === "error");
    if (failure || error || child.exitCode !== null) {
      return failedStartup(
        failure ?? new Error(error?.message ?? "Process supervisor exited"),
        close,
      );
    }
    await pause(50);
  }
  return failedStartup(
    new Error("Process supervisor startup timed out"),
    close,
  );
}
