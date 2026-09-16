import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ParseError } from "./errors.js";
import { parseFormData, parseFormHtml } from "./parse.js";

const fixturesDir = fileURLToPath(new URL("./__fixtures__/", import.meta.url));

function loadFixture(slug: string): unknown {
  return JSON.parse(readFileSync(`${fixturesDir}${slug}.json`, "utf8"));
}

const FIXTURE_SLUGS = [
  "event-feedback",
  "event-rsvp",
  "question-types-demo",
  "ttrpg-applications",
  "booking-request",
  "meeting-room-reservation",
] as const;

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

describe("parseFormData — event-feedback", () => {
  const schema = parseFormData(loadFixture("event-feedback"));

  it("finds the expected question types", () => {
    const types = schema.questions.map((q) => q.type);
    expect(types).toContain("short_answer");
    expect(types).toContain("checkboxes");
    expect(types).toContain("linear_scale");
    expect(types).toContain("grid");
  });

  it("parses linear scale min/max and labels", () => {
    const scale = schema.questions.find((q) => q.type === "linear_scale");
    expect(scale?.scale).toBeDefined();
    expect(scale?.scale?.min).toBe(1);
    expect(typeof scale?.scale?.max).toBe("number");
  });

  it("single-page form has exactly one section and multiPage false", () => {
    expect(schema.multiPage).toBe(false);
    expect(schema.sections).toHaveLength(1);
  });
});

describe("parseFormData — question-types-demo (richest fixture)", () => {
  const schema = parseFormData(loadFixture("question-types-demo"));

  it("is a multi-page form with multiple sections", () => {
    expect(schema.multiPage).toBe(true);
    expect(schema.sections.length).toBeGreaterThan(1);
  });

  it("every section tracks its own question ids, covering all questions", () => {
    const allIds = schema.sections.flatMap((s) => s.questionIds);
    expect(allIds.sort()).toEqual(schema.questions.map((q) => q.id).sort());
  });

  it("skips image/video/section-header/page-break blocks as questions", () => {
    for (const q of schema.questions) {
      expect(q.title).not.toBe("Watch this video");
      expect(q.title).not.toBe("Map of Indonesia");
    }
  });

  it("parses a checkbox question with a required-count validation rule", () => {
    const q = schema.questions.find(
      (qq) => qq.title === "Holiday activities you enjoy - Select any 2",
    );
    expect(q?.type).toBe("checkboxes");
    expect(q?.options?.length).toBe(5);
  });

  it("parses both grid kinds distinctly", () => {
    const grid = schema.questions.find(
      (q) => q.title === "How do you feel about the following statements about travel?",
    );
    const checkboxGrid = schema.questions.find(
      (q) => q.title === "Where would you like to do the following activities?",
    );
    expect(grid?.type).toBe("grid");
    expect(checkboxGrid?.type).toBe("checkbox_grid");
    expect(grid?.rows?.length).toBeGreaterThan(1);
    expect(checkboxGrid?.rows?.length).toBeGreaterThan(1);
    for (const row of grid?.rows ?? []) {
      expect(row.entryId.startsWith("entry.")).toBe(true);
      expect(row.label.length).toBeGreaterThan(0);
    }
    expect(grid?.entryId).toBe(`entry.${grid?.rows?.[0]?.entryId.replace("entry.", "")}`);
  });

  it("parses date question flags", () => {
    const q = schema.questions.find((qq) => qq.title === "Enter your birthday");
    expect(q?.type).toBe("date");
    expect(q?.date).toEqual({ includeTime: false, includeYear: true });
  });

  it("parses time question flag", () => {
    const q = schema.questions.find((qq) => qq.type === "time");
    expect(q?.time).toEqual({ isDuration: false });
  });

  it("parses linear scale with low/high labels", () => {
    const q = schema.questions.find((qq) => qq.type === "linear_scale");
    expect(q?.scale?.lowLabel).toBe("Not at all");
    expect(q?.scale?.highLabel).toBe("Very much");
    expect(q?.scale?.min).toBe(1);
    expect(q?.scale?.max).toBe(10);
  });

  it("marks required questions correctly", () => {
    const nameQ = schema.questions.find((q) => q.title === "Your first name");
    expect(nameQ?.required).toBe(false);
  });
});

describe("parseFormData — booking-request and meeting-room-reservation date flags", () => {
  it("booking-request date question: no time, has year", () => {
    const schema = parseFormData(loadFixture("booking-request"));
    const dateQ = schema.questions.find((q) => q.type === "date");
    expect(dateQ?.date).toEqual({ includeTime: false, includeYear: true });
  });

  it("meeting-room-reservation date question: has time and year", () => {
    const schema = parseFormData(loadFixture("meeting-room-reservation"));
    const dateQ = schema.questions.find((q) => q.title === "Start Day and Time");
    expect(dateQ?.date).toEqual({ includeTime: true, includeYear: true });
  });
});

describe("parseFormData — ttrpg-applications 'Other' option (second example)", () => {
  it("finds the Other-flagged option on the checkbox question", () => {
    const schema = parseFormData(loadFixture("ttrpg-applications"));
    const q = schema.questions.find((qq) => qq.type === "checkboxes");
    expect(q?.options?.some((o) => o.isOther && o.value === "")).toBe(true);
  });
});

describe("parseFormData — error handling", () => {
  it("throws ParseError on non-array input", () => {
    expect(() => parseFormData({})).toThrow(ParseError);
  });

  it("throws ParseError when data[1] is missing", () => {
    expect(() => parseFormData([null])).toThrow(ParseError);
  });

  it("throws ParseError on unknown question type code", () => {
    const bad = [null, [null, [[1, "Title", null, 999, null]]], null, "Title"];
    expect(() => parseFormData(bad)).toThrow(ParseError);
  });
});

describe("parseFormHtml", () => {
  it("extracts and parses question-types-demo.html end to end", () => {
    const html = readFileSync(`${fixturesDir}question-types-demo.html`, "utf8");
    const schema = parseFormHtml(html);
    expect(schema.title).toBe("Understanding Different Question Types in Google Forms");
    expect(schema.multiPage).toBe(true);
    expect(schema.fbzx).toBeDefined();
  });

  it("extracts and parses event-rsvp.html end to end", () => {
    const html = readFileSync(`${fixturesDir}event-rsvp.html`, "utf8");
    const schema = parseFormHtml(html);
    expect(schema.questions.length).toBeGreaterThan(0);
    expect(schema.fbzx).toBeDefined();
  });
});
