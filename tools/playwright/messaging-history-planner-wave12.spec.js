import { expect, test } from "@playwright/test";
import {
  expectClassifiedComponentOccurrences,
  readComponentAuditManifest,
} from "./component-audit.js";

const manifest = await readComponentAuditManifest(
  new globalThis.URL(
    "../../docs/component-audits/messaging-history-planner-compositions.json",
    import.meta.url,
  ),
);

const executedStates = new Set();

const expectMaterialStates = (component) => {
  expect(component).toBe("messaging-history-planner-compositions");
  expect([...executedStates].sort()).toEqual(
    [...manifest.interactionEvidence.materialStates].sort(),
  );
};

test("Wave 12 higher-level composition roots remain absent", async ({
  page,
}) => {
  await page.goto("/?full=1");
  await expectClassifiedComponentOccurrences(page, manifest);
  expectMaterialStates("messaging-history-planner-compositions");
});
