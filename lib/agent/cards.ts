/**
 * The wire format between /api/chat and the browser.
 *
 * Deliberately standalone: this module imports nothing, so a client component
 * can use these types with no chance of dragging Prisma, the tool registry or
 * the provider into the browser bundle. It also makes the contract explicit —
 * whatever the tools return internally, only what is described here is ever
 * sent to a citizen.
 */

export type SchemeView = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly isDemo: boolean;
  /** Plain-language criteria, exactly as stored on the scheme. */
  readonly criteria: readonly string[];
};

export type EligibilityOutcomeView =
  | "LIKELY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "MORE_INFORMATION_NEEDED";

export type CriterionView = {
  readonly id: string;
  readonly label: string;
  readonly status: "PASSED" | "FAILED" | "UNKNOWN";
  readonly failureHint: string | null;
};

export type EligibilityView = {
  readonly outcome: EligibilityOutcomeView;
  readonly schemeName: string;
  readonly isDemo: boolean;
  readonly criteria: readonly CriterionView[];
};

export type ApplicationFieldView = {
  readonly id: string;
  readonly label: string;
  readonly kind: "number" | "boolean" | "text";
  readonly unit?: string;
  readonly value: string | number | boolean | null;
};

export type ApplicationView = {
  readonly applicationId: string;
  readonly schemeName: string;
  readonly isDemo: boolean;
  readonly fields: readonly ApplicationFieldView[];
  /** False while a required field is still blank. */
  readonly readyToConfirm: boolean;
};

export type SubmissionView = {
  readonly trackingId: string;
  readonly schemeName: string;
  readonly status: string;
  readonly submittedAt: string;
  readonly simulated: true;
  readonly disclosure: string;
};

export type StatusView = {
  readonly trackingId: string;
  readonly schemeName: string;
  readonly status: string;
  readonly submittedAt: string | null;
  readonly simulated: true;
};

/**
 * A card exists only because a tool actually returned the data behind it.
 * Nothing here can be produced by the model writing prose.
 */
export type AgentCard =
  | { readonly kind: "scheme"; readonly schemes: readonly SchemeView[] }
  | { readonly kind: "eligibility"; readonly eligibility: EligibilityView }
  | { readonly kind: "application"; readonly application: ApplicationView }
  | { readonly kind: "submission"; readonly submission: SubmissionView }
  | { readonly kind: "status"; readonly status: StatusView }
  | { readonly kind: "error"; readonly message: string };

export type ChatTurnResponse = {
  readonly message: string;
  readonly cards: readonly AgentCard[];
};
