import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const manifestPath = "docs/component-audits/select.json";

test("Select audit manifest is complete, traceable, and classification-driven", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.component, "select");
  assert.ok(manifest.rootSelector);
  assert.ok(manifest.legacySelectors.length);
  assert.ok(manifest.diagnosticBoundaries.length);

  const ids = manifest.occurrences.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length, "audit IDs must be unique");
  for (const occurrence of manifest.occurrences)
    assert.ok(
      [
        "executable-fixture",
        "live-consumer",
        "content-stress-fixture",
      ].includes(occurrence.kind),
      `Unknown occurrence kind: ${occurrence.kind}`,
    );

  for (const path of [
    manifest.authoritativeSource,
    ...manifest.referenceSources,
    ...manifest.implementation,
    manifest.behavior,
    manifest.docs,
    ...manifest.browserTests,
    ...manifest.visualSnapshots,
    ...manifest.sourceClaims.map(({ evidence }) => evidence),
  ])
    await access(path);

  const requiredEvidence = [
    "source-integrity",
    "structural-contract",
    "runtime-browser",
    "accessibility",
    "focused-visual",
    "consumer-integration",
    "responsive-content-stress",
  ];
  assert.deepEqual(
    Object.keys(manifest.evidence).sort(),
    requiredEvidence.sort(),
  );
  for (const [level, status] of Object.entries(manifest.evidence))
    assert.ok(
      status === "applicable" || status.startsWith("not-applicable:"),
      `${level} needs an applicability decision`,
    );

  for (const claim of manifest.sourceClaims)
    assert.ok(
      [
        "source-fact",
        "derived-pattern",
        "repository-decision",
        "assumption",
      ].includes(claim.classification),
      `Unknown source classification: ${claim.classification}`,
    );

  for (const deviation of manifest.acceptedDeviations ?? []) {
    assert.match(deviation.id, /^[a-z0-9-]+$/);
    assert.match(deviation.severity, /^P[0-3]$/);
    assert.ok(deviation.scope);
    assert.equal(deviation.status, "accepted-for-this-pr");
    assert.equal(deviation.introducedByThisChange, false);
    assert.equal(deviation.worsenedByThisChange, false);
    assert.ok(deviation.evidence);
    assert.ok(deviation.reason);
    assert.match(
      deviation.tracking,
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/,
      `${deviation.id} needs a linked follow-up issue`,
    );
  }
});
