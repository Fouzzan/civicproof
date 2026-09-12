import { z } from "zod";

import {
  getDraft,
  saveApplicationData,
  saveFacts,
  withdrawConfirmation,
} from "@/lib/application/repository";
import { checkEligibility, missingFactsFor } from "@/lib/eligibility/checker";
import { mergeFacts, normaliseFacts, type FactRejection } from "@/lib/schemes/facts";
import { getSchemeBySlug, SchemeDataError } from "@/lib/schemes/repository";
import type { FactValue } from "@/lib/schemes/types";
import { toolError, toolOk, type ToolContext, type ToolResult } from "@/lib/tools/types";

/**
 * Tool 3 — FormFiller.
 *
 * Prepares a DRAFT application from facts the citizen has already given. It
 * writes no status, allocates no tracking id and submits nothing — its output
 * exists to be shown to the citizen and corrected.
 *
 * It refuses to build a form for someone the rules have already ruled out, so
 * nobody is walked through filling in an application they cannot use.
 */
export const formFillerInput = z.object({
  schemeSlug: z.string().min(1).describe("The slug of the scheme being applied for."),
  facts: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional()
    .describe(
      "Any further facts the citizen has stated, such as their name or district. Only include what they actually said.",
    ),
});

export type FormFillerInput = z.infer<typeof formFillerInput>;

export type ApplicationFieldView = {
  readonly id: string;
  readonly label: string;
  readonly kind: "number" | "boolean" | "text";
  readonly unit?: string;
  readonly value: FactValue | null;
};

export type FormFillerOutput = {
  readonly applicationId: string;
  readonly schemeSlug: string;
  readonly schemeName: string;
  readonly isDemo: boolean;
  readonly fields: readonly ApplicationFieldView[];
  readonly missing: readonly { id: string; label: string; question: string }[];
  /** True only when every required field is present. */
  readonly readyToConfirm: boolean;
  readonly rejected: readonly FactRejection[];
  /** Restated on every response so it cannot be lost in summarisation. */
  readonly notSubmitted: true;
};

export async function runFormFiller(
  input: FormFillerInput,
  context: ToolContext,
): Promise<ToolResult<FormFillerOutput>> {
  try {
    const scheme = await getSchemeBySlug(input.schemeSlug);

    if (!scheme) {
      return toolError("SCHEME_NOT_FOUND", `"${input.schemeSlug}" is not a supported scheme.`);
    }

    // Scoped to this scheme: with six schemes in the catalogue, "the citizen's
    // most recent draft" may belong to a different one entirely.
    const draft = await getDraft(context.userId, scheme.slug);

    if (!draft) {
      return toolError(
        "NO_APPLICATION",
        "There is no draft for this scheme yet. Run the eligibility check first.",
      );
    }

    const { accepted, rejected } = normaliseFacts(scheme, input.facts ?? {});
    const merged = mergeFacts(draft.collectedFacts, accepted);

    if (Object.keys(accepted).length > 0) {
      const saved = await saveFacts(context.userId, draft.id, merged);

      if (!saved) {
        return toolError(
          "ALREADY_SUBMITTED",
          "This application has already been submitted and can no longer be changed.",
        );
      }

      // A changed value invalidates an earlier confirmation.
      if (draft.confirmedAt) {
        await withdrawConfirmation(context.userId, draft.id);
      }
    }

    // Re-evaluated from the merged facts, so a correction that breaks
    // eligibility stops the form here rather than producing an application the
    // citizen cannot use.
    const eligibility = checkEligibility(scheme, merged);

    if (eligibility.outcome === "NOT_ELIGIBLE") {
      return toolError(
        "NOT_ELIGIBLE",
        "The citizen does not meet this scheme's criteria, so no application should be prepared. Explain the failed criteria instead.",
      );
    }

    if (eligibility.outcome === "MORE_INFORMATION_NEEDED") {
      return toolError(
        "INCOMPLETE_APPLICATION",
        "Eligibility is not settled yet. Ask for the outstanding facts before preparing the application.",
      );
    }

    const applicationFacts = scheme.facts.filter((fact) => fact.forApplication);

    const fields: readonly ApplicationFieldView[] = applicationFacts.map((fact) => ({
      id: fact.id,
      label: fact.label,
      kind: fact.kind,
      ...(fact.unit ? { unit: fact.unit } : {}),
      value: merged[fact.id] ?? null,
    }));

    const missingIds = missingFactsFor(scheme, merged, "application");
    const missing = missingIds.flatMap((factId) => {
      const fact = scheme.facts.find((candidate) => candidate.id === factId);

      return fact ? [{ id: fact.id, label: fact.label, question: fact.question }] : [];
    });

    const applicationData = Object.fromEntries(
      fields.filter((field) => field.value !== null).map((field) => [field.id, field.value]),
    );

    await saveApplicationData(context.userId, draft.id, applicationData);

    return toolOk({
      applicationId: draft.id,
      schemeSlug: scheme.slug,
      schemeName: scheme.name,
      isDemo: scheme.isDemo,
      fields,
      missing,
      readyToConfirm: missing.length === 0,
      rejected,
      notSubmitted: true,
    });
  } catch (error) {
    if (error instanceof SchemeDataError) {
      return toolError("SCHEME_DATA_ERROR", error.message);
    }

    return toolError("STORAGE_ERROR", "The application service is temporarily unavailable.");
  }
}
