import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, forbidden, requireAuthenticatedUser } from "@/lib/auth";
import { createCaseForReporter } from "@/lib/cases/create-case";
import { createCaseRequestSchema, fieldErrorsFrom } from "@/lib/report/schema";

// Docs/08-API.md §3.1 — generous enough for normal use, tight enough to stop
// runaway loops and accidental double submissions.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * POST /api/cases — create a case from a citizen's report.
 *
 * Order is deliberate and matches Docs/13-SECURITY.md §16:
 *   authenticate -> authorize role -> rate limit -> parse -> validate -> persist
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    // Only citizens file reports. An authority user reviews cases; letting one
    // create a citizen case would put a case in the system with an authority as
    // its reporter.
    if (user.role !== Role.CITIZEN) {
      throw forbidden(`User ${user.id} with role ${user.role} attempted case creation.`);
    }

    const limit = checkRateLimit(`create-case:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many reports created recently. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const parsed = createCaseRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Some details need attention before this report can be created.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        },
        { status: 422 },
      );
    }

    const created = await createCaseForReporter(parsed.data, user);

    return NextResponse.json(
      {
        case: {
          caseId: created.caseId,
          incidentType: created.incidentType,
          isSensitive: created.isSensitive,
          status: created.status,
          handoffStatus: created.handoffStatus,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid report data." }, { status: 400 });
    }

    // Never surface Prisma/driver internals to the browser.
    console.error("POST /api/cases failed:", error);

    return NextResponse.json(
      { error: "We couldn't create the case. Your information has not been lost — please try again." },
      { status: 500 },
    );
  }
}
