import type { FormSchema } from "@ez-gform/core";
import { parseFormData } from "@ez-gform/core";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { useGoogleForm } from "./useGoogleForm.js";

const FORM_ID = "1FAIpQLtestformidtestformid1234567";

const loadDemoSchema = (): FormSchema => {
  const fixturePath = path.resolve(
    import.meta.dirname,
    "../../core/src/__fixtures__/question-types-demo.json",
  );
  const data = JSON.parse(readFileSync(fixturePath, "utf8"));
  return parseFormData(data);
};

describe("useGoogleForm status transitions", () => {
  it("goes idle -> submitting -> sent with mode: no-cors (default)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const onSent = vi.fn();

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        initialValues: { "entry.1": "hello" },
        fetch: fetchMock,
        onSent,
      });
    });

    expect(result.current.status).toBe("idle");

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit();
    });

    expect(submitResult).toEqual({ status: "sent" });
    expect(result.current.status).toBe("sent");
    expect(result.current.result).toEqual({ status: "sent" });
    expect(onSent).toHaveBeenCalledWith({ status: "sent" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("resolves status 'ok' when mode: cors and the response is ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        mode: "cors",
        fetch: fetchMock,
      });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe("ok");
  });

  it("goes to status 'error' and calls onError when fetch rejects", async () => {
    const fetchError = new Error("network down");
    const fetchMock = vi.fn().mockRejectedValue(fetchError);
    const onError = vi.fn();

    const { result } = renderHook(() => {
      return useGoogleForm({ formId: FORM_ID, fetch: fetchMock, onError });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.result).toEqual({
      status: "error",
      error: fetchError,
    });
    expect(onError).toHaveBeenCalledWith({
      status: "error",
      error: fetchError,
    });
  });

  it("blocks the network call and sets status 'error' when schema validation fails", async () => {
    const schema: FormSchema = {
      formId: FORM_ID,
      title: "Test",
      questions: [
        {
          id: "q1",
          entryId: "entry.1",
          title: "Required question",
          type: "short_answer",
          required: true,
        },
      ],
      sections: [],
      multiPage: false,
    };
    const fetchMock = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        schema,
        fetch: fetchMock,
        onError,
      });
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("error");
    expect(result.current.errors).toEqual([
      {
        entryId: "entry.1",
        message:
          'Missing required answer for question "Required question" (entry.1)',
      },
    ]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[1]).toEqual(result.current.errors);
  });

  it("reset() clears values, status, and errors back to initialValues", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        initialValues: { "entry.1": "start" },
        fetch: fetchMock,
      });
    });

    act(() => {
      result.current.setValue("entry.1", "changed");
    });
    expect(result.current.values).toEqual({ "entry.1": "changed" });

    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.status).toBe("sent");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.errors).toEqual([]);
    expect(result.current.values).toEqual({ "entry.1": "start" });
  });

  it("resetOnSent resets values automatically after a successful submit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        initialValues: { "entry.1": "start" },
        fetch: fetchMock,
        resetOnSent: true,
      });
    });

    act(() => {
      result.current.setValue("entry.1", "changed");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.values).toEqual({ "entry.1": "start" });
  });

  it("a submit while already submitting reuses the in-flight promise instead of double-fetching", async () => {
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderHook(() => {
      return useGoogleForm({ formId: FORM_ID, fetch: fetchMock });
    });

    let firstPromise!: Promise<unknown>;
    let secondPromise!: Promise<unknown>;
    act(() => {
      firstPromise = result.current.submit();
      secondPromise = result.current.submit();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch({ ok: true, status: 200 });
      await firstPromise;
      await secondPromise;
    });

    expect(await firstPromise).toEqual(await secondPromise);
  });

  it("multi-page fields (fbzx / pageHistory / partialResponse) are included in the submitted body when schema.multiPage is true", async () => {
    const schema = loadDemoSchema();
    expect(schema.multiPage).toBe(true);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const { result } = renderHook(() => {
      return useGoogleForm({
        formId: FORM_ID,
        schema,
        validate: false,
        fetch: fetchMock,
        mode: "cors",
      });
    });

    await act(async () => {
      await result.current.submit();
    });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = new URLSearchParams(requestInit.body as string);
    expect(body.has("fbzx")).toBe(true);
    expect(body.has("pageHistory")).toBe(true);
    expect(body.has("partialResponse")).toBe(true);
  });
});

function TextFieldTestForm() {
  const { register, values } = useGoogleForm({
    formId: FORM_ID,
    initialValues: { "entry.1": "" },
  });
  const current = values["entry.1"];
  return (
    <form>
      <input aria-label="name" {...register("entry.1")} />
      <output data-testid="out">
        {typeof current === "string" ? current : ""}
      </output>
    </form>
  );
}

function CheckboxTestForm() {
  const { registerCheckbox, values } = useGoogleForm({
    formId: FORM_ID,
    initialValues: { "entry.2": [] },
  });
  return (
    <form>
      <input
        type="checkbox"
        aria-label="swimming"
        {...registerCheckbox("entry.2", "Swimming")}
      />
      <input
        type="checkbox"
        aria-label="hiking"
        {...registerCheckbox("entry.2", "Hiking")}
      />
      <output data-testid="out">{JSON.stringify(values["entry.2"])}</output>
    </form>
  );
}

describe("useGoogleForm register / registerCheckbox wiring", () => {
  it("register() wires a text input's value/onChange through a real <form>", async () => {
    const user = userEvent.setup();

    render(<TextFieldTestForm />);
    const input = screen.getByLabelText("name");
    await user.type(input, "hi");

    expect(screen.getByTestId("out").textContent).toBe("hi");
  });

  it("registerCheckbox() toggles membership in a string[] value", async () => {
    const user = userEvent.setup();

    render(<CheckboxTestForm />);
    await user.click(screen.getByLabelText("swimming"));
    expect(screen.getByTestId("out").textContent).toBe('["Swimming"]');

    await user.click(screen.getByLabelText("hiking"));
    expect(screen.getByTestId("out").textContent).toBe('["Swimming","Hiking"]');

    await user.click(screen.getByLabelText("swimming"));
    expect(screen.getByTestId("out").textContent).toBe('["Hiking"]');
  });
});
