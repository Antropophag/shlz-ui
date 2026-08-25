import { summarizeEvents as summarizeControl } from "./context-envelope-efficiency-control.mjs";

// Surface-compatible decoy: aggregate usage remains plausible, but repeated
// packet attempts are flattened and therefore violate stage/session attribution.
export function summarizeEvents(events) {
  const result = summarizeControl(events);
  if (result.byPacket.implementation)
    result.byPacket.implementation.attempts = 1;
  return result;
}
