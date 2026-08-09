import { createHash } from "node:crypto";

const classifications = {
  product: "PRODUCT_CANDIDATE",
  documentation: "DOCUMENTATION_SHOWCASE",
  embedded: "EMBEDDED_ASSET_TYPOGRAPHY",
  foreign: "FOREIGN_LEGACY",
  outlier: "LOCAL_OVERRIDE_OUTLIER",
};

export function normalizeFigmaNumber(value) {
  if (typeof value !== "number") return value;
  const integer = Math.round(value);
  return Math.abs(value - integer) < 0.0001 ? integer : value;
}

function normalizeMetric(metric) {
  return {
    unit: metric.unit,
    ...(Object.hasOwn(metric, "value")
      ? { value: normalizeFigmaNumber(metric.value) }
      : {}),
  };
}

export function normalizeTypographySignature(signature) {
  return {
    fontFamily: signature.fontFamily ?? signature.fontName.family,
    fontStyle: signature.fontStyle ?? signature.fontName.style,
    fontSize: normalizeFigmaNumber(signature.fontSize),
    lineHeight: normalizeMetric(signature.lineHeight),
    letterSpacing: normalizeMetric(signature.letterSpacing),
    textCase: signature.textCase,
    textDecoration: signature.textDecoration,
  };
}

export function typographySignatureKey(signature) {
  return JSON.stringify(normalizeTypographySignature(signature));
}

function classify(signature, observations) {
  const paths = observations.flatMap(({ sourcePaths }) => sourcePaths);
  const usageCount = observations.reduce(
    (sum, item) => sum + item.usageCount,
    0,
  );
  const interfaceUsage = observations.some(({ sourcePage }) =>
    sourcePage.includes("Interface elements"),
  );
  const family = signature.fontFamily;
  const isFileAsset = paths.every((sourcePath) =>
    /File type icon|Attached Document/.test(sourcePath),
  );

  if (family === "Inter" && isFileAsset) {
    return {
      classification: classifications.embedded,
      reasons: [
        "All sampled paths place the text inside file-type graphic assets.",
        "The source colors and geometry belong to the asset rather than product UI text.",
      ],
    };
  }
  if (family !== "Golos Text") {
    return {
      classification: classifications.foreign,
      reasons: [
        `The ${family} family occurs in legacy, Ant-derived, avatar or external component paths, not as the main Service Desk typography family.`,
      ],
    };
  }

  const documentationGeometry =
    signature.fontSize === 80 ||
    signature.fontSize === 48 ||
    (signature.fontSize === 16 &&
      signature.fontStyle === "Medium" &&
      signature.lineHeight.unit === "PIXELS" &&
      signature.lineHeight.value === 14) ||
    (signature.fontSize === 16 &&
      signature.fontStyle === "Regular" &&
      signature.lineHeight.unit === "PERCENT" &&
      signature.lineHeight.value === 140) ||
    (signature.fontSize === 32 &&
      signature.fontStyle === "Medium" &&
      signature.letterSpacing.value === 0) ||
    (signature.fontSize === 20 &&
      signature.fontStyle === "SemiBold" &&
      signature.lineHeight.unit === "PIXELS") ||
    (signature.fontSize === 18 && !interfaceUsage) ||
    (signature.fontSize === 20 &&
      signature.fontStyle === "SemiBold" &&
      paths.every((sourcePath) => sourcePath.includes("System description"))) ||
    (signature.fontSize === 24 &&
      signature.fontStyle === "SemiBold" &&
      paths.every((sourcePath) => sourcePath.includes("Corner radius")));

  if (documentationGeometry) {
    return {
      classification: classifications.documentation,
      reasons: [
        "Source paths and geometry identify UI Kit covers, section headings or explanatory specification content rather than rendered product UI.",
      ],
    };
  }

  const onlyLocalOverrides = observations.every(
    ({ flags }) => flags.localOverride,
  );
  if (usageCount <= 2 && onlyLocalOverrides) {
    return {
      classification: classifications.outlier,
      reasons: [
        "Rare local override with no repeated styled use; retained as an observation, not promoted to product typography.",
      ],
    };
  }

  return {
    classification: classifications.product,
    reasons: [
      interfaceUsage
        ? "Used in concrete Interface elements component paths."
        : "Used repeatedly in concrete Basic elements component variants.",
      family === "Golos Text"
        ? "Golos Text is independently present across core Interface elements component families."
        : "",
    ].filter(Boolean),
  };
}

