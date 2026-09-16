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

| Question type | Encoding |
|---|---|
| Short answer (text) | `entry.NNN=<value>` — single value. |
| Paragraph | `entry.NNN=<value>` — single value, `\n` for line breaks. |
| Multiple choice (radio) | `entry.NNN=<option text, exact match>` — single value. |
| Dropdown | `entry.NNN=<option text, exact match>` — single value. |
| Checkboxes (multi-value) | Repeat the **same** `entry.NNN` once per selected option: `entry.NNN=OptionA&entry.NNN=OptionB`. |
| Linear scale | `entry.NNN=<number as string>` — single value, matching one of the scale's defined points. |
| Date | Three params, all required together: `entry.NNN_year=YYYY&entry.NNN_month=M&entry.NNN_day=D`. |
| Time | Two params: `entry.NNN_hour=H&entry.NNN_minute=M` (legacy `core` repo also supports `_second`, but Google Forms' native time question only exposes hour/minute in the UI). |
| Grid (multiple choice grid / checkbox grid) | Each **row** has its own separate `entry.NNN` id (rows are effectively independent sub-questions sharing the same question block); value is the selected column's exact text for radio-grid rows, repeated `entry.NNN=col` per selection for checkbox-grid rows. |
| "Other" option (radio/checkbox/dropdown) | Set `entry.NNN=__other_option__` to select the "Other" choice, and additionally send `entry.NNN.other_option_response=<free text>` with the typed value. |

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
**no official schema**; the shape below is reverse-engineered and may not
be stable across all form variants.

Root array (best-documented public description found):

- `[1]` — main container: form metadata + questions.
  - `[1][0]` — form description.
  - `[1][1]` — array of question entries (one element per question).
  - `[1][8]` — form title (inside the `[1]` container, not root).
- `[3]` — form name/title (also present at root level in some captures —
  the two title locations found in different write-ups were not
  cross-verified against each other; **treat form-title location as
  unconfirmed**, verify against a live capture before relying on it).
- `[14]` — form id.

Each question entry (inside `[1][1]`):

- `[1]` — question text.
- `[3]` — question type code (see table below).
- `[4]` — array of "sub-question" descriptors (plural, because grid
  questions have one entry per row; simple questions have a single-element
  array):
  - `[4][0][0]` — entry/field id (the numeric id used as `entry.<id>`).
  - `[4][0][1]` — array of option objects/strings (for choice-type
    questions: multiple choice, dropdown, checkboxes, grid columns).
  - `[4][0][2]` — required flag (`1` = required, `0`/absent = optional).

Question type codes:

| Code | Type |
|---|---|
| 0 | Short answer |
| 1 | Paragraph |
| 2 | Multiple choice |
| 3 | Dropdown |
| 4 | Checkboxes |
| 5 | Linear scale |
| 7 | Grid (multiple choice grid or checkbox grid) |
| 9 | Date |
| 10 | Time |
| 13 | File upload |

Source: [Programmatically access your complete Google Forms skeleton](https://theconfuzedsourcecode.wordpress.com/2019/12/15/programmatically-access-your-complete-google-forms-skeleton/)
(the author explicitly states these indices/codes were found "through trial
and error," not from any Google documentation). **Not independently
re-verified against a live Google Form capture in this research pass** —
before building the parser, fetch a real `/viewform` page containing one of
each question type and confirm every index against the actual JSON, since
minor-version drift in this structure across form templates is plausible
and the source itself is unofficial.

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
the fetch response itself; a caller can only know the request was *sent*,
not that Google *accepted* it. `@ez-gform/core`'s submit function should
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
