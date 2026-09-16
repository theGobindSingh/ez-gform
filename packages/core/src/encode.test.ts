import type { FormSchema, FormValues } from "@ez-gform/types";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { encodeValues, validateValues } from "./encode.js";
import { parseFormData } from "./parse.js";

const fixturesDir = fileURLToPath(new URL("./__fixtures__/", import.meta.url));

const loadFixture = (slug: string): unknown => {
  return JSON.parse(readFileSync(`${fixturesDir}${slug}.json`, "utf8"));
};

describe("encodeValues — scalar text/number", () => {
  it("encodes a plain string", () => {
    const params = encodeValues({ "entry.1": "hello world" });
    expect(params.get("entry.1")).toBe("hello world");
  });

  it("encodes a number", () => {
    const params = encodeValues({ "entry.1": 5 });
    expect(params.get("entry.1")).toBe("5");
  });

  it("skips null, undefined, and empty string", () => {
    const params = encodeValues({
      "entry.1": null,
      "entry.2": undefined,
      "entry.3": "",
    });
    expect([...params.keys()]).toHaveLength(0);
  });

  it("preserves unicode and & / = characters via URLSearchParams (never hand-encoded)", () => {
    const params = encodeValues({ "entry.1": "héllo & wörld = ok 日本語" });
    expect(params.get("entry.1")).toBe("héllo & wörld = ok 日本語");
    expect(params.toString()).toContain("entry.1=");
    expect(params.toString()).not.toContain("héllo & wörld"); // must be percent-encoded in the serialized form
  });
});

describe("encodeValues — checkbox multi-value (string[])", () => {
  it("repeats the same entry.N", () => {
    const params = encodeValues({ "entry.1": ["A", "B", "C"] });
    expect(params.getAll("entry.1")).toEqual(["A", "B", "C"]);
  });

  it("emits nothing for an empty checkbox array", () => {
    const params = encodeValues({ "entry.1": [] });
    expect([...params.keys()]).toHaveLength(0);
  });
});

describe("encodeValues — 'Other' option", () => {
  it("encodes a single OtherValue", () => {
    const params = encodeValues({ "entry.1": { other: "my custom answer" } });
    expect(params.get("entry.1")).toBe("__other_option__");
    expect(params.get("entry.1.other_option_response")).toBe(
      "my custom answer",
    );
  });

  it("encodes an array mixing strings and OtherValue (checkbox + other)", () => {
    const params = encodeValues({ "entry.1": ["A", { other: "custom" }] });
    expect(params.getAll("entry.1")).toEqual(["A", "__other_option__"]);
    expect(params.get("entry.1.other_option_response")).toBe("custom");
  });
});

describe("encodeValues — date", () => {
  it("encodes year/month/day", () => {
    const params = encodeValues({
      "entry.1": { year: 2026, month: 9, day: 16 },
    });
    expect(params.get("entry.1_year")).toBe("2026");
    expect(params.get("entry.1_month")).toBe("9");
    expect(params.get("entry.1_day")).toBe("16");
  });

  it("omits _year when year is undefined", () => {
    const params = encodeValues({ "entry.1": { month: 9, day: 16 } });
    expect(params.has("entry.1_year")).toBe(false);
    expect(params.get("entry.1_month")).toBe("9");
    expect(params.get("entry.1_day")).toBe("16");
  });

  it("does not zero-pad month/day (Google accepts unpadded values)", () => {
    const params = encodeValues({
      "entry.1": { year: 2026, month: 9, day: 7 },
    });
    expect(params.get("entry.1_month")).toBe("9");
    expect(params.get("entry.1_day")).toBe("7");
  });

  it("zero-pads hour/minute when a date value also carries a time, like the TimeValue branch", () => {
    const params = encodeValues({
      "entry.1": { year: 2026, month: 9, day: 17, hour: 9, minute: 5 },
    });
    expect(params.get("entry.1_hour")).toBe("09");
    expect(params.get("entry.1_minute")).toBe("05");
  });
});

