import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

const read = (file) =>
  readFile(new URL(`../../${file}`, import.meta.url), "utf8");

test("accessible production text uses semantic roles without rewriting source facts", async () => {
  const [tokensSource, tokensDist, provenanceSource, field, modal, policy] =
    await Promise.all([
      read("packages/tokens/tokens.json"),
      read("packages/tokens/dist/tokens.json"),
      read("packages/tokens/provenance.json"),
      read("packages/styles/components/field.css"),
      read("packages/styles/components/modal.css"),
      read("docs/accessibility-source-contrast.md"),
    ]);
  const tokens = JSON.parse(tokensSource);
  const distributed = JSON.parse(tokensDist);
  const expected = "rgb(11 22 35 / 60%)";

  assert.equal(
    tokens.source.color["Dark Blue"]["Dark blue 50%"],
    "rgb(11 22 35 / 50%)",
  );
  assert.equal(
    tokens.source.color["Dark Blue"]["Dark blue 25%"],
    "rgb(11 22 35 / 25%)",
  );
  assert.equal(tokens.semantic.color.text["supporting-accessible"], expected);
  assert.equal(tokens.semantic.color.text["placeholder-accessible"], expected);
  assert.deepEqual(distributed, tokens);
  assert.match(provenanceSource, /accessible production text/i);
  assert.match(provenanceSource, /DECISION/);
  assert.match(field, /--shlz-semantic-color-text-supporting-accessible/);
  assert.match(field, /--shlz-semantic-color-text-placeholder-accessible/);
  assert.match(modal, /--shlz-semantic-color-text-supporting-accessible/);
  assert.match(policy, /WCAG 2\.2/);
  assert.match(policy, /4\.5:1/);
  assert.match(policy, /consumer-owned/i);
});
