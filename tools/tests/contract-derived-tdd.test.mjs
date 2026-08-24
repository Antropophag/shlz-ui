import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertCurrentContractDerivedTdd,
  contractDerivedTddBinding,
  loadChangeScenarioSemantics,
  parseDeltaScenarioSemantics,
} from "../lib/harness/contract-derived-tdd.mjs";

const capability = "harness/contract-derived-tdd-routing";
const contract = (semantics, extra = "") => ({
  capability,
  content: `### Requirement: Deterministic routing

#### Scenario: Contract category
<!-- implementation-semantics: ${semantics} -->${extra}
- **WHEN** planning runs
- **THEN** routing is derived
`,
});

for (const semantics of [
  "material-behavior",
  "material-state",
  "source-only",
  "absence-only",
  "documentation-only",
]) {
  test(`parses ${semantics} scenario semantics`, () => {
    const result = parseDeltaScenarioSemantics([contract(semantics)]);
    assert.deepEqual(result.scenarios, [
      {
        id: `${capability}::Deterministic routing::Contract category`,
        semantics,
      },
    ]);
    assert.deepEqual(
      result.requiredScenarioIds,
      semantics.startsWith("material-") ? [result.scenarios[0].id] : [],
    );
  });
}

test("normalizes contract order before digesting", () => {
  const first = contract("source-only");
  const second = {
    capability: "harness/second",
    content: `### Requirement: Other\n\n#### Scenario: Evidence\n<!-- implementation-semantics: documentation-only -->\n`,
  };
  assert.equal(
    parseDeltaScenarioSemantics([first, second]).contractDigest,
    parseDeltaScenarioSemantics([second, first]).contractDigest,
  );
});

test("binds the digest to normalized normative scenario content", () => {
  const original = contract("material-behavior");
  const changed = {
    ...original,
    content: original.content.replace(
      "- **THEN** routing is derived",
      "- **THEN** a different observable result is derived",
    ),
  };
  const lineEndingOnly = {
    ...original,
    content: original.content.replaceAll("\n", "\r\n"),
  };
  assert.notEqual(
    parseDeltaScenarioSemantics([original]).contractDigest,
    parseDeltaScenarioSemantics([changed]).contractDigest,
  );
  assert.equal(
    parseDeltaScenarioSemantics([original]).contractDigest,
    parseDeltaScenarioSemantics([lineEndingOnly]).contractDigest,
  );
});

test("derives capability identity from the delta spec path", async () => {
  const repo = await mkdtemp(path.join(tmpdir(), "shlz-contract-capability-"));
  try {
    const specRoot = path.join(
      repo,
      "openspec/changes/example/specs/actual/capability",
    );
    await mkdir(specRoot, { recursive: true });
    await writeFile(
      path.join(specRoot, "spec.md"),
      contract("source-only").content,
    );
    const result = await loadChangeScenarioSemantics(repo, "example", [
      "planner/false-capability",
    ]);
    assert.equal(
      result.scenarios[0].id,
      "actual/capability::Deterministic routing::Contract category",
    );
    const plan = {
      openSpecChange: "example",
      contractDerivedTdd: contractDerivedTddBinding(result),
    };
    await assertCurrentContractDerivedTdd(repo, plan);
    await writeFile(
      path.join(specRoot, "spec.md"),
      contract("source-only").content.replace(
        "- **THEN** routing is derived",
        "- **THEN** changed contract behavior is derived",
      ),
    );
    await assert.rejects(
      assertCurrentContractDerivedTdd(repo, plan),
      /obligation is stale/,
    );
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test("rejects missing, duplicate, and unknown declarations", () => {
  assert.throws(
    () =>
      parseDeltaScenarioSemantics([
        {
          ...contract("source-only"),
          content: contract("source-only").content.replace(/<!--.*-->/, ""),
        },
      ]),
    /exactly one/,
  );
  assert.throws(
    () =>
      parseDeltaScenarioSemantics([
        contract(
          "source-only",
          "\n<!-- implementation-semantics: absence-only -->",
        ),
      ]),
    /exactly one/,
  );
  assert.throws(
    () => parseDeltaScenarioSemantics([contract("runtime-ish")]),
    /unknown implementation-semantics/,
  );
  assert.throws(
    () =>
      parseDeltaScenarioSemantics([
        {
          ...contract("source-only"),
          content: contract("source-only").content.replace(
            "<!-- implementation-semantics: source-only -->",
            "Evidence first\n<!-- implementation-semantics: source-only -->",
          ),
        },
      ]),
    /adjacent implementation-semantics/,
  );
});

test("rejects duplicate stable scenario identities", () => {
  assert.throws(
    () =>
      parseDeltaScenarioSemantics([
        contract("source-only"),
        contract("source-only"),
      ]),
    /duplicate OpenSpec scenario identity/,
  );
});

test("persists only the compact obligation binding", () => {
  const parsed = {
    ...parseDeltaScenarioSemantics([contract("material-state")]),
    change: "example",
  };
  assert.deepEqual(contractDerivedTddBinding(parsed), {
    version: 1,
    openSpecChange: "example",
    contractDigest: parsed.contractDigest,
    requiredScenarioIds: parsed.requiredScenarioIds,
  });
});
