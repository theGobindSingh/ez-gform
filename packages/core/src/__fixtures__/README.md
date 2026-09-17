# FB_PUBLIC_LOAD_DATA_ fixtures

Live captures of two purpose-built forms owned by this project. All content
is synthetic: no third-party names, emails, or links. Neither form was ever
submitted to. Captured 2026-09-17.

To add coverage, edit the form (or build a new one you own) and recapture.
Do not commit captures of other people's forms.

## all-question-types.html / .json

https://docs.google.com/forms/d/e/1FAIpQLScXpdCnyzcv0h5_3giJaB9vP_00UIXggzt4UAfMamwPApnINw/viewform

Public, no sign-in. Captured with `curl -sL -A "Mozilla/5.0" <url>`.

- `.json` is `FB_PUBLIC_LOAD_DATA_` pretty-printed with `JSON.parse`,
  otherwise untouched.
- `.html` is the viewform page trimmed to the parts the parser reads: the
  `FB_PUBLIC_LOAD_DATA_` script and the hidden `fbzx`, `pageHistory`, and
  `partialResponse` inputs. Everything else Google serves (styles, scripts,
  script nonce) was dropped.

Four pages. Every item, in order:

| Page             | Item                                                         | Type code |
| ---------------- | ------------------------------------------------------------ | --------- |
| 1                | Short answer required (required, has description)            | 0         |
| 1                | Short answer optional (number > 0 validation)                | 0         |
| 1                | Paragraph question                                           | 1         |
| 1                | Radio plain (required)                                       | 2         |
| 1                | Radio with other                                             | 2         |
| 1                | Dropdown question (required)                                 | 3         |
| 1                | Checkboxes plain                                             | 4         |
| 1                | Checkboxes with other                                        | 4         |
| 1                | Checkboxes with validation (required, select at least 2)     | 4         |
| 1                | Info block (title/description, no input, no page break)      | 6         |
| Scales and grids | page break                                                   | 8         |
| 2                | Scale with labels (1–5, "Bad"/"Great", required)             | 5         |
| 2                | Scale without labels (0–10)                                  | 5         |
| 2                | Radio grid (each row required; row flag `[0]`)               | 7         |
| 2                | Checkbox grid (row flag `[1]`)                               | 7         |
| 2                | Rating question (5 stars)                                    | 18        |
| Dates and times  | page break                                                   | 8         |
| 3                | Date with year (required) — flags `[0,1]`                    | 9         |
| 3                | Date with year and time — `[1,1]`                            | 9         |
| 3                | Date without year — `[0,0]`                                  | 9         |
| 3                | Date with time without year — `[1,0]`                        | 9         |
| 3                | Time of day — flag `[0]`                                     | 10        |
| 3                | Duration — flag `[1]`                                        | 10        |
| Media            | page break                                                   | 8         |
| 4                | Image item (stock image from the Forms picker)               | 11        |
| 4                | Video item (a Google Workspace channel video)                | 12        |

Date flags are `[includeTime, includeYear]`.

## file-upload.json

https://docs.google.com/forms/d/e/1FAIpQLSfREd_C7AwV7IR5sGJjSXoleJi-zXtaSFVPPLyI8hqOb0ILhA/viewform

One required File Upload question (type 13) plus one optional short answer.
A file-upload question forces sign-in on the whole form, so anonymous `curl`
gets a 401 and there is no `.html`. The JSON was read from
`FB_PUBLIC_LOAD_DATA_` in a signed-in browser. One edit: root index 15, a
per-account font-usage string, was replaced with `"[]"` (the value an
anonymous capture has).

## Notes

- `entry.` occurrences found by plain `grep` on static viewform HTML
  undercount the true number of fields — grid rows and later-page questions
  are rendered client-side from `FB_PUBLIC_LOAD_DATA_`. Parse
  `FB_PUBLIC_LOAD_DATA_` instead.
- `pageHistory` is present with value `"0"` on first load for every form,
  not only multi-page ones.
