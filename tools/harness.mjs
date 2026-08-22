#!/usr/bin/env node
import { open, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  affectedValidation,
  assertValidationRun,
  claimPacket,
  completePacket,
  contextIndex,
  createExecutionState,
  createPlan,
  createReviewState,
  fingerprintFiles,
  gitEvidence,
  gitImplementationState,
  pausePacket,
  readJson,
  readyPackets,
  relevantValidationFiles,
  recordEvent,
  recordReview,
  recordValidation,
  requirementsStatus,
  assertImplementationDelivery,
  assertImplementationPreflight,
  assertRouteConformance,
  evaluateRouteEligibility,
  resumePacket,
  reviewContext,
  resolveReviewFindings,
  summarizeEvents,
  validateHandoff,
  validatePlan,
  writeJson,
} from "./lib/harness/core.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const config = await readJson(
  path.join(repoRoot, "docs/exec-plans/config.json"),
);
const [command, ...args] = process.argv.slice(2);
const stateRoot = path.join(repoRoot, "docs/exec-plans");
const within = (root, target) =>
  target === root || target.startsWith(`${root}${path.sep}`);
const absolute = (file) => {
  const target = path.resolve(repoRoot, file);
  if (!within(repoRoot, target))
    throw new Error(`path escapes repository: ${file}`);
  return target;
};
const statePath = (file) => {
  const target = absolute(file);
  if (!within(stateRoot, target))
    throw new Error(
      `mutable harness state must stay under docs/exec-plans: ${file}`,
    );
  return target;
};
const readJsonOr = async (file, fallback) => {
  try {
    return await readJson(file);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};
const withStateLock = async (target, operation) => {
  const lockPath = `${target}.lock`;
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST") {
      const owner = await readFile(lockPath, "utf8").catch(
        () => "unknown owner",
      );
      throw new Error(
        `state is already being updated: ${path.relative(repoRoot, target)}; lock ${path.relative(repoRoot, lockPath)} (${owner.trim() || "unknown owner"}) may be removed if its process stopped`,
      );
    }
    throw error;
  }
  await lock.write(`${process.pid} ${new Date().toISOString()}\n`);
  try {
    return await operation();
  } finally {
    await lock.close().catch(() => {});
    await unlink(lockPath).catch(() => {});
  }
};
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const output = (value) =>
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);

