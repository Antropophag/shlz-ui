import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/upload-document-compositions.json",
    import.meta.url,
  ),
);

const executedStates = new Set();

const expectMaterialStates = (component) => {
  expect(component).toBe("upload-document-compositions");
  expect([...executedStates].sort()).toEqual(
    [...manifest.interactionEvidence.materialStates].sort(),
  );
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("Wave 11 keeps higher-level Upload / Document compositions source-only", async ({
  page,
}) => {
  expect(manifest.implementation).toEqual([]);
  expect(manifest.occurrences).toEqual([]);
  expect(manifest.visualSnapshots).toEqual([]);
  expect(manifest.primitiveDependencies).toHaveLength(11);
  await expectClassifiedComponentOccurrences(page, manifest);
  expectMaterialStates("upload-document-compositions");
});
