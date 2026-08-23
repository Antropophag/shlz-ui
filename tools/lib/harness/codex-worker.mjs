import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { clearTimeout, setTimeout } from "node:timers";

const digest = (value) => createHash("sha256").update(value).digest("hex");

export function parseCodexExecJsonl(stdout) {
  const events = [];
  for (const [index, line] of stdout.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      throw new Error(`codex exec emitted invalid JSONL at line ${index + 1}`);
    }
  }
  const started = events.find(
    (event) =>
      event?.type === "thread.started" &&
      typeof (event.thread_id ?? event.threadId) === "string",
  );
  const runtimeId = started?.thread_id ?? started?.threadId;
  if (!runtimeId)
    throw new Error(
      "codex exec JSONL did not attest a runtime thread identity",
    );
  const completed = events.find((event) => event?.type === "turn.completed");
  const failed = events.find((event) =>
    ["turn.failed", "error"].includes(event?.type),
  );
  const workerReport = events
    .filter(
      (event) =>
        event?.type === "item.completed" &&
        event.item?.type === "agent_message" &&
        typeof event.item.text === "string" &&
        event.item.text.trim(),
    )
    .at(-1)?.item.text;
  const usage = completed?.usage ?? null;
  return {
    runtimeId,
    terminalStatus: failed ? "failed" : completed ? "completed" : "incomplete",
    usage,
    workerReport: workerReport ?? null,
    events,
  };
}

const defaultRun = ({ command, args, cwd, input, timeoutMs }) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut });
    });
    child.stdin.end(input);
  });

export async function probeCodexExec({
  run = defaultRun,
  cwd,
  command = "codex",
} = {}) {
  try {
    const result = await run({
      command,
      args: ["exec", "--help"],
      cwd,
      input: "",
      timeoutMs: 10_000,
    });
    const help = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    const available = result.code === 0 && /--json\b/.test(help);
    return {
      version: 1,
      adapter: "codex-exec-jsonl",
      available,
      reason: available ? null : "codex exec --json is not supported",
    };
  } catch (error) {
    return {
      version: 1,
      adapter: "codex-exec-jsonl",
      available: false,
      reason:
        error.code === "ENOENT"
          ? "codex executable is unavailable"
          : error.message,
    };
  }
}

export async function launchCodexWorker({
  brief,
  cwd,
  run = defaultRun,
  command = "codex",
  timeoutMs = 30 * 60 * 1000,
  launchId = randomUUID(),
  startedAt = new Date().toISOString(),
}) {
  const capability = await probeCodexExec({ run, cwd, command });
  if (!capability.available)
    return { capability, launchId, terminalStatus: "unavailable" };
  let raw;
  try {
    raw = await run({
      command,
      args: ["exec", "--json", "-"],
      cwd,
      input: `${JSON.stringify(brief)}\n`,
      timeoutMs,
    });
  } catch (error) {
    return {
      capability,
      launchId,
      terminalStatus: "launch-failed",
      error: error.message,
    };
  }
  let parsed;
  try {
    parsed = parseCodexExecJsonl(raw.stdout ?? "");
  } catch (error) {
    return {
      capability,
      launchId,
      terminalStatus: raw.timedOut ? "timed-out" : "unattested",
      exitCode: raw.code,
      error: error.message,
      evidenceDigest: digest(raw.stdout ?? ""),
    };
  }
  const evidence = {
    version: 1,
    source: "codex-exec-jsonl",
    runtimeId: parsed.runtimeId,
    launchId,
    startedAt,
    evidenceDigest: digest(raw.stdout ?? ""),
  };
  return {
    capability,
    launchId,
    terminalStatus:
      raw.timedOut || raw.code !== 0 ? "failed" : parsed.terminalStatus,
    exitCode: raw.code,
    evidence,
    usage: parsed.usage,
    workerReport: parsed.workerReport,
    workerReportDigest: parsed.workerReport
      ? digest(parsed.workerReport)
      : null,
  };
}
