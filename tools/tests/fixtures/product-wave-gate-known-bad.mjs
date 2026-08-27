export function route(assessment) {
  return {
    payload: {
      wave: assessment.wave
        ? {
            ...assessment.wave,
            executionPath: "product",
            heavyExecution: true,
            roadmapAdvance: true,
          }
        : undefined,
    },
  };
}
