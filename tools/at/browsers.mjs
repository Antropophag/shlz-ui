import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as pause } from "node:timers/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";

const alive = (child) => child.exitCode === null && child.signalCode === null;

async function start(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "ignore",
    windowsHide: true,
    ...options,
  });
  await once(child, "spawn");
  return child;
}

async function stop(child) {
  if (!alive(child)) return;
  const exited = once(child, "exit");
  child.kill();
  await Promise.race([exited, pause(3000)]);
  if (alive(child)) throw new Error("Owned browser process did not exit");
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function chromePort(profile, child) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (!alive(child)) throw new Error("Owned Chrome exited before startup");
    try {
      const port = Number(
        (
          await readFile(path.join(profile, "DevToolsActivePort"), "utf8")
        ).split("\n")[0],
      );
      if (Number.isInteger(port) && port > 0 && port <= 65535) return port;
    } catch {
      // Chrome writes this file after opening its debugging endpoint.
    }
    await pause(100);
  }
  throw new Error("Owned Chrome debugging endpoint did not start");
}

async function openChrome(settings, runDirectory) {
  const profile = path.join(runDirectory, "chrome-profile");
  const child = await start(
    settings.chrome,
    [
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1440,1000",
      "about:blank",
    ],
    { windowsHide: false },
  );
  let browser;
  let session;
  let ownershipVerified = false;
  const close = async () => {
    try {
      if (session && ownershipVerified && alive(child))
        await session.send("Browser.close");
    } finally {
      try {
        if (browser) await browser.close();
      } finally {
        await stop(child);
      }
    }
  };
  try {
    const port = await chromePort(profile, child);
    // Use the owned stock browser without automation focus emulation.
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, {
      noDefaults: true,
    });
    const page = browser.contexts()[0].pages()[0];
    session = await browser.newBrowserCDPSession();
    const { processInfo } = await session.send("SystemInfo.getProcessInfo");
    const pid = processInfo.find((item) => item.type === "browser").id;
    if (pid !== child.pid)
      throw new Error(
        "Chrome endpoint ownership differs from launched process",
      );
    ownershipVerified = true;
    return {
      pid,
      version: browser.version(),
      goto: (url) => page.goto(url, { waitUntil: "domcontentloaded" }),
      evaluate: (fn, argument) => page.evaluate(fn, argument),
      close,
    };
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Chrome startup and cleanup failed",
      );
    }
    throw error;
  }
}

function webdriver(endpoint) {
  return async (route, body, method = "POST", timeout = 30000) => {
    const response = await globalThis.fetch(endpoint + route, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: globalThis.AbortSignal.timeout(timeout),
    });
    const { value } = await response.json();
    if (!response.ok || value?.error)
      throw new Error(value?.message ?? "WebDriver request failed");
    return value;
  };
}

async function waitForDriver(request, child) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (!alive(child)) throw new Error("Geckodriver exited before startup");
    try {
      await request("/status", undefined, "GET", 250);
      return;
    } catch {
      await pause(100);
    }
  }
  throw new Error("Geckodriver startup timed out");
}

async function openFirefox(settings, runDirectory) {
  const port = await availablePort();
  const driver = await start(settings.geckodriver, [
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--profile-root",
    runDirectory,
    "--log",
    "error",
  ]);
  const request = webdriver(`http://127.0.0.1:${port}`);
  let sessionId;
  const close = async () => {
    try {
      if (sessionId)
        await request(`/session/${sessionId}`, undefined, "DELETE");
    } finally {
      await stop(driver);
    }
  };
  try {
    await waitForDriver(request, driver);
    const created = await request("/session", {
      capabilities: {
        alwaysMatch: {
          browserName: "firefox",
          "moz:firefoxOptions": {
            binary: settings.firefox,
            prefs: {
              "browser.shell.checkDefaultBrowser": false,
              "browser.startup.homepage_override.mstone": "ignore",
              "browser.tabs.warnOnClose": false,
              "focusmanager.testmode": false,
            },
          },
        },
      },
    });
    sessionId = created.sessionId;
    await request(`/session/${sessionId}/window/rect`, {
      width: 1440,
      height: 1000,
    });
    return {
      pid: created.capabilities["moz:processID"],
      version: created.capabilities.browserVersion,
      goto: (url) => request(`/session/${sessionId}/url`, { url }),
      evaluate: (fn, argument) =>
        request(`/session/${sessionId}/execute/sync`, {
          script: `return (${fn.toString()})(arguments[0]);`,
          args: [argument ?? null],
        }),
      close,
    };
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Firefox startup and cleanup failed",
      );
    }
    throw error;
  }
}

export async function openBrowser(kind, settings, runDirectory) {
  if (kind === "chrome") return openChrome(settings, runDirectory);
  if (kind === "firefox") return openFirefox(settings, runDirectory);
  throw new Error("Unknown browser");
}
