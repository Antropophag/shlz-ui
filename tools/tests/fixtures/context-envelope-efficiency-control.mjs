const unavailable = "unavailable";

export function summarizeEvents(events) {
  const usage = events.filter((event) => event.type === "usage");
  const boundaries = events.filter(
    (event) => event.type === "execution-boundary",
  );
  const packets = new Map();
  const bySession = {};

  for (const event of usage) {
    const inputTokens = event.inputTokens ?? event.contextTokens;
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
    packet.inputTokens += inputTokens;
    if (Number.isFinite(event.cachedInputTokens)) {
      packet.cachedInputTokens += event.cachedInputTokens;
      packet.uncachedInputTokens += inputTokens - event.cachedInputTokens;
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
      inputTokens,
      cachedInputTokens: event.cachedInputTokens ?? unavailable,
      uncachedInputTokens: Number.isFinite(event.cachedInputTokens)
        ? inputTokens - event.cachedInputTokens
        : unavailable,
      outputTokens: event.outputTokens ?? unavailable,
    };
  }

  const allFinite = (field) =>
    usage.every((event) => Number.isFinite(event[field]));
  const normalizedUsage = usage.map((event) => ({
    ...event,
    inputTokens: event.inputTokens ?? event.contextTokens,
  }));
  const normalizedSum = (field) =>
    normalizedUsage.reduce((total, event) => total + event[field], 0);
  const inputTokens = normalizedSum("inputTokens");
  const cachedInputTokens = allFinite("cachedInputTokens")
    ? normalizedSum("cachedInputTokens")
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
        ? normalizedSum("outputTokens")
        : unavailable,
      source: "codex-exec-jsonl:turn.completed",
    },
    byPacket: Object.fromEntries(packets),
    bySession,
  };
}
