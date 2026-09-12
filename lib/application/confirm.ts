import { confirmDraft, getById, type ApplicationRecord } from "@/lib/application/repository";
import { checkEligibility, missingFactsFor } from "@/lib/eligibility/checker";
import { getSchemeBySlug } from "@/lib/schemes/repository";

/**
 * The confirmation policy.
 *
 * Extracted from the route so it can be exercised directly by the verification
 * scripts. The route stays a thin HTTP wrapper around this.
 *
 * Everything is re-checked here from STORED facts rather than trusting the
 * `readyToConfirm` flag the browser last rendered. That flag can be stale — the
 * citizen may have corrected something since the card was drawn — and
 * confirming a half-filled or newly-ineligible application would carry it
 * through to submission.
 */
export type ConfirmOutcome =
  | { readonly kind: "CONFIRMED"; readonly record: ApplicationRecord }
  | { readonly kind: "NOT_FOUND" }
  | { readonly kind: "SCHEME_UNAVAILABLE" }
  | { readonly kind: "NOT_ELIGIBLE" }
  | { readonly kind: "INCOMPLETE"; readonly missing: readonly string[] };

export async function confirmApplication(
  userId: string,
  applicationId: string,
): Promise<ConfirmOutcome> {
  const draft = await getById(userId, applicationId);

  if (!draft || draft.status !== "DRAFT") {
    return { kind: "NOT_FOUND" };
  }

  const scheme = await getSchemeBySlug(draft.schemeSlug);

  if (!scheme) {
    return { kind: "SCHEME_UNAVAILABLE" };
  }

  if (checkEligibility(scheme, draft.collectedFacts).outcome !== "LIKELY_ELIGIBLE") {
    return { kind: "NOT_ELIGIBLE" };
  }

  const missing = missingFactsFor(scheme, draft.collectedFacts, "application");

  if (missing.length > 0) {
    return { kind: "INCOMPLETE", missing };
  }

  const confirmed = await confirmDraft(userId, applicationId);

  return confirmed ? { kind: "CONFIRMED", record: confirmed } : { kind: "NOT_FOUND" };
}
