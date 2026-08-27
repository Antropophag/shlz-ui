import { expect, test } from "@playwright/test";
import { readComponentAuditManifest } from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/card-compositions.json",
    import.meta.url,
  ),
);

const executedStates = new Set();

const expectMaterialStates = (component) => {
  expect(component).toBe("card-compositions");
  expect([...executedStates].sort()).toEqual(
    [...manifest.interactionEvidence.materialStates].sort(),
  );
};

test("Wave 10 keeps Card compositions source-only with no runtime state", () => {
  expect(manifest.implementation).toEqual([]);
  expect(manifest.occurrences).toEqual([]);
  expect(manifest.visualSnapshots).toEqual([]);
  expect(manifest.interactionEvidence.types.realInteractionVisual).toEqual([
    "not-applicable: no executable Card composition exists on which a browser can create a real interaction state",
  ]);
  expect(manifest.interactionEvidence.types.runtimeBehavior).toEqual([
    "not-applicable: click, navigation, loading, media lifecycle, and data behavior are outside the static source contract",
  ]);
  expectMaterialStates("card-compositions");
});
