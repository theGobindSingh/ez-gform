# @ez-gform/core

Read a Google Form's questions and submit answers to it, from any JavaScript.
No dependencies. Works in Node 20+ and browsers.

Using React? You want [`@ez-gform/react`](../react) instead.

## Install

```sh
pnpm add @ez-gform/core
```

## Usage

```ts
import { parseFormHtml, submitForm } from "@ez-gform/core";

// 1. Turn a public form's /viewform HTML into a typed schema.
const schema = parseFormHtml(html);

// 2. Submit answers, keyed by entry id.
const result = await submitForm(
  schema.formId,
  { "entry.123": "hello" },
  { schema },
);
```

`result.status` is:

- `"sent"` by default. The request is `no-cors` (browsers require it), so you
  can't know whether Google accepted it.
- `"ok"` or `"error"` if you pass `mode: "cors"`. Only works outside the
  browser (Node), where the response is readable.

## Value shapes

What to pass for each kind of question:

| Question                  | Value                                            |
| ------------------------- | ------------------------------------------------ |
| Short answer, paragraph   | `"text"`                                         |
| Multiple choice, dropdown | `"Option text"` (must match exactly)             |
| Checkboxes                | `["Option A", "Option B"]`                       |
| "Other" option            | `{ other: "my text" }`                           |
| Linear scale              | `4`                                              |
| Date                      | `{ year, month, day }` (`year` is optional)      |
| Date with time            | `{ year, month, day, hour, minute }`             |
| Time                      | `{ hour, minute }`                               |
| Grid                      | `{ "entry.<rowId>": "Column" }`, one key per row |
| Checkbox grid             | `{ "entry.<rowId>": ["Col A", "Col B"] }`        |

Empty strings, `null` and `undefined` are skipped.

Each grid row has its own entry id. Pass rows nested under the grid question's
id (`{ "entry.1": { "entry.10": "Agree" } }`) or flat
(`{ "entry.10": "Agree" }`); both work.

## Other exports

| Export                                   | What it does                                          |
| ---------------------------------------- | ----------------------------------------------------- |
| `validateValues(values, schema)`         | Finds unknown entry ids and missing required answers. |
| `encodeValues(values, schema)`           | Answers → `URLSearchParams`, without submitting.      |
| `buildSubmitBody`                        | The exact POST body `submitForm` sends.               |
| `buildPrefillUrl`                        | A link to the form prefilled with your values.        |
| `normalizeFormId`, `formUrls`            | Accept any form URL or id; get its endpoints.         |
| `parseFormData`, `extractPublicLoadData` | Lower-level parsing steps behind `parseFormHtml`.     |
| `ParseError`, `ValidationError`          | Error classes.                                        |
