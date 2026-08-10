export const fixtureUrl = (filename) => {
  if (
    typeof filename !== "string" ||
    filename.length === 0 ||
    filename === "." ||
    filename === ".." ||
    /[/\\]/.test(filename)
  ) {
    throw new TypeError("Fixture filename must be a single basename");
  }

  const fixture = new globalThis.URL(
    `../fixtures/${encodeURIComponent(filename)}`,
    import.meta.url,
  );
  return `/@fs${fixture.pathname}`;
};
