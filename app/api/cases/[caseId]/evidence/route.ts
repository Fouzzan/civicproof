import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth";
import { isValidCaseId } from "@/lib/cases/case-id";
import { prisma } from "@/lib/db";
import { EvidenceUploadError, uploadEvidenceForCase } from "@/lib/evidence/upload-evidence";

// Docs/08-API.md §3.2
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const FAILURE_STATUS = {
  MISSING_FILE: 400,
  UNSUPPORTED_TYPE: 415,
  TOO_LARGE: 413,
  TOO_MANY_FILES: 409,
  STORAGE_NOT_CONFIGURED: 503,
} as const;

const FAILURE_MESSAGE = {
  MISSING_FILE: "No image was received. Please choose a photo and try again.",
  UNSUPPORTED_TYPE: "That file is not a supported image. Use JPEG, PNG, WebP or HEIC.",
  TOO_LARGE: "That image is too large. The limit is 10 MB.",
  TOO_MANY_FILES: "This case already has the maximum number of photos.",
  STORAGE_NOT_CONFIGURED: "Evidence storage is not configured. Your case is unaffected.",
} as const;

/**
 * POST /api/cases/:caseId/evidence — attach one image to a case.
 *
 * Order matches Docs/13-SECURITY.md §16:
 *   authenticate -> load resource -> authorize -> validate -> store
 */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/cases/[caseId]/evidence">,
) {
  try {
    const user = await requireAuthenticatedUser();
    const { caseId } = await params;

    if (!isValidCaseId(caseId)) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const limit = checkRateLimit(
      `upload-evidence:${user.id}`,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_MS,
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many uploads recently. Please wait and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    // Authorization is part of the lookup: the case must belong to this
    // reporter. A case ID alone proves nothing (Docs/13-SECURITY.md §3), and an
    // unauthorised target returns 404 so the response never confirms that
    // someone else's case exists.
    const target = await prisma.case.findFirst({
      where: { caseId, reporterId: user.id },
    });

    if (!target) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Expected a multipart/form-data upload." },
        { status: 400 },
      );
    }

    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: FAILURE_MESSAGE.MISSING_FILE }, { status: 400 });
    }

    const rawDescription = form.get("description");
    const description =
      typeof rawDescription === "string" ? rawDescription.slice(0, 500) : undefined;

    const evidence = await uploadEvidenceForCase(file, target, user, description);

    // Deliberately no storageReference / blob URL in the response: the client
    // never needs it and must not be able to reach the object directly.
    return NextResponse.json(
      {
        evidence: {
          id: evidence.id,
          fileName: evidence.fileName,
          fileType: evidence.fileType,
          createdAt: evidence.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }

    if (error instanceof EvidenceUploadError) {
      // Reason only — never the filename or any file content.
      console.error("Evidence upload rejected:", error.reason);

      return NextResponse.json(
        { error: FAILURE_MESSAGE[error.reason] },
        { status: FAILURE_STATUS[error.reason] },
      );
    }

    console.error("POST /api/cases/[caseId]/evidence failed.");

    return NextResponse.json(
      { error: "We couldn't attach that photo. Your case is safe — please try again." },
      { status: 500 },
    );
  }
}
