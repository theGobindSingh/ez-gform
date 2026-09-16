import { describe, expect, it } from "vitest";
import { FIXTURE_SLUGS, loadFixtureSchema } from "./__test-utils__/fixtures.js";
import { generateSchemaJson } from "./schema-json.js";

describe("generateSchemaJson", () => {
  for (const slug of FIXTURE_SLUGS) {
    it(`round-trips ${slug} through JSON.parse structurally`, () => {
      const schema = loadFixtureSchema(slug);
      const json = generateSchemaJson(schema);
      const parsed: unknown = JSON.parse(json);
      expect(parsed).toEqual(schema);
    });
  }

  it("pretty-prints by default", () => {
    const schema = loadFixtureSchema("event-feedback");
    const json = generateSchemaJson(schema);
    expect(json).toContain("\n");
  });

  it("can be minified", () => {
    const schema = loadFixtureSchema("event-feedback");
    const json = generateSchemaJson(schema, { pretty: false });
    expect(json).not.toContain("\n");
    expect(JSON.parse(json)).toEqual(schema);
  });
});
