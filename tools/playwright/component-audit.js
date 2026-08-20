import { expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const readComponentAuditManifest = async (manifestUrl) =>
  JSON.parse(await readFile(fileURLToPath(manifestUrl), "utf8"));

export const inspectComponentOccurrences = (page, manifest) =>
  page.evaluate((contract) => {
    const roots = [...document.querySelectorAll(contract.rootSelector)];
    const occurrences = roots.map(
      (root) => root.dataset.componentAuditId ?? null,
    );
    const legacy = contract.legacySelectors.flatMap((selector) =>
      [...document.querySelectorAll(selector)].map((element) => ({
        selector,
        diagnostic: contract.diagnosticBoundaries.some((boundary) =>
          element.closest(boundary),
        ),
        classified: Boolean(element.closest("[data-component-audit-id]")),
      })),
    );

    return {
      occurrences,
      unclassifiedLegacy: legacy.filter(
        ({ diagnostic, classified }) => !diagnostic && !classified,
      ),
      diagnosticLegacy: legacy.filter(({ diagnostic }) => diagnostic).length,
    };
  }, manifest);

export const expectClassifiedComponentOccurrences = async (page, manifest) => {
  const inventory = await inspectComponentOccurrences(page, manifest);
  const expectedIds = manifest.occurrences.map(({ id }) => id).sort();

  expect(inventory.occurrences.every(Boolean)).toBe(true);
  expect(new Set(inventory.occurrences).size).toBe(
    inventory.occurrences.length,
  );
  expect(inventory.occurrences.sort()).toEqual(expectedIds);
  expect(inventory.unclassifiedLegacy).toEqual([]);

  return inventory;
};
