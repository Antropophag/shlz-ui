import { spawnSync } from "node:child_process";
import {
  readFile,
  copyFile,
  mkdir,
  mkdtemp,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { setTimeout } from "node:timers";
import { openBrowser, startOwnedProcess } from "./browsers.mjs";
import {
  assertCheckpoint,
  assertSemanticCheckpoint,
  speechText,
} from "./evidence.mjs";
import { speechContracts } from "./contracts.mjs";
import { startForegroundMonitor } from "./foreground.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const hash = (value) => createHash("sha256").update(value).digest("hex");

export class ScreenReaderSession {
  constructor(browser, nvda, log, monitor) {
    this.browser = browser;
    this.nvda = nvda;
    this.log = log;
    this.monitor = monitor;
    this.checkpoints = [];
    this.actions = [];
    this.stateReads = [];
  }

  desktop(command) {
    if (
      this.nvda &&
      (this.nvda.exitCode !== null || this.nvda.signalCode !== null)
    )
      throw new Error("NVDA exited");
    const result = spawnSync(
      String.raw`C:\Windows\py.exe`,
      ["-3", "-B", path.join(here, "windows_input.py")],
      {
        input: JSON.stringify({ allowedPids: [this.browser.pid], ...command }),
        encoding: "utf8",
        windowsHide: true,
        timeout: 10000,
      },
    );
    if (result.status !== 0)
      throw new Error(
        result.stdout || result.stderr || "Windows input helper failed",
      );
    return JSON.parse(result.stdout);
  }

  async goto(route) {
    await this.browser.goto(route);
    this.desktop({ command: "activate", pid: this.browser.pid });
    await pause(700);
  }

  async evaluate(fn, argument) {
    return this.browser.evaluate(fn, argument);
  }

  async waitFor(fn, argument, timeout = 5000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.evaluate(fn, argument)) return;
      await pause(100);
    }
    throw new Error("Browser state wait timed out");
  }

  async focus(selector) {
    await this.waitFor(
      (selector) => Boolean(document.querySelector(selector)),
      selector,
    );
    for (let attempt = 0; attempt < 6; attempt++) {
      if (await this.evaluate(() => document.hasFocus())) break;
      await this.key("F6");
    }
    const focused = await this.evaluate((selector) => {
      const target = document.querySelector(selector);
      target.scrollIntoView({ block: "center" });
      target.focus();
      return document.activeElement === target && document.hasFocus();
    }, selector);
    if (!focused) throw new Error("Setup target could not receive focus");
    await pause(400);
    await this.confirmReaderFocus(selector);
  }

  async confirmReaderFocus(selector) {
    const name = await this.evaluate((selector) => {
      const target = document.querySelector(selector);
      const labelId = target.getAttribute("aria-labelledby")?.split(/\s+/)[0];
      return (
        target.getAttribute("aria-label") ||
        (labelId && document.getElementById(labelId)?.textContent) ||
        target.labels?.[0]?.textContent ||
        target.textContent
      )
        .trim()
        .replace(/\s+/g, " ");
    }, selector);
    if (!name) throw new Error("Setup control has no accessible name");
    for (let attempt = 0; attempt < 4; attempt++) {
      const offset = (await readFile(this.log, "utf8")).length;
      await this.key("NVDA+Tab");
      await pause(350);
      const lines = (await readFile(this.log, "utf8"))
        .slice(offset)
        .split(/\r?\n/)
        .filter((line) => line.startsWith("Speaking ["));
      if (speechText(lines).includes(name)) return;
      await this.key("Tab");
      await this.key("Shift+Tab");
      await this.evaluate(
        (selector) => document.querySelector(selector).focus(),
        selector,
      );
    }
    throw new Error("NVDA focus did not reach the setup control");
  }

  async key(key, { nativeDialog = false } = {}) {
    this.monitor.check();
    if (
      this.activeSpan &&
      this.monitor.foreign(this.activeSpan, Infinity, this.browser.pid).length
    ) {
      throw new Error("Foreign foreground transition detected; input stopped");
    }
    if (
      !nativeDialog &&
      !["Tab", "Shift+Tab", "F6", "NVDA+Tab"].includes(key) &&
      !(await this.evaluate(() => document.hasFocus()))
    ) {
      throw new Error("Browser document does not own keyboard focus");
    }
    this.desktop({ command: "key", key, allowOwnedDialog: nativeDialog });
    this.actions.push({ kind: "os-keyboard", key, nativeDialog });
    await pause(250);
  }

  async type(text, { nativeDialog = false } = {}) {
    this.monitor.check();
    if (
      this.activeSpan &&
      this.monitor.foreign(this.activeSpan, Infinity, this.browser.pid).length
    ) {
      throw new Error(
        "Foreign foreground transition detected; text input stopped",
      );
    }
    if (
      !nativeDialog &&
      !(await this.evaluate(
        () =>
          document.hasFocus() &&
          document.activeElement.matches(
            "input:not([type=file]):not([type=hidden]),textarea,[contenteditable=true]",
          ),
      ))
    )
      throw new Error("An editable document control must own text input");
    this.desktop({ command: "text", text, allowOwnedDialog: nativeDialog });
    this.actions.push({
      kind: "os-keyboard",
      text: text.includes(":\\") ? "[task-owned file path]" : text,
    });
    await pause(300);
  }

  async mode(mode) {
    const start = (await readFile(this.log, "utf8")).length;
    await this.key("NVDA+Space");
    await pause(250);
    const spoken = speechText(
      (await readFile(this.log, "utf8"))
        .slice(start)
        .split(/\r?\n/)
        .filter((line) => line.startsWith("Speaking [")),
    ).toLowerCase();
    if (!spoken.includes(`${mode} mode`)) {
      if (!/browse mode|focus mode/.test(spoken))
        throw new Error("NVDA mode was not observed");
      await this.key("NVDA+Space");
    }
  }

  async checkpoint(
    id,
    operation,
    stateChecks,
    { reportFocus = true, onlyFocusReport = false } = {},
  ) {
    this.actions = [];
    this.stateReads = [];
    const meanings = speechContracts[this.workflowId][id];
    this.captureOffset = null;
    const before = this.desktop({ command: "status" });
    this.activeSpan = before.tick;
    if (before.pid !== this.browser.pid)
      throw new Error("Foreground ownership was lost");
    let offset = (await readFile(this.log, "utf8")).length;
    await operation();
    if (this.captureOffset !== null) offset = this.captureOffset;
    if (onlyFocusReport) offset = (await readFile(this.log, "utf8")).length;
    if (reportFocus) await this.key("NVDA+Tab");
    await pause(600);
    if (this.desktop({ command: "status" }).pid !== this.browser.pid) {
      throw new Error("Foreground ownership lost; speech was not retained");
    }
    const delta = (await readFile(this.log, "utf8")).slice(offset);
    const speech = delta
      .split(/\r?\n/)
      .filter((line) => line.startsWith("Speaking ["));
    const text = speechText(speech);
    const states = await stateChecks();
    const after = this.desktop({ command: "status" });
    const value = {
      id,
      workflow: this.workflowId,
      stateReads: this.stateReads,
      actions: this.actions,
      speech,
      inputEventCount: (delta.match(/Input: kb\(/g) ?? []).length,
      foregroundVerified: after.pid === this.browser.pid,
      foregroundSpan: {
        start: before.tick,
        end: after.tick,
        browserPid: this.browser.pid,
        before,
        after,
      },
      assertions: [
        ...meanings.map(([meaning, pattern]) => ({
          meaning,
          expected: pattern.source,
          passed: pattern.test(text),
        })),
        ...states.map(([meaning, passed]) => ({ meaning, passed })),
      ],
    };
    try {
      assertSemanticCheckpoint(value);
      value.status = "pass";
    } catch (error) {
      value.status = "fail";
      value.error = error.message;
    }
    this.checkpoints.push(value);
    console.log(`${id}: ${value.status} (foreground capture pending)`);
    this.activeSpan = null;
    if (states.some(([, passed]) => !passed))
      throw new Error("Browser-state assertion failed");
    return value;
  }

  async resetSpeechCapture() {
    this.captureOffset = (await readFile(this.log, "utf8")).length;
  }

  async capturedSpeech() {
    const delta = (await readFile(this.log, "utf8")).slice(
      this.captureOffset ?? 0,
    );
    return speechText(
      delta.split(/\r?\n/).filter((line) => line.startsWith("Speaking [")),
    );
  }
}