switch (command) {
  case "route-check":
    output(evaluateRouteEligibility(await readJson(absolute(args[0]))));
    break;
  case "implementation-preflight": {
    const requirementsPath = option("--requirements");
    output(
      assertImplementationPreflight(
        await readJson(absolute(args[0])),
        requirementsPath ? await readJson(absolute(requirementsPath)) : null,
        await gitImplementationState(repoRoot, {
          defaultBranch: option("--default") ?? "main",
          baseRef: option("--base") ?? "origin/main",
        }),
      ),
    );
    break;
  }
  case "route-conformance":
    output(
      assertRouteConformance(
        await readJson(absolute(args[0])),
        await readJson(absolute(args[1])),
      ),
    );
    break;
  case "delivery-check":
    output(assertImplementationDelivery(await readJson(absolute(args[0]))));
    break;
  case "plan": {
    const requirementsPath = option("--requirements");
    const plan = createPlan(
      await readJson(absolute(args[0])),
      config,
      requirementsPath ? await readJson(absolute(requirementsPath)) : null,
    );
    await writeJson(statePath(args[1]), plan);
    output(plan);
    break;
  }
  case "requirements-check":
    output(requirementsStatus(await readJson(absolute(args[0]))));
    break;
  case "plan-check":
    output(validatePlan(await readJson(absolute(args[0])), config));
    break;
  case "context": {
    const plan = await readJson(absolute(args[0]));
    const handoffPath = option("--state") ?? option("--handoff");
    output(
      await contextIndex(
        plan,
        args[1],
        repoRoot,
        handoffPath ? await readJson(absolute(handoffPath)) : null,
      ),
    );
    break;
  }
  case "ready": {
    const handoffPath = option("--state") ?? option("--handoff");
    output(
      readyPackets(
        await readJson(absolute(args[0])),
        handoffPath ? await readJson(absolute(handoffPath)) : null,
      ),
    );
    break;
  }
  case "handoff-write": {
    const plan = await readJson(absolute(args[0]));
    const value = validateHandoff(await readJson(absolute(args[1])), plan);
    await writeJson(statePath(args[2]), value);
    output(value);
    break;
  }
  case "affected":
    output(affectedValidation(args, config));
    break;
  case "validation-check": {
    const ledger = await readJsonOr(absolute(args[1]), []);
    const changed = await gitEvidence(repoRoot, option("--base"));
    const files = relevantValidationFiles(
      changed.changedFiles,
      args[0],
      config,
    );
    assertValidationRun(
      {
        target: args[0],
        currentFingerprint: await fingerprintFiles(files, repoRoot),
        reason: option("--reason"),
      },
      ledger,
      config,
    );
    output({ allowed: true });
    break;
  }
  case "validation-record": {
    const ledgerPath = statePath(args[0]);
    const ledger = await readJsonOr(ledgerPath, []);
    const changed = await gitEvidence(repoRoot, option("--base"));
    await recordValidation(
      {
        target: args[1],
        files: relevantValidationFiles(changed.changedFiles, args[1], config),
        outcome: option("--outcome"),
        reason: option("--reason"),
        packet: option("--packet"),
        session: option("--session"),
      },
      ledger,
      config,
      repoRoot,
    );
    await writeJson(ledgerPath, ledger);
    output(ledger.at(-1));
    break;
  }
  case "state-init": {
    const state = createExecutionState(await readJson(absolute(args[0])));
    await writeJson(statePath(args[1]), state);
    output(state);
    break;
  }
  case "claim": {
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const state = await withStateLock(target, async () => {
      const next = claimPacket(
        plan,
        await readJson(target),
        args[2],
        option("--session"),
        option("--requirements")
          ? await readJson(absolute(option("--requirements")))
          : null,
      );
      await writeJson(target, next);
      return next;
    });
    output(state.packets[args[2]]);
    break;
  }
  case "complete": {
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const state = await withStateLock(target, async () => {
      const next = completePacket(
        plan,
        await readJson(target),
        await readJson(absolute(args[2])),
        option("--requirements")
          ? await readJson(absolute(option("--requirements")))
          : null,
      );
      await writeJson(target, next);
      return next;
    });
    output(state.packets);
    break;
  }
  case "pause": {
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const requirementsPath = option("--requirements");
    if (!requirementsPath)
      throw new Error("pause requires --requirements <state>");
    const state = await withStateLock(target, async () => {
      const next = pausePacket(
        plan,
        await readJson(target),
        args[2],
        await readJson(absolute(requirementsPath)),
      );
      await writeJson(target, next);
      return next;
    });
    output(state.packets[args[2]]);
    break;
  }
  case "resume": {
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const requirementsPath = option("--requirements");
    if (!requirementsPath)
      throw new Error("resume requires --requirements <state>");
    const state = await withStateLock(target, async () => {
      const next = resumePacket(
        plan,
        await readJson(target),
        args[2],
        option("--session"),
        await readJson(absolute(requirementsPath)),
      );
      await writeJson(target, next);
      return next;
    });
    output(state.packets[args[2]]);
    break;
  }
  case "review-init": {
    const state = createReviewState(args[1]);
    await writeJson(statePath(args[0]), state);
    output(state);
    break;
  }
  case "review-record": {
    const target = statePath(args[0]);
    const state = recordReview(await readJson(target), {
      axis: option("--axis"),
      head: option("--head"),
      findings: await readJson(absolute(option("--findings"))),
    });
    await writeJson(target, state);
    output(reviewContext(state));
    break;
  }
  case "review-context":
    output(reviewContext(await readJson(absolute(args[0]))));
    break;
  case "review-resolve": {
    const target = statePath(args[0]);
    const state = resolveReviewFindings(
      await readJson(target),
      option("--ids")?.split(",").filter(Boolean) ?? [],
      option("--head"),
    );
    await writeJson(target, state);
    output(reviewContext(state));
    break;
  }
  case "telemetry-record": {
    const raw = option("--event");
    if (!raw) throw new Error("telemetry-record requires --event <json>");
    const event = JSON.parse(raw);
    await recordEvent(statePath(args[0]), event);
    output({ recorded: true, type: event.type });
    break;
  }
  case "telemetry-summary": {
    const text = await readFile(absolute(args[0]), "utf8");
    output(
      summarizeEvents(text.trim().split("\n").filter(Boolean).map(JSON.parse)),
    );
    break;
  }
  case "evidence":
    output(await gitEvidence(repoRoot, args[0]));
    break;
  default:
    throw new Error(
      "usage: harness <route-check|implementation-preflight|route-conformance|delivery-check|requirements-check|plan|plan-check|context|ready|state-init|claim|pause|resume|complete|handoff-write|affected|validation-check|validation-record|review-init|review-record|review-context|review-resolve|telemetry-record|telemetry-summary|evidence> ...",
    );
}
