import { z } from "zod";

import {
  getOrCreateDraft,
  saveEligibility,
  saveFacts,
  withdrawConfirmation,
} from "@/lib/application/repository";
import { checkEligibility, type EligibilityResult } from "@/lib/eligibility/checker";
import { mergeFacts, normaliseFacts, type FactRejection } from "@/lib/schemes/facts";
import { getSchemeBySlug, getSchemeIdBySlug, SchemeDataError } from "@/lib/schemes/repository";
import { toolError, toolOk, type ToolContext, type ToolResult } from "@/lib/tools/types";

/**
 * Tool 2 — EligibilityChecker.
 *
 * The authoritative eligibility path. The model supplies facts it understood
 * from the conversation; everything after that is deterministic:
 *
 *   normalise -> merge over stored facts -> persist -> evaluate -> persist
 *
 * The model never receives the rules, so it cannot apply them itself, and it
 * never writes the outcome, so it cannot disagree with one.
 */
export const eligibilityCheckerInput = z.object({
  schemeSlug: z.string().min(1).describe("The slug of the scheme, from SchemeMatcher."),
  facts: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .describe(
      "Facts the citizen has actually stated, keyed by fact id. Only include a fact the citizen gave you. Never guess a value.",
    ),
});

export type EligibilityCheckerInput = z.infer<typeof eligibilityCheckerInput>;

export type MissingFactPrompt = {
  readonly id: string;
  readonly label: string;
  readonly question: string;
};

export type EligibilityCheckerOutput = {
  readonly applicationId: string;
  readonly result: EligibilityResult;
  /** Exactly what still needs asking, with the wording to use. */
  readonly missing: readonly MissingFactPrompt[];
  /** Values that could not be used, so the model re-asks instead of assuming. */
  readonly rejected: readonly FactRejection[];
};

export async function runEligibilityChecker(
  input: EligibilityCheckerInput,
  context: ToolContext,
): Promise<ToolResult<EligibilityCheckerOutput>> {
  try {
    const scheme = await getSchemeBySlug(input.schemeSlug);
    const schemeId = await getSchemeIdBySlug(input.schemeSlug);

    if (!scheme || !schemeId) {
      return toolError(
        "SCHEME_NOT_FOUND",
        `"${input.schemeSlug}" is not a supported scheme. Use SchemeMatcher to see what is supported.`,
      );
    }

    const draft = await getOrCreateDraft(context.userId, schemeId);

    // Drop anything the scheme does not define, and reject anything that cannot
    // be read as the right type rather than coercing it into a wrong answer.
    const { accepted, rejected } = normaliseFacts(scheme, input.facts);
    const merged = mergeFacts(draft.collectedFacts, accepted);

    const saved = await saveFacts(context.userId, draft.id, merged);

    if (!saved) {
      return toolError(
        "ALREADY_SUBMITTED",
        "This application has already been submitted and can no longer be changed.",
      );
    }

    // New facts invalidate an earlier confirmation: nobody confirms an
    // application and then silently has its contents change underneath them
    // (safety rules 5 and 6).
    if (Object.keys(accepted).length > 0 && draft.confirmedAt) {
      await withdrawConfirmation(context.userId, draft.id);
    }

    const result = checkEligibility(scheme, merged);
    await saveEligibility(context.userId, draft.id, result);

    const missing = result.missingFacts.flatMap((factId) => {
      const fact = scheme.facts.find((candidate) => candidate.id === factId);

      return fact ? [{ id: fact.id, label: fact.label, question: fact.question }] : [];
    });

    return toolOk({ applicationId: draft.id, result, missing, rejected });
  } catch (error) {
    if (error instanceof SchemeDataError) {
      return toolError("SCHEME_DATA_ERROR", error.message);
    }

    return toolError(
      "STORAGE_ERROR",
      "The eligibility service is temporarily unavailable. Nothing has been lost.",
    );
  }
}
