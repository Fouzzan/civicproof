import { NextResponse } from "next/server";
import { z } from "zod";

import { confirmApplication } from "@/lib/application/confirm";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/application/confirm — record the citizen's explicit confirmation.
 *
 * This route is the ONLY thing in the system that can set `confirmedAt`, and it
 * runs only when a person presses the confirm button. The agent cannot reach
 * it: it is not a tool, it is not in the tool registry, and the model has no
 * way to issue an HTTP request.
 *
 * That separation is what makes "never submit without confirmation" a property
 * of the architecture rather than a hope about the prompt
 * (Docs/09-AI-DESIGN.md, safety rule 7).
 */
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const confirmRequestSchema = z.object({
  applicationId: z.string().min(1).max(64),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    const limit = checkRateLimit(`confirm:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = confirmRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }

    const outcome = await confirmApplication(user.id, parsed.data.applicationId);

    switch (outcome.kind) {
      case "CONFIRMED":
        return NextResponse.json({ ok: true, applicationId: outcome.record.id });

      case "NOT_FOUND":
        return NextResponse.json(
          { error: "That application is no longer open for confirmation." },
          { status: 404 },
        );

      case "SCHEME_UNAVAILABLE":
        return NextResponse.json(
          { error: "This scheme is unavailable right now. Nothing was confirmed." },
          { status: 503 },
        );

      case "NOT_ELIGIBLE":
        return NextResponse.json(
          { error: "This application no longer meets the scheme's criteria." },
          { status: 409 },
        );

      case "INCOMPLETE":
        return NextResponse.json(
          { error: "Some details are still missing. Please complete the application first." },
          { status: 409 },
        );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not record your confirmation." }, { status: 500 });
  }
}