describe("encodeValues — time (zero-padded)", () => {
  it("zero-pads hour and minute to 2 digits", () => {
    const params = encodeValues({ "entry.1": { hour: 8, minute: 5 } });
    expect(params.get("entry.1_hour")).toBe("08");
    expect(params.get("entry.1_minute")).toBe("05");
  });

  it("does not pad already-2-digit values", () => {
    const params = encodeValues({ "entry.1": { hour: 23, minute: 59 } });
    expect(params.get("entry.1_hour")).toBe("23");
    expect(params.get("entry.1_minute")).toBe("59");
  });

  it("pads a bare TimeValue the same as a DateValue carrying hour/minute", () => {
    const timeOnly = encodeValues({ "entry.1": { hour: 9, minute: 5 } });
    const dateWithTime = encodeValues({
      "entry.1": { year: 2026, month: 9, day: 17, hour: 9, minute: 5 },
    });
    expect(timeOnly.get("entry.1_hour")).toBe("09");
    expect(timeOnly.get("entry.1_minute")).toBe("05");
    expect(dateWithTime.get("entry.1_hour")).toBe(timeOnly.get("entry.1_hour"));
    expect(dateWithTime.get("entry.1_minute")).toBe(
      timeOnly.get("entry.1_minute"),
    );
  });
});

describe("encodeValues — grid row maps", () => {
  it("encodes each row's own entry.N for a radio grid", () => {
    const params = encodeValues({
      "entry.1": { "entry.10": "Agree", "entry.11": "Disagree" },
    });
    expect(params.get("entry.10")).toBe("Agree");
    expect(params.get("entry.11")).toBe("Disagree");
    expect(params.has("entry.1")).toBe(false);
  });

  it("encodes repeated entry.N per row for a checkbox grid (row -> string[])", () => {
    const params = encodeValues({
      "entry.1": { "entry.10": ["Japan", "Canada"] },
    });
    expect(params.getAll("entry.10")).toEqual(["Japan", "Canada"]);
  });

  it("also supports row entryIds passed directly at the top level", () => {
    const params = encodeValues({ "entry.10": "Agree" });
    expect(params.get("entry.10")).toBe("Agree");
  });

  it("encodes a live grid fixture identically via nested row map or flat row ids", () => {
    const schema = parseFormData(loadFixture("event-feedback"));
    const grid = schema.questions.find((q) => {
      return q.title === "How satisfied were you with the following:";
    });
    const rows = grid?.rows ?? [];
    expect(rows.length).toBeGreaterThan(1);
    const [rowA, rowB] = rows;

    const nested = encodeValues({
      [grid!.entryId]: {
        [rowA!.entryId]: "Agree",
        [rowB!.entryId]: "Disagree",
      },
    });
    const flat = encodeValues({
      [rowA!.entryId]: "Agree",
      [rowB!.entryId]: "Disagree",
    });

    expect(nested.toString()).toBe(flat.toString());
  });
});

describe("validateValues", () => {
  const schema: FormSchema = {
    formId: "abc",
    title: "t",
    questions: [
      {
        id: "1",
        entryId: "entry.1",
        title: "Required text",
        type: "short_answer",
        required: true,
      },
      {
        id: "2",
        entryId: "entry.2",
        title: "Optional text",
        type: "short_answer",
        required: false,
      },
      {
        id: "3",
        entryId: "entry.10",
        title: "Required grid",
        type: "grid",
        required: true,
        rows: [
          { entryId: "entry.10", label: "Row A" },
          { entryId: "entry.11", label: "Row B" },
        ],
      },
    ],
    sections: [{ title: "t", questionIds: ["1", "2", "3"] }],
    multiPage: false,
  };

  it("ok:true when all required entries are present and no unknown ids", () => {
    const values: FormValues = {
      "entry.1": "hi",
      "entry.10": "a",
      "entry.11": "b",
    };
    expect(validateValues(values, schema)).toEqual({ ok: true });
  });

  it("flags unknown entry ids", () => {
    const result = validateValues(
      { "entry.999": "x", "entry.1": "hi", "entry.10": "a", "entry.11": "b" },
      schema,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => {
          return e.entryId === "entry.999";
        }),
      ).toBe(true);
    }
  });

  it("flags missing required questions (including per-row for grids)", () => {
    const result = validateValues({}, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const ids = result.errors.map((e) => {
        return e.entryId;
      });
      expect(ids).toContain("entry.1");
      expect(ids).toContain("entry.10");
      expect(ids).toContain("entry.11");
    }
  });

  it("encodeValues itself never throws on unknown/missing data", () => {
    expect(() => {
      return encodeValues({ "entry.999": "x" }, schema);
    }).not.toThrow();
  });
});
