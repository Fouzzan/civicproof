import { TimelineEventType, type AIAnalysis, type Case, type User } from "@prisma/client";

import type { AiAnalysisResult } from "@/lib/ai/schema";
import { prisma } from "@/lib/db";

/**
 * Persist a validated analysis against a case.
 *
 * Side effects follow Docs/08-API.md §3.4 exactly:
 *   - create or replace the single AIAnalysis for the case
 *   - mirror the advisory fields onto Case
 *   - append an AI_ANALYSIS_COMPLETED timeline event
 *
 * Deliberately NOT touched: status, handoffStatus, resolutionText, resolvedAt,
 * authorityUserId, reporterId, isSensitive. The AI has no authority over case
 * state (Docs/09-AI-DESIGN.md §11). reportingChannel is also left alone — an
 * official channel must come from trusted configuration, never from a model.
 */
export async function recordCaseAnalysis(
  target: Case,
  result: AiAnalysisResult,
  modelLabel: string,
  actor: User,
): Promise<AIAnalysis> {
  const structuredData = {
    suggestedCategory: result.suggestedCategory,
    severityReason: result.severityReason,
    immediateSafetyGuidance: result.immediateSafetyGuidance,
    potentiallyRelevantRegulatoryContext: result.potentiallyRelevantRegulatoryContext,
  };

  return prisma.$transaction(async (tx) => {
    // caseId is unique, so this enforces one current analysis per case.
    const analysis = await tx.aIAnalysis.upsert({
      where: { caseId: target.id },
      create: {
        caseId: target.id,
        summary: result.summary,
        structuredData,
        severitySuggestion: result.severity,
        reportingSuggestion: result.reportingDirection,
        modelLabel,
      },
      update: {
        summary: result.summary,
        structuredData,
        severitySuggestion: result.severity,
        reportingSuggestion: result.reportingDirection,
        modelLabel,
      },
    });

    await tx.case.update({
      where: { id: target.id },
      data: {
        severity: result.severity,
        severityReason: result.severityReason,
        reportingDirection: result.reportingDirection,
      },
    });

    await tx.timelineEvent.create({
      data: {
        caseId: target.id,
        eventType: TimelineEventType.AI_ANALYSIS_COMPLETED,
        title: "AI-assisted analysis completed",
        description:
          "CivicProof produced an AI-assisted summary, severity suggestion and reporting direction. These are suggestions, not official determinations, and nothing has been sent to any authority.",
        actorUserId: actor.id,
      },
    });

    return analysis;
  });
}
