import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const request = (query: string): Request => {
  return new Request(`http://localhost/api/schema${query}`);
};

describe("GET /api/schema — input validation", () => {
  it("returns 400 when formId is missing", async () => {
    const response = await GET(request(""));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/formId/i);
  });

  it("returns 400 when formId is an empty string", async () => {
    const response = await GET(request("?formId=%20%20"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when formId is not a recognizable form URL or id", async () => {
    const response = await GET(request("?formId=not a url at all"));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/could not recognize/i);
  });

  it("accepts a bare form id and a docs.google.com URL alike (no 400)", async () => {
    // Stub fetch so this stays a validation test, not a network test — a
    // syntactically valid id/URL should pass normalizeFormId and reach the
    // fetch step at all, proving validation didn't reject a well-formed id.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        return new Response("<html></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }),
    );

    const bareId = await GET(
      request(
        "?formId=1FAIpQLSeea5PBMuJUpTG9ephwFbt4NApN1TPQi6Yc5cNNw0vgPm9Umw",
      ),
    );
    expect(bareId.status).not.toBe(400);

    const fullUrl = await GET(
      request(
        "?formId=" +
          encodeURIComponent(
            "https://docs.google.com/forms/d/e/1FAIpQLSeea5PBMuJUpTG9ephwFbt4NApN1TPQi6Yc5cNNw0vgPm9Umw/viewform",
          ),
      ),
    );
    expect(fullUrl.status).not.toBe(400);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
