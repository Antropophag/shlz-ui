import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, appendFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as browsers from "../at/browsers.mjs";
import { ScreenReaderSession } from "../at/runtime.mjs";

const owned = { pid: 123, windowClass: "Chrome_WidgetWin_1", tick: 10 };
const dialog = {
  pid: 456,
  windowClass: "#32770",
  ownerPids: [123],
  focusClass: "Edit",
  tick: 20,
};
function session(states) {
  const t = new ScreenReaderSession({ pid: 123 }, null, null, {
    check() {},
    foreign() {
      return [];
    },
  });
  t.desktop = () => (states.length > 1 ? states.shift() : states[0]);
  return t;
}

test("Chrome waits for asynchronously attached context and page", async () => {
  let calls = 0;
  const page = {};
  const browser = {
    contexts() {
      calls++;
      return calls === 1 ? [] : [{ pages: () => (calls < 3 ? [] : [page]) }];
    },
  };
  assert.equal(await browsers.waitForInitialPage(browser, 1000), page);
  await assert.rejects(
    () => browsers.waitForInitialPage({ contexts: () => [] }, 0),
    /Owned Chrome exposed no initial page/,
  );
});

test("native chooser waits through browser and unfocused dialog states", async () => {
  const states = [owned, { ...dialog, focusClass: "Button" }, dialog];
  await session(states).waitForNativeDialog(1000);
  assert.equal(states.length, 1);
});

test("native chooser times out and refuses foreign ownership or stopped monitoring", async () => {
  await assert.rejects(
    () => session([owned]).waitForNativeDialog(0),
    /dialog.*timed out/i,
  );
  await assert.rejects(
    () => session([{ ...dialog, ownerPids: [999] }]).waitForNativeDialog(),
    /ownership/i,
  );
  const stopped = session([dialog]);
  stopped.monitor.check = () => {
    throw new Error("monitor stopped");
  };
  await assert.rejects(() => stopped.waitForNativeDialog(), /monitor stopped/);
  const returned = session([dialog]);
  returned.activeSpan = 10;
  returned.monitor.foreign = () => [{ pid: 999 }];
  await assert.rejects(
    () => returned.waitForNativeDialog(),
    /foreign foreground/i,
  );
});

test("checkpoint accepts owned dialog snapshots and rejects foreign snapshots", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "shlz-checkpoint-"));
  try {
    for (const states of [
      [dialog, dialog, dialog],
      [{ ...dialog, ownerPids: [] }],
      [owned, { ...dialog, ownerPids: [] }],
      [owned, owned, { ...dialog, ownerPids: [] }],
    ]) {
      const t = session([...states]);
      t.workflowId = "input";
      t.log = path.join(directory, "speech.log");
      await writeFile(t.log, "");
      const run = () =>
        t.checkpoint(
          "name-value",
          () =>
            appendFile(
              t.log,
              "Input: kb(test)\nSpeaking ['Имя', 'edit', 'Анна']\n",
            ),
          async () => [],
          { reportFocus: false },
        );
      if (states.every((s) => s.ownerPids?.includes(123))) {
        const value = await run();
        assert.equal(value.foregroundVerified, true);
        assert.equal(value.foregroundSpan.before.pid, 456);
        assert.equal(value.foregroundSpan.after.pid, 456);
      } else {
        await assert.rejects(run, /ownership/i);
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
