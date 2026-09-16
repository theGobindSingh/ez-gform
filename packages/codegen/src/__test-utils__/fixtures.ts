import type { FormSchema } from "@ez-gform/core";
import { parseFormData } from "@ez-gform/core";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixturesDir = fileURLToPath(
  new URL("../../../core/src/__fixtures__/", import.meta.url),
);

export const FIXTURE_SLUGS = [
  "event-feedback",
  "event-rsvp",
  "question-types-demo",
  "ttrpg-applications",
  "booking-request",
  "meeting-room-reservation",
] as const;

export const loadFixtureSchema = (slug: string): FormSchema => {
  const raw = JSON.parse(
    readFileSync(`${fixturesDir}${slug}.json`, "utf8"),
  ) as unknown;
  return parseFormData(raw, { formId: slug });
};
