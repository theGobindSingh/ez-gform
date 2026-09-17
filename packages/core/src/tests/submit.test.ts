import type { FormSchema } from "@ez-gform/types";
import { describe, expect, it, vi } from "vitest";
import { buildPrefillUrl, buildSubmitBody, submitForm } from "../submit.js";

const ID = "1FAIpQLScXpdCnyzcv0h5_3giJaB9vP_00UIXggzt4UAfMamwPApnINw";

describe("buildPrefillUrl", () => {
  it("builds a viewform URL with usp=pp_url and encoded entries", () => {
    const url = buildPrefillUrl(ID, { "entry.1": "hello" });
    expect(
      url.startsWith(`https://docs.google.com/forms/d/e/${ID}/viewform?`),
    ).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("usp")).toBe("pp_url");
    expect(parsed.searchParams.get("entry.1")).toBe("hello");
  });
});

describe("buildSubmitBody", () => {
  it("always includes submit=Submit", () => {
    const body = buildSubmitBody(ID, { "entry.1": "hi" });
    expect(body.get("submit")).toBe("Submit");
  });

  it("does not add multi-page fields for a single-page schema", () => {
    const schema: FormSchema = {
      formId: ID,
      title: "t",
      questions: [],
      sections: [{ title: "t", questionIds: [] }],
      multiPage: false,
    };
    const body = buildSubmitBody(ID, {}, schema);
    expect(body.has("fbzx")).toBe(false);
    expect(body.has("pageHistory")).toBe(false);
  });

  it("adds fbzx/pageHistory/partialResponse for a multi-page schema", () => {
    const schema: FormSchema = {
      formId: ID,
      title: "t",
      questions: [],
      sections: [
        { title: "p0", questionIds: [] },
        { title: "p1", questionIds: [] },
        { title: "p2", questionIds: [] },
      ],
      multiPage: true,
      fbzx: "-1234567890123456789",
    };
    const body = buildSubmitBody(ID, {}, schema);
    expect(body.get("fbzx")).toBe("-1234567890123456789");
    expect(body.get("pageHistory")).toBe("0,1,2");
    expect(body.get("partialResponse")).toBe(
      JSON.stringify([null, null, "-1234567890123456789"]),
    );
  });

  it("generates a random fbzx if the schema doesn't carry one", () => {
    const schema: FormSchema = {
      formId: ID,
      title: "t",
      questions: [],
      sections: [
        { title: "p0", questionIds: [] },
        { title: "p1", questionIds: [] },
      ],
      multiPage: true,
    };
    const body = buildSubmitBody(ID, {}, schema);
    expect(body.get("fbzx")).toMatch(/^-\d{19}$/);
  });
});

describe("submitForm", () => {
  it("returns {status: 'sent'} on a successful no-cors fetch", async () => {
    const fakeFetch = vi
      .fn()
      .mockResolvedValue({ type: "opaque", status: 0, ok: false });
    const result = await submitForm(
      ID,
      { "entry.1": "hi" },
      { fetch: fakeFetch as unknown as typeof fetch },
    );
    expect(result).toEqual({ status: "sent" });
    expect(fakeFetch).toHaveBeenCalledWith(
      `https://docs.google.com/forms/d/e/${ID}/formResponse`,
      expect.objectContaining({ method: "POST", mode: "no-cors" }),
    );
  });

  it("returns {status: 'error'} when fetch rejects", async () => {
    const err = new Error("network down");
    const fakeFetch = vi.fn().mockRejectedValue(err);
    const result = await submitForm(
      ID,
      { "entry.1": "hi" },
      { fetch: fakeFetch as unknown as typeof fetch },
    );
    expect(result).toEqual({ status: "error", error: err });
  });

  it("returns {status: 'ok', httpStatus} for a 2xx response in cors mode", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const result = await submitForm(
      ID,
      { "entry.1": "hi" },
      { fetch: fakeFetch as unknown as typeof fetch, mode: "cors" },
    );
    expect(result).toEqual({ status: "ok", httpStatus: 200 });
  });

  it("returns {status: 'error', httpStatus} for a non-2xx response in cors mode", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    const result = await submitForm(
      ID,
      { "entry.1": "hi" },
      { fetch: fakeFetch as unknown as typeof fetch, mode: "cors" },
    );
    expect(result.status).toBe("error");
    expect((result as { httpStatus?: number }).httpStatus).toBe(400);
  });
});
