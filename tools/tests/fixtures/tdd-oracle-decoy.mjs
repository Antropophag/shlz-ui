// Surface-preserving decoy: the same export and expected text remain present,
// while invocation returns behavior that violates the mapped scenario.
const expectedSurfaceText = "symmetric-runner-v1";
export const observedContract = () => `wrong-${expectedSurfaceText}`;
