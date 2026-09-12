import { z } from "zod";

import { submitApplication } from "@/lib/application/repository";
import { toolError, toolOk, type ToolContext, type ToolResult } from "@/lib/tools/types";

/**
 * Tool 4 — ApplicationSubmitter.
 *
 * Performs the simulated submission and allocates the tracking id.
 *
 * Note what is ABSENT from the input schema: there is no `confirmed` argument.
 * That is the whole design. Confirmation is a timestamp written by
 * POST /api/application/confirm when the citizen presses the button, and this
 * tool reads it from the row inside the submitting transaction. The model can
 * call this tool whenever it likes; without a real confirmation it simply gets
 * CONFIRMATION_REQUIRED back (Docs/09-AI-DESIGN.md, safety rule 7).
 */
export const applicationSubmitterInput = z.object({
  applicationId: z
    .string()
    .min(1)
    .describe("The applicationId returned by FormFiller."),
});

export type ApplicationSubmitterInput = z.infer<typeof applicationSubmitterInput>;

export type ApplicationSubmitterOutput = {
  readonly trackingId: string;
  readonly schemeName: string;
  readonly status: string;
  readonly submittedAt: string;
  /** Always true. Every surface rendering this must say so. */
  readonly simulated: true;
  readonly disclosure: string;
};

const DISCLOSURE =
  "This application was recorded in the Sahayak demonstration system only. " +
  "It has NOT been sent to any real government department.";

export async function runApplicationSubmitter(
  input: ApplicationSubmitterInput,
  context: ToolContext,
): Promise<ToolResult<ApplicationSubmitterOutput>> {
  try {
    const outcome = await submitApplication(context.userId, input.applicationId);

    switch (outcome.kind) {
      case "NOT_FOUND":
        return toolError("NOT_FOUND", "No such application belongs to this citizen.");

      case "NOT_CONFIRMED":
        return toolError(
          "CONFIRMATION_REQUIRED",
          "The citizen has not confirmed this application. Show them the application to review and ask them to press the confirm button. Do NOT tell them it was submitted.",
        );

      case "ALREADY_SUBMITTED":
        return toolError(
          "ALREADY_SUBMITTED",
          `This application was already submitted. Its reference is ${outcome.record.trackingId}. Do not submit it again.`,
        );

      case "SUBMITTED":
        return toolOk({
          trackingId: outcome.record.trackingId ?? "",
          schemeName: outcome.record.schemeName,
          status: outcome.record.status,
          submittedAt: (outcome.record.submittedAt ?? new Date()).toISOString(),
          simulated: true,
          disclosure: DISCLOSURE,
        });
    }
  } catch {
    // A persistence failure must produce NO success state, NO tracking id and
    // no claim of submission.
    return toolError(
      "STORAGE_ERROR",
      "The application could not be recorded. Nothing was submitted. Tell the citizen plainly and invite them to try again.",
    );
  }
}
