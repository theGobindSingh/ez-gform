# FB_PUBLIC_LOAD_DATA_ fixtures

Captured 2026-09-16 via plain `curl -sL -A "Mozilla/5.0" <url>` (no sign-in,
no submission). Each `<slug>.html` is the raw viewform page; each
`<slug>.json` is `FB_PUBLIC_LOAD_DATA_` pretty-printed with
`JSON.parse`.

## event-feedback.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSeea5PBMuJUpTG9ephwFbt4NApN1TPQi6Yc5cNNw0vgPm9Umw/viewform
("Event feedback", Infinite Flight LLC)

Types present: short answer, paragraph, multiple choice (radio, type 2),
checkboxes (type 4), linear scale with min/max labels (type 5),
multiple-choice grid (type 7, all rows single-select).

## event-rsvp.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSfYyu6DOujdBirlNdKv7qvex3kwJh8q_BEtxESoE6vZQaQV2w/viewform
("Event RSVP" / "Future Options Night 2022")

Types present: multiple choice (radio), short answer, checkboxes,
type-6 informational/title block (no entry array — "if you have further
questions contact ..." block).

## question-types-demo.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSciCcNILfeSdgUavm_GYuCFE_G8InD1YVkIWAiTU_B3-l9AkA/viewform
("Understanding Different Question Types in Google Forms") — the richest
fixture. Types present: short answer, paragraph, multiple choice, dropdown
(type 3), checkboxes with a required-count validation rule, checkboxes with
an "Other" option (option flagged via trailing `1` in the option tuple),
linear scale with labels, multiple-choice grid AND tick-box/checkbox grid
(both type 7, distinguished by a trailing `[0]`/`[1]` per-row flag), date
(type 9, with include-time/include-year flag pair), time (type 10), section
header/title-description block (type 6, no page break), true section/page
break (type 8, used to split the form into multiple pages — this form is
multi-section), video embed (type 12), image embed (type 11). Only
"File Upload" (type 13) is described in the form's own text but the actual
question is stated by the form author to be omitted (Shared-Drive/DLP
restriction) — no live type-13 example was found anywhere in this pass.

## ttrpg-applications.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSfq6m_mqAq406IBKKErxGzzfwdVV6fNMMk2TqFjTQEDkeJaQQ/viewform
("Applications")

Types present: short answer, paragraph, checkboxes with an "Other" option
(second confirming example of the Other-option flag).

## booking-request.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSeY-Ly53GKeAESPVGnxkNQxXFcJBUFOAKVnmtwKcso3tSf0NA/viewform
("Booking Request Form")

Types present: date questions (type 9) with the include-time/include-year
flag pair set to `[0,1]` (no time, has year) — used to cross-check the date
flag semantics against a second form.

## meeting-room-reservation.html / .json
https://docs.google.com/forms/d/e/1FAIpQLSeT7JUpxNspz1Fk1lojsMBqd2TDWXFKpf3Ahv1uNY84HSEYeQ/viewform
("Meeting and Study Room Reservation")

Types present: date question with `[1,1]` flag pair (include time AND
year — "Start Day and Time"), separate time-only question (type 10) with
`[0]` flag. This pair of values (`[1,1]` here vs `[0,1]` in
booking-request.html) is what confirms the flag order is
`[includeTime, includeYear]`, not the reverse.

## Notes
- All six forms are single-load, no-signin, `curl -sL` fetchable; none were
  submitted to.
- Every fixture's HTML contains hidden inputs `fbzx`, `pageHistory` (always
  present, value `"0"` on first load even for single-page forms — not
  exclusive to multi-page forms), and `partialResponse`.
- `entry.` occurrences found by plain `grep` on the static HTML
  undercount the true number of fields — many inputs (especially grid rows
  and later-page questions) are rendered client-side from
  `FB_PUBLIC_LOAD_DATA_` rather than present as static `<input name="entry...">`
  tags in the initial HTML. Do not rely on grepping raw HTML for `entry.`
  ids; parse `FB_PUBLIC_LOAD_DATA_` instead.
