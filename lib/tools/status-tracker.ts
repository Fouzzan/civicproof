import { z } from "zod";

import { findByTrackingId, findLatestSubmitted } from "@/lib/application/repository";
import { isValidTrackingId, normaliseTrackingId } from "@/lib/application/tracking-id";
import { toolError, toolOk, type ToolResult } from "@/lib/tools/types";
import type { ToolContext } from "@/lib/tools/types";

/**
 * Tool 5 — StatusTracker.
 *
 * Reads a persisted status. It has no branch that invents one: if there is no
 * row, the answer is "not found", never a plausible-sounding "under review"
 * (Docs/09-AI-DESIGN.md, safety rule 9).
 */
export const statusTrackerInput = z.object({
  trackingId: z
    .string()
    .max(40)
    .optional()
    .describe(
      "The DEMO-nnnnnn reference, if the citizen quoted one. Omit it to look up their most recent application.",
    ),
});

export type StatusTrackerInput = z.infer<typeof statusTrackerInput>;

export type StatusTrackerOutput = {
  readonly trackingId: string;
  readonly schemeName: string;
  readonly status: string;
  readonly submittedAt: string | null;
  /** Always true in the MVP. The UI must say so wherever this is rendered. */
  readonly simulated: true;
};

export async function runStatusTracker(
  input: StatusTrackerInput,
  context: ToolContext,
): Promise<ToolResult<StatusTrackerOutput>> {
  try {
    const quoted = input.trackingId?.trim();

    if (quoted && quoted.length > 0) {
      if (!isValidTrackingId(quoted)) {
        return toolError(
          "INVALID_INPUT",
          `"${quoted}" is not a valid reference. A Sahayak demo reference looks like DEMO-123456.`,
        );
      }

      // Scoped by userId: another citizen's reference reads as not found.
      const found = await findByTrackingId(context.userId, normaliseTrackingId(quoted));

      return found
        ? toolOk(present(found))
        : toolError("NOT_FOUND", `No application of yours matches ${normaliseTrackingId(quoted)}.`);
    }

    const latest = await findLatestSubmitted(context.userId);

    return latest
      ? toolOk(present(latest))
      : toolError(
          "NOT_FOUND",
          "You have not submitted an application yet, so there is no status to report.",
        );
  } catch {
    return toolError("STORAGE_ERROR", "Application status is temporarily unavailable.");
  }
}

function present(record: {
  trackingId: string | null;
  schemeName: string;
  status: string;
  submittedAt: Date | null;
}): StatusTrackerOutput {
  return {
    // A non-draft row always has a tracking id; the fallback keeps the type
    // honest rather than asserting.
    trackingId: record.trackingId ?? "UNKNOWN",
    schemeName: record.schemeName,
    status: record.status,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    simulated: true,
  };
}
