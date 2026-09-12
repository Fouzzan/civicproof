import { ApplicationStatus, Prisma } from "@prisma/client";

import { generateTrackingId } from "@/lib/application/tracking-id";
import { prisma } from "@/lib/db";
import type { EligibilityResult } from "@/lib/eligibility/checker";
import type { CollectedFacts } from "@/lib/schemes/types";

/**
 * Data access for applications.
 *
 * Every function takes a userId and scopes its query by it, so an application
 * belonging to someone else reads as "not found" rather than "forbidden". The
 * agent never issues a query itself — it calls tools, tools call this.
 */

export type ApplicationRecord = {
  readonly id: string;
  readonly schemeSlug: string;
  readonly schemeName: string;
  readonly isDemo: boolean;
  readonly status: ApplicationStatus;
  readonly trackingId: string | null;
  readonly collectedFacts: CollectedFacts;
  readonly applicationData: Readonly<Record<string, unknown>>;
  readonly eligibilityResult: EligibilityResult | null;
  readonly confirmedAt: Date | null;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;
};

type RowWithScheme = Prisma.ApplicationGetPayload<{ include: { scheme: true } }>;

/** Json columns arrive as `unknown`; narrow defensively rather than trusting. */
function asFacts(value: unknown): CollectedFacts {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as CollectedFacts)
    : {};
}

function toRecord(row: RowWithScheme): ApplicationRecord {
  return {
    id: row.id,
    schemeSlug: row.scheme.slug,
    schemeName: row.scheme.name,
    isDemo: row.scheme.isDemo,
    status: row.status,
    trackingId: row.trackingId,
    collectedFacts: asFacts(row.collectedFacts),
    applicationData: asFacts(row.applicationData),
    eligibilityResult: (row.eligibilityResult as EligibilityResult | null) ?? null,
    confirmedAt: row.confirmedAt,
    submittedAt: row.submittedAt,
    createdAt: row.createdAt,
  };
}

/** The in-progress draft for a scheme, created on first use. */
export async function getOrCreateDraft(
  userId: string,
  schemeId: string,
): Promise<ApplicationRecord> {
  const existing = await prisma.application.findFirst({
    where: { userId, schemeId, status: ApplicationStatus.DRAFT },
    include: { scheme: true },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return toRecord(existing);
  }

  const created = await prisma.application.create({
    data: { userId, schemeId, collectedFacts: {}, applicationData: {} },
    include: { scheme: true },
  });

  return toRecord(created);
}

export async function getDraft(userId: string): Promise<ApplicationRecord | null> {
  const row = await prisma.application.findFirst({
    where: { userId, status: ApplicationStatus.DRAFT },
    include: { scheme: true },
    orderBy: { createdAt: "desc" },
  });

  return row ? toRecord(row) : null;
}

export async function getById(
  userId: string,
  applicationId: string,
): Promise<ApplicationRecord | null> {
  const row = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: { scheme: true },
  });

  return row ? toRecord(row) : null;
}

/**
 * Replace the stored facts.
 *
 * Callers pass the already-merged set, so a correction supersedes the old value
 * rather than being merged underneath it.
 */
export async function saveFacts(
  userId: string,
  applicationId: string,
  facts: CollectedFacts,
): Promise<ApplicationRecord | null> {
  const { count } = await prisma.application.updateMany({
    where: { id: applicationId, userId, status: ApplicationStatus.DRAFT },
    data: { collectedFacts: facts as Prisma.InputJsonValue },
  });

  return count === 0 ? null : getById(userId, applicationId);
}

export async function saveEligibility(
  userId: string,
  applicationId: string,
  result: EligibilityResult,
): Promise<void> {
  await prisma.application.updateMany({
    where: { id: applicationId, userId, status: ApplicationStatus.DRAFT },
    data: { eligibilityResult: result as unknown as Prisma.InputJsonValue },
  });
}

export async function saveApplicationData(
  userId: string,
  applicationId: string,
  data: Readonly<Record<string, unknown>>,
): Promise<void> {
  await prisma.application.updateMany({
    where: { id: applicationId, userId, status: ApplicationStatus.DRAFT },
    data: { applicationData: data as Prisma.InputJsonValue },
  });
}

/**
 * Record explicit confirmation.
 *
 * Called only from the confirmation route, which is driven by a button press —
 * never from a tool. That is what makes confirmation unforgeable by the model:
 * ApplicationSubmitter reads this column, and nothing the model can write sets
 * it (Docs/09-AI-DESIGN.md, safety rule 7).
 */
export async function confirmDraft(
  userId: string,
  applicationId: string,
): Promise<ApplicationRecord | null> {
  const { count } = await prisma.application.updateMany({
    where: { id: applicationId, userId, status: ApplicationStatus.DRAFT },
    data: { confirmedAt: new Date() },
  });

  return count === 0 ? null : getById(userId, applicationId);
}

/** Editing after confirming drops the confirmation, so it is never stale. */
export async function withdrawConfirmation(
  userId: string,
  applicationId: string,
): Promise<void> {
  await prisma.application.updateMany({
    where: { id: applicationId, userId, status: ApplicationStatus.DRAFT },
    data: { confirmedAt: null },
  });
}

export type SubmitOutcome =
  | { readonly kind: "SUBMITTED"; readonly record: ApplicationRecord }
  | { readonly kind: "NOT_CONFIRMED" }
  | { readonly kind: "ALREADY_SUBMITTED"; readonly record: ApplicationRecord }
  | { readonly kind: "NOT_FOUND" };

/**
 * Simulated submission.
 *
 * The status change and the tracking id are written in ONE transaction, so a
 * tracking id can never exist for an application that was not submitted, and a
 * submitted application can never exist without its reference.
 *
 * The confirmation check runs inside the transaction against the stored row,
 * never against anything the caller asserted.
 */
export async function submitApplication(
  userId: string,
  applicationId: string,
): Promise<SubmitOutcome> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.application.findFirst({
      where: { id: applicationId, userId },
      include: { scheme: true },
    });

    if (!row) {
      return { kind: "NOT_FOUND" } as const;
    }

    if (row.status !== ApplicationStatus.DRAFT || row.trackingId) {
      return { kind: "ALREADY_SUBMITTED", record: toRecord(row) } as const;
    }

    if (!row.confirmedAt) {
      return { kind: "NOT_CONFIRMED" } as const;
    }

    // Retry on the vanishingly rare collision against the unique column.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const trackingId = generateTrackingId();
      const taken = await tx.application.findUnique({ where: { trackingId } });

      if (taken) {
        continue;
      }

      const updated = await tx.application.update({
        where: { id: row.id },
        data: {
          status: ApplicationStatus.SUBMITTED,
          trackingId,
          submittedAt: new Date(),
        },
        include: { scheme: true },
      });

      return { kind: "SUBMITTED", record: toRecord(updated) } as const;
    }

    throw new Error("Could not allocate a unique tracking id.");
  });
}

export async function findByTrackingId(
  userId: string,
  trackingId: string,
): Promise<ApplicationRecord | null> {
  const row = await prisma.application.findFirst({
    where: { userId, trackingId },
    include: { scheme: true },
  });

  return row ? toRecord(row) : null;
}

export async function findLatestSubmitted(userId: string): Promise<ApplicationRecord | null> {
  const row = await prisma.application.findFirst({
    where: { userId, status: { not: ApplicationStatus.DRAFT } },
    include: { scheme: true },
    orderBy: { submittedAt: "desc" },
  });

  return row ? toRecord(row) : null;
}
