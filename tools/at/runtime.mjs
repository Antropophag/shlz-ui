import { spawn, spawnSync } from "node:child_process";
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
import { openBrowser } from "./browsers.mjs";
import { assertCheckpoint, speechText } from "./evidence.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const hash = (value) => createHash("sha256").update(value).digest("hex");

export class ScreenReaderSession {
  constructor(browser, nvda, log) {
    this.browser = browser;
    this.nvda = nvda;
    this.log = log;
    this.checkpoints = [];
    this.actions = [];
  }

  desktop(command) {
    if (
      this.nvda &&
      (this.nvda.exitCode !== null || this.nvda.signalCode !== null)
    )
      throw new Error("NVDA exited");
    const result = spawnSync(
      "C:\\Windows\\py.exe",
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
  }

  async key(key, { nativeDialog = false } = {}) {
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
    meanings,
    stateChecks,
    { reportFocus = true, onlyFocusReport = false } = {},
  ) {
    this.actions = [];
    this.captureOffset = null;
    const before = this.desktop({ command: "status" });
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
    const value = {
      id,
      actions: this.actions,
      speech,
      inputEventCount: (delta.match(/Input: kb\(/g) ?? []).length,
      foregroundVerified:
        this.desktop({ command: "status" }).pid === this.browser.pid,
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
      assertCheckpoint(value);
      value.status = "pass";
    } catch (error) {
      value.status = "fail";
      value.error = error.message;
    }
    this.checkpoints.push(value);
    console.log(`${id}: ${value.status} | ${text}`);
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
  const result = { browser: kind, workflows: [], cleanup: [] };
  try {
    browser = await openBrowser(kind, settings, directory);
    result.version = browser.version;
    const session = new ScreenReaderSession(browser, null, log);
    await session.goto(settings.baseURL + "/?full=1");
    nvda = spawn(
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
    for (const workflow of workflows) {
      session.checkpoints = [];
      const row = {
        id: workflow.id,
        status: "blocked",
        checkpoints: session.checkpoints,
      };
      try {
        await workflow.run(session, settings);
        row.status = session.checkpoints.every(
          (point) => point.status === "pass",
        )
          ? "pass"
          : "fail";
      } catch (error) {
        row.status = "fail";
        row.error = error.message;
        console.log(`${kind}/${workflow.id}: ${error.message}`);
      }
      result.workflows.push(row);
    }
    const content = await readFile(log, "utf8");
    result.logHash = hash(content);
    result.nvdaVersion =
      content.match(/Starting NVDA version ([^\r\n]+)/)?.[1] ?? null;
    result.directory = directory;
  } finally {
    if (nvda) {
      if (nvda.exitCode === null && nvda.signalCode === null) {
        nvda.kill();
        await pause(500);
      }
      result.cleanup.push({
        process: "owned-nvda",
        exited: nvda.exitCode !== null || nvda.signalCode !== null,
      });
    }
    if (browser) {
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
