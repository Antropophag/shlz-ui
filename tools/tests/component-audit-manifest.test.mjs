import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const manifestPaths = [
  "select",
  "input",
  "textarea",
  "checkbox",
  "radio",
  "switch",
  "button",
  "link",
  "segment",
  "tabs",
  "pagination",
  "status",
  "badge",
  "tag",
  "person-tag",
  "avatar",
].map((component) => `docs/component-audits/${component}.json`);
const inventoryPath = "docs/component-audits/project-inventory.json";

const auditStatuses = new Set([
  "UNAUDITED",
  "INVENTORIED",
  "VERIFIED",
  "FINDINGS",
]);
const implementationStatuses = new Set([
  "reusable",
  "composition-only",
  "source-only",
  "diagnostic-only",
  "application-local",
  "unsupported",
]);
const evidenceLevels = [
  "source-integrity",
  "structural-contract",
  "runtime-browser",
  "accessibility",
  "focused-visual",
  "consumer-integration",
  "responsive-content-stress",
];
const measuredCountFields = [
  "executableShowcase",
  "liveConsumers",
  "dataWorkspace",
  "inertDiagnostics",
  "legacyNative",
  "localAlternatives",
];
const interactionEvidenceTypes = [
  "staticVisual",
  "realInteractionVisual",
  "runtimeBehavior",
];
const interactionBrowserTest =
  "tools/playwright/interaction-evidence-wave35.spec.js";
const diagnosticCensusComponents = new Set([
  "status",
  "badge",
  "tag",
  "person-tag",
  "avatar",
]);

test("project inventory has one valid contract for every discovered family", async () => {
  const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
  assert.equal(inventory.schemaVersion, 2);
  assert.ok(inventory.baseline.sha);
  assert.match(inventory.measuredCountsContract, /not cardinality-equivalent/);
  assert.deepEqual(new Set(inventory.statuses), auditStatuses);
  assert.deepEqual(inventory.interactionEvidenceTypes, [
    "static-visual",
    "real-interaction-visual",
    "runtime-behavior",
  ]);
  assert.deepEqual(
    new Set(inventory.implementationStatuses),
    implementationStatuses,
  );
  assert.deepEqual(inventory.evidenceLevels.sort(), evidenceLevels.sort());

  const names = inventory.families.map(({ canonical_name }) => canonical_name);
  assert.equal(
    new Set(names).size,
    names.length,
    "family names must be unique",
  );

  const requiredArrays = [
    "authoritative_source",
    "production_implementation",
    "behavior",
    "docs",
    "executable_fixtures",
    "live_consumers",
    "data_workspace_consumers",
    "inert_diagnostics",
    "legacy_native_implementations",
    "local_alternatives",
    "scope",
    "known_findings",
    "limitations",
    "tests",
  ];

  for (const family of inventory.families) {
    assert.ok(family.canonical_name);
    assert.ok(family.category);
    assert.ok(
      auditStatuses.has(family.audit_status),
      `${family.canonical_name} has an invalid audit status`,
    );
    assert.ok(
      implementationStatuses.has(family.implementation_status),
      `${family.canonical_name} has an invalid implementation status`,
    );
    for (const field of requiredArrays)
      assert.ok(
        Array.isArray(family[field]),
        `${family.canonical_name}.${field} must be an array`,
      );
    assert.deepEqual(
      Object.keys(family.evidence).sort(),
      evidenceLevels.sort(),
      `${family.canonical_name} must classify every evidence level`,
    );
    assert.deepEqual(
      Object.keys(family.measured_counts).sort(),
      measuredCountFields.sort(),
      `${family.canonical_name} must provide every measured count`,
    );
    for (const count of Object.values(family.measured_counts)) {
      assert.ok(Number.isInteger(count) && count >= 0);
    }
    if (family.audit_status === "FINDINGS")
      assert.ok(
        family.known_findings.length > 0,
        `${family.canonical_name} needs a finding`,
      );
    for (const finding of family.known_findings) {
      assert.match(finding.id, /^[a-z0-9-]+$/);
      assert.match(finding.severity, /^P[0-3]$/);
      assert.ok(finding.status);
      assert.ok(finding.description);
      assert.ok(finding.evidence);
      assert.ok(finding.tracking);
    }
  }

  const select = inventory.families.find(
    ({ canonical_name }) => canonical_name === "Select",
  );
  assert.ok(select, "inventory must contain the Select family");
  assert.equal(select.audit_status, "VERIFIED");
  assert.equal(select.implementation_status, "reusable");
  for (const level of evidenceLevels)
    assert.match(select.evidence[level], /pass/);
});

