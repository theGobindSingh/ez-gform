import { describe, expect, it } from "vitest";
import { resolveSource } from "./resolve-source.js";

const ID = "1FAIpQLSciCcNILfeSdgUavm_GYuCFE_G8InD1YVkIWAiTU_B3-l9AkA";

describe("resolveSource", () => {
  it("reads the DOM directly for a viewform URL", () => {
    const result = resolveSource(
      `https://docs.google.com/forms/d/e/${ID}/viewform`,
    );
    expect(result.shouldFetch).toBe(false);
  });

  it("fetches the published viewform for an editor URL", () => {
    const result = resolveSource(`https://docs.google.com/forms/d/${ID}/edit`);
    expect(result.shouldFetch).toBe(true);
    expect(result.fetchUrl).toBe(
      `https://docs.google.com/forms/d/e/${ID}/viewform`,
    );
  });

  it("handles multi-account /u/<n>/ editor URLs", () => {
    const result = resolveSource(
      `https://docs.google.com/forms/u/1/d/${ID}/edit`,
    );
    expect(result.shouldFetch).toBe(true);
    expect(result.fetchUrl).toBe(
      `https://docs.google.com/forms/d/e/${ID}/viewform`,
    );
  });

  it("throws when the URL has no recognizable form id", () => {
    expect(() => {
      return resolveSource("https://docs.google.com/forms/edit");
    }).toThrow();
  });
});
