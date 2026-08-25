const unavailable = "unavailable";

export function summarizeEvents(events) {
  const usage = events.filter((event) => event.type === "usage");
  const boundaries = events.filter(
    (event) => event.type === "execution-boundary",
  );
  const packets = new Map();
  const bySession = {};

  for (const event of usage) {
    const packet = packets.get(event.packet) ?? {
      attempts: 0,
      physicalBoundaries: 0,
      sessions: [],
      inputTokens: 0,
      cachedInputTokens: 0,
      uncachedInputTokens: 0,
      outputTokens: 0,
    };
    const boundary = boundaries.find(
      (candidate) => candidate.session === event.session,
    );
    packet.attempts += 1;
    packet.physicalBoundaries += boundary ? 1 : 0;
    packet.sessions.push(event.session);
    packet.inputTokens += event.inputTokens;
    if (Number.isFinite(event.cachedInputTokens)) {
      packet.cachedInputTokens += event.cachedInputTokens;
      packet.uncachedInputTokens +=
        event.inputTokens - event.cachedInputTokens;
    } else {
      packet.cachedInputTokens = unavailable;
      packet.uncachedInputTokens = unavailable;
    }
    if (Number.isFinite(event.outputTokens))
      packet.outputTokens += event.outputTokens;
    else packet.outputTokens = unavailable;
    packets.set(event.packet, packet);
    bySession[event.session] = {
      packet: event.packet,
      phase: event.phase,
      attempt: packet.attempts,
      runtimeId: boundary?.runtimeId,
      inputTokens: event.inputTokens,
      cachedInputTokens: event.cachedInputTokens ?? unavailable,
      uncachedInputTokens: Number.isFinite(event.cachedInputTokens)
        ? event.inputTokens - event.cachedInputTokens
        : unavailable,
      outputTokens: event.outputTokens ?? unavailable,
    };
  }

  const allFinite = (field) => usage.every((event) => Number.isFinite(event[field]));
  const sum = (field) => usage.reduce((total, event) => total + event[field], 0);
  const inputTokens = sum("inputTokens");
  const cachedInputTokens = allFinite("cachedInputTokens")
    ? sum("cachedInputTokens")
    : unavailable;
  return {
    runtimeUsage: {
      inputTokens,
      cachedInputTokens,
      uncachedInputTokens:
        cachedInputTokens === unavailable
          ? unavailable
          : inputTokens - cachedInputTokens,
      outputTokens: allFinite("outputTokens")
        ? sum("outputTokens")
        : unavailable,
      source: "codex-exec-jsonl:turn.completed",
    },
    byPacket: Object.fromEntries(packets),
    bySession,
  };
}
