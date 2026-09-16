import type { FormSchema, FormValues } from "@ez-gform/types";
import { describe, expect, it } from "vitest";
import { encodeValues, validateValues } from "./encode.js";

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

  it("includes hour/minute when present", () => {
    const params = encodeValues({
      "entry.1": { year: 2026, month: 9, day: 16, hour: 8, minute: 5 },
    });
    expect(params.get("entry.1_hour")).toBe("8");
    expect(params.get("entry.1_minute")).toBe("5");
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
});

describe("encodeValues — schema-aware checkbox sentinel", () => {
  const schema: FormSchema = {
    formId: "abc",
    title: "t",
    questions: [
      {
        id: "1",
        entryId: "entry.1",
        title: "Checkbox Q",
        type: "checkboxes",
        required: false,
      },
      {
        id: "2",
        entryId: "entry.2",
        title: "Text Q",
        type: "short_answer",
        required: false,
      },
    ],
    sections: [{ title: "t", questionIds: ["1", "2"] }],
    multiPage: false,
  };

  it("adds entry.N_sentinel for checkbox questions present in values, when schema is given", () => {
    const params = encodeValues({ "entry.1": ["A"], "entry.2": "hi" }, schema);
    expect(params.has("entry.1_sentinel")).toBe(true);
    expect(params.get("entry.1_sentinel")).toBe("");
    expect(params.has("entry.2_sentinel")).toBe(false);
  });

  it("does not add a sentinel when no schema is given", () => {
    const params = encodeValues({ "entry.1": ["A"] });
    expect(params.has("entry.1_sentinel")).toBe(false);
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
