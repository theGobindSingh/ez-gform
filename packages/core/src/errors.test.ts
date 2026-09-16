import { describe, expect, it } from "vitest";
import { ParseError, ValidationError } from "./errors.js";

describe("ParseError", () => {
  it("is an Error subclass with the right name/message", () => {
    const err = new ParseError("bad shape");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ParseError");
    expect(err.message).toBe("bad shape");
  });
});

describe("ValidationError", () => {
  it("carries structured errors alongside the message", () => {
    const errors = [{ entryId: "entry.1", message: "required" }];
    const err = new ValidationError("validation failed", errors);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ValidationError");
    expect(err.errors).toBe(errors);
  });
});
