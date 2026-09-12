import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { analyseCase } from "@/lib/ai/case-analysis";
import { fingerprintReport, signAnalysis } from "@/lib/ai/draft-token";
import { collectAnalysisImages, MAX_ANALYSIS_IMAGES } from "@/lib/ai/images";
import { AiProviderError } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, forbidden, requireAuthenticatedUser } from "@/lib/auth";
import { isSensitiveIncidentType } from "@/lib/report/incident-types";
import { createCaseRequestSchema, fieldErrorsFrom } from "@/lib/report/schema";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const PROVIDER_STATUS = {
  NOT_CONFIGURED: 503,
  PROVIDER_ERROR: 502,
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  EMPTY_RESPONSE: 502,
} as const;

const PROVIDER_MESSAGE = {
  NOT_CONFIGURED: "AI review is not configured. You can continue without it.",
  PROVIDER_ERROR: "AI review is temporarily unavailable. You can continue without it.",
  RATE_LIMITED: "The AI service is busy. Wait a moment, or continue without review.",
  TIMEOUT: "AI review took too long. You can try again or continue without it.",
  EMPTY_RESPONSE: "AI review returned an unusable result. You can continue without it.",
} as const;

/**
 * POST /api/report/analysis — analyse a draft report before any Case exists.
 *
 * Writes nothing. The citizen is still deciding whether to file, so creating a
 * row here would litter the database with abandoned cases.
 *
 * The returned token is an HMAC binding the analysis to this report and this
 * user, so the analysis can survive a round-trip through the browser without
 * becoming forgeable (see lib/ai/draft-token.ts).
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    if (user.role !== Role.CITIZEN) {
      throw forbidden(`User ${user.id} with role ${user.role} requested draft analysis.`);
    }

    const limit = checkRateLimit(
      `draft-analysis:${user.id}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS,
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many review requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }

    const raw = form.get("report");

    if (typeof raw !== "string") {
      return NextResponse.json({ error: "Missing report data." }, { status: 400 });
    }

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Report data must be valid JSON." }, { status: 400 });
    }

    const parsed = createCaseRequestSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Some details need attention before this can be reviewed.",
          fieldErrors: fieldErrorsFrom(parsed.error),
        },
        { status: 422 },
      );
    }

    // Sensitivity is derived from the category, never taken from the client.
    const isSensitive = isSensitiveIncidentType(parsed.data.incidentType);

    // THE GATE. Photographs attached to a harassment, stalking or assault report
    // are discarded here and never reach the AI provider. Only non-sensitive
    // civic reports contribute images.
    const images = isSensitive
      ? []
      : collectAnalysisImages(
          await Promise.all(
            form
              .getAll("images")
              .filter((entry): entry is File => entry instanceof File)
              .slice(0, MAX_ANALYSIS_IMAGES)
              .map(async (file) => new Uint8Array(await file.arrayBuffer())),
          ),
        );

    const { result, modelLabel } = await analyseCase({
      incidentType: parsed.data.incidentType,
      description: parsed.data.description,
      incidentDateTime: parsed.data.date
        ? new Date(`${parsed.data.date}T${parsed.data.time || "00:00"}:00`).toISOString()
        : null,
      location: parsed.data.location ?? null,
      isSensitive,
      images,
    });

    const fingerprint = fingerprintReport({
      incidentType: parsed.data.incidentType,
      description: parsed.data.description,
      location: parsed.data.location,
    });

    return NextResponse.json({
      analysis: { ...result, modelLabel, aiAssisted: true },
      analysisToken: signAnalysis(result, fingerprint, user.id, modelLabel),
      imagesAnalysed: images.length,
      isSensitive,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    if (error instanceof AiProviderError) {
      console.error("Draft analysis failed:", error.reason);

      return NextResponse.json(
        { error: PROVIDER_MESSAGE[error.reason] },
        { status: PROVIDER_STATUS[error.reason] },
      );
    }

    console.error("POST /api/report/analysis failed.");

    return NextResponse.json(
      { error: "We couldn't review this report. You can continue without AI review." },
      { status: 500 },
    );
  }
}