export function buildTypographyIndex(sourceFiles) {
  const merged = new Map();
  const sourceSummaries = [];
  const mixedNodes = [];
  const styleMap = new Map();

  for (const { path, sha256, data } of sourceFiles) {
    sourceSummaries.push({
      path,
      sha256,
      source: data.source,
      extractedAt: data.extractedAt,
      counts: data.counts,
    });

    for (const observation of data.typographyInventory) {
      const normalized = normalizeTypographySignature(observation.signature);
      const key = typographySignatureKey(normalized);
      const entry = merged.get(key) ?? {
        normalizedSignature: normalized,
        originalSourceSignatures: [],
        observations: [],
      };
      entry.originalSourceSignatures.push({
        sourcePage: data.source.name,
        inventoryId: observation.id,
        signature: observation.signature,
      });
      entry.observations.push({
        sourcePage: data.source.name,
        inventoryId: observation.id,
        usageCount: observation.usageCount,
        sourcePaths: observation.sourcePaths,
        flags: observation.flags,
      });
      entry.usageCountTotal =
        (entry.usageCountTotal ?? 0) + observation.usageCount;
      entry.usageByPage = {
        ...(entry.usageByPage ?? {}),
        [data.source.name]: observation.usageCount,
      };
      entry.sampleTexts = [
        ...new Set([...(entry.sampleTexts ?? []), ...observation.sampleTexts]),
      ].slice(0, 12);
      entry.samplePaths = [
        ...new Set([...(entry.samplePaths ?? []), ...observation.sourcePaths]),
      ].slice(0, 12);
      entry.sourceNodeIds = [
        ...new Set([
          ...(entry.sourceNodeIds ?? []),
          ...observation.sourceNodeIds,
        ]),
      ];
      entry.textStyleIds = [
        ...new Set([
          ...(entry.textStyleIds ?? []),
          ...observation.textStyleIds,
        ]),
      ];
      entry.flags = {
        styled: (entry.flags?.styled ?? false) || observation.flags.styled,
        localOverride:
          (entry.flags?.localOverride ?? false) ||
          observation.flags.localOverride,
        mixed: (entry.flags?.mixed ?? false) || observation.flags.mixed,
      };
      merged.set(key, entry);
    }

    for (const reference of data.sourceReferences) {
      if (reference.mixed) {
        mixedNodes.push({
          sourcePage: data.source.name,
          sourceNodeId: reference.id,
          text: reference.characters,
          sourcePath: reference.hierarchyPath.join(" / "),
          baseSignature: normalizeTypographySignature(reference),
          segments: reference.styledSegments.map((segment) => ({
            range: [segment.start, segment.end],
            text: segment.characters,
            signature: normalizeTypographySignature(segment),
            textStyleId: segment.textStyleId || null,
          })),
        });
      }

      const styledParts = reference.styledSegments.length
        ? reference.styledSegments
        : [reference];
      for (const part of styledParts) {
        if (!part.textStyleId) continue;
        const style = styleMap.get(part.textStyleId) ?? {
          textStyleId: part.textStyleId,
          signatureKeys: new Set(),
          sourcePages: new Set(),
          samples: new Map(),
        };
        style.signatureKeys.add(typographySignatureKey(part));
        style.sourcePages.add(data.source.name);
        style.samples.set(`${data.source.id}:${reference.id}`, {
          text: part.characters ?? reference.characters,
          path: reference.hierarchyPath.join(" / "),
          sourceNodeId: reference.id,
        });
        styleMap.set(part.textStyleId, style);
      }
    }
  }

  const signatures = [...merged.values()].map((entry, index) => {
    const result = classify(entry.normalizedSignature, entry.observations);
    return {
      id: `typography-${String(index + 1).padStart(3, "0")}`,
      normalizedSignature: entry.normalizedSignature,
      originalSourceSignatures: entry.originalSourceSignatures,
      usageCountTotal: entry.usageCountTotal,
      usageByPage: entry.usageByPage,
      sampleTexts: entry.sampleTexts,
      samplePaths: entry.samplePaths,
      sourceNodeIds: entry.sourceNodeIds,
      textStyleIds: entry.textStyleIds,
      flags: entry.flags,
      classification: result.classification,
      classificationReasons: result.reasons,
    };
  });
  const signatureIdByKey = new Map(
    signatures.map((entry) => [
      typographySignatureKey(entry.normalizedSignature),
      entry.id,
    ]),
  );
  const textStyles = [...styleMap.values()].map((style) => {
    const signatureIds = [...style.signatureKeys].map((key) =>
      signatureIdByKey.get(key),
    );
    const samples = [...style.samples.values()];
    return {
      textStyleId: style.textStyleId,
      signatureIds,
      usageCount: style.samples.size,
      sourcePages: [...style.sourcePages],
      sampleTexts: [...new Set(samples.map(({ text }) => text))].slice(0, 10),
      samplePaths: [...new Set(samples.map(({ path }) => path))].slice(0, 10),
      inconsistent: signatureIds.length > 1,
    };
  });
  const classificationCounts = Object.fromEntries(
    Object.values(classifications).map((classification) => [
      classification,
      signatures.filter((entry) => entry.classification === classification)
        .length,
    ]),
  );
  const fontFamilies = [
    ...new Set(signatures.map((entry) => entry.normalizedSignature.fontFamily)),
  ].map((fontFamily) => ({
    fontFamily,
    styles: [
      ...new Set(
        signatures
          .filter(
            (entry) => entry.normalizedSignature.fontFamily === fontFamily,
          )
          .map((entry) => entry.normalizedSignature.fontStyle),
      ),
    ],
    signatureCount: signatures.filter(
      (entry) => entry.normalizedSignature.fontFamily === fontFamily,
    ).length,
    usageCount: signatures
      .filter((entry) => entry.normalizedSignature.fontFamily === fontFamily)
      .reduce((sum, entry) => sum + entry.usageCountTotal, 0),
    classifications: [
      ...new Set(
        signatures
          .filter(
            (entry) => entry.normalizedSignature.fontFamily === fontFamily,
          )
          .map((entry) => entry.classification),
      ),
    ],
  }));

  return {
    schemaVersion: 1,
    sourceFiles: sourceSummaries,
    summary: {
      textNodes: sourceSummaries.reduce(
        (sum, source) => sum + source.counts.textNodes,
        0,
      ),
      sourceSignatures: sourceSummaries.reduce(
        (sum, source) => sum + source.counts.uniqueTypographySignatures,
        0,
      ),
      mergedSignatures: signatures.length,
      crossPageSignatures: signatures.filter(
        ({ usageByPage }) => Object.keys(usageByPage).length > 1,
      ).length,
      referencedTextStyles: textStyles.length,
      mixedNodes: mixedNodes.length,
      styledSegmentsInMixedNodes: mixedNodes.reduce(
        (sum, node) => sum + node.segments.length,
        0,
      ),
      classificationCounts,
    },
    fontFamilies,
    signatures,
    textStyles,
    classification: {
      categories: classifications,
      method:
        "Classification uses source paths, page context, usage, styled/localOverride flags and asset context. It is evidence metadata, not a semantic token scale.",
    },
    mixedNodes,
    issues: [
      {
        type: "FOREIGN_LEGACY_FAMILIES",
        classification: "OBSERVED",
        families: ["Roboto", "SF Pro Display", "Suisse Intl"],
      },
      {
        type: "MIXED_NODES",
        classification: "FACT",
        count: mixedNodes.length,
        note: "Segment typography is preserved; mixed nodes are not promoted to standalone styles.",
      },
      {
        type: "TEXT_STYLE_SIGNATURE_CONFLICT",
        classification: "FACT",
        conflicts: textStyles.filter(({ inconsistent }) => inconsistent),
      },
      {
        type: "LOCAL_OVERRIDES_OUTLIERS",
        classification: "OBSERVED",
        signatureIds: signatures
          .filter(
            ({ classification }) => classification === classifications.outlier,
          )
          .map(({ id }) => id),
        note: "Rare local overrides are retained in the inventory and are not promoted to product candidates.",
      },
      {
        type: "SEMANTIC_SCALE",
        classification: "UNKNOWN",
        note: "Source facts do not provide authoritative semantic names such as body-sm or heading-lg.",
      },
    ],
    coverage: {
      status: "SOURCE_FACTS_AVAILABLE",
      primaryProductFamily: {
        value: "Golos Text",
        classification: "DERIVED_FROM_SOURCE_CONTEXT",
        evidence:
          "Regular, Medium and SemiBold are used across concrete Interface elements component paths, including Sidebar, Status, Documents, History, Messages, Header and Table.",
      },
      limitations: [
        "Figma text style names are absent; IDs must remain opaque.",
        "Classification does not create production or semantic typography tokens.",
        "Font delivery, fallback and browser rendering are outside this source index.",
      ],
    },
  };
}

export function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}
