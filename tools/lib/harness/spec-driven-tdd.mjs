import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const sha256Pattern = /^[0-9a-f]{64}$/;

export function createSpecDrivenTdd({
  stableValue,
  valueDigest,
  fingerprintFiles,
  walk,
  matchesPattern,
  validateExecutionBaseline,
  assertExecutionBaselineState,
  gitExecutionBaselineState,
}) {
  function tddSlice(plan, state, sliceId) {
    const contract = plan.specDrivenTdd?.slices.find(
      ({ id }) => id === sliceId,
    );
    const lifecycle = state.specDrivenTdd?.slices?.[sliceId];
    if (!contract || !lifecycle)
      throw new Error(`unknown spec-driven TDD slice ${sliceId}`);
    if (contract.applicability !== "enforced")
      throw new Error(`spec-driven TDD slice ${sliceId} is inapplicable`);
    return { contract, lifecycle };
  }

  const tddIdentityFields = [
    "requirementsRevision",
    "baselineDigest",
    "acceptanceDigest",
    "fixtureDigest",
    "controlsDigest",
    "contractDigest",
    "oracleChallengeDigest",
  ];

  function assertTddDigests(value) {
    for (const field of tddIdentityFields.slice(1))
      if (!sha256Pattern.test(value[field] ?? ""))
        throw new Error(`spec-driven TDD evidence requires ${field}`);
  }

  function assertTddIdentity(expected, actual, message) {
    if (tddIdentityFields.some((field) => expected[field] !== actual[field]))
      throw new Error(message);
  }

  function tddRetentionIdentity(plan, state, contract, design) {
    const packet = (id) => plan.packets.find((item) => item.id === id);
    return {
      scenarioDigest: valueDigest(contract.scenarioIds),
      authorityDigest: valueDigest(contract.authorities),
      dependencyDigest: valueDigest({
        testDesign: packet(contract.testDesignPacket)?.dependencies ?? [],
        implementation:
          packet(contract.implementationPacket)?.dependencies ?? [],
        handoffs: Object.fromEntries(
          [contract.testDesignPacket, contract.implementationPacket]
            .filter((id) => state.handoffs?.[id])
            .map((id) => [id, valueDigest(state.handoffs[id])]),
        ),
      }),
      commandDigest: valueDigest(contract.command),
      acceptanceDigest: design.acceptanceDigest,
      fixtureDigest: design.fixtureDigest,
      controlsDigest: design.controlsDigest,
      sliceContractDigest: valueDigest(contract),
    };
  }

  async function createTddReentryEvidence(plan, state, reentry, repoRoot) {
    if (!Array.isArray(reentry?.slices)) return reentry;
    return {
      ...reentry,
      slices: await Promise.all(
        reentry.slices.map(async (item) => {
          if (item.classification !== "retained") return item;
          const { contract, lifecycle } = tddSlice(plan, state, item.sliceId);
          if (
            !Array.isArray(lifecycle.design?.acceptanceFiles) ||
            !Array.isArray(lifecycle.design?.fixtureFiles)
          )
            throw new Error(
              `spec-driven TDD slice ${item.sliceId} retention requires file-bound design evidence`,
            );
          const evidence = tddRetentionIdentity(
            plan,
            state,
            contract,
            lifecycle.design,
          );
          evidence.acceptanceDigest = await fingerprintFiles(
            lifecycle.design.acceptanceFiles,
            repoRoot,
          );
          evidence.fixtureDigest = await fingerprintFiles(
            lifecycle.design.fixtureFiles,
            repoRoot,
          );
          return { ...item, evidence };
        }),
      ),
    };
  }

  async function tddSurfaceFiles(patterns, repoRoot) {
    const files = await walk(repoRoot);
    const selected = [
      ...new Set(
        patterns.flatMap((pattern) =>
          files.filter((file) => matchesPattern(file, pattern)),
        ),
      ),
    ].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
    const missing = patterns.filter(
      (pattern) => !files.some((file) => matchesPattern(file, pattern)),
    );
    if (missing.length)
      throw new Error(
        `spec-driven TDD surface is missing: ${missing.join(", ")}`,
      );
    return selected;
  }

  async function computeTddDesignIdentity(
    plan,
    state,
    handoff,
    baseline,
    repoRoot,
  ) {
    validateExecutionBaseline(baseline);
    const { contract } = tddSlice(plan, state, handoff?.sliceId);
    const [acceptanceFiles, fixtureFiles] = await Promise.all([
      tddSurfaceFiles(contract.acceptanceSurface, repoRoot),
      tddSurfaceFiles(contract.fixtureSurface, repoRoot),
    ]);
    const commandInputs = new Set(contract.command.slice(1));
    if (
      !acceptanceFiles.some(
        (file) =>
          commandInputs.has(file) ||
          commandInputs.has(path.resolve(repoRoot, file)),
      )
    )
      throw new Error(
        "spec-driven TDD command must execute a declared acceptance file",
      );
    const evidence = {
      ...handoff,
      requirementsRevision:
        state.requirementsRevision ?? plan.requirementsRevision ?? 1,
      baselineDigest: valueDigest(baseline),
      acceptanceDigest: await fingerprintFiles(acceptanceFiles, repoRoot),
      fixtureDigest: await fingerprintFiles(fixtureFiles, repoRoot),
      controlsDigest: valueDigest(contract.controls),
      contractDigest: valueDigest(contract),
      acceptanceFiles,
      fixtureFiles,
    };
    const challenge = handoff.oracleChallenge;
    if (
      challenge?.version !== 1 ||
      typeof challenge.adapterEnvironment !== "string" ||
      !challenge.adapterEnvironment ||
      typeof challenge.controlAdapter !== "string" ||
      typeof challenge.decoyAdapter !== "string" ||
      challenge.controlAdapter === challenge.decoyAdapter ||
      !fixtureFiles.includes(challenge.controlAdapter) ||
      !fixtureFiles.includes(challenge.decoyAdapter) ||
      typeof challenge.expectedFailureSignature !== "string" ||
      !challenge.expectedFailureSignature ||
      !Array.isArray(challenge.scenarioIds) ||
      !challenge.scenarioIds.length ||
      challenge.scenarioIds.some((id) => !contract.scenarioIds.includes(id))
    )
      throw new Error(
        "spec-driven TDD design requires a fixture-bound scenario-grounded oracle challenge",
      );
    const oracleChallengeDigest = valueDigest({
      challenge,
      command: contract.command,
      controls: contract.controls,
      fixtureDigest: evidence.fixtureDigest,
    });
    return { contract, challenge, evidence, oracleChallengeDigest };
  }

  async function executeOracleChallenge(contract, challenge, repoRoot) {
    const runAdapter = async (adapter) => {
      const challengeContract = {
        ...contract,
        controls: {
          ...contract.controls,
          environment: {
            ...contract.controls.environment,
            [challenge.adapterEnvironment]: adapter,
          },
        },
      };
      const runs = [];
      for (let index = 0; index < contract.repeatCount; index++)
        runs.push(
          await executeTddRequest(
            challengeContract,
            repoRoot,
            repoRoot,
            repoRoot,
          ),
        );
      if (runs.some((run) => run.output !== runs[0].output))
        throw new Error("spec-driven TDD oracle challenge is nondeterministic");
      return runs;
    };
    const controlRuns = await runAdapter(challenge.controlAdapter);
    const decoyRuns = await runAdapter(challenge.decoyAdapter);
    if (controlRuns.some(({ exitCode }) => exitCode !== 0))
      throw new Error(
        "spec-driven TDD oracle challenge rejected known-good control",
      );
    if (decoyRuns.some(({ exitCode }) => exitCode === 0))
      throw new Error(
        "spec-driven TDD oracle challenge did not discriminate behavioral decoy",
      );
    if (
      decoyRuns.some(
        ({ output }) => !output.includes(challenge.expectedFailureSignature),
      )
    )
      throw new Error(
        "spec-driven TDD oracle challenge did not match the scenario failure signature",
      );
    return { control: controlRuns, decoy: decoyRuns };
  }

  async function createTddDesignEvidence(
    plan,
    state,
    handoff,
    baseline,
    repoRoot,
  ) {
    const { contract, challenge, evidence, oracleChallengeDigest } =
      await computeTddDesignIdentity(plan, state, handoff, baseline, repoRoot);
    return {
      ...evidence,
      oracleChallengeDigest,
      oracleChallengeRuns: await executeOracleChallenge(
        contract,
        challenge,
        repoRoot,
      ),
    };
  }

  function normalizedTddOutput(value, repoRoot, worktreeRoot) {
    let output = value.replaceAll("\r\n", "\n");
    output = output.replaceAll(worktreeRoot, "<worktree-root>");
    output = output.replaceAll(repoRoot, "<repo-root>");
    return output.trim();
  }

  async function executeTddRequest(contract, cwd, repoRoot, worktreeRoot) {
    const controls = contract.controls;
    if (
      !controls ||
      !Number.isInteger(controls.timeoutMs) ||
      controls.timeoutMs < 1 ||
      controls.timeoutMs > 10 * 60 * 1000 ||
      !controls.environment ||
      Object.values(controls.environment).some(
        (value) => typeof value !== "string",
      )
    )
      throw new Error(
        "spec-driven TDD controls require bounded deterministic execution",
      );
    const options = {
      cwd,
      env: { ...controls.environment },
      timeout: controls.timeoutMs,
      killSignal: "SIGKILL",
      maxBuffer: 10 * 1024 * 1024,
    };
    const command = contract.command.map((part) => {
      const resolved = path.isAbsolute(part) ? path.resolve(part) : null;
      const relative = resolved ? path.relative(repoRoot, resolved) : null;
      const isRepositoryPath =
        relative !== null &&
        relative !== "" &&
        !relative.startsWith(`..${path.sep}`) &&
        relative !== ".." &&
        !path.isAbsolute(relative);
      return isRepositoryPath ? path.join(cwd, relative) : part;
    });
    try {
      const { stdout, stderr } = await exec(
        command[0],
        command.slice(1),
        options,
      );
      return {
        exitCode: 0,
        output: normalizedTddOutput(
          `${stdout}${stderr}`,
          repoRoot,
          worktreeRoot,
        ),
      };
    } catch (error) {
      if (error.killed || error.signal)
        throw new Error(
          "spec-driven TDD acceptance command timed out or was killed",
        );
      return {
        exitCode: Number.isInteger(error.code) ? error.code : 1,
        output: normalizedTddOutput(
          `${error.stdout ?? ""}${error.stderr ?? ""}`,
          repoRoot,
          worktreeRoot,
        ),
      };
    }
  }

  async function prepareRedWorktree(context, repoRoot, baseline, frozenFiles) {
    const worktreeParent = path.join(homedir(), "code");
    await mkdir(worktreeParent, { recursive: true });
    context.root = await mkdtemp(path.join(worktreeParent, "shlz-ui-tdd-"));
    context.allocated = true;
    await exec(
      "git",
      ["worktree", "add", "--detach", context.root, baseline.commit],
      {
        cwd: repoRoot,
      },
    );
    context.created = true;
    const { stdout } = await exec("git", ["rev-parse", "HEAD"], {
      cwd: context.root,
    });
    if (stdout.trim() !== baseline.commit)
      throw new Error(
        "spec-driven TDD RED worktree is not the immutable baseline",
      );
    for (const file of frozenFiles) {
      await mkdir(path.dirname(path.join(context.root, file)), {
        recursive: true,
      });
      await copyFile(path.join(repoRoot, file), path.join(context.root, file));
    }
  }

  async function repeatedTddRuns(contract, worktreeRoot, repoRoot) {
    const runs = [];
    for (let index = 0; index < contract.repeatCount; index++)
      runs.push(
        await executeTddRequest(contract, worktreeRoot, repoRoot, worktreeRoot),
      );
    if (runs.some((run) => run.output !== runs[0].output))
      throw new Error("spec-driven TDD probe is nondeterministic");
    return runs;
  }

  async function recordAcceptancePhase(
    plan,
    state,
    phase,
    designed,
    runs,
    repoRoot,
  ) {
    if (phase === "red") {
      if (runs.some(({ exitCode }) => exitCode === 0))
        throw new Error("spec-driven TDD baseline did not produce RED");
      if (
        typeof designed.expectedFailureSignature !== "string" ||
        !runs[0].output.includes(designed.expectedFailureSignature)
      )
        throw new Error(
          "spec-driven TDD RED did not match the stable failure signature",
        );
      return recordTddRed(plan, state, {
        ...designed,
        runtimeId: `tdd-runner-${process.pid}`,
        normalizedFailureSignature: designed.expectedFailureSignature,
        failedScenarioIds: designed.failedScenarioIds,
        runs,
      });
    }
    if (runs.some(({ exitCode }) => exitCode !== 0))
      throw new Error("spec-driven TDD candidate did not produce GREEN");
    const { stdout: candidateHead } = await exec("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
    });
    return recordTddGreen(plan, state, {
      ...designed,
      candidateHead: candidateHead.trim(),
      runs,
    });
  }

  function porcelainChangedPaths(stdout) {
    const records = stdout.split("\0");
    const changed = [];
    for (let index = 0; index < records.length; index++) {
      const record = records[index];
      if (!record) continue;
      changed.push(record.slice(3));
      if (/[RC]/.test(record.slice(0, 2))) index++;
    }
    return changed;
  }

  async function inspectBaselineWorktree(
    context,
    currentIdentity,
    frozenFiles,
  ) {
    const { stdout } = await exec("git", ["status", "--porcelain=v1", "-z"], {
      cwd: context.root,
    });
    context.dirty = Boolean(stdout);
    const frozen = new Set(frozenFiles);
    const frozenIdentityMatches =
      (await fingerprintFiles(
        currentIdentity.acceptanceFiles,
        context.root,
      )) === currentIdentity.acceptanceDigest &&
      (await fingerprintFiles(currentIdentity.fixtureFiles, context.root)) ===
        currentIdentity.fixtureDigest;
    context.modified =
      porcelainChangedPaths(stdout).some((file) => !frozen.has(file)) ||
      !frozenIdentityMatches;
  }

  async function cleanupBaselineWorktree(
    context,
    repoRoot,
    currentIdentity,
    frozenFiles,
  ) {
    const errors = [];
    if (!context.allocated) return errors;
    try {
      if (context.created)
        await inspectBaselineWorktree(context, currentIdentity, frozenFiles);
    } catch (error) {
      context.modified = true;
      errors.push(error);
    }
    try {
      if (!context.created)
        await rm(context.root, { recursive: true, force: true });
      else if (!context.modified)
        await exec(
          "git",
          [
            "worktree",
            "remove",
            ...(context.dirty ? ["--force"] : []),
            context.root,
          ],
          { cwd: repoRoot },
        );
    } catch (error) {
      errors.push(error);
    }
    try {
      await exec("git", ["worktree", "prune"], { cwd: repoRoot });
    } catch (error) {
      errors.push(error);
    }
    return errors;
  }

  async function runTddAcceptance(
    plan,
    state,
    sliceId,
    baseline,
    repoRoot,
    phase,
  ) {
    validateExecutionBaseline(baseline);
    assertExecutionBaselineState(
      baseline,
      await gitExecutionBaselineState(repoRoot, baseline),
    );
    const { contract, lifecycle } = tddSlice(plan, state, sliceId);
    if (!new Set(["red", "green"]).has(phase))
      throw new Error("spec-driven TDD runner phase must be red or green");
    const designed = lifecycle.design;
    if (!designed)
      throw new Error(
        `spec-driven TDD slice ${sliceId} requires accepted design`,
      );
    const { evidence: currentEvidence, oracleChallengeDigest } =
      await computeTddDesignIdentity(
        plan,
        state,
        {
          ...designed,
          acceptanceFiles: undefined,
          fixtureFiles: undefined,
        },
        baseline,
        repoRoot,
      );
    const currentIdentity = { ...currentEvidence, oracleChallengeDigest };
    try {
      assertTddIdentity(
        designed,
        currentIdentity,
        "acceptance contract changed after test design",
      );
    } catch (error) {
      if (phase === "green")
        state.specDrivenTdd.slices[sliceId] = {
          status: "pending-test-design",
          invalidation: {
            reason: error.message,
            previousRedDigest: lifecycle.redDigest,
          },
        };
      throw error;
    }
    const worktree = {
      root: repoRoot,
      allocated: false,
      created: false,
      dirty: false,
      modified: false,
    };
    const frozenFiles = [
      ...currentIdentity.acceptanceFiles,
      ...currentIdentity.fixtureFiles,
    ];
    let result;
    let runError;
    try {
      if (phase === "red")
        await prepareRedWorktree(worktree, repoRoot, baseline, frozenFiles);
      const runs = await repeatedTddRuns(contract, worktree.root, repoRoot);
      result = await recordAcceptancePhase(
        plan,
        state,
        phase,
        designed,
        runs,
        repoRoot,
      );
    } catch (error) {
      runError = error;
    }
    const cleanupErrors = await cleanupBaselineWorktree(
      worktree,
      repoRoot,
      currentIdentity,
      frozenFiles,
    );
    const failures = [
      ...(runError ? [runError] : []),
      ...(worktree.modified
        ? [
            new Error(
              `spec-driven TDD baseline worktree was modified; evidence retained at ${worktree.root}`,
            ),
          ]
        : []),
      ...cleanupErrors,
    ];
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1)
      throw new AggregateError(
        failures,
        "spec-driven TDD run and cleanup failed",
      );
    return result;
  }

  function recordTddDesign(plan, state, handoff) {
    if (!handoff || handoff.version !== 1 || !handoff.sliceId)
      throw new Error("spec-driven TDD design handoff version must be 1");
    const { contract, lifecycle } = tddSlice(plan, state, handoff.sliceId);
    if (lifecycle.status !== "pending-test-design")
      throw new Error(
        `spec-driven TDD slice ${handoff.sliceId} is not awaiting test design`,
      );
    if (typeof handoff.runtimeId !== "string" || !handoff.runtimeId)
      throw new Error("spec-driven TDD design requires runtime identity");
    const designerPacket = state.packets?.[contract.testDesignPacket];
    if (
      designerPacket?.status !== "completed" ||
      designerPacket.execution?.runtimeId !== handoff.runtimeId
    )
      throw new Error(
        "spec-driven TDD design requires the completed guarded test-design worker runtime",
      );
    if (
      handoff.requirementsRevision !==
      (state.requirementsRevision ?? plan.requirementsRevision ?? 1)
    )
      throw new Error("spec-driven TDD design requirements revision is stale");
    assertTddDigests(handoff);
    const mappings = new Map(
      (handoff.scenarioMappings ?? []).map((mapping) => [
        mapping.scenarioId,
        mapping,
      ]),
    );
    if (
      mappings.size !== contract.scenarioIds.length ||
      contract.scenarioIds.some((scenarioId) => {
        const expected = contract.authorities.find(
          (authority) => authority.scenarioId === scenarioId,
        );
        return mappings.get(scenarioId)?.authorityRef !== expected.ref;
      })
    )
      throw new Error(
        "spec-driven TDD design requires current scenario authority mapping",
      );
    if (
      !Array.isArray(handoff.inputs) ||
      handoff.inputs.some((input) =>
        contract.productionSurface.some((pattern) =>
          matchesPattern(input, pattern),
        ),
      )
    )
      throw new Error(
        "spec-driven TDD design declares production implementation input",
      );
    const expectedSourceKinds = new Set([
      "worked-example",
      "standard",
      "design-authority",
      "existing-public-contract",
      "explicit-openspec-literal",
    ]);
    if (
      !expectedSourceKinds.has(handoff.expectedResultSource?.kind) ||
      typeof handoff.expectedResultSource?.ref !== "string" ||
      !handoff.expectedResultSource.ref
    )
      throw new Error(
        "spec-driven TDD design requires an independent expected-result source",
      );
    if (
      handoff.oracleMethod?.kind !== "behavioral-assertion" ||
      handoff.oracleMethod?.observesSeam !== contract.seam
    )
      throw new Error(
        "spec-driven TDD behavioral oracle must observe the declared seam",
      );
    if (
      !handoff.oracleChallenge ||
      !sha256Pattern.test(handoff.oracleChallengeDigest ?? "") ||
      !Array.isArray(handoff.oracleChallengeRuns?.control) ||
      handoff.oracleChallengeRuns.control.length !== contract.repeatCount ||
      handoff.oracleChallengeRuns.control.some(
        ({ exitCode }) => exitCode !== 0,
      ) ||
      handoff.oracleChallengeRuns.control.some(
        ({ output }) =>
          output !== handoff.oracleChallengeRuns.control[0].output,
      ) ||
      !Array.isArray(handoff.oracleChallengeRuns?.decoy) ||
      handoff.oracleChallengeRuns.decoy.length !== contract.repeatCount ||
      handoff.oracleChallengeRuns.decoy.some(
        ({ exitCode, output }) =>
          exitCode === 0 ||
          !output.includes(handoff.oracleChallenge.expectedFailureSignature),
      ) ||
      handoff.oracleChallengeRuns.decoy.some(
        ({ output }) => output !== handoff.oracleChallengeRuns.decoy[0].output,
      )
    )
      throw new Error(
        "spec-driven TDD design requires accepted same-oracle challenge evidence",
      );
    state.specDrivenTdd.slices[handoff.sliceId] = {
      status: "designed",
      design: stableValue(handoff),
      designDigest: valueDigest(handoff),
      sliceContractDigest: valueDigest(contract),
      retentionIdentity: tddRetentionIdentity(plan, state, contract, handoff),
    };
    return state;
  }

  function recordTddRed(plan, state, evidence) {
    const { contract, lifecycle } = tddSlice(plan, state, evidence?.sliceId);
    if (lifecycle.status !== "designed")
      throw new Error(
        `spec-driven TDD slice ${evidence?.sliceId} requires accepted design`,
      );
    assertTddIdentity(
      lifecycle.design,
      evidence,
      "RED evidence does not match the designed acceptance contract",
    );
    if (
      typeof evidence.normalizedFailureSignature !== "string" ||
      !evidence.normalizedFailureSignature ||
      !Array.isArray(evidence.failedScenarioIds) ||
      !evidence.failedScenarioIds.length ||
      evidence.failedScenarioIds.some(
        (id) => !contract.scenarioIds.includes(id),
      )
    )
      throw new Error(
        "RED evidence requires a stable failure grounded in current scenarios",
      );
    lifecycle.status = "red-proven";
    lifecycle.red = stableValue(evidence);
    lifecycle.redDigest = valueDigest(evidence);
    return state;
  }

  function authorizeTddImplementation(plan, state, sliceId, runtimeId) {
    const { lifecycle } = tddSlice(plan, state, sliceId);
    if (lifecycle.status !== "red-proven")
      throw new Error(`spec-driven TDD slice ${sliceId} requires accepted RED`);
    if (
      !runtimeId ||
      runtimeId === lifecycle.design.runtimeId ||
      runtimeId === lifecycle.red.runtimeId
    )
      throw new Error(
        "implementation runtime identity must differ from test design and RED",
      );
    lifecycle.status = "implementing";
    lifecycle.implementationRuntimeId = runtimeId;
    return state;
  }

  function recordTddGreen(plan, state, evidence) {
    const { lifecycle } = tddSlice(plan, state, evidence?.sliceId);
    if (lifecycle.status !== "implementing")
      throw new Error(
        `spec-driven TDD slice ${evidence?.sliceId} is not implementing`,
      );
    try {
      assertTddIdentity(
        lifecycle.design,
        evidence,
        "acceptance contract changed after RED",
      );
    } catch (error) {
      state.specDrivenTdd.slices[evidence.sliceId] = {
        status: "pending-test-design",
        invalidation: {
          reason: error.message,
          previousRedDigest: lifecycle.redDigest,
        },
      };
      throw error;
    }
    if (typeof evidence.candidateHead !== "string" || !evidence.candidateHead)
      throw new Error("GREEN evidence requires candidate head");
    lifecycle.status = "green-proven";
    lifecycle.green = stableValue(evidence);
    lifecycle.greenDigest = valueDigest(evidence);
    return state;
  }
  return {
    createTddReentryEvidence,
    createTddDesignEvidence,
    runTddAcceptance,
    recordTddDesign,
    recordTddRed,
    authorizeTddImplementation,
    recordTddGreen,
    tddRetentionIdentity,
  };
}
