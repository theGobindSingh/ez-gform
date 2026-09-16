import type { FormSchema, Question } from "@ez-gform/core";
import { describe, expect, it } from "vitest";
import { FIXTURE_SLUGS, loadFixtureSchema } from "./__test-utils__/fixtures.js";
import { generateHtmlForm } from "./generate-html.js";

const hasOtherOption = (question: Question): boolean => {
  return question.options?.some((o) => o.isOther) ?? false;
};

/** Every distinct `name=` attribute value the encoder would produce for this schema. */
const expectedNames = (schema: FormSchema): Set<string> => {
  const names = new Set<string>();
  if (schema.multiPage) {
    names.add("fbzx");
  }
  for (const question of schema.questions) {
    switch (question.type) {
      case "short_answer":
      case "paragraph":
      case "linear_scale":
        names.add(question.entryId);
        break;
      case "multiple_choice":
      case "dropdown":
        names.add(question.entryId);
        if (hasOtherOption(question)) {
          names.add(`${question.entryId}.other_option_response`);
        }
        break;
      case "checkboxes":
        names.add(question.entryId);
        if (hasOtherOption(question)) {
          names.add(`${question.entryId}.other_option_response`);
        }
        break;
      case "grid":
      case "checkbox_grid":
        for (const row of question.rows ?? []) {
          names.add(row.entryId);
        }
        break;
      case "date":
        if (question.date?.includeYear !== false) {
          names.add(`${question.entryId}_year`);
        }
        names.add(`${question.entryId}_month`);
        names.add(`${question.entryId}_day`);
        if (question.date?.includeTime) {
          names.add(`${question.entryId}_hour`);
          names.add(`${question.entryId}_minute`);
        }
        break;
      case "time":
        names.add(`${question.entryId}_hour`);
        names.add(`${question.entryId}_minute`);
        break;
      case "file_upload":
        break;
      default:
        break;
    }
  }
  return names;
};

const extractNames = (html: string): Set<string> => {
  const names = new Set<string>();
  const re = /\bname="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    names.add(match[1]!);
  }
  return names;
};

describe("generateHtmlForm", () => {
  for (const slug of FIXTURE_SLUGS) {
    it(`emits exactly the expected entry names for ${slug}`, () => {
      const schema = loadFixtureSchema(slug);
      const html = generateHtmlForm(schema);
      const found = extractNames(html);
      const expected = expectedNames(schema);
      expect([...found].sort()).toEqual([...expected].sort());
    });
  }

  it("posts to the formResponse URL", () => {
    const schema = loadFixtureSchema("event-feedback");
    const html = generateHtmlForm(schema);
    expect(html).toContain(
      `action="https://docs.google.com/forms/d/e/${schema.formId}/formResponse"`,
    );
    expect(html).toContain('method="POST"');
  });
});
