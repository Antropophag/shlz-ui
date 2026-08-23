import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const knownBadRevision = "fd4f1cfb6f214ee7068160f97e32ac34c4c9404c";
const files = {
  cli: "tools/harness.mjs",
  core: "tools/lib/harness/core.mjs",
  worker: "tools/lib/harness/codex-worker.mjs",
  state: "docs/exec-plans/active/execution-context-isolation/state.json",
};
const show = async (revision, file) =>
  (await exec("git", ["show", `${revision}:${file}`], { maxBuffer: 10e6 }))
    .stdout;
const head = (await exec("git", ["rev-parse", "HEAD"])).stdout.trim();
const source = async (revision) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(files).map(async ([key, file]) => [
        key,
        await show(revision, file),
      ]),
    ),
  );
const bad = await source(knownBadRevision);
const current = await source(head);

const invariants = [
  {
    id: "launch-recording-is-recoverable",
    concern: "state-machine",
    check: ({ cli }) => /failWorkerReservation\(/.test(cli),
  },
  {
    id: "declared-fallback-can-complete",
    concern: "state-machine",
    check: ({ core }) =>
      /execution\?\.source === "codex-exec-jsonl"/.test(core),
  },
  {
    id: "retry-state-is-monotonic",
    concern: "persistence",
    check: ({ core }) =>
      /state\.packets\[packetId\]\?\.attempts !== undefined[\s\S]*attempts: state\.packets\[packetId\]\.attempts/.test(
        core,
      ),
  },
  {
    id: "stdin-failure-settles-once",
    concern: "subprocess",
    check: ({ worker }) => /child\.stdin\.once\("error"/.test(worker),
  },
  {
    id: "terminal-events-have-defined-precedence",
    concern: "subprocess",
    check: ({ worker }) =>
      /if \(turnFailed\) terminalStatus = "failed";[\s\S]*else if \(completed\) terminalStatus = "completed";[\s\S]*else if \(streamError\)/.test(
        worker,
      ),
  },
  {
    id: "persisted-completions-are-report-bound",
    concern: "persistence",
    check: ({ state }) => {
      const parsed = JSON.parse(state);
      return ["worker-adapter", "telemetry-operator"].every(
        (id) => parsed.packets[id]?.launch?.workerReportDigest,
      );
    },
  },
].map(({ check, ...invariant }) => ({
  ...invariant,
  knownBad: check(bad) ? "pass" : "fail",
  reviewedHead: check(current) ? "pass" : "fail",
}));

process.stdout.write(
  `${JSON.stringify({ version: 1, knownBadRevision, reviewedHead: head, invariants })}\n`,
);
