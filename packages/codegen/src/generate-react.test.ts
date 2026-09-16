import { describe, expect, it } from "vitest";
import { transpiles, typeCheck } from "./__test-utils__/compile-check.js";
import { FIXTURE_SLUGS, loadFixtureSchema } from "./__test-utils__/fixtures.js";
import { generateReactComponent } from "./generate-react.js";

describe("generateReactComponent", () => {
  for (const slug of FIXTURE_SLUGS) {
    it(`generates a component for ${slug} that transpiles cleanly`, () => {
      const schema = loadFixtureSchema(slug);
      const source = generateReactComponent(schema);

      expect(source).toContain("useGoogleForm");
      expect(source).toContain("export function");

      const transpileResult = transpiles(source);
      expect(transpileResult.diagnostics.join("\n")).toBe("");
      expect(transpileResult.ok).toBe(true);
    });

    it(`generates a component for ${slug} that type-checks against @ez-gform/react (when built)`, () => {
      const schema = loadFixtureSchema(slug);
      const source = generateReactComponent(schema);
      const result = typeCheck(source, { needsReact: true });
      if (result.skipped) {
        return;
      }
      expect(result.diagnostics.join("\n")).toBe("");
      expect(result.ok).toBe(true);
    }, 20000);
  }

  it("renders a disabled note for file_upload questions", () => {
    const schema = loadFixtureSchema("question-types-demo");
    const hasFileUpload = schema.questions.some(
      (q) => q.type === "file_upload",
    );
    const source = generateReactComponent(schema);
    if (hasFileUpload) {
      expect(source).toContain("not supported by Google Forms submission");
    }
  });

  it("respects a provided component name", () => {
    const schema = loadFixtureSchema("event-feedback");
    const source = generateReactComponent(schema, { name: "MyCustomForm" });
    expect(source).toContain("export function MyCustomForm()");
  });

  it("emits plain JSX (no type annotations) when typescript is false", () => {
    const schema = loadFixtureSchema("event-feedback");
    const source = generateReactComponent(schema, { typescript: false });
    expect(source).not.toContain("import type { FormSchema }");
    expect(source).not.toContain("satisfies FormSchema");
    const result = transpiles(source, "generated.jsx");
    expect(result.ok).toBe(true);
  });
});
