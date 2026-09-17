# @ez-gform/react

A React hook that submits your own `<form>` to a Google Form. No backend.

## Install

```sh
pnpm add @ez-gform/react
```

## Usage

```tsx
import { useGoogleForm } from "@ez-gform/react";

function ContactForm() {
  const { register, registerCheckbox, submit, status, isSubmitting } =
    useGoogleForm({
      formId: "https://docs.google.com/forms/d/e/1FAIpQLS.../viewform",
    });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />

      <label>
        <input type="checkbox" {...registerCheckbox("entry.222", "Swimming")} />
        Swimming
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </button>
      {status === "sent" && <p>Thanks!</p>}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}
```

Find your form's `entry.N` ids with `npx @ez-gform/cli <google-form-url>`.

## Options

| Option          | What it does                                                         |
| --------------- | -------------------------------------------------------------------- |
| `formId`        | The form's URL or id. Required.                                      |
| `schema`        | A `FormSchema` (from the CLI). Turns on validation before submit.    |
| `validate`      | Set `false` to skip validation even when `schema` is given.          |
| `initialValues` | Starting values, keyed by `entry.N`.                                 |
| `resetOnSent`   | Reset to `initialValues` after a successful submit. Default `false`. |
| `onSent`        | Called after a submission is sent.                                   |
| `onError`       | Called with the result (and validation errors) when something fails. |
| `mode`          | `"no-cors"` (default) or `"cors"`. See below.                        |
| `fetch`         | Custom `fetch`, for tests or non-browser runtimes.                   |

## Returns

| Field                               | What it is                                                  |
| ----------------------------------- | ----------------------------------------------------------- |
| `register(entryId)`                 | Props for an input, textarea or select.                     |
| `registerCheckbox(entryId, option)` | Props for one checkbox option.                              |
| `submit`                            | Pass to `onSubmit`, or call it yourself. Returns a promise. |
| `status`                            | `idle`, `validating`, `submitting`, `sent`, `ok`, `error`.  |
| `isSubmitting`                      | `true` while a submission is in flight.                     |
| `errors`                            | Validation errors: `{ entryId, message }[]`.                |
| `values`, `setValue`, `setValues`   | Read or set values directly.                                |
| `reset`                             | Back to `initialValues`.                                    |
| `result`                            | The last `SubmitResult`.                                    |
| `prefillUrl`                        | Link to the Google Form prefilled with the current values.  |

Calling `submit()` again while one is in flight does not send twice.

## "sent" is not "succeeded"

Browsers can't read Google's response (the request is `no-cors`), so in the
browser `status` stops at `"sent"`: the request went out, but you can't know
whether Google accepted it. Outside the browser (Node), pass `mode: "cors"`
to get a real `"ok"` or `"error"`.
