# @ez-gform/react

React hooks for submitting a custom `<form>` UI straight to a Google Form,
with no backend. Built on `@ez-gform/core`.

## Install

```sh
pnpm add @ez-gform/react @ez-gform/core react
```

## `useGoogleForm`

A controlled-values hook with an explicit `status` state machine
(`idle` → `validating`? → `submitting` → `sent` / `ok` / `error`) and a
promise-returning `submit`. A second `submit()` call while one is already
in flight reuses the same in-flight promise instead of double-posting.

```tsx
import { useGoogleForm } from "@ez-gform/react";
import type { FormSchema } from "@ez-gform/react";

function ContactForm({ schema }: { schema: FormSchema }) {
  const { register, registerCheckbox, submit, status, errors, isSubmitting } =
    useGoogleForm({
      formId: schema.formId, // bare id, e/<id>, or any docs.google.com/forms URL
      schema, // enables validation + multi-page field support
      initialValues: { "entry.111": "" },
      onSent: (result) => console.log("sent:", result),
      onError: (result, validationErrors) =>
        console.error(result, validationErrors),
    });

  return (
    <form onSubmit={submit}>
      <input aria-label="Your name" {...register("entry.111")} />

      <label>
        <input type="checkbox" {...registerCheckbox("entry.222", "Swimming")} />
        Swimming
      </label>

      {errors.map((e) => (
        <p key={e.entryId}>{e.message}</p>
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </button>
      {status === "sent" && (
        <p>Thanks! (browser submissions are fire-and-forget — see below)</p>
      )}
      {status === "error" && <p>Something went wrong.</p>}
    </form>
  );
}
```

`submit` also accepts being passed directly as a form's `onSubmit` (it calls
`event.preventDefault()` for you) or called imperatively — either way it
resolves a `SubmitResult`. In the browser, submissions use
`fetch(url, { mode: "no-cors" })`, so Google's response is opaque and
`status` can only ever reach `"sent"`, never a confirmed `"ok"` — pass
`mode: "cors"` (e.g. from a Node/CLI context) to get a real `"ok"`/`"error"`
outcome.

Also returned: `values`, `setValue`, `setValues`, `reset`, `result`,
`prefillUrl` (a `/viewform?usp=pp_url&...` link prefilled with the current
values).
