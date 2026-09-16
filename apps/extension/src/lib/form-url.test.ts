import { describe, expect, it } from "vitest";
import { parseFormUrl } from "./form-url";

describe("parseFormUrl", () => {
  it("parses a published form URL", () => {
    expect(
      parseFormUrl("https://docs.google.com/forms/d/e/1FAIpQLSabcDEF1234567890abcdefghij/viewform"),
    ).toEqual({ kind: "published", id: "1FAIpQLSabcDEF1234567890abcdefghij" });
  });

  it("parses an edit form URL", () => {
    expect(
      parseFormUrl("https://docs.google.com/forms/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit"),
    ).toEqual({ kind: "edit", id: "1AbCdEfGhIjKlMnOpQrStUvWxYz" });
  });

  it("parses a multi-account edit form URL", () => {
    expect(
      parseFormUrl("https://docs.google.com/forms/u/2/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit"),
    ).toEqual({ kind: "edit", id: "1AbCdEfGhIjKlMnOpQrStUvWxYz" });
  });

  it("returns null for a non-form URL", () => {
    expect(parseFormUrl("https://docs.google.com/document/d/abc123/edit")).toBeNull();
    expect(parseFormUrl("https://example.com/forms/d/e/abc/viewform")).toBeNull();
    expect(parseFormUrl("not a url")).toBeNull();
  });
});
