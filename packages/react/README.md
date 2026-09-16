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

## `useEasyGoogleForm` (deprecated compat shim)

Matches the legacy `use-easy-google-form` hook's `formRef`/`gFormId`/`links`
DOM-scraping signature, so existing consumers can migrate by changing only
the import:

```tsx
import useEasyGoogleForm from "@ez-gform/react"; // default export, drop-in
// or: import { useEasyGoogleForm } from "@ez-gform/react";

function LegacyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useEasyGoogleForm({
    formRef,
    gFormId: "1FAIpQLS...",
    links: [{ entryId: "entry.111", formId: "name", type: "text" }],
  });

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <input id="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Unlike the legacy hook, `onSubmit` **returns a promise that resolves with the
`SubmitResult`** instead of firing the request and forgetting about it, and
CSS id selectors are escaped internally (ids with spaces/leading digits no
longer throw). New code should prefer `useGoogleForm`, which takes a plain
values object instead of reading the DOM by id.
