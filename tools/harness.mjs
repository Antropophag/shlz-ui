#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  affectedValidation,
  assertValidationRun,
  contextIndex,
  createPlan,
  gitEvidence,
  readJson,
  readyPackets,
  recordEvent,
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
const absolute = (file) => path.resolve(repoRoot, file);
const option = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const output = (value) =>
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);

switch (command) {
  case "plan": {
    const plan = createPlan(await readJson(absolute(args[0])), config);
    await writeJson(absolute(args[1]), plan);
    output(plan);
    break;
  }
  case "plan-check":
    output(validatePlan(await readJson(absolute(args[0])), config));
    break;
  case "context": {
    const plan = await readJson(absolute(args[0]));
    const handoffPath = option("--handoff");
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
    const handoffPath = option("--handoff");
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
    await writeJson(absolute(args[2]), value);
    output(value);
    break;
  }
  case "affected":
    output(affectedValidation(args, config));
    break;
  case "validation-check": {
    const ledger = await readJson(absolute(args[1]));
    assertValidationRun(
      {
        target: args[0],
        currentFingerprint: option("--fingerprint"),
        reason: option("--reason"),
      },
      ledger,
      config,
    );
    output({ allowed: true });
    break;
  }
  case "telemetry-record": {
    const event = JSON.parse(option("--event"));
    await recordEvent(absolute(args[0]), event);
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
      "usage: harness <plan|plan-check|context|ready|handoff-write|affected|validation-check|telemetry-record|telemetry-summary|evidence> ...",
    );
}
