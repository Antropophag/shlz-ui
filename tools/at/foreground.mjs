import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

export function ownsWindow(state, pid) {
  return (
    state.pid === pid ||
    (state.windowClass === "#32770" && state.ownerPids?.includes(pid))
  );
}

export async function startForegroundMonitor() {
  const child = spawn(
    String.raw`C:\Windows\py.exe`,
    ["-3", "-B", fileURLToPath(new URL("./windows_input.py", import.meta.url))],
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
      const item = JSON.parse(line);
      observations.push(item);
      if (item.kind === "error" || item.error)
        failure = new Error("Foreground observation failed");
    } catch {
      failure = new Error("Invalid foreground monitor output");
    }
  });
  child.stdin.write(JSON.stringify({ command: "watch" }) + "\n");
  for (
    let attempt = 0;
    attempt < 100 && !observations.some((item) => item.kind === "ready");
    attempt++
  ) {
    if (failure || child.exitCode !== null) {
      child.stdin.end();
      child.kill();
      lines.close();
      throw failure ?? new Error("Foreground monitor exited");
    }
    await pause(50);
  }
  if (!observations.some((item) => item.kind === "ready")) {
    child.kill();
    lines.close();
    throw new Error("Foreground monitor startup timed out");
  }
  return {
    events: observations,
    check() {
      if (failure || child.exitCode !== null || child.signalCode !== null) {
        throw failure ?? new Error("Foreground observation stopped");
      }
    },
    foreign(start, end, pid) {
      return observations.filter(
        (item) =>
          item.kind === "foreground" &&
          item.state.tick >= start &&
          item.state.tick <= end &&
          !ownsWindow(item.state, pid),
      );
    },
    async close() {
      if (child.exitCode === null && child.signalCode === null) {
        const closed = once(child, "close");
        child.stdin.end("stop\n");
        await Promise.race([closed, pause(3000)]);
      }
      lines.close();
      if (!observations.some((item) => item.kind === "closed") || failure) {
        child.kill();
        throw (
          failure ?? new Error("Foreground observation did not close cleanly")
        );
      }
      return observations;
    },
  };
}
