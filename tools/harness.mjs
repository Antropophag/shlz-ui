#!/usr/bin/env node
import { open, readFile, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  affectedValidation,
  assertValidationRun,
  claimPacket,
  completePacket,
  contextIndex,
  createExecutionState,
  createPlan,
  createTddDesignEvidence,
  createTddReviewBinding,
  createTddReentryEvidence,
  createReviewState,
  createWorkerBrief,
  failWorkerReservation,
  fingerprintFiles,
  gitEvidence,
  gitDeliveryState,
  gitExecutionBaselineState,
  gitImplementationState,
  gitRouteSurfaces,
  loadChangeFailureInvariants,
  pausePacket,
  readJson,
  readyPackets,
  relevantValidationFiles,
  recordEvent,
  recordFailurePathDegradation,
  recordFailurePathProof,
  recordReview,
  recordValidation,
  reserveWorkerPacket,
  recordWorkerAttempt,
  recordTddDesign,
  requirementsStatus,
  assertImplementationDelivery,
  assertImplementationPreflight,
  assertExecutionBaselineState,
  assertRouteConformance,
  evaluateRouteEligibility,
  failurePathResultDigest,
  resumePacket,
  runTddAcceptance,
  reviewContext,
  resolveReviewFindings,
  retryWorkerPacket,
  summarizeEvents,
  validateHandoff,
  validateExecutionBaseline,
  validatePlan,
  writeJson,
  workerTelemetryEvents,
} from "./lib/harness/core.mjs";
import {
  launchCodexWorker,
  probeCodexExec,
} from "./lib/harness/codex-worker.mjs";
import {
  acknowledgeContextCapsule,
  createContextLedger,
  createPacketContextCapsule,
  runContextCostReplay,
} from "./lib/harness/context-cost.mjs";

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
const refreshChangeFailureInvariants = async (state, target) => {
  const stored = state.changeFailureInvariants;
  if (!stored) return state;
  const current = await loadChangeFailureInvariants(
    stored.change,
    {
      version: 1,
      change: stored.change,
      invariants: stored.invariants.map(
        ({ id, concern, requirement, scenario }) => ({
          id,
          concern,
          requirement,
          scenario,
        }),
      ),
    },
    repoRoot,
  );
  if (
    current.manifestDigest !== stored.manifestDigest ||
    current.contractDigest !== stored.contractDigest
  ) {
    delete state.failurePathProof;
    await writeJson(target, state);
    throw new Error(
      "change-specific failure invariant contracts changed after review initialization",
    );
  }
  return state;
};
const exec = promisify(execFile);

