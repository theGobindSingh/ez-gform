import type { FormSchema, StoredSettings } from "@ez-gform/types";
import { describe, expect, it } from "vitest";
import { buildOutput } from "./build-output.js";

const schema: FormSchema = {
  formId: "1FAIpQLSabc",
  title: "Feedback Form",
  questions: [
    {
      id: "1",
      entryId: "entry.111",
      title: "Your name",
      type: "short_answer",
      required: true,
    },
  ],
  sections: [{ title: "Feedback Form", questionIds: ["1"] }],
  multiPage: false,
};

describe("buildOutput", () => {
  it("generates JSON", () => {
    const settings: StoredSettings = { format: "json", typescript: true };
    const output = buildOutput(schema, settings);
    expect(output.filename).toBe("form-schema.json");
    expect(JSON.parse(output.code)).toEqual(schema);
  });

  it("generates TypeScript types", () => {
    const settings: StoredSettings = { format: "types", typescript: true };
    const output = buildOutput(schema, settings);
    expect(output.language).toBe("typescript");
    expect(output.code).toContain("satisfies");
  });

  it("generates a React component honoring the component name", () => {
    const settings: StoredSettings = {
      format: "react",
      componentName: "FeedbackForm",
      typescript: true,
    };
    const output = buildOutput(schema, settings);
    expect(output.filename).toBe("FormComponent.tsx");
    expect(output.code).toContain("FeedbackForm");
  });

  it("generates a plain JSX filename when typescript is disabled", () => {
    const settings: StoredSettings = { format: "react", typescript: false };
    const output = buildOutput(schema, settings);
    expect(output.filename).toBe("FormComponent.jsx");
  });

  it("generates a plain HTML form", () => {
    const settings: StoredSettings = { format: "html", typescript: false };
    const output = buildOutput(schema, settings);
    expect(output.filename).toBe("form.html");
    expect(output.code).toContain("<form");
    expect(output.code).toContain("entry.111");
  });
});
