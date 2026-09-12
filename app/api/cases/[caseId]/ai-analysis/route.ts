import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { analyseCase } from "@/lib/ai/case-analysis";
import { AiProviderError } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth";
import { isValidCaseId } from "@/lib/cases/case-id";
import { recordCaseAnalysis } from "@/lib/cases/record-analysis";
import { prisma } from "@/lib/db";
import { DESCRIPTION_MIN_LENGTH } from "@/lib/report/schema";

// Docs/08-API.md §3.4
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

// Docs/08-API.md §3.4: "one active analysis request per case at a time".
const PER_CASE_MAX = 1;
const PER_CASE_WINDOW_MS = 20 * 1000;

const PROVIDER_STATUS = {
  NOT_CONFIGURED: 503,
  PROVIDER_ERROR: 502,
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  EMPTY_RESPONSE: 502,
} as const;

const PROVIDER_MESSAGE = {
  NOT_CONFIGURED: "AI analysis is not configured. Your case is unaffected.",
  PROVIDER_ERROR: "AI analysis is temporarily unavailable. Your case is safe — please try again.",
  RATE_LIMITED: "The AI service is busy right now. Your case is safe — please wait a moment and try again.",
  TIMEOUT: "AI analysis took too long. Your case is safe — please try again.",
  EMPTY_RESPONSE: "AI analysis returned an unusable result and was discarded. Please try again.",
} as const;

/**
 * POST /api/cases/:caseId/ai-analysis
 *
 * authenticate -> load resource -> authorize -> rate limit -> analyse ->
 * validate -> persist. On any failure nothing is written, so a failed analysis
 * can never look like a completed one (Docs/08-API.md §3.4).
 */
export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/cases/[caseId]/ai-analysis">,
) {
  try {
    const user = await requireAuthenticatedUser();
    const { caseId } = await params;

    if (!isValidCaseId(caseId)) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    // Same authorization shape as every other case route: the reporter owns the
    // case, or an authority explicitly assigned to it. Anything else is 404 so
    // the response never reveals that a case exists (Docs/13-SECURITY.md §3).
    const target = await prisma.case.findFirst({
      where: {
        caseId,
        ...(user.role === Role.AUTHORITY
          ? { authorityUserId: user.id }
          : { reporterId: user.id }),
      },
    });

    if (!target) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const userLimit = checkRateLimit(
      `ai-analysis:${user.id}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS,
    );

    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Too many analysis requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(userLimit.retryAfterSeconds) } },
      );
    }

    const caseLimit = checkRateLimit(
      `ai-analysis-case:${target.id}`,
      PER_CASE_MAX,
      PER_CASE_WINDOW_MS,
    );

    if (!caseLimit.allowed) {
      return NextResponse.json(
        { error: "An analysis for this case is already running." },
        { status: 429, headers: { "Retry-After": String(caseLimit.retryAfterSeconds) } },
      );
    }

    if (target.description.trim().length < DESCRIPTION_MIN_LENGTH) {
      return NextResponse.json(
        { error: "There isn't enough information in this report to analyse it." },
        { status: 422 },
      );
    }

    // Only the report itself is sent to the provider — no account details.
    const { result, modelLabel } = await analyseCase({
      incidentType: target.incidentType,
      description: target.description,
      incidentDateTime: target.incidentDateTime?.toISOString() ?? null,
      location: target.location,
      isSensitive: target.isSensitive,
    });

    await recordCaseAnalysis(target, result, modelLabel, user);

    return NextResponse.json(
      {
        analysis: {
          summary: result.summary,
          suggestedCategory: result.suggestedCategory,
          severity: result.severity,
          severityReason: result.severityReason,
          reportingDirection: result.reportingDirection,
          immediateSafetyGuidance: result.immediateSafetyGuidance,
          potentiallyRelevantRegulatoryContext: result.potentiallyRelevantRegulatoryContext,
          modelLabel,
          aiAssisted: true,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    if (error instanceof AiProviderError) {
      // Reason only. Provider bodies can echo the prompt, which restates the
      // report, so neither is logged.
      console.error("AI analysis failed:", error.reason);

      return NextResponse.json(
        { error: PROVIDER_MESSAGE[error.reason] },
        { status: PROVIDER_STATUS[error.reason] },
      );
    }

    console.error("POST /api/cases/[caseId]/ai-analysis failed.");

    return NextResponse.json(
      { error: "We couldn't analyse this case. Your case is safe — please try again." },
      { status: 500 },
    );
  }
}
