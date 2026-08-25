import { readFile } from "node:fs/promises";
import path from "node:path";

import { matchesPattern, summarizeEvents } from "./core.mjs";

const unavailable = "unavailable";
const applyMetricPolicy = (value, unavailableMetrics) =>
  Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      unavailableMetrics.has(key) ? unavailable : item,
    ]),
  );
const sumAvailable = (items, field) =>
  items.length && items.every((item) => Number.isFinite(item[field]))
    ? items.reduce((total, item) => total + item[field], 0)
    : unavailable;

const aggregateAttempts = (attempts) => ({
  attempts: attempts.length,
  physicalBoundaries: attempts.length,
  sessions: attempts.map(({ session }) => session),
  inputTokens: sumAvailable(attempts, "inputTokens"),
  cachedInputTokens: sumAvailable(attempts, "cachedInputTokens"),
  uncachedInputTokens: sumAvailable(attempts, "uncachedInputTokens"),
  outputTokens: sumAvailable(attempts, "outputTokens"),
});

const groupAttempts = (attempts, field) => {
  const groups = new Map();
  for (const attempt of attempts) {
    const key = attempt[field];
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }
  return Object.fromEntries(
    [...groups.entries()].map(([key, values]) => [
      key,
      aggregateAttempts(values),
    ]),
  );
};

const absolute = (repoRoot, file) => {
  const target = path.resolve(repoRoot, file);
  if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`))
    throw new Error(`path escapes repository: ${file}`);
  return target;
};

const readJson = async (repoRoot, file) =>
  JSON.parse(await readFile(absolute(repoRoot, file), "utf8"));

export async function evaluateTelemetryEfficiency(fixture, repoRoot) {
  if (fixture?.version !== 1 || !Array.isArray(fixture.telemetrySources))
    throw new Error("efficiency evaluation requires a version 1 fixture");
  if (!Array.isArray(fixture.sourceEnvelopes))
    throw new Error("sourceEnvelopes must be an array");
  if (!fixture.metricPolicy?.unavailable?.includes("contextRelevance"))
    throw new Error("metricPolicy.unavailable must include contextRelevance");
  const changes = [];
  const all = [];
  const unavailableMetrics = new Set(fixture.metricPolicy?.unavailable ?? []);
  for (const source of fixture.telemetrySources) {
    const text = await readFile(absolute(repoRoot, source.path), "utf8");
    const events = text.trim().split("\n").filter(Boolean).map(JSON.parse);
    all.push(...events.map((event) => ({ ...event, change: source.id })));
    const attribution = summarizeEvents(events);
    const sessionByRuntime = new Map(
      Object.entries(attribution.bySession).flatMap(([session, value]) =>
        (Array.isArray(value) ? value : [value]).map(({ runtimeId }) => [
          runtimeId,
          session,
        ]),
      ),
    );
    const attempts = Object.entries(attribution.byAttempt).map(
      ([runtimeId, attempt]) =>
        applyMetricPolicy(
          { runtimeId, session: sessionByRuntime.get(runtimeId), ...attempt },
          unavailableMetrics,
        ),
    );
    const physicalBoundaries = events.filter(
      ({ type }) => type === "execution-boundary",
    ).length;
    const usageEvents = events.filter(({ type }) => type === "usage").length;
    changes.push({
      id: source.id,
      runtime: applyMetricPolicy(attribution.runtimeUsage, unavailableMetrics),
      physicalBoundaries,
      usageEvents,
      missingUsageBoundaries: physicalBoundaries - usageEvents,
      packets: Object.fromEntries(
        Object.entries(attribution.byPacket).map(([packet, value]) => [
          packet,
          applyMetricPolicy(value, unavailableMetrics),
        ]),
      ),
      sessions: Object.fromEntries(
        Object.entries(attribution.bySession).map(([session, value]) => [
          session,
          Array.isArray(value)
            ? value.map((item) => applyMetricPolicy(item, unavailableMetrics))
            : applyMetricPolicy(value, unavailableMetrics),
        ]),
      ),
      phases: groupAttempts(attempts, "phase"),
      attempts,
    });
  }

  const attribution = summarizeEvents(all);
  const usage = all.filter(({ type }) => type === "usage");
  const boundaries = all.filter(({ type }) => type === "execution-boundary");
  const grouped = new Map();
  for (const event of boundaries) {
    const key = `${event.change}\0${event.packet}`;
    const value = grouped.get(key) ?? {
      change: event.change,
      packet: event.packet,
      attempts: 0,
      sessions: [],
      runtimeIds: [],
    };
    value.attempts += 1;
    value.sessions.push(event.session);
    value.runtimeIds.push(event.runtimeId);
    grouped.set(key, value);
  }
  const repeatedPackets = [...grouped.values()].filter(
    ({ attempts }) => attempts > 1,
  );
  const attempts = changes.flatMap((change) =>
    change.attempts.map((attempt) => ({ ...attempt, change: change.id })),
  );
  const sourceEnvelopes = await Promise.all(
    fixture.sourceEnvelopes.map(async (source) => {
      const capsule = await readJson(repoRoot, source.capsule);
      const resolved = capsule.readNow ?? [];
      const patternSources = resolved.filter(({ path: sourcePath }) =>
        matchesPattern(sourcePath, source.declaredPattern),
      );
      const largestContributor =
        [...resolved].sort(
          (left, right) =>
            right.bytes - left.bytes ||
            (left.path < right.path ? -1 : left.path > right.path ? 1 : 0),
        )[0] ?? null;
      return {
        change: source.change,
        packet: source.packet,
        budget: source.maxInitialContextBytes ?? "unbudgeted",
        resolvedSourceCount: resolved.length,
        resolvedSourceBytes: resolved.reduce(
          (total, item) => total + item.bytes,
          0,
        ),
        broadPattern: {
          pattern: source.declaredPattern,
          sourceCount: patternSources.length,
          sourceBytes: patternSources.reduce(
            (total, item) => total + item.bytes,
            0,
          ),
        },
        largestContributor,
      };
    }),
  );
  const missingUsage = boundaries.length - usage.length;
  return {
    version: 1,
    fixture: fixture.id,
    sample: {
      changes: changes.length,
      physicalBoundaries: boundaries.length,
      usageEvents: usage.length,
      missingUsageBoundaries: missingUsage,
    },
    runtime: applyMetricPolicy(attribution.runtimeUsage, unavailableMetrics),
    byChange: changes,
    attribution: {
      phases: groupAttempts(attempts, "phase"),
      repeatedPackets,
    },
    sourceEnvelopes,
    proxies: {
      handoffBytes: attribution.handoffObservations
        ? attribution.handoffBytes
        : unavailable,
      contextRelevance: attribution.contextRelevance,
      retryFanOut: {
        physicalBoundaries: boundaries.length,
        repeatedPacketAttempts: repeatedPackets.reduce(
          (total, packet) => total + packet.attempts,
          0,
        ),
      },
    },
    limitations: [
      "The selected telemetry does not retain raw cached-input or output fields, so cached, uncached, and output token values remain unavailable.",
      `${missingUsage} physical boundaries have no matching trusted usage event and are excluded from token totals without estimation.`,
      "No selected event explicitly classifies source-read relevance; capsule inclusion and byte size are not treated as semantic relevance.",
      "Source-envelope bytes are a repository-controlled input proxy and are not converted into model tokens.",
      "The sample observes guarded workers only; root-agent context and unrecorded execution remain outside the evaluation.",
    ],
  };
}
