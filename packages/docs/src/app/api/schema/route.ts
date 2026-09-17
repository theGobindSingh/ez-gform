import { formUrls, normalizeFormId, parseFormHtml } from "@ez-gform/core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SIGN_IN_ERROR =
  "This form requires sign-in; ez-gform only works with forms that are public (Settings → Responses → 'Restrict to users in <org>' off).";

const FETCH_TIMEOUT_MS = 10_000;

/**
 * `GET /api/schema?formId=<url-or-bare-id>`
 *
 * Fetches a public Google Form's `/viewform` HTML server-side (with a
 * browser-like User-Agent, since Google serves a different, non-parseable
 * page to unrecognized clients), parses it with `@ez-gform/core`'s
 * `parseFormHtml`, and returns the resulting `FormSchema` as JSON.
 */
export const GET = async (request: Request): Promise<NextResponse> => {
  const url = new URL(request.url);
  const rawFormId = url.searchParams.get("formId");

  if (!rawFormId || rawFormId.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required query param: formId" },
      { status: 400 },
    );
  }

  let formId: string;
  try {
    formId = normalizeFormId(rawFormId);
  } catch (cause) {
    return NextResponse.json(
      {
        error: `Could not recognize "${rawFormId}" as a Google Form URL or id: ${
          cause instanceof Error ? cause.message : String(cause)
        }`,
      },
      { status: 400 },
    );
  }

  const { viewform } = formUrls(formId);

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(viewform, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } catch (cause) {
    const timedOut = controller.signal.aborted;
    return NextResponse.json(
      {
        error: timedOut
          ? `Timed out fetching "${viewform}" after ${FETCH_TIMEOUT_MS}ms`
          : `Failed to fetch "${viewform}": ${
              cause instanceof Error ? cause.message : String(cause)
            }`,
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.url.includes("accounts.google.com")) {
    return NextResponse.json({ error: SIGN_IN_ERROR }, { status: 401 });
  }

  if (response.status === 404) {
    return NextResponse.json(
      { error: `Form not found at "${viewform}"` },
      { status: 404 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: `Failed to fetch "${viewform}": HTTP ${response.status}` },
      { status: 502 },
    );
  }

  const html = await response.text();

  try {
    const schema = parseFormHtml(html);
    return NextResponse.json({ schema });
  } catch (cause) {
    return NextResponse.json(
      {
        error: `Failed to parse form HTML: ${
          cause instanceof Error ? cause.message : String(cause)
        }`,
      },
      { status: 422 },
    );
  }
};
