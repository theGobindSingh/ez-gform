import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ParseError } from "../errors.js";
import { parseFormData, parseFormHtml } from "../parse.js";

const fixturesDir = fileURLToPath(new URL("../__fixtures__/", import.meta.url));

const loadFixture = (slug: string): unknown => {
  return JSON.parse(readFileSync(`${fixturesDir}${slug}.json`, "utf8"));
};

const FIXTURE_SLUGS = ["all-question-types", "file-upload"] as const;

describe("parseFormData over every live fixture", () => {
  for (const slug of FIXTURE_SLUGS) {
    it(`parses ${slug} without throwing and returns a sane schema`, () => {
      const data = loadFixture(slug);
      const schema = parseFormData(data);

      expect(schema.formId.length).toBeGreaterThan(0);
      expect(schema.formId.startsWith("e/")).toBe(false);
      expect(typeof schema.title).toBe("string");
      expect(schema.title.length).toBeGreaterThan(0);
      expect(Array.isArray(schema.questions)).toBe(true);
      expect(schema.questions.length).toBeGreaterThan(0);
      expect(Array.isArray(schema.sections)).toBe(true);
      expect(schema.sections.length).toBeGreaterThan(0);

      for (const q of schema.questions) {
        expect(q.entryId.startsWith("entry.")).toBe(true);
        expect(typeof q.required).toBe("boolean");
      }
    });
  }
});

describe("parseFormData — all-question-types", () => {
  const schema = parseFormData(loadFixture("all-question-types"));
  const byTitle = (title: string) => {
    return schema.questions.find((q) => {
      return q.title === title;
    });
  };

  it("reads form title, description, and id", () => {
    expect(schema.title).toBe("ez-gform fixture: all question types");
    expect(schema.description).toBe(
      "Synthetic form used as a parser test fixture.",
    );
    expect(schema.formId).toBe(
      "1FAIpQLScXpdCnyzcv0h5_3giJaB9vP_00UIXggzt4UAfMamwPApnINw",
    );
  });

  it("maps every question to its type, in order", () => {
    expect(
      schema.questions.map((q) => {
        return [q.title, q.type];
      }),
    ).toEqual([
      ["Short answer required", "short_answer"],
      ["Short answer optional", "short_answer"],
      ["Paragraph question", "paragraph"],
      ["Radio plain", "multiple_choice"],
      ["Radio with other", "multiple_choice"],
      ["Dropdown question", "dropdown"],
      ["Checkboxes plain", "checkboxes"],
      ["Checkboxes with other", "checkboxes"],
      ["Checkboxes with validation", "checkboxes"],
      ["Scale with labels", "linear_scale"],
      ["Scale without labels", "linear_scale"],
      ["Radio grid", "grid"],
      ["Checkbox grid", "checkbox_grid"],
      ["Rating question", "linear_scale"],
      ["Date with year", "date"],
      ["Date with year and time", "date"],
      ["Date without year", "date"],
      ["Date with time without year", "date"],
      ["Time of day", "time"],
      ["Duration", "time"],
    ]);
  });

  it("splits page breaks into sections and skips non-question blocks", () => {
    expect(schema.multiPage).toBe(true);
    expect(
      schema.sections.map((s) => {
        return [s.title, s.questionIds.length];
      }),
    ).toEqual([
      // the "Info block" title item retitles the first section
      ["Info block", 9],
      ["Scales and grids", 5],
      ["Dates and times", 6],
      // image and video items are not questions
      ["Media", 0],
    ]);
    expect(schema.sections[1]?.description).toBe("Second page");
  });

  it("reads required flags and descriptions", () => {
    expect(byTitle("Short answer required")?.required).toBe(true);
    expect(byTitle("Short answer required")?.description).toBe(
      "A description under the title",
    );
    expect(byTitle("Short answer optional")?.required).toBe(false);
    expect(byTitle("Radio grid")?.required).toBe(true);
    expect(byTitle("Checkbox grid")?.required).toBe(false);
  });

  it("flags the Other option on radio and checkbox questions only", () => {
    expect(byTitle("Radio plain")?.options).toEqual([
      { value: "Alpha", isOther: false },
      { value: "Beta", isOther: false },
      { value: "Gamma", isOther: false },
    ]);
    expect(byTitle("Radio with other")?.options).toEqual([
      { value: "Red", isOther: false },
      { value: "Green", isOther: false },
      { value: "", isOther: true },
    ]);
    expect(byTitle("Checkboxes with other")?.options?.at(-1)).toEqual({
      value: "",
      isOther: true,
    });
  });

  it("parses options on a checkbox question carrying a validation rule", () => {
    expect(
      byTitle("Checkboxes with validation")?.options?.map((o) => {
        return o.value;
      }),
    ).toEqual(["A", "B", "C", "D"]);
  });

  it("parses linear scales with and without labels", () => {
    expect(byTitle("Scale with labels")?.scale).toEqual({
      min: 1,
      max: 5,
      lowLabel: "Bad",
      highLabel: "Great",
    });
    expect(byTitle("Scale without labels")?.scale).toEqual({
      min: 0,
      max: 10,
      lowLabel: undefined,
      highLabel: undefined,
    });
  });

  it("parses a rating question (type 18) as a 1..N scale", () => {
    expect(byTitle("Rating question")?.scale).toMatchObject({ min: 1, max: 5 });
  });

  it("parses both grid kinds distinctly, one entry id per row", () => {
    const grid = byTitle("Radio grid");
    const checkboxGrid = byTitle("Checkbox grid");
    expect(
      grid?.rows?.map((r) => {
        return r.label;
      }),
    ).toEqual(["Row A", "Row B"]);
    expect(
      grid?.options?.map((o) => {
        return o.value;
      }),
    ).toEqual(["Low", "Mid", "High"]);
    expect(
      checkboxGrid?.rows?.map((r) => {
        return r.label;
      }),
    ).toEqual(["Row X", "Row Y"]);
    expect(grid?.entryId).toBe(grid?.rows?.[0]?.entryId);
    expect(grid?.rows?.[0]?.entryId).not.toBe(grid?.rows?.[1]?.entryId);
  });

  it("parses all four [includeTime, includeYear] date flag pairs", () => {
    expect(byTitle("Date with year")?.date).toEqual({
      includeTime: false,
      includeYear: true,
    });
    expect(byTitle("Date with year and time")?.date).toEqual({
      includeTime: true,
      includeYear: true,
    });
    expect(byTitle("Date without year")?.date).toEqual({
      includeTime: false,
      includeYear: false,
    });
    expect(byTitle("Date with time without year")?.date).toEqual({
      includeTime: true,
      includeYear: false,
    });
  });

  it("distinguishes time of day from duration", () => {
    expect(byTitle("Time of day")?.time).toEqual({ isDuration: false });
    expect(byTitle("Duration")?.time).toEqual({ isDuration: true });
  });
});

