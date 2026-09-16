import {
  generateHtmlForm,
  generateReactComponent,
  generateSchemaJson,
  generateTypes,
} from "@ez-gform/codegen";
import type { FormSchema, FormValues } from "@ez-gform/core";
import {
  formUrls,
  normalizeFormId,
  parseFormData,
  parseFormHtml,
  submitForm,
  validateValues,
} from "@ez-gform/core";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SIGN_IN_ERROR =
  "This form requires sign-in; ez-gform only works with forms that are public (Settings → Responses → 'Restrict to users in <org>' off)";

const USAGE = `Usage:
  ez-gform <form-url-or-id> [--format json|types|react|html] [--name MyForm] [--out <file>] [--json-input <file>]
  ez-gform submit <form-url-or-id> --data '<json>' | --data @<file> [--json-input <file>]
  ez-gform --help
  ez-gform --version

Options:
  --format <json|types|react|html>  Output format. Defaults to "json".
  --name <Name>                     Base name used for generated types/component (types/react formats).
  --out <file>                      Write output to a file instead of stdout.
  --json-input <file>               Use a saved FB_PUBLIC_LOAD_DATA_ JSON or viewform HTML file instead of fetching.
  --data <json|@file>               (submit) Values to submit, as inline JSON or "@path/to/file.json".
  --help                            Show this help.
  --version                         Show the CLI version.
`;

class UsageError extends Error {}
class FetchOrParseError extends Error {}

const readOwnVersion = async (): Promise<string> => {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const raw = await readFile(fileURLToPath(pkgUrl), "utf8");
  const pkg = JSON.parse(raw) as { version?: string };
  return pkg.version ?? "0.0.0";
};

const readDataOption = async (data: string): Promise<FormValues> => {
  const raw = data.startsWith("@")
    ? await readFile(data.slice(1), "utf8")
    : data;
  return JSON.parse(raw) as FormValues;
};

/** Loads a schema from `--json-input` (FB_PUBLIC_LOAD_DATA_ JSON array, or full viewform HTML). */
const loadSchemaFromFile = async (path: string): Promise<FormSchema> => {
  const raw = await readFile(path, "utf8");
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    return parseFormData(JSON.parse(trimmed));
  }
  return parseFormHtml(raw);
};

/** Fetches a public form's `/viewform` HTML and parses it into a `FormSchema`. */
const fetchSchema = async (formIdOrUrl: string): Promise<FormSchema> => {
  const formId = normalizeFormId(formIdOrUrl);
  const { viewform } = formUrls(formId);

  let response: Response;
  try {
    response = await fetch(viewform, {
      headers: { "User-Agent": USER_AGENT },
    });
  } catch (cause) {
    throw new FetchOrParseError(
      `Failed to fetch "${viewform}": ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }

  if (response.status === 401 || response.url.includes("accounts.google.com")) {
    throw new FetchOrParseError(SIGN_IN_ERROR);
  }

  if (!response.ok) {
    throw new FetchOrParseError(
      `Failed to fetch "${viewform}": HTTP ${response.status}`,
    );
  }

  const html = await response.text();
  try {
    return parseFormHtml(html);
  } catch (cause) {
    throw new FetchOrParseError(
      `Failed to parse form HTML: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
};

const renderFormat = (
  format: string,
  schema: FormSchema,
  name: string | undefined,
): string => {
  switch (format) {
    case "json":
      return generateSchemaJson(schema, { pretty: true });
    case "types":
      return generateTypes(schema, { name });
    case "react":
      return generateReactComponent(schema, { name });
    case "html":
      return generateHtmlForm(schema);
    default:
      throw new UsageError(
        `Unknown --format "${format}" (expected one of: json, types, react, html)`,
      );
  }
};

const runGenerate = async (argv: string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      format: { type: "string", default: "json" },
      name: { type: "string" },
      out: { type: "string" },
      "json-input": { type: "string" },
      help: { type: "boolean", default: false },
      version: { type: "boolean", default: false },
    },
  });

  if (values.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (values.version) {
    process.stdout.write(`${await readOwnVersion()}\n`);
    return 0;
  }

  const [formArg] = positionals;
  if (!formArg) {
    process.stderr.write(`Missing <form-url-or-id>.\n\n${USAGE}`);
    return 1;
  }

  let schema: FormSchema;
  try {
    schema = values["json-input"]
      ? await loadSchemaFromFile(values["json-input"])
      : await fetchSchema(formArg);
  } catch (error) {
    if (error instanceof FetchOrParseError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 2;
  }

  let output: string;
  try {
    output = renderFormat(values.format, schema, values.name);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`${error.message}\n\n${USAGE}`);
      return 1;
    }
    throw error;
  }

  if (values.out) {
    await writeFile(values.out, output, "utf8");
  } else {
    process.stdout.write(output.endsWith("\n") ? output : `${output}\n`);
  }
  return 0;
};

const runSubmit = async (argv: string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      data: { type: "string" },
      "json-input": { type: "string" },
      help: { type: "boolean", default: false },
    },
  });

  if (values.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  const [formArg] = positionals;
  if (!formArg || !values.data) {
    process.stderr.write(
      `Usage: ez-gform submit <form-url-or-id> --data '<json>' | --data @<file>\n`,
    );
    return 1;
  }

  let schema: FormSchema;
  try {
    schema = values["json-input"]
      ? await loadSchemaFromFile(values["json-input"])
      : await fetchSchema(formArg);
  } catch (error) {
    if (error instanceof FetchOrParseError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }
    throw error;
  }

  let data: FormValues;
  try {
    data = await readDataOption(values.data);
  } catch (error) {
    process.stderr.write(
      `Failed to read --data: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 1;
  }

  const validation = validateValues(data, schema);
  if (!validation.ok) {
    process.stderr.write(
      `Validation failed:\n${validation.errors
        .map((e) => `  - ${e.entryId}: ${e.message}`)
        .join("\n")}\n`,
    );
    return 2;
  }

  const formId = normalizeFormId(formArg);
  const result = await submitForm(formId, data, { schema, mode: "cors" });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.status === "error" ? 2 : 0;
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);

  if (argv[0] === "--help" || argv[0] === "-h") {
    process.stdout.write(USAGE);
    process.exit(0);
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    process.stdout.write(`${await readOwnVersion()}\n`);
    process.exit(0);
  }

  const exitCode =
    argv[0] === "submit"
      ? await runSubmit(argv.slice(1))
      : await runGenerate(argv);
  process.exit(exitCode);
};

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(2);
});
