export default function QuestionTypesPage() {
  return (
    <div>
      <h1>Question types</h1>
      <p>
        Every <code>QuestionType</code> in <code>@ez-gform/types</code>, the
        shape of the value you hand to <code>useGoogleForm</code> /{" "}
        <code>encodeValues</code> for it (<code>FieldValue</code>), and the wire
        format it&apos;s encoded to on submit. Source:{" "}
        <code>docs/research/google-forms-internals.md</code>.
      </p>

      <table>
        <thead>
          <tr>
            <th>QuestionType</th>
            <th>FieldValue shape</th>
            <th>Encoded entry params</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>short_answer</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>entry.NNN=&lt;value&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>paragraph</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>entry.NNN=&lt;value&gt;</code> (<code>\n</code> for line
              breaks)
            </td>
          </tr>
          <tr>
            <td>
              <code>multiple_choice</code>
            </td>
            <td>
              <code>string</code> or <code>{"{ other: string }"}</code> when the
              question has an &quot;Other&quot; option
            </td>
            <td>
              <code>entry.NNN=&lt;exact option text&gt;</code>, or{" "}
              <code>entry.NNN=__other_option__</code> +{" "}
              <code>entry.NNN.other_option_response=&lt;text&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>dropdown</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              <code>entry.NNN=&lt;exact option text&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>checkboxes</code>
            </td>
            <td>
              <code>string[]</code> or{" "}
              <code>{"(string | { other: string })[]"}</code>
            </td>
            <td>
              repeated <code>entry.NNN=OptionA&amp;entry.NNN=OptionB</code>{" "}
              (plus the <code>__other_option__</code> pair if &quot;Other&quot;
              is selected)
            </td>
          </tr>
          <tr>
            <td>
              <code>linear_scale</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>
              <code>entry.NNN=&lt;number as string&gt;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>date</code>
            </td>
            <td>
              <code>{"DateValue"}</code>:{" "}
              <code>{"{ year?, month, day, hour?, minute? }"}</code>
            </td>
            <td>
              <code>entry.NNN_year</code> (omitted if <code>year</code> is
              undefined) / <code>_month</code> / <code>_day</code> (+{" "}
              <code>_hour</code> / <code>_minute</code> if the question includes
              a time)
            </td>
          </tr>
          <tr>
            <td>
              <code>time</code>
            </td>
            <td>
              <code>{"TimeValue"}</code>: <code>{"{ hour, minute }"}</code>
            </td>
            <td>
              <code>entry.NNN_hour</code> / <code>entry.NNN_minute</code>,
              zero-padded to 2 digits
            </td>
          </tr>
          <tr>
            <td>
              <code>grid</code> (multiple choice grid)
            </td>
            <td>
              <code>{"Record<rowEntryId, string>"}</code>
            </td>
            <td>
              each row has its own <code>entry.&lt;rowId&gt;</code>, value is
              the selected column&apos;s exact text
            </td>
          </tr>
          <tr>
            <td>
              <code>checkbox_grid</code> (tick-box grid)
            </td>
            <td>
              <code>{"Record<rowEntryId, string[]>"}</code>
            </td>
            <td>
              each row has its own <code>entry.&lt;rowId&gt;</code>, repeated
              per selected column
            </td>
          </tr>
          <tr>
            <td>
              <code>file_upload</code>
            </td>
            <td>
              unsupported — <code>null</code>/<code>undefined</code> (skipped)
            </td>
            <td>
              not submittable through the public <code>formResponse</code>{" "}
              endpoint; omitted from generated types/UI
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Notes</h2>
      <ul>
        <li>
          <code>null</code>/<code>undefined</code> values are always skipped by{" "}
          <code>encodeValues</code> — it never throws and never hand-encodes
          strings, it builds a native <code>URLSearchParams</code>.
        </li>
        <li>
          Multiple choice / dropdown / grid values must match the option text{" "}
          <strong>exactly</strong> (case, whitespace) or Google silently ignores
          the answer.
        </li>
        <li>
          Pair any of the above with <code>validateValues(values, schema)</code>{" "}
          to check for unknown entry ids or missing required answers before
          submitting.
        </li>
      </ul>
    </div>
  );
}
