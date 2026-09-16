import { describe, expect, it, vi } from "vitest";
import { relayGetSource, type TabsApi } from "./relay.js";

describe("relayGetSource", () => {
  it("returns a parse error when there is no active tab", async () => {
    const tabs: TabsApi = {
      query: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn(),
    };
    const result = await relayGetSource(tabs);
    expect(result.type).toBe("EZ_GFORM_PARSE_ERROR");
  });

  it("returns a parse error when the active tab is not a Google Form", async () => {
    const tabs: TabsApi = {
      query: vi.fn().mockResolvedValue([{ id: 1, url: "https://example.com" }]),
      sendMessage: vi.fn(),
    };
    const result = await relayGetSource(tabs);
    expect(result.type).toBe("EZ_GFORM_PARSE_ERROR");
    expect(tabs.sendMessage).not.toHaveBeenCalled();
  });

  it("relays EZ_GFORM_GET_SOURCE to the active Google Forms tab", async () => {
    const tabs: TabsApi = {
      query: vi
        .fn()
        .mockResolvedValue([
          { id: 42, url: "https://docs.google.com/forms/d/e/abc/viewform" },
        ]),
      sendMessage: vi.fn().mockResolvedValue({
        type: "EZ_GFORM_SOURCE",
        html: "<html/>",
        url: "https://docs.google.com/forms/d/e/abc/viewform",
      }),
    };
    const result = await relayGetSource(tabs);
    expect(tabs.sendMessage).toHaveBeenCalledWith(42, {
      type: "EZ_GFORM_GET_SOURCE",
    });
    expect(result.type).toBe("EZ_GFORM_SOURCE");
  });

  it("returns a parse error when sendMessage rejects (no content script)", async () => {
    const tabs: TabsApi = {
      query: vi
        .fn()
        .mockResolvedValue([
          { id: 42, url: "https://docs.google.com/forms/d/e/abc/viewform" },
        ]),
      sendMessage: vi.fn().mockRejectedValue(new Error("no receiver")),
    };
    const result = await relayGetSource(tabs);
    expect(result.type).toBe("EZ_GFORM_PARSE_ERROR");
  });
});
