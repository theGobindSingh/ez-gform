import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ParseError } from "./errors.js";
import { extractFbzx, extractPublicLoadData } from "./extract.js";

const fixturesDir = fileURLToPath(new URL("./__fixtures__/", import.meta.url));

describe("extractPublicLoadData", () => {
  it("extracts and JSON.parses the array from question-types-demo.html", () => {
    const html = readFileSync(`${fixturesDir}question-types-demo.html`, "utf8");
    const data = extractPublicLoadData(html);
    expect(Array.isArray(data)).toBe(true);
    expect((data as unknown[])[3]).toBe(
      "Understanding Different Question Types",
    );
  });

  it("extracts and JSON.parses the array from event-rsvp.html", () => {
    const html = readFileSync(`${fixturesDir}event-rsvp.html`, "utf8");
    const data = extractPublicLoadData(html);
    expect(Array.isArray(data)).toBe(true);
  });

  it("throws ParseError when the marker is absent", () => {
    expect(() => {
      return extractPublicLoadData("<html><body>nope</body></html>");
    }).toThrow(ParseError);
  });

  it("throws ParseError on a malformed assignment", () => {
    expect(() => {
      return extractPublicLoadData("var FB_PUBLIC_LOAD_DATA_ ");
    }).toThrow(ParseError);
  });

  it("throws ParseError when the array literal is unterminated", () => {
    expect(() => {
      return extractPublicLoadData("var FB_PUBLIC_LOAD_DATA_ = [1, 2, [3");
    }).toThrow(ParseError);
  });

  it("correctly bracket-matches nested arrays and brackets inside strings", () => {
    const html =
      'var FB_PUBLIC_LOAD_DATA_ = [1, "a ] weird [ string", [2, 3]];</script>';
    const data = extractPublicLoadData(html);
    expect(data).toEqual([1, "a ] weird [ string", [2, 3]]);
  });
});

describe("extractFbzx", () => {
  it("extracts fbzx from event-rsvp.html", () => {
    const html = readFileSync(`${fixturesDir}event-rsvp.html`, "utf8");
    const fbzx = extractFbzx(html);
    expect(fbzx).toBeDefined();
    expect(fbzx?.length).toBeGreaterThan(0);
  });

  it("returns undefined when no fbzx input is present", () => {
    expect(extractFbzx("<html></html>")).toBeUndefined();
  });
});
