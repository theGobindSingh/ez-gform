import { describe, expect, it } from "vitest";
import { toIdentifier, toPascalCase } from "./names.js";

describe("toPascalCase", () => {
  it("converts a title with spaces to PascalCase", () => {
    expect(toPascalCase("Event RSVP Form")).toBe("EventRsvpForm");
  });

  it("strips punctuation", () => {
    expect(toPascalCase("Booking Request - 2024!")).toBe("BookingRequest2024");
  });

  it("falls back to Form for an empty/unusable string", () => {
    expect(toPascalCase("")).toBe("Form");
    expect(toPascalCase("!!!")).toBe("Form");
  });
});

describe("toIdentifier", () => {
  it("converts a title to camelCase", () => {
    expect(toIdentifier("Event RSVP Form")).toBe("eventRsvpForm");
  });

  it("prefixes a leading digit", () => {
    expect(toIdentifier("2024 Booking")).toBe("_2024Booking");
  });

  it("falls back to Form for an empty string", () => {
    expect(toIdentifier("")).toBe("Form");
  });

  it("falls back to Form for emoji-only input", () => {
    expect(toIdentifier("🎉")).toBe("Form");
  });

  it("suffixes an underscore for a reserved word (capitalized)", () => {
    expect(toIdentifier("Delete")).toBe("delete_");
  });

  it("suffixes an underscore for a reserved word (lowercase)", () => {
    expect(toIdentifier("class")).toBe("class_");
  });

  it("prefixes a leading digit with words following", () => {
    expect(toIdentifier("123 go")).toBe("_123Go");
  });
});
