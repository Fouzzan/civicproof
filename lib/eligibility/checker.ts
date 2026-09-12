import type {
  CollectedFacts,
  EligibilityRule,
  FactValue,
  SchemeDefinition,
} from "@/lib/schemes/types";

/**
 * Deterministic eligibility evaluation.
 *
 * This module is THE eligibility authority for the MVP (Docs/09-AI-DESIGN.md
 * §3). It is a pure function of (scheme rules, collected facts) — no network,
 * no database, no model. That is what makes the result reproducible, unit
 * testable, and impossible for a prompt to talk its way around.
 */

export type EligibilityOutcome =
  | "LIKELY_ELIGIBLE"
  | "NOT_ELIGIBLE"
  | "MORE_INFORMATION_NEEDED";

export type CriterionStatus = "PASSED" | "FAILED" | "UNKNOWN";

export type CriterionResult = {
  readonly id: string;
  readonly label: string;
  readonly status: CriterionStatus;
  readonly fact: string;
  /** What the citizen told us, or null when the fact is still unknown. */
  readonly actual: FactValue | null;
  /** Populated only for a FAILED criterion, so an explanation cannot be invented. */
  readonly failureHint: string | null;
};

export type EligibilityResult = {
  readonly outcome: EligibilityOutcome;
  readonly schemeSlug: string;
  readonly schemeName: string;
  readonly isDemo: boolean;
  readonly criteria: readonly CriterionResult[];
  /** Fact ids still needed before the decision can be completed. */
  readonly missingFacts: readonly string[];
};

/** Evaluate one rule against one value. Null means the fact is unusable. */
function evaluateRule(rule: EligibilityRule, value: FactValue | undefined): CriterionStatus {
  if (value === undefined || value === null) {
    return "UNKNOWN";
  }

  switch (rule.kind) {
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return "UNKNOWN";
      }

      switch (rule.op) {
        case "gte":
          return value >= rule.value ? "PASSED" : "FAILED";
        case "lte":
          return value <= rule.value ? "PASSED" : "FAILED";
        case "gt":
          return value > rule.value ? "PASSED" : "FAILED";
        case "lt":
          return value < rule.value ? "PASSED" : "FAILED";
      }
    }

    case "range": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return "UNKNOWN";
      }

      return value >= rule.min && value <= rule.max ? "PASSED" : "FAILED";
    }

    case "boolean": {
      if (typeof value !== "boolean") {
        return "UNKNOWN";
      }

      return value === rule.expected ? "PASSED" : "FAILED";
    }
  }
}

/**
 * Fact ids the scheme still needs.
 *
 * `purpose` keeps the agent from asking for application-only details (a name, a
 * district) before eligibility has even been established — nobody should have
 * to fill in a form to be told they do not qualify.
 */
export function missingFactsFor(
  scheme: SchemeDefinition,
  facts: CollectedFacts,
  purpose: "eligibility" | "application",
): readonly string[] {
  return scheme.facts
    .filter((fact) => (purpose === "eligibility" ? fact.forEligibility : fact.forApplication))
    .filter((fact) => {
      const value = facts[fact.id];

      if (value === undefined || value === null) {
        return true;
      }

      return typeof value === "string" ? value.trim().length === 0 : false;
    })
    .map((fact) => fact.id);
}

/**
 * Evaluate every criterion of a scheme.
 *
 * Outcome precedence is deliberate: a criterion that definitively fails settles
 * the answer even when other facts are still unknown, because no later answer
 * can undo it. Asking further questions in that situation would be busywork
 * that implies the refusal is still in doubt.
 */
export function checkEligibility(
  scheme: SchemeDefinition,
  facts: CollectedFacts,
): EligibilityResult {
  const criteria: readonly CriterionResult[] = scheme.rules.map((rule) => {
    const value = facts[rule.fact];
    const status = evaluateRule(rule, value);

    return {
      id: rule.id,
      label: rule.label,
      status,
      fact: rule.fact,
      actual: status === "UNKNOWN" ? (value ?? null) : value,
      failureHint: status === "FAILED" ? rule.failureHint : null,
    };
  });

  const hasFailure = criteria.some((criterion) => criterion.status === "FAILED");
  const hasUnknown = criteria.some((criterion) => criterion.status === "UNKNOWN");

  const outcome: EligibilityOutcome = hasFailure
    ? "NOT_ELIGIBLE"
    : hasUnknown
      ? "MORE_INFORMATION_NEEDED"
      : "LIKELY_ELIGIBLE";

  return {
    outcome,
    schemeSlug: scheme.slug,
    schemeName: scheme.name,
    isDemo: scheme.isDemo,
    criteria,
    missingFacts: hasFailure ? [] : missingFactsFor(scheme, facts, "eligibility"),
  };
}
