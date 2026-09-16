---
name: gform-internals
description: Reference for how Google Forms submission, prefill URLs, entry encoding and FB_PUBLIC_LOAD_DATA_ work. Load before touching @ez-gform/core encoding, parsing, or submit logic.
---

# Google Forms internals (quick reference)

Full detail lives in `docs/research/google-forms-internals.md`. Read that file first; this is the checklist.

- Submit endpoint: `https://docs.google.com/forms/d/e/<FORM_ID>/formResponse` (POST, `application/x-www-form-urlencoded`). Also accepts `/forms/d/<ID>/formResponse`. Prefill: same path with `viewform?usp=pp_url&entry.N=...`.
- Browser fetch must use `mode: "no-cors"`; the response is opaque, so success cannot be read. Report "sent" not "succeeded". Node/CLI can read status.
- Form must be public with "require sign-in" off, otherwise 401/redirect.
- Encoding per question type:
  - short/paragraph text: `entry.N=value`
  - radio/dropdown: `entry.N=<exact option text>`
  - checkbox: repeat `entry.N=opt` per selection
  - "Other": `entry.N=__other_option__` and `entry.N.other_option_response=text`
  - linear scale: `entry.N=<number>`
  - date: `entry.N_year`, `entry.N_month`, `entry.N_day` (plus `_hour`/`_minute` if time included)
  - time: `entry.N_hour`, `entry.N_minute`
  - grid: each row has its own `entry.N`; value is the column label (repeat for checkbox grid)
- Multi-page forms need hidden `fbzx`, `pageHistory=0,1,...`, and `partialResponse`; single-page forms do not.
- Question metadata comes from the `FB_PUBLIC_LOAD_DATA_` JSON array in viewform HTML, not from CSS classes. Never rely on obfuscated Google class names.