test("audited component manifests are complete, traceable, and classification-driven", async () => {
  for (const manifestPath of manifestPaths) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    assert.ok(manifest.rootSelector);
    assert.ok(manifest.legacySelectors.length);
    assert.ok(manifest.diagnosticBoundaries.length);
    if (diagnosticCensusComponents.has(manifest.component))
      assert.ok(
        Number.isInteger(manifest.diagnosticOccurrenceCount) &&
          manifest.diagnosticOccurrenceCount >= 0,
        `${manifest.component} needs a diagnostic occurrence census`,
      );

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
    ].filter(Boolean))
      await access(path);

    assert.deepEqual(
      Object.keys(manifest.evidence).sort(),
      evidenceLevels.sort(),
    );
    for (const [level, status] of Object.entries(manifest.evidence)) {
      assert.match(
        status,
        /^(not-applicable|pass):\s*\S/,
        `${level} needs a pass claim or not-applicable reason`,
      );
      assert.doesNotMatch(
        status,
        /^(?:pass|not-applicable):\s*(?:applicable|pass|n\/?a|none)$/i,
        `${level} needs a concrete claim or not-applicable reason`,
      );
    }

    assert.deepEqual(
      Object.keys(manifest.interactionEvidence.types).sort(),
      interactionEvidenceTypes.sort(),
      `${manifest.component} must separate all interaction evidence types`,
    );
    for (const [type, claims] of Object.entries(
      manifest.interactionEvidence.types,
    )) {
      assert.ok(claims.length, `${manifest.component}.${type} needs claims`);
      for (const claim of claims) {
        assert.match(claim, /^(?:pass|not-applicable):\s*\S.+/);
        if (type === "realInteractionVisual")
          assert.doesNotMatch(claim, /fake|selector presence/i);
      }
    }
    const realInteractionApplicable =
      manifest.interactionEvidence.types.realInteractionVisual.some((claim) =>
        claim.startsWith("pass:"),
      );
    const runtimeApplicable =
      manifest.interactionEvidence.types.runtimeBehavior.some((claim) =>
        claim.startsWith("pass:"),
      );
    if (realInteractionApplicable || runtimeApplicable) {
      assert.ok(
        manifest.interactionEvidence.materialStates.length,
        `${manifest.component} needs material states when interaction evidence is applicable`,
      );
    } else {
      assert.deepEqual(
        manifest.interactionEvidence.materialStates,
        [],
        `${manifest.component} must not invent material states for non-interactive ownership`,
      );
    }
    assert.equal(
      manifest.interactionEvidence.browserTest,
      interactionBrowserTest,
    );
    await access(manifest.interactionEvidence.browserTest);
    const interactionBrowserSource = await readFile(
      manifest.interactionEvidence.browserTest,
      "utf8",
    );
    assert.ok(
      interactionBrowserSource.includes(
        `expectMaterialStates("${manifest.component}"`,
      ),
      `${manifest.component} must bind its declaration to an executable state assertion`,
    );
    if (realInteractionApplicable)
      assert.ok(
        new RegExp(`verifyPaintState\\(\\s*["']${manifest.component}["']`).test(
          interactionBrowserSource,
        ),
        `${manifest.component} must bind computed paint to its executable state ledger`,
      );
    for (const state of manifest.interactionEvidence.materialStates) {
      assert.match(state, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
    assert.match(manifest.interactionEvidence.manualStateWalk, /^pass:\s*\S.+/);

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
  }
});