async function executeWorkflows(session, settings, workflows, result, kind) {
  for (const workflow of workflows) {
    session.workflowId = workflow.id;
    session.activeSpan = null;
    session.checkpoints = [];
    const row = {
      id: workflow.id,
      status: "blocked",
      checkpoints: session.checkpoints,
    };
    try {
      await workflow.run(session, settings);
      row.status = session.checkpoints.every((point) => point.status === "pass")
        ? "pass"
        : "fail";
    } catch (error) {
      row.status = "fail";
      row.error = error.message;
      console.log(`${kind}/${workflow.id}: ${error.message}`);
    }
    result.workflows.push(row);
  }
}

async function closeNvda(nvda, result) {
  if (!nvda) return;
  if (nvda.exitCode === null && nvda.signalCode === null) {
    nvda.kill();
    await pause(500);
  }
  result.cleanup.push({
    process: "owned-nvda",
    exited: nvda.exitCode !== null || nvda.signalCode !== null,
  });
}

async function closeBrowser(browser, result) {
  if (!browser) return;
  try {
    await browser.close();
    result.cleanup.push({ process: "owned-browser", exited: true });
  } catch (error) {
    result.cleanup.push({
      process: "owned-browser",
      exited: false,
      error: error.message,
    });
  }
}

function finishPoint(point, trace, monitor, browser, observation) {
  const span = point.foregroundSpan;
  span.events = trace
    .filter(
      (item) =>
        item.kind === "foreground" &&
        item.state.tick >= span.start &&
        item.state.tick <= span.end,
    )
    .map((item) => item.state);
  span.complete = true;
  span.observationStart = observation.started;
  span.observationEnd = observation.ended;
  if (monitor.foreign(span.start, span.end, browser.pid).length) {
    point.speech = [];
    point.status = "blocked";
  }
  try {
    assertCheckpoint(point);
  } catch (error) {
    point.status = "fail";
    point.error = error.message;
  }
}

