import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [target, invariant] = process.argv.slice(2);
const targetStat = await stat(target);
const modulePath = targetStat.isDirectory()
  ? path.join(target, "tools/lib/harness/core.mjs")
  : target;
const { route } = await import(pathToFileURL(modulePath));
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
