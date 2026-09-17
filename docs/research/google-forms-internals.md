# Google Forms Internals — Rebuild Reference

Unofficial, reverse-engineered behavior. No part of this is documented by
Google; all of it can change without notice. Sources noted per section.

## 1. Submission endpoint

```
POST https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
Content-Type: application/x-www-form-urlencoded
```

Body/query params: one `entry.NNNNNNNN=<value>` pair per answer (see
section 3 for per-type encoding). `<FORM_ID>` is the long id from the
form's `/d/e/<FORM_ID>/viewform` URL (the public "e/" published id, not the
editor id from `/d/<editor-id>/edit`).

Source: legacy `core` repo (`src/index.ts:135-190`, reverse-engineered
convention, confirmed working in production use by that package); consistent
with the community reference at theconfuzedsourcecode.wordpress.com (see
section 2).

## 2. Prefill URL parameters (`usp=pp_url`)

Google's own "Get pre-filled link" feature generates URLs of the form:

```
https://docs.google.com/forms/d/e/<FORM_ID>/viewform?usp=pp_url&entry.NNNNNNNN=value&...
```

- `usp=pp_url` marks the URL as a pre-fill link (present on Google-generated
  links; not required for the `formResponse` POST, only relevant to the
  human-facing `/viewform` prefill URL).
