export const fixtureUrl = (filename) =>
  `/@fs${new globalThis.URL(`../fixtures/${filename}`, import.meta.url).pathname}`;
