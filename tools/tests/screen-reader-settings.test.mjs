import assert from "node:assert/strict";
import test from "node:test";
import { validateSettings } from "../at/settings.mjs";

const settings = () => ({
  sourceCommit: "a".repeat(40),
  phase: "verification",
  repoPosix: "/repo",
  baseURL: "http://127.0.0.1:4183",
  tempRoot: "C:\\Temp\\shlz-at-test",
  chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  firefox: "C:\\Temp\\shlz-at-test\\firefox\\firefox.exe",
  geckodriver: "C:\\Temp\\shlz-at-test\\geckodriver.exe",
  nvda: "C:\\Temp\\shlz-at-test\\nvda\\nvda.exe",
  output: "C:\\Temp\\shlz-at-test\\result.json",
  sampleFile: "C:\\Temp\\shlz-at-test\\shlz-at-upload.txt",
});

test("desktop settings constrain writes, binaries and fixture navigation", () => {
  assert.deepEqual(validateSettings(settings()), ["chrome", "firefox"]);
  for (const delta of [
    { output: "C:\\Temp\\outside.json" },
    { output: "C:\\Temp\\shlz-at-test\\result.json:stream.json" },
    { nvda: "C:\\Temp\\foreign\\nvda.exe" },
    { chrome: "C:\\Temp\\cmd.exe" },
    { baseURL: "https://example.com" },
    { baseURL: "http://127.0.0.1:4183/#other" },
    { browsers: ["chrome", "chrome"] },
    { tempRoot: "C:\\" },
  ])
    assert.throws(() => validateSettings({ ...settings(), ...delta }));
});