switch (command) {
  case "context-capsule": {
    const ledgerPath = option("--ledger");
    const phase = option("--phase");
    const transition = option("--transition");
    const out = option("--out");
    if (!ledgerPath || !phase || !transition || !out)
      throw new Error(
        "context-capsule requires --ledger, --phase, --transition, and --out",
      );
    const plan = await readJson(absolute(args[0]));
    const executionStatePath = option("--state");
    const index = await contextIndex(
      plan,
      args[1],
      repoRoot,
      executionStatePath ? await readJson(absolute(executionStatePath)) : null,
    );
    const capsule = await createPacketContextCapsule(
      index,
      await readJsonOr(absolute(ledgerPath), createContextLedger()),
      repoRoot,
      { phase, transition },
    );
    await writeJson(statePath(out), capsule);
    output(capsule);
    break;
  }
  case "context-ack": {
    const ledgerPath = args[1];
    if (!ledgerPath) throw new Error("context-ack requires <capsule> <ledger>");
    const next = acknowledgeContextCapsule(
      await readJsonOr(absolute(ledgerPath), createContextLedger()),
      await readJson(absolute(args[0])),
    );
    await writeJson(statePath(ledgerPath), next);
    output(next);
    break;
  }
  case "context-cost-replay":
    output(
      await runContextCostReplay(await readJson(absolute(args[0])), repoRoot),
    );
    break;
  case "route-check":
    output(evaluateRouteEligibility(await readJson(absolute(args[0]))));
    break;
  case "implementation-preflight": {
    const requirementsPath = option("--requirements");
    const outputPath = option("--out");
    if (!outputPath)
      throw new Error(
        "implementation-preflight requires --out <execution-baseline>",
      );
    const result = assertImplementationPreflight(
      await readJson(absolute(args[0])),
      requirementsPath ? await readJson(absolute(requirementsPath)) : null,
      await gitImplementationState(repoRoot, {
        defaultBranch: option("--default") ?? "main",
        baseRef: option("--base") ?? "origin/main",
        pullRequestUrl: option("--pull-request"),
      }),
    );
    await writeJson(statePath(outputPath), result.baseline);
    output(result);
    break;
  }
  case "route-conformance":
    {
      const executionPath = option("--execution");
      if (!executionPath)
        throw new Error(
          "route-conformance requires --execution <execution-baseline>",
        );
      const baseline = validateExecutionBaseline(
        await readJson(absolute(executionPath)),
      );
      assertExecutionBaselineState(
        baseline,
        await gitExecutionBaselineState(repoRoot, baseline),
      );
      const base = baseline.commit;
      const evidence = await gitEvidence(repoRoot, base);
      const targetRelevantFiles = evidence.changedFiles.filter(
        (file) => !file.startsWith("docs/exec-plans/active/"),
      );
      output(
        assertRouteConformance(
          await readJson(absolute(args[0])),
          await readJson(absolute(args[1])),
          await gitRouteSurfaces(repoRoot, base, targetRelevantFiles),
        ),
      );
    }
    break;
  case "delivery-check": {
    const delivery = await readJson(absolute(args[0]));
    const planPath = option("--plan");
    const executionStatePath = option("--state");
    const directPath = option("--direct");
    if (Boolean(planPath) !== Boolean(executionStatePath))
      throw new Error("delivery-check requires both --plan and --state");
    if (!planPath && !directPath)
      throw new Error(
        "delivery-check requires --plan <plan> --state <state> or --direct <route-assessment>",
      );
    if (planPath && directPath)
      throw new Error(
        "delivery-check cannot combine execution and direct evidence",
      );
    let execution = null;
    if (planPath) {
      const plan = validatePlan(await readJson(absolute(planPath)), config);
      const reviewPath = option("--review");
      if (!reviewPath)
        throw new Error("planned delivery-check requires --review <state>");
      const requirementsPath = option("--requirements");
      if (plan.requirementsGate === "required" && !requirementsPath)
        throw new Error(
          "requirements-gated delivery-check requires --requirements <state>",
        );
      execution = {
        plan,
        state: await readJson(absolute(executionStatePath)),
        requirementsState: requirementsPath
          ? await readJson(absolute(requirementsPath))
          : null,
        reviewState: await refreshChangeFailureInvariants(
          await readJson(absolute(reviewPath)),
          absolute(reviewPath),
        ),
      };
    } else {
      const direct = await readJson(absolute(directPath));
      const eligibility = evaluateRouteEligibility(direct);
      if (direct.route !== "direct" || !eligibility.eligible)
        throw new Error("delivery direct evidence is not positively eligible");
    }
    output(
      assertImplementationDelivery(
        {
          ...delivery,
          actual: await gitDeliveryState(repoRoot, delivery.pullRequestUrl),
        },
        execution,
      ),
    );
    break;
  }
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
  case "tdd-design-record": {
    const baselinePath = option("--execution");
    if (!baselinePath)
      throw new Error("tdd-design-record requires --execution <baseline>");
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const handoff = await readJson(absolute(args[2]));
    const state = await withStateLock(target, async () => {
      const current = await readJson(target);
      recordTddDesign(
        plan,
        current,
        await createTddDesignEvidence(
          plan,
          current,
          handoff,
          await readJson(absolute(baselinePath)),
          repoRoot,
        ),
      );
      await writeJson(target, current);
      return current;
    });
    output(state.specDrivenTdd.slices[handoff.sliceId]);
    break;
  }
  case "tdd-red":
  case "tdd-green": {
    if (
      args.includes("--baseline-command") ||
      args.includes("--candidate-command")
    )
      throw new Error(
        "spec-driven TDD does not accept revision-specific command or oracle overrides",
      );
    const baselinePath = option("--execution");
    if (!baselinePath)
      throw new Error(`${command} requires --execution <baseline>`);
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const state = await withStateLock(target, async () => {
      const current = await readJson(target);
      try {
        await runTddAcceptance(
          plan,
          current,
          args[2],
          await readJson(absolute(baselinePath)),
          repoRoot,
          command === "tdd-red" ? "red" : "green",
        );
      } catch (error) {
        if (
          command === "tdd-green" &&
          current.specDrivenTdd?.slices?.[args[2]]?.status ===
            "pending-test-design"
        )
          await writeJson(target, current);
        throw error;
      }
      await writeJson(target, current);
      return current;
    });
    output(state.specDrivenTdd.slices[args[2]]);
    break;
  }
  case "worker-probe":
    output(await probeCodexExec({ cwd: repoRoot }));
    break;
  case "worker-brief": {
    const baselinePath = option("--execution");
    const claimId = option("--claim");
    const outputPath = option("--out");
    if (!baselinePath || !claimId || !outputPath)
      throw new Error(
        "worker-brief requires --execution <baseline> --claim <id> --out <brief>",
      );
    const brief = createWorkerBrief(
      await readJson(absolute(args[0])),
      await readJson(absolute(args[1])),
      args[2],
      {
        baseline: await readJson(absolute(baselinePath)),
        requirementsState: option("--requirements")
          ? await readJson(absolute(option("--requirements")))
          : null,
        claimId,
      },
    );
    await writeJson(statePath(outputPath), brief);
    output(brief);
    break;
  }
  case "worker-run": {
    const baselinePath = option("--execution");
    const claimId = option("--claim");
    const session = option("--session");
    const briefPath = option("--brief-out");
    if (!baselinePath || !claimId || !session || !briefPath)
      throw new Error(
        "worker-run requires --execution <baseline> --claim <id> --session <id> --brief-out <brief>",
      );
    const plan = await readJson(absolute(args[0]));
    const target = statePath(args[1]);
    const requirementsState = option("--requirements")
      ? await readJson(absolute(option("--requirements")))
      : null;
    const prepared = await withStateLock(target, async () => {
      const current = await readJson(target);
      const brief = createWorkerBrief(plan, current, args[2], {
        baseline: await readJson(absolute(baselinePath)),
        requirementsState,
        claimId,
      });
      await writeJson(statePath(briefPath), brief);
      reserveWorkerPacket(
        plan,
        current,
        args[2],
        brief,
        session,
        requirementsState,
      );
      await writeJson(target, current);
      return { brief };
    });
    const result = await launchCodexWorker({
      brief: prepared.brief,
      cwd: repoRoot,
    });
    const state = await withStateLock(target, async () => {
      const current = await readJson(target);
      let recordingError = null;
      try {
        recordWorkerAttempt(
          plan,
          current,
          args[2],
          prepared.brief,
          result,
          session,
          requirementsState,
        );
      } catch (error) {
        failWorkerReservation(current, args[2], error, result);
        recordingError = error;
      }
      await writeJson(target, current);
      return { packet: current.packets[args[2]], result, recordingError };
    });
    if (state.recordingError) throw state.recordingError;
    const telemetryPath = option("--telemetry-out");
    if (telemetryPath)
      for (const event of workerTelemetryEvents({
        packets: { [args[2]]: state.packet },
      }))
        await recordEvent(statePath(telemetryPath), event, {
          trustedRuntime: true,
        });
    output(state);
    break;
  }
  case "worker-retry": {
    const target = statePath(args[0]);
    const state = await withStateLock(target, async () => {
      const current = await readJson(target);
      retryWorkerPacket(current, args[1]);
      await writeJson(target, current);
      return current;
    });
    output(state.packets[args[1]]);
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
        null,
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
        option("--execution")
          ? { baseline: await readJson(absolute(option("--execution"))) }
          : {},
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
      const current = await readJson(target);
      const reentry = option("--tdd-reentry")
        ? await createTddReentryEvidence(
            plan,
            current,
            await readJson(absolute(option("--tdd-reentry"))),
            repoRoot,
          )
        : null;
      const next = pausePacket(
        plan,
        current,
        args[2],
        await readJson(absolute(requirementsPath)),
        reentry,
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
    const failurePathOption = option("--failure-path-concerns");
    if (!failurePathOption)
      throw new Error(
        "review-init requires --failure-path-concerns <list|none>",
      );
    const concerns =
      failurePathOption === "none"
        ? []
        : failurePathOption.split(",").filter(Boolean);
    const change = option("--change");
    const invariantsPath = option("--invariants");
    if (concerns.length && (!change || !invariantsPath))
      throw new Error(
        "material review-init requires --change <name> --invariants <manifest>",
      );
    if (!concerns.length && (change || invariantsPath))
      throw new Error(
        "concern-free review-init does not accept change-specific invariants",
      );
    const binding = concerns.length
      ? await loadChangeFailureInvariants(
          change,
          await readJson(absolute(invariantsPath)),
          repoRoot,
        )
      : null;
    if (
      binding &&
      binding.invariants.some(({ concern }) => !concerns.includes(concern))
    )
      throw new Error(
        "change-specific failure invariant concern is not enabled for review",
      );
    const tddPlanPath = option("--tdd-plan");
    const tddStatePath = option("--tdd-state");
    if (Boolean(tddPlanPath) !== Boolean(tddStatePath))
      throw new Error("review-init requires both --tdd-plan and --tdd-state");
    const executionPlanPath = option("--plan");
    if (!executionPlanPath)
      throw new Error("review-init requires --plan <execution-plan>");
    const executionPlan = validatePlan(
      await readJson(absolute(executionPlanPath)),
      config,
    );
    const enforcedTdd = (executionPlan.specDrivenTdd?.slices ?? []).some(
      ({ applicability }) => applicability === "enforced",
    );
    if (enforcedTdd && (!tddPlanPath || !tddStatePath))
      throw new Error(
        "review-init requires a TDD binding for an execution plan with enforced slices",
      );
    if (tddPlanPath && absolute(tddPlanPath) !== absolute(executionPlanPath))
      throw new Error("review-init TDD plan must be the authoritative plan");
    const currentHead = await exec("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
    }).then(({ stdout }) => stdout.trim());
    const tddBinding = tddPlanPath
      ? createTddReviewBinding(
          executionPlan,
          await readJson(absolute(tddStatePath)),
          currentHead,
        )
      : null;
    const state = createReviewState(args[1], concerns, binding, tddBinding);
    await writeJson(statePath(args[0]), state);
    output(state);
    break;
  }
  case "review-proof": {
    const target = statePath(args[0]);
    const definition = await readJson(absolute(option("--proof")));
    if (
      !Array.isArray(definition.command) ||
      !definition.command.length ||
      definition.command.some((part) => typeof part !== "string" || !part) ||
      (definition.timeoutMs !== undefined &&
        (!Number.isInteger(definition.timeoutMs) ||
          definition.timeoutMs < 1 ||
          definition.timeoutMs > 10 * 60 * 1000))
    )
      throw new Error(
        "review proof requires a command array and optional bounded timeoutMs",
      );
    const state = await withStateLock(target, async () => {
      const current = await refreshChangeFailureInvariants(
        await readJson(target),
        target,
      );
      let observed;
      try {
        const { stdout } = await exec(
          definition.command[0],
          definition.command.slice(1),
          {
            cwd: repoRoot,
            env: { ...process.env, SHLZ_REVIEW_BASE: current.base },
            maxBuffer: 10 * 1024 * 1024,
            timeout: definition.timeoutMs ?? 10 * 60 * 1000,
            killSignal: "SIGKILL",
          },
        );
        observed = JSON.parse(stdout);
      } catch (error) {
        await writeJson(
          target,
          recordFailurePathDegradation(current, "execution", error.message),
        );
        throw error;
      }
      const proof = {
        ...observed,
        command: definition.command,
        ...(current.changeFailureInvariants
          ? {
              openSpecChange: current.changeFailureInvariants.change,
              manifestDigest: current.changeFailureInvariants.manifestDigest,
              contractDigest: current.changeFailureInvariants.contractDigest,
            }
          : {}),
      };
      proof.resultDigest = failurePathResultDigest(proof);
      const next = recordFailurePathProof(current, proof);
      await writeJson(target, next);
      return next;
    });
    output(reviewContext(state));
    break;
  }
  case "review-degrade": {
    const target = statePath(args[0]);
    const state = await withStateLock(target, async () => {
      const next = recordFailurePathDegradation(
        await readJson(target),
        option("--capability"),
        option("--reason"),
      );
      await writeJson(target, next);
      return next;
    });
    output(reviewContext(state));
    break;
  }
  case "review-record": {
    const target = statePath(args[0]);
    const findings = await readJson(absolute(option("--findings")));
    const state = await withStateLock(target, async () => {
      const current = await refreshChangeFailureInvariants(
        await readJson(target),
        target,
      );
      const tddPlanPath = option("--tdd-plan");
      const tddStatePath = option("--tdd-state");
      if (current.specDrivenTdd && (!tddPlanPath || !tddStatePath))
        throw new Error(
          "review-record requires --tdd-plan and --tdd-state for a TDD-bound review",
        );
      const tddEvidence = current.specDrivenTdd
        ? createTddReviewBinding(
            await readJson(absolute(tddPlanPath)),
            await readJson(absolute(tddStatePath)),
            option("--head"),
          )
        : null;
      const next = recordReview(current, {
        axis: option("--axis"),
        head: option("--head"),
        findings,
        tddEvidence,
      });
      await writeJson(target, next);
      return next;
    });
    output(reviewContext(state));
    break;
  }
  case "review-context":
    output(reviewContext(await readJson(absolute(args[0]))));
    break;
  case "review-resolve": {
    const target = statePath(args[0]);
    const state = await withStateLock(target, async () => {
      const next = resolveReviewFindings(
        await readJson(target),
        option("--ids")?.split(",").filter(Boolean) ?? [],
        option("--head"),
      );
      await writeJson(target, next);
      return next;
    });
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
      "usage: harness <context-capsule|context-ack|context-cost-replay|route-check|implementation-preflight|route-conformance|delivery-check|requirements-check|plan|plan-check|context|ready|state-init|tdd-design-record|tdd-red|tdd-green|worker-probe|worker-brief|worker-run|worker-retry|claim|pause|resume|complete|handoff-write|affected|validation-check|validation-record|review-init|review-record|review-context|review-resolve|telemetry-record|telemetry-summary|evidence> ... (preflight: --out/--pull-request; conformance: --execution)",
    );
}
