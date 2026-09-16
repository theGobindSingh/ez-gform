# @ez-gform/core

Framework-agnostic Google Forms parser, entry encoder, and submitter. Zero
runtime dependencies; works in Node 20+, browsers, and extension content
scripts (no DOM access).

## Install

```sh
pnpm add @ez-gform/core
```

## The three main functions

```ts
import { parseFormHtml, encodeValues, submitForm } from "@ez-gform/core";

// 1. Parse a public /viewform page's HTML into a typed FormSchema.
const schema = parseFormHtml(html);

// 2. Encode plain-object answers into entry.NNN-keyed URLSearchParams,
//    per Google's per-question-type wire format.
const params = encodeValues({ "entry.123": "hello" }, schema);

// 3. POST the encoded answers to the form's formResponse endpoint.
const result = await submitForm(
  schema.formId,
  { "entry.123": "hello" },
  { schema },
);
// result: { status: "sent" } (browser, no-cors — success is never observable)
//      or { status: "ok", httpStatus } / { status: "error", error } (Node, mode: "cors")
```

Also exported: `extractPublicLoadData`, `parseFormData`, `normalizeFormId`,
`formUrls`, `buildPrefillUrl`, `buildSubmitBody`, `validateValues`,
`ParseError`, `ValidationError`, `VERSION`.

## Encoding table

| Value shape                              | Wire format                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `string` / `number`                      | `entry.N=<value>` (empty string is skipped)                                                |
| `string[]`                               | repeated `entry.N=<value>` (checkboxes)                                                    |
| `{ other: string }`                      | `entry.N=__other_option__` + `entry.N.other_option_response=<text>`                        |
| `(string \| { other })[]`                | mix of the two rules above, same `entry.N`                                                 |
| `{ year?, month, day, hour?, minute? }`  | `entry.N_year` (omitted if `year` undefined) `/_month/_day` (+ `_hour/_minute` if present) |
| `{ hour, minute }`                       | `entry.N_hour` / `entry.N_minute`, zero-padded to 2 digits                                 |
| `Record<rowEntryId, string \| string[]>` | each row's own `entry.<rowId>` (grid questions)                                            |
| `null` / `undefined`                     | skipped                                                                                    |

`encodeValues` never throws and never hand-encodes strings — it builds a
native `URLSearchParams`. Pair it with `validateValues(values, schema)` to
check for unknown entry ids or missing required answers before submitting.
