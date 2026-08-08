import tokens from "../dist/tokens.json" with { type: "json" };
export { tokens };
export type TokenPath = keyof typeof tokens;
