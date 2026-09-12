import { Prisma, TimelineEventType, type Case, type User } from "@prisma/client";

import type { AiAnalysisResult } from "@/lib/ai/schema";

import { generateCaseId } from "@/lib/cases/case-id";
import { prisma } from "@/lib/db";
import { isSensitiveIncidentType } from "@/lib/report/incident-types";
import type { CreateCaseRequest } from "@/lib/report/schema";

const MAX_CASE_ID_ATTEMPTS = 5;

/**
 * Combine the separately-collected date and time into one timestamp.
 *
 * A time with no date cannot form a timestamp, so it is dropped rather than
 * guessed — the system must not invent information the reporter did not give
 * (Docs/03-REQUIREMENTS.md FR-003).
 */
function toIncidentDateTime(date?: string, time?: string): Date | null {
  if (!date) {
    return null;
  }

  const parsed = new Date(`${date}T${time && time.length > 0 ? time : "00:00"}:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The five-model schema has no column for the optional "anything else" field, so
 * it is appended to the description under a clear heading. Both halves are the
 * reporter's own words; nothing is rewritten or generated.
 */
function composeDescription(description: string, additionalContext?: string): string {
  const extra = additionalContext?.trim();

  if (!extra) {
    return description.trim();
  }

  return `${description.trim()}\n\nAdditional details from the reporter:\n${extra}`;
}

function isCaseIdCollision(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    String(error.meta?.target ?? "").includes("caseId")
  );
}

/**
 * Create a case and its opening timeline event atomically.
 *
 * Every security-relevant value is derived here, server-side:
 *   reporterId    <- the authenticated user
 *   isSensitive   <- the incident category
 *   status        <- schema default (CREATED)
 *   handoffStatus <- schema default (DRAFT)
 *   actorUserId   <- the authenticated user
 *
 * None of them is ever read from the request body.
 */
/**
 * A analysis that has already been verified as genuinely ours (see
 * lib/ai/draft-token.ts). Callers must not pass unverified client input here.
 */
export type VerifiedAnalysis = {
  readonly result: AiAnalysisResult;
  readonly modelLabel: string;
};

export async function createCaseForReporter(
  input: CreateCaseRequest,
  reporter: User,
  analysis?: VerifiedAnalysis,
): Promise<Case> {
  const isSensitive = isSensitiveIncidentType(input.incidentType);
  const incidentDateTime = toIncidentDateTime(input.date, input.time);
  const description = composeDescription(input.description, input.additionalContext);
  const location = input.location?.trim() || null;

  for (let attempt = 0; attempt < MAX_CASE_ID_ATTEMPTS; attempt += 1) {
    const caseId = generateCaseId();

    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.case.create({
          data: {
            caseId,
            reporterId: reporter.id,
            incidentType: input.incidentType,
            description,
            incidentDateTime,
            location,
            isSensitive,
            // status and handoffStatus intentionally omitted: the schema
            // defaults (CREATED / DRAFT) are the only truthful starting states.
            //
            // Severity and reporting direction are advisory mirrors of the AI
            // analysis, written only when a verified analysis accompanies the
            // report.
            ...(analysis
              ? {
                  severity: analysis.result.severity,
                  severityReason: analysis.result.severityReason,
                  reportingDirection: analysis.result.reportingDirection,
                }
              : {}),
          },
        });

        await tx.timelineEvent.create({
          data: {
            caseId: created.id,
            eventType: TimelineEventType.CASE_CREATED,
            title: "Report created",
            description:
              "The reporter created this case in CivicProof. No complaint has been generated and nothing has been sent to any authority.",
            actorUserId: reporter.id,
          },
        });

        // The analysis was produced before the case existed, so it is stored
        // here in the same transaction: a case never exists with a half-written
        // analysis, and a failure leaves neither.
        if (analysis) {
          await tx.aIAnalysis.create({
            data: {
              caseId: created.id,
              summary: analysis.result.summary,
              structuredData: {
                suggestedCategory: analysis.result.suggestedCategory,
                severityReason: analysis.result.severityReason,
                immediateSafetyGuidance: analysis.result.immediateSafetyGuidance,
                potentiallyRelevantRegulatoryContext:
                  analysis.result.potentiallyRelevantRegulatoryContext,
              },
              severitySuggestion: analysis.result.severity,
              reportingSuggestion: analysis.result.reportingDirection,
              modelLabel: analysis.modelLabel,
            },
          });

          await tx.timelineEvent.create({
            data: {
              caseId: created.id,
              eventType: TimelineEventType.AI_ANALYSIS_COMPLETED,
              title: "AI-assisted analysis completed",
              description:
                "CivicProof produced an AI-assisted summary, severity suggestion and reporting direction before this report was filed. These are suggestions, not official determinations.",
              actorUserId: reporter.id,
            },
          });
        }

        return created;
      });
    } catch (error) {
      if (isCaseIdCollision(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    `Could not allocate a unique case ID after ${MAX_CASE_ID_ATTEMPTS} attempts.`,
  );
}
