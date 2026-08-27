import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [target, invariant] = process.argv.slice(2);
const targetStat = await stat(target);
const modulePath = targetStat.isDirectory()
  ? path.join(target, "tools/lib/harness/core.mjs")
  : target;
const fixturePath = targetStat.isDirectory()
  ? path.join(target, "tools/tests/fixtures/pr43-wave-incident.json")
  : path.join(import.meta.dirname, "fixtures/pr43-wave-incident.json");
const harness = await import(pathToFileURL(modulePath));
const { route } = harness;
const materialSignals = {
  newCapability: true,
  publishingOrRelease: false,
  externalEffects: false,
  publicUrlOrDomain: false,
  deploymentSemantics: false,
  permissionsOrSecurity: false,
  destructiveOrIrreversible: false,
  externalAutomation: false,
  publicContract: true,
  materialAmbiguity: false,
};
const assessment = {
  version: 1,
  intent: "product wave gate oracle",
  route: "open-spec",
  openSpecChange: "gate-product-waves-by-production-delta",
  requiredDecisions: [],
  materialSignals,
};

if (!invariant || invariant === "product-wave-without-delta-cannot-start") {
  assert.throws(
    () =>
      route({
        ...assessment,
        wave: {
          number: 11,
          expectedProductionDelta: {
            kind: "implementation",
            description: "",
          },
        },
      }),
    /expected production delta/,
  );
}

if (!invariant || invariant === "evidence-wave-cannot-promote-roadmap") {
  const replay = route({
    ...assessment,
    wave: {
      number: 10,
      evidenceKind: "source-only",
      expectedProductionDelta: null,
    },
  });
  assert.equal(replay.payload.wave.executionPath, "bounded-evidence");
  assert.equal(replay.payload.wave.heavyExecution, false);
  assert.equal(replay.payload.wave.roadmapAdvance, false);
}

if (invariant === "bounded-evidence-cannot-launch-isolated") {
  assert.equal(typeof harness.assertIsolatedExecutionAllowed, "function");
  const incident = JSON.parse(await readFile(fixturePath, "utf8"));
  const replay = route({
    ...assessment,
    intent: `Replay PR #${incident.pullRequest}`,
    wave: incident.wave,
  });
  assert.throws(
    () => harness.assertIsolatedExecutionAllowed([replay]),
    /bounded evidence must execute inline/,
  );
}

if (invariant === "repeated-production-delta-is-not-proof") {
  assert.equal(typeof harness.assertProductionOutcomeEligible, "function");
  const incident = JSON.parse(await readFile(fixturePath, "utf8"));
  const replay = route({
    ...assessment,
    intent: `Replay PR #${incident.pullRequest}`,
    wave: incident.wave,
  });
  assert.equal(incident.evidence.productionImplementations, 0);
  assert.equal(incident.evidence.runtimeConsumers, 0);
  assert.throws(
    () =>
      harness.assertProductionOutcomeEligible(replay, {
        kind: "implementation",
        description: "Claimed production delivery",
      }),
    /roadmap-eligible route delta/,
  );
}
