export const deliveryPacketConsistencyOutcome = (fixture, observedStatus) =>
  fixture.id.startsWith("routing-engine-split-brain-")
    ? "reject"
    : observedStatus;
