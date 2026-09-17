import { describe, expect, it } from "vitest";
import { formUrls, normalizeFormId } from "../url.js";

const ID = "1FAIpQLScXpdCnyzcv0h5_3giJaB9vP_00UIXggzt4UAfMamwPApnINw";

describe("normalizeFormId", () => {
  it("accepts a bare id", () => {
    expect(normalizeFormId(ID)).toBe(ID);
  });

  it("accepts an 'e/<id>' string", () => {
    expect(normalizeFormId(`e/${ID}`)).toBe(ID);
  });

  it("accepts a full viewform URL", () => {
    expect(
      normalizeFormId(`https://docs.google.com/forms/d/e/${ID}/viewform`),
    ).toBe(ID);
  });

  it("accepts a viewform URL with a multi-account /u/<n>/ segment", () => {
    expect(
      normalizeFormId(`https://docs.google.com/forms/u/0/d/e/${ID}/viewform`),
    ).toBe(ID);
  });

  it("accepts an editor /d/<id>/edit URL", () => {
    expect(normalizeFormId(`https://docs.google.com/forms/d/${ID}/edit`)).toBe(
      ID,
    );
  });

  it("accepts a URL with query params and a trailing slash", () => {
    expect(
      normalizeFormId(
        `https://docs.google.com/forms/d/e/${ID}/viewform?usp=sf_link`,
      ),
    ).toBe(ID);
    expect(
      normalizeFormId(`https://docs.google.com/forms/d/e/${ID}/viewform/`),
    ).toBe(ID);
  });

  it("throws on garbage input", () => {
    expect(() => {
      return normalizeFormId("");
    }).toThrow();
    expect(() => {
      return normalizeFormId("not a form id at all, just a sentence");
    }).toThrow();
    expect(() => {
      return normalizeFormId("https://example.com/not-a-form");
    }).toThrow();
  });
});

describe("formUrls", () => {
  it("builds viewform and formResponse URLs", () => {
    const urls = formUrls(ID);
    expect(urls.viewform).toBe(
      `https://docs.google.com/forms/d/e/${ID}/viewform`,
    );
    expect(urls.formResponse).toBe(
      `https://docs.google.com/forms/d/e/${ID}/formResponse`,
    );
  });

  it("normalizes a URL input too", () => {
    const urls = formUrls(`https://docs.google.com/forms/d/e/${ID}/viewform`);
    expect(urls.viewform).toBe(
      `https://docs.google.com/forms/d/e/${ID}/viewform`,
    );
  });
});
