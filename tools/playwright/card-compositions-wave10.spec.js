import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

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

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Wave 10 keeps Card compositions source-only with no runtime state", async ({
  page,
}) => {
  expect(manifest.implementation).toEqual([]);
  expect(manifest.occurrences).toEqual([]);
  expect(manifest.visualSnapshots).toEqual([]);
  expect(manifest.interactionEvidence.types.realInteractionVisual).toEqual([
    "not-applicable: no executable Card composition exists on which a browser can create a real interaction state",
  ]);
  expect(manifest.interactionEvidence.types.runtimeBehavior).toEqual([
    "not-applicable: click, navigation, loading, media lifecycle, and data behavior are outside the static source contract",
  ]);
  await expectClassifiedComponentOccurrences(page, manifest);
  expectMaterialStates("card-compositions");
});
