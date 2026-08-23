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
  const turnFailed = events.some((event) => event?.type === "turn.failed");
  const streamError = events.some((event) => event?.type === "error");
  const workerReport = events.findLast(
    (event) =>
      event?.type === "item.completed" &&
      ["agent_message", "assistant_message"].includes(
        event.item?.type ?? event.item?.item_type,
      ) &&
      typeof event.item.text === "string" &&
      event.item.text.trim(),
  )?.item.text;
  let terminalStatus = "incomplete";
  if (turnFailed) terminalStatus = "failed";
  else if (completed) terminalStatus = "completed";
  else if (streamError) terminalStatus = "failed";
  const usage = completed?.usage ?? null;
  return {
    runtimeId,
    terminalStatus,
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
    let killTimer;
    let settled = false;
    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(killTimer);
      callback(value);
    };
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 5_000);
    }, timeoutMs);
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.once("error", (error) => settle(reject, error));
    child.once("close", (code, signal) =>
      settle(resolve, { code, signal, stdout, stderr, timedOut }),
    );
    child.stdin.once("error", (error) => {
      child.kill("SIGTERM");
      settle(reject, error);
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
