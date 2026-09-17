import { describe, expect, it } from "vitest";
import { typeCheck } from "./__test-utils__/compile-check.js";
import { FIXTURE_SLUGS, loadFixtureSchema } from "./__test-utils__/fixtures.js";
import { generateTypes } from "./generate-types.js";

describe("generateTypes", () => {
  for (const slug of FIXTURE_SLUGS) {
    it(`generates types for ${slug} that type-check`, () => {
      const schema = loadFixtureSchema(slug);
      const source = generateTypes(schema);

      expect(source).toContain("as const satisfies FormSchema");
      expect(source).toContain("Values = {");

      const result = typeCheck(source, { fileName: "/virtual/generated.ts" });
      if (result.skipped) {
        // @ez-gform/core hasn't been built in this environment — skip the
        // full type-check but keep the structural assertions above.
        return;
      }
      expect(result.diagnostics.join("\n")).toBe("");
      expect(result.ok).toBe(true);
    });
  }

  it("marks required questions as non-optional and others as optional", () => {
    const schema = loadFixtureSchema("event-feedback");
    const source = generateTypes(schema);
    for (const question of schema.questions) {
      if (question.type === "file_upload") continue;
      const key = JSON.stringify(question.entryId);
      const optionalPattern = new RegExp(
        `${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\?:`,
      );
      const requiredPattern = new RegExp(
        `${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`,
      );
      if (question.required) {
        expect(source).toMatch(requiredPattern);
        expect(optionalPattern.test(source)).toBe(false);
      } else {
        expect(source).toMatch(optionalPattern);
      }
    }
  });

  it("uses a checkboxes-with-other type when the question has an Other option", () => {
    const schema = loadFixtureSchema("question-types-demo");
    const checkboxWithOther = schema.questions.find((q) => {
      return (
        q.type === "checkboxes" &&
        q.options?.some((o) => {
          return o.isOther;
        })
      );
    });
    if (!checkboxWithOther) return;
    const source = generateTypes(schema);
    expect(source).toContain(
      `${JSON.stringify(checkboxWithOther.entryId)}${
        checkboxWithOther.required ? "" : "?"
      }: (string | { other: string })[];`,
    );
  });

  it("uses a provided name", () => {
    const schema = loadFixtureSchema("event-feedback");
    const source = generateTypes(schema, { name: "Custom" });
    expect(source).toContain("export const CustomSchema =");
    expect(source).toContain("export type CustomValues =");
  });
});
