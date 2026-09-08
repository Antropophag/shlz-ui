import assert from "node:assert/strict";
import path from "node:path";
import { URL } from "node:url";

export function validateSettings(settings) {
  const win = path.win32;
  assert.ok(
    settings && typeof settings === "object",
    "settings object required",
  );
  assert.match(
    settings.sourceCommit ?? "",
    /^[a-f0-9]{40}$/,
    "exact source commit required",
  );
  assert.ok(
    ["discovery", "verification"].includes(settings.phase),
    "explicit execution phase required",
  );
  assert.match(
    settings.repoPosix ?? "",
    /^\/[^?#\\]+$/,
    "POSIX fixture root required",
  );
  const base = new URL(settings.baseURL);
  assert.ok(
    base.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(base.hostname) &&
      base.pathname === "/" &&
      !base.search &&
      !base.hash &&
      !base.username &&
      !base.password,
    "fixture server must be a loopback HTTP origin",
  );
  assert.ok(
    typeof settings.tempRoot === "string" && win.isAbsolute(settings.tempRoot),
    "absolute task root required",
  );
  assert.match(
    win.parse(settings.tempRoot).root,
    /^[a-zA-Z]:\\$/,
    "local Windows task root required",
  );
  assert.match(
    win.basename(settings.tempRoot),
    /^shlz-at-[a-zA-Z0-9_-]+$/,
    "dedicated task root required",
  );
  const root = win.normalize(settings.tempRoot).toLowerCase();
  for (const [key, filename] of Object.entries({
    chrome: "chrome.exe",
    firefox: "firefox.exe",
    geckodriver: "geckodriver.exe",
    nvda: "nvda.exe",
  })) {
    const file = settings[key];
    assert.ok(
      typeof file === "string" && win.isAbsolute(file),
      `absolute ${key} binary required`,
    );
    assert.match(
      win.parse(file).root,
      /^[a-zA-Z]:\\$/,
      "local Windows executable required",
    );
    assert.equal(
      win.basename(file).toLowerCase(),
      filename,
      `unexpected ${key} binary`,
    );
    if (key !== "chrome") {
      assert.ok(
        win
          .normalize(file)
          .toLowerCase()
          .startsWith(root + "\\"),
        `${key} must belong to the task root`,
      );
    }
  }
  for (const key of ["output", "sampleFile"]) {
    assert.ok(
      typeof settings[key] === "string" && win.isAbsolute(settings[key]),
      `absolute ${key} path required`,
    );
    assert.equal(
      win.dirname(win.normalize(settings[key])).toLowerCase(),
      root,
      `${key} must be a direct child of the task root`,
    );
  }
  assert.match(
    win.basename(settings.output),
    /^[a-zA-Z0-9_.-]+\.json$/,
    "JSON result filename required",
  );
  assert.equal(
    win.basename(settings.sampleFile),
    "shlz-at-upload.txt",
    "dedicated sample file required",
  );
  const targets = settings.browsers ?? ["chrome", "firefox"];
  assert.ok(
    Array.isArray(targets) &&
      targets.length > 0 &&
      targets.every((name) => ["chrome", "firefox"].includes(name)) &&
      new Set(targets).size === targets.length,
    "invalid browser selection",
  );
  return targets;
}