- Field ids are discovered by viewing page source of the form and searching
  for `entry.` (each hidden/visible input's `name` attribute), or by
  inspecting the DOM of `/viewform`.
- Parameters are joined with `&`, standard `application/x-www-form-urlencoded`
  syntax: `entry.XXXXXXXXX=value`.
- Only fields you want prefilled need to be present; omit the rest.
- Multiple-choice/dropdown values **must match the option text exactly**
  (case, whitespace) or the prefill is silently ignored.

Source: [Let's auto-fill Google Forms with URL parameters](https://theconfuzedsourcecode.wordpress.com/2019/11/10/lets-auto-fill-google-forms-with-url-parameters/).

## 3. `entry.NNN` encoding per question type

All values are `encodeURIComponent`-ed before being placed in the query
string / POST body.

| Question type                               | Encoding                                                                                                                                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Short answer (text)                         | `entry.NNN=<value>` — single value.                                                                                                                                                                                                                              |
| Paragraph                                   | `entry.NNN=<value>` — single value, `\n` for line breaks.                                                                                                                                                                                                        |
| Multiple choice (radio)                     | `entry.NNN=<option text, exact match>` — single value.                                                                                                                                                                                                           |
| Dropdown                                    | `entry.NNN=<option text, exact match>` — single value.                                                                                                                                                                                                           |
| Checkboxes (multi-value)                    | Repeat the **same** `entry.NNN` once per selected option: `entry.NNN=OptionA&entry.NNN=OptionB`.                                                                                                                                                                 |
| Linear scale                                | `entry.NNN=<number as string>` — single value, matching one of the scale's defined points.                                                                                                                                                                       |
| Date                                        | Three params, all required together: `entry.NNN_year=YYYY&entry.NNN_month=M&entry.NNN_day=D`.                                                                                                                                                                    |
| Time                                        | Two params: `entry.NNN_hour=H&entry.NNN_minute=M` (legacy `core` repo also supports `_second`, but Google Forms' native time question only exposes hour/minute in the UI).                                                                                       |
| Grid (multiple choice grid / checkbox grid) | Each **row** has its own separate `entry.NNN` id (rows are effectively independent sub-questions sharing the same question block); value is the selected column's exact text for radio-grid rows, repeated `entry.NNN=col` per selection for checkbox-grid rows. |
| "Other" option (radio/checkbox/dropdown)    | Set `entry.NNN=__other_option__` to select the "Other" choice, and additionally send `entry.NNN.other_option_response=<free text>` with the typed value.                                                                                                         |

Sources: legacy `core` repo's date/`_year`/`_month`/`_day` and
time `_hour`/`_minute`/`_second` suffix convention (`src/index.ts`);
theconfuzedsourcecode.wordpress.com pre-fill post (checkboxes repeat-id
pattern, date `_year`/`_month`/`_day`, time `_hour`/`_minute`). The grid
row-id and `__other_option__`/`.other_option_response` conventions are
**widely documented in community reverse-engineering write-ups and
open-source Forms scraping tools but were not independently re-verified
against a live form in this research pass** — treat as high-confidence but
unverified-by-us; verify against a real multi-row grid / "Other" question
during implementation before shipping.

## 4. `FB_PUBLIC_LOAD_DATA_` structure

Every public `/viewform` page embeds a `<script>` containing:

```js
var FB_PUBLIC_LOAD_DATA_ = [ ... ];
```

To parse: strip the `var FB_PUBLIC_LOAD_DATA_ = ` prefix and trailing `;`,
then `JSON.parse` the remainder (it is a JSON-compatible nested array, not a
JS object — no keys, purely positional/parallel-array encoded). There is
**no official schema**. Everything in this section (unless marked
"unverified") was confirmed by inspecting the parsed JSON of live forms
with node — no form was submitted to. The fixtures in
`packages/core/src/__fixtures__/` are two purpose-built forms owned by this
project (captured 2026-09-17); see the fixture README for what each
contains:

- `all-question-types` — public, no sign-in, fetched with plain `curl -sL`.
- `file-upload` — requires sign-in (any form with a file-upload question
  does; anonymous `curl` gets a 401), so its JSON was read from a signed-in
  browser session.

### Root array (verified)

- `[1]` — main container: form metadata + questions.
  - `[1][0]` — form **description** (string, may be multi-line/HTML-escaped
    plain text). Verified across all 6 fixtures.
  - `[1][1]` — array of question entries, one element per question,
    including non-input elements (section headers, page breaks, image/video
    blocks). Verified across all 6 fixtures.
  - `[1][8]` — form **title** (`[null, "<title text>"]` — a 2-element array
    whose second element is the title; same `[null, text]` wrapper shape is
    reused for description/title pairs elsewhere in the structure).
    Verified across all 6 fixtures.
- `[3]` — also the form title, as a **plain string** (not wrapped in
  `[null, ...]`) — this is the same title text as `[1][8][1]`, just
  duplicated at root level in a different shape. Both locations were
  cross-verified against each other in all 6 fixtures and always matched
  (small whitespace/trailing-space differences seen in one fixture, e.g.
  `"Job Application"` vs `"Job Application "`, are cosmetic). Prior
  uncertainty about whether these were two different fields is resolved:
  they are the same title, in two encodings.
- `[14]` — form id, as the string `"e/<published-id>"` — i.e. it includes
  the `e/` prefix, not just the bare id from the `/d/e/<id>/viewform` URL.
  Verified across all 6 fixtures.

### Each question entry (inside `[1][1][i]`) — verified

- `[0]` — question id (a numeric id distinct from the entry/field id; not
  the `entry.NNN` submission id).
- `[1]` — question title text.
- `[2]` — question description/help text, or `null` if none.
- `[3]` — question type code (see table below).
- `[4]` — array of "sub-question" descriptors, or `null` for non-input
  types (section header, page break, image, video). Plural because grid
  questions have one element per **row**; simple questions have a
  single-element array. For each element:
  - `[4][i][0]` — entry/field id (the numeric id used as `entry.<id>` on
    submit). For a grid, this is the **row's own, independent** entry id
    (confirmed: each row in a grid is a separate `entry.NNN`).
  - `[4][i][1]` — for choice-type questions (radio/dropdown/checkbox/grid
    column set): array of option tuples, each
    `[optionText, imageId_or_null, ?, ?, isOtherFlag]`. `isOtherFlag` is
    `1` when that option is the synthesized "Other" choice (and in that
    case `optionText` is an empty string `""` — Google leaves the display
    text blank client-side since the responder types their own); `0`/absent
    otherwise. Verified on both a radio and a checkbox question
    ("Radio with other", "Checkboxes with other" in `all-question-types`). For non-choice
    questions (short answer, paragraph, date, time) this is `null`.
  - `[4][i][2]` — required flag (`1` = required, `0` = optional).
  - `[4][i][3]` — for a **grid row**, a single-element array holding the
    row label text, e.g. `["Location"]`. For a **linear-scale** question,
    a 2-element array of the low/high end labels, e.g.
    `["Not at all", "Very much"]` (present even when the author left them
    blank — Google still ships a slot, possibly empty strings). `null`
    otherwise.
  - Further positions vary by type and are mostly `null` padding except
    where noted below per-type.

### Question type codes (verified against live data)

| Code | Type                                                  | Notes                                                                                                |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 0    | Short answer                                          |                                                                                                      |
| 1    | Paragraph                                             |                                                                                                      |
| 2    | Multiple choice (radio)                               |                                                                                                      |
| 3    | Dropdown                                              |                                                                                                      |
| 4    | Checkboxes                                            | can carry a validation-rule tuple (e.g. "select exactly N") at `[4][0][3]` when configured           |
| 5    | Linear scale                                          | options are `[["1"],["2"],...]`; low/high labels at `[4][0][3]`                                      |
| 6    | Section header / title+description block              | **not** a page break — an informational block with a title/description and no input; `[4]` is `null` |
| 7    | Grid (multiple choice grid OR checkbox/tick-box grid) | see "grid kind" below — **same type code for both**                                                  |
| 8    | Section/page break                                    | genuinely splits the form into multiple pages; `[4]` is `null`                                       |
| 9    | Date                                                  | see date flags below                                                                                 |
| 10   | Time                                                  | see time flag below                                                                                  |
| 11   | Image block (non-input)                               |                                                                                                      |
| 12   | Video block (non-input)                               |                                                                                                      |
| 13   | File upload                                           | forces sign-in on the whole form — see below                                                         |
| 18   | Rating (stars/hearts/thumbs)                          | options `"1"`..`"N"`, same wire shape as linear scale                                                |

**Type 13 (file upload)**, verified in `file-upload`: the sub-question is
`[entryId, null, requiredFlag]` — no options. Adding one forces sign-in for
the whole form, so such forms cannot be fetched or submitted anonymously.

**Type 18 (rating)**, verified in `all-question-types`: `[4][0][1]` holds
option tuples `["1"]`..`["N"]` and the sub-question ends with a
single-element icon flag array (`[1]` observed for stars). The parser maps
it to `linear_scale`. That it submits as `entry.N=<number>` is inferred from
the identical option shape, not observed (no form was submitted to).

### Grid kind: radio-grid vs checkbox-grid (verified — they ARE distinguishable)

Both "Multiple choice grid" and "Tick box/checkbox grid" use question type
`7`. They are distinguished by a **per-row** trailing single-element flag
array (last element of each row's descriptor array):

- `[0]` on a row → that row is single-select (radio-style) — "Multiple
  Choice Grid."
- `[1]` on a row → that row is multi-select (checkbox-style) — "Tick Box
  Grid."

Verified directly in `all-question-types.json`: "Radio grid" has `[0]` on
every row and "Checkbox grid" has `[1]` on every row. All rows within a
grid question share the same flag — i.e. this is effectively a
per-question, not truly per-row, setting in practice.

### Date question flags (verified)

For a date question (type 9), `[4][0]` carries an extra trailing 2-element
array at index 7: `[includeTime, includeYear]`, each `0` or `1`.

All four combinations verified in `all-question-types`, each toggled via
the question's "Include time" / "Include year" menu items:

- "Date with year": `[0, 1]`
- "Date with year and time": `[1, 1]`
- "Date without year": `[0, 0]`
- "Date with time without year": `[1, 0]`

### Time question flag (verified)

For a time question (type 10), `[4][0]` carries a single-element array at
index 6: `[0]` for an ordinary time-of-day picker ("Time of day") and
`[1]` for the "Duration" answer type ("Duration"), both verified in
`all-question-types`.

### Section/page breaks (verified)

Type `8` entries are genuine page breaks — `all-question-types` is a
four-page form, and its type-8 entries carry section title/description text
in the same `[null, text]` wrapper shape as the root title. Type `6` entries
look superficially similar (title + description, `[4]` null) but are
informational blocks that do **not** create a new page ("Info block" sits
on page one of that form).

All 6 fixtures' HTML — single-page and multi-page alike — contained hidden
`<input>`s named `fbzx`, `pageHistory` (value `"0"` on first load), and
`partialResponse`, confirming section 5's claim that these are present,
though their exact round-trip submission behavior for multi-page forms was
still not tested end-to-end (no submission was made in this pass).

## 5. Multi-page forms: `fbzx`, `pageHistory`, `partialResponse`

Multi-page (sectioned) Google Forms include additional hidden fields that
must be echoed back on submit for the response to be accepted as
belonging to the correct session/page sequence:

- `fbzx` — a per-load anti-replay/session token embedded as a hidden input
  in the form HTML; must be read from the page being submitted and sent
  back unchanged.
- `pageHistory` — a comma-separated list of page indices visited (e.g.
  `0,1,2`), reflecting the section-navigation path taken through the form.
- `partialResponse` — used internally by Google Forms' own JS to persist
  in-progress multi-page state; not required for a single-shot
  `formResponse` POST replicating a full submission, but present in the
  page's hidden inputs.

This detail was **not independently verified in this research pass** (no
live multi-page form was captured/tested); it is included because
multi-page support is a known limitation in Forms-automation tooling
generally and should be validated against a real sectioned form during
implementation. None of the three legacy repos examined here handle
multi-page forms at all — this is new scope for the rebuild.

## 6. CORS behavior

The `formResponse` endpoint does not return CORS headers permitting
arbitrary origins reading the response. A plain `fetch(url, {method:
'POST'})` (default `mode: 'cors'`) from a browser on a different origin
will have its response blocked by the browser — the request is still
delivered and processed server-side by Google, but the calling page cannot
read status/body. The correct approach is `fetch(url, { method: 'POST',
mode: 'no-cors' })`, which explicitly acknowledges the response will be
**opaque** (`response.type === 'opaque'`, `status` always `0`, body always
empty) — there is no way to detect actual server-side success/failure from
the fetch response itself; a caller can only know the request was _sent_,
not that Google _accepted_ it. `@ez-gform/core`'s submit function should
use `no-cors` explicitly (not rely on a silently-swallowed CORS error as
the legacy `core` repo does) and document this opacity as a hard
platform constraint, not a bug to "fix" — there is no known reliable
same-page way to confirm server-side acceptance without a server-side
proxy that isn't opaque.

Source: legacy `core` repo research report (`core-report.md`, section 3 —
identifies the `fetch(...).catch(()=>{})` fire-and-forget-into-CORS-error
pattern); no `mode: 'no-cors'` was actually used in the legacy code (a gap
itself).

## 7. "Form must be public" constraint

Prefill and `formResponse` submission both require the form to be
accessible **without Google sign-in** ("Anyone with the link can respond,"
sign-in not required, in the form owner's Settings). If the form owner has
restricted responses to signed-in users only, or to a Google Workspace
domain, both prefill-HTML fetch and blind `formResponse` POST will not work
the same way (the response page will require authentication first) — this
is a hard constraint on what `@ez-gform/core`/`cli`/`extension` can support,
not a bug to work around. Confirmed by the legacy `extension` repo's own
caveat (relies on ambient session cookies, doesn't differentiate
not-logged-in from parse failure) and consistent with the general
well-known behavior of Google Forms responder-restriction settings.
