import { put } from "@vercel/blob";
import type { Case, Evidence, User } from "@prisma/client";

import { prisma } from "@/lib/db";
import { detectImageType } from "@/lib/evidence/image-signature";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/report/evidence";

/**
 * Failure modes the route maps onto HTTP status codes (Docs/08-API.md §3.2).
 */
export type EvidenceUploadFailure =
  | "MISSING_FILE"
  | "UNSUPPORTED_TYPE"
  | "TOO_LARGE"
  | "TOO_MANY_FILES"
  | "STORAGE_NOT_CONFIGURED";

export class EvidenceUploadError extends Error {
  readonly reason: EvidenceUploadFailure;

  constructor(reason: EvidenceUploadFailure, message: string) {
    super(message);
    this.name = "EvidenceUploadError";
    this.reason = reason;
  }
}

/** Strip any path components a client may have embedded in the filename. */
function safeFileName(rawName: string): string {
  const base = rawName.split(/[/\\]/).pop() ?? "upload";

  return base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120) || "upload";
}

/**
 * Store one image against a case the caller is already authorized for.
 *
 * Authorization is NOT performed here — the route resolves the case through the
 * authenticated user before calling this. Everything the database records is
 * derived server-side: the caller supplies bytes and a filename, nothing else.
 */
export async function uploadEvidenceForCase(
  file: File,
  target: Case,
  uploader: User,
  description?: string,
): Promise<Evidence> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new EvidenceUploadError(
      "STORAGE_NOT_CONFIGURED",
      "BLOB_READ_WRITE_TOKEN is not set.",
    );
  }

  if (file.size === 0) {
    throw new EvidenceUploadError("MISSING_FILE", "The uploaded file is empty.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new EvidenceUploadError("TOO_LARGE", "The file exceeds the size limit.");
  }

  const existingCount = await prisma.evidence.count({ where: { caseId: target.id } });

  if (existingCount >= MAX_FILE_COUNT) {
    throw new EvidenceUploadError(
      "TOO_MANY_FILES",
      `This case already has ${existingCount} evidence files.`,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // The declared type is a hint; the bytes decide. A mismatch is rejected rather
  // than trusted, so a renamed executable cannot enter the store as an image.
  const detectedType = detectImageType(bytes);

  if (!detectedType || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(detectedType)) {
    throw new EvidenceUploadError(
      "UNSUPPORTED_TYPE",
      "The file is not a supported image.",
    );
  }

  const fileName = safeFileName(file.name);

  // Vercel Blob only supports `access: "public"`, so the object is readable by
  // anyone holding its URL. Two mitigations, per Docs/13-SECURITY.md §10:
  //   - addRandomSuffix makes the URL unguessable;
  //   - the URL is stored here and NEVER returned to a client. Any future
  //     viewer must proxy the bytes behind a case-authorization check.
  const stored = await put(`cases/${target.id}/evidence/${fileName}`, Buffer.from(bytes), {
    access: "public",
    addRandomSuffix: true,
    contentType: detectedType,
  });

  return prisma.evidence.create({
    data: {
      caseId: target.id,
      fileName,
      fileType: detectedType,
      storageReference: stored.url,
      description: description?.trim() || null,
      uploadedBy: uploader.id,
    },
  });
}
