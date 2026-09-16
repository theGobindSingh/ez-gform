import { parseFormData } from "@ez-gform/core";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

const cliPath = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const fixturesDir = fileURLToPath(
  new URL("../../core/src/__fixtures__/", import.meta.url),
);

const fixturePath = (slug: string): string => `${fixturesDir}${slug}.json`;

const run = async (
  args: string[],
): Promise<{ stdout: string; stderr: string; code: number }> => {
  try {
    const { stdout, stderr } = await execFileAsync("node", [cliPath, ...args]);
    return { stdout, stderr, code: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      code: e.code ?? 1,
    };
  }
};

const FIXTURE_SLUGS = [
  "event-feedback",
  "event-rsvp",
  "question-types-demo",
  "ttrpg-applications",
  "booking-request",
  "meeting-room-reservation",
] as const;

describe("ez-gform CLI", () => {
  it("prints help", async () => {
    const { stdout, code } = await run(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("ez-gform");
  });

  it("prints version", async () => {
    const { stdout, code } = await run(["--version"]);
    expect(code).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("exits 1 with no form argument", async () => {
    const { code, stderr } = await run([]);
    expect(code).toBe(1);
    expect(stderr).toContain("Usage");
  });

  it("exits 1 for an unknown --format", async () => {
    const { code, stderr } = await run([
      "some-form-id-1234567890",
      "--json-input",
      fixturePath("event-feedback"),
      "--format",
      "yaml",
    ]);
    expect(code).toBe(1);
    expect(stderr).toContain("Unknown --format");
  });

  for (const slug of FIXTURE_SLUGS) {
    it(`--format json (default) for ${slug} matches parseFormData`, async () => {
      const { stdout, code } = await run([
        "some-form-id-1234567890",
        "--json-input",
        fixturePath(slug),
      ]);
      expect(code).toBe(0);
      const schema: unknown = JSON.parse(stdout);
      const raw = JSON.parse(
        readFileSync(fixturePath(slug), "utf8"),
      ) as unknown;
      expect(schema).toEqual(parseFormData(raw));
    });

    it(`--format types for ${slug} produces compilable-looking types`, async () => {
      const { stdout, code } = await run([
        "some-form-id-1234567890",
        "--json-input",
        fixturePath(slug),
        "--format",
        "types",
      ]);
      expect(code).toBe(0);
      expect(stdout).toContain("as const satisfies FormSchema");
    });

    it(`--format react for ${slug} produces a component`, async () => {
      const { stdout, code } = await run([
        "some-form-id-1234567890",
        "--json-input",
        fixturePath(slug),
        "--format",
        "react",
      ]);
      expect(code).toBe(0);
      expect(stdout).toContain("useGoogleForm");
    });

    it(`--format html for ${slug} produces a form`, async () => {
      const { stdout, code } = await run([
        "some-form-id-1234567890",
        "--json-input",
        fixturePath(slug),
        "--format",
        "html",
      ]);
      expect(code).toBe(0);
      expect(stdout).toContain("<form");
      expect(stdout).toContain("formResponse");
    });
  }

  it("accepts --name and uses it in generated types", async () => {
    const { stdout, code } = await run([
      "some-form-id-1234567890",
      "--json-input",
      fixturePath("event-feedback"),
      "--format",
      "types",
      "--name",
      "Custom",
    ]);
    expect(code).toBe(0);
    expect(stdout).toContain("export const CustomSchema");
  });

  it("submit exits 2 on validation failure without hitting the network", async () => {
    const { code, stderr } = await run([
      "submit",
      "some-form-id-1234567890",
      "--json-input",
      fixturePath("event-feedback"),
      "--data",
      "{}",
    ]);
    expect(code).toBe(2);
    expect(stderr).toContain("Validation failed");
  });

  it("submit exits 1 when --data is missing", async () => {
    const { code, stderr } = await run([
      "submit",
      "some-form-id-1234567890",
      "--json-input",
      fixturePath("event-feedback"),
    ]);
    expect(code).toBe(1);
    expect(stderr).toContain("Usage");
  });
});