async function closeMonitor(monitor, browser, result) {
  if (!monitor) return;
  try {
    const trace = await monitor.close();
    result.monitor = {
      started: trace.find((item) => item.kind === "ready")?.tick,
      ended: trace.find((item) => item.kind === "closed")?.tick,
    };
    for (const flow of result.workflows) {
      for (const point of flow.checkpoints)
        finishPoint(point, trace, monitor, browser, result.monitor);
      if (flow.checkpoints.some((point) => point.status !== "pass"))
        flow.status = "fail";
    }
    result.cleanup.push({ process: "owned-monitor", exited: true });
  } catch (error) {
    for (const flow of result.workflows) {
      flow.status = "fail";
      flow.checkpoints.forEach((point) => {
        point.speech = [];
      });
    }
    result.cleanup.push({
      process: "owned-monitor",
      exited: false,
      error: error.message,
    });
  }
}

export async function runWithNvda(kind, settings, workflows) {
  if (process.platform !== "win32")
    throw new Error("Actual NVDA execution requires Windows Node.js");
  const baseUrl = new URL(settings.baseURL);
  if (!["127.0.0.1", "localhost"].includes(baseUrl.hostname))
    throw new Error("Only a local fixture server is allowed");
  const check = spawnSync(settings.nvda, ["--check-running"], {
    timeout: 10000,
    windowsHide: true,
  });
  if (check.status !== 1)
    throw new Error("Existing NVDA session or unavailable running-state check");
  const directory = await mkdtemp(path.join(settings.tempRoot, `${kind}-run-`));
  const config = path.join(directory, "nvda-config");
  const log = path.join(directory, "nvda.log");
  await mkdir(config);
  await copyFile(path.join(here, "nvda.ini"), path.join(config, "nvda.ini"));
  let browser;
  let nvda;
  let monitor;
  const result = { browser: kind, workflows: [], cleanup: [] };
  try {
    browser = await openBrowser(kind, settings, directory);
    result.version = browser.version;
    result.browserPid = browser.pid;
    monitor = await startForegroundMonitor();
    const session = new ScreenReaderSession(browser, null, log, monitor);
    await session.goto(settings.baseURL + "/?full=1");
    nvda = await startOwnedProcess(
      settings.nvda,
      [
        "--minimal",
        `--config-path=${config}`,
        `--log-file=${log}`,
        "--log-level=12",
        "--lang=en",
        "--disable-addons",
        "--no-sr-flag",
      ],
      { stdio: "ignore", windowsHide: true },
    );
    session.nvda = nvda;
    await pause(4000);
    const initialLog = await readFile(log, "utf8");
    if (!initialLog.includes("Loaded synthDriver espeak"))
      throw new Error("NVDA speech synthesizer did not initialize");
    await executeWorkflows(session, settings, workflows, result, kind);
    const content = await readFile(log, "utf8");
    result.logHash = hash(content);
    result.nvdaVersion =
      content.match(/Starting NVDA version ([^\r\n]+)/)?.[1] ?? null;
    result.directory = directory;
  } finally {
    await closeNvda(nvda, result);
    await closeBrowser(browser, result);
    await closeMonitor(monitor, browser, result);
    await writeFile(
      path.join(directory, "result.json"),
      JSON.stringify(result, null, 2),
    );
  }
  return result;
}

export async function environment() {
  return {
    os: os.version(),
    build: os.release(),
    nvda: null,
    settingsHash: hash(await readFile(path.join(here, "nvda.ini"))),
    language: "en",
    synthesizer: "espeak",
    keyboard: "desktop",
    modePolicy:
      "automatic; explicit browse mode for list/unavailable-control reading and focus mode for calendar arrows",
    chromeAutomation: "CDP noDefaults; native focus, no focus emulation",
    firefoxAutomation: "WebDriver; focusmanager.testmode=false",
    globalScreenReaderFlag: "unchanged (--no-sr-flag)",
    speechEvidence:
      "NVDA input/output log; not an acoustic or human usability assessment",
  };
}