describe("parseFormData — file-upload", () => {
  const schema = parseFormData(loadFixture("file-upload"));

  it("parses a type-13 file upload question on a single-page form", () => {
    expect(schema.multiPage).toBe(false);
    expect(schema.sections).toHaveLength(1);
    expect(schema.questions[0]).toMatchObject({
      title: "Upload question",
      type: "file_upload",
      required: true,
    });
  });
});

describe("parseFormData — error handling", () => {
  it("throws ParseError on non-array input", () => {
    expect(() => {
      return parseFormData({});
    }).toThrow(ParseError);
  });

  it("throws ParseError when data[1] is missing", () => {
    expect(() => {
      return parseFormData([null]);
    }).toThrow(ParseError);
  });

  it("throws ParseError on unknown question type code", () => {
    const bad = [null, [null, [[1, "Title", null, 999, null]]], null, "Title"];
    expect(() => {
      return parseFormData(bad);
    }).toThrow(ParseError);
  });
});

describe("parseFormHtml", () => {
  it("extracts and parses all-question-types.html end to end", () => {
    const html = readFileSync(`${fixturesDir}all-question-types.html`, "utf8");
    const schema = parseFormHtml(html);
    expect(schema.title).toBe("ez-gform fixture: all question types");
    expect(schema.multiPage).toBe(true);
    expect(schema.questions).toHaveLength(20);
    expect(schema.fbzx).toBeDefined();
  });
});
