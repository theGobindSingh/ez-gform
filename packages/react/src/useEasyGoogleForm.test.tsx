import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent } from "react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useEasyGoogleForm } from "./useEasyGoogleForm.js";

const FORM_ID = "1FAIpQLtestformidtestformid1234567";

function LegacyStyleForm({
  onSubmitResult,
}: {
  onSubmitResult: (result: unknown) => void;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const onSubmit = useEasyGoogleForm({
    formRef,
    gFormId: FORM_ID,
    links: [
      { entryId: "entry.1", formId: "first-name", type: "text" },
      { entryId: "entry.2", formId: "bio", type: "textarea" },
      { entryId: "entry.3", formId: "country", type: "dropdown" },
      { entryId: "entry.4", formId: "hobbies", type: "checkbox" },
      { entryId: "entry.5", formId: "dob", type: "date" },
      { entryId: "entry.6", formId: "wake-time", type: "time" },
    ],
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(event).then((result) => {
      onSubmitResult(result);
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input id="first-name" defaultValue="Ada" />
      <textarea id="bio" defaultValue="hello world" />
      <select id="country" defaultValue="NZ">
        <option value="AU">AU</option>
        <option value="NZ">NZ</option>
      </select>
      <div id="hobbies">
        <input type="checkbox" name="hobbies" value="Swimming" defaultChecked />
        <input type="checkbox" name="hobbies" value="Hiking" defaultChecked />
        <input type="checkbox" name="hobbies" value="Reading" />
      </div>
      <div id="dob">
        <input name="year" defaultValue="1990" />
        <input name="month" defaultValue="4" />
        <input name="day" defaultValue="12" />
      </div>
      <div id="wake-time">
        <input name="hour" defaultValue="7" />
        <input name="minute" defaultValue="30" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function LegacyStyleFormWithExtras({
  onSubmitExtra,
}: {
  onSubmitExtra: () => void;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const onSubmit = useEasyGoogleForm({
    formRef,
    gFormId: FORM_ID,
    links: [{ entryId: "entry.1", formId: "first-name", type: "text" }],
    extraEntries: [{ entryId: "entry.99", value: "source=test" }],
    onSubmitExtra,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(event);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input id="first-name" defaultValue="Ada" />
      <button type="submit">Submit</button>
    </form>
  );
}

// The compat hook always delegates to core's `submitForm`, which uses the
// ambient `fetch` unless a custom one is threaded through — the legacy API
// it mirrors has no `fetch` option, so we stub the global here.
describe("useEasyGoogleForm (legacy compat)", () => {
  it("reads text/textarea/dropdown/checkbox/date/time fields from the DOM and resolves a SubmitResult", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    globalThis.fetch = fetchMock;

    const onSubmitResult = vi.fn();
    const user = userEvent.setup();

    render(<LegacyStyleForm onSubmitResult={onSubmitResult} />);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Submit" }));
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(FORM_ID);
    const body = new URLSearchParams(init.body as string);

    expect(body.get("entry.1")).toBe("Ada");
    expect(body.get("entry.2")).toBe("hello world");
    expect(body.get("entry.3")).toBe("NZ");
    expect(body.getAll("entry.4")).toEqual(["Swimming", "Hiking"]);
    expect(body.get("entry.5_year")).toBe("1990");
    expect(body.get("entry.5_month")).toBe("4");
    expect(body.get("entry.5_day")).toBe("12");
    expect(body.get("entry.6_hour")).toBe("07");
    expect(body.get("entry.6_minute")).toBe("30");

    expect(onSubmitResult).toHaveBeenCalledWith({ status: "sent" });

    globalThis.fetch = originalFetch;
  });

  it("supports extraEntries and calls onSubmitExtra", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    globalThis.fetch = fetchMock;
    const onSubmitExtra = vi.fn();

    render(<LegacyStyleFormWithExtras onSubmitExtra={onSubmitExtra} />);
    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Submit" }));
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = new URLSearchParams(init.body as string);
    expect(body.get("entry.99")).toBe("source=test");
    expect(onSubmitExtra).toHaveBeenCalledTimes(1);

    globalThis.fetch = originalFetch;
  });
});
