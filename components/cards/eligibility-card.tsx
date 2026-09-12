import { Check, CircleHelp, X } from "lucide-react";
import { cn } from "cn";

import { DemoBadge } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import type { CriterionView, EligibilityView } from "@/lib/agent/cards";

/**
 * The eligibility result.
 *
 * Every criterion is listed with its own outcome, so the citizen can see which
 * specific rule decided the answer rather than being handed a verdict. The
 * explanation for a failure is the rule's own stored wording — the model has no
 * opportunity to paraphrase a criterion into something it does not say.
 */
const OUTCOME = {
  LIKELY_ELIGIBLE: {
    title: "You appear to be eligible",
    tone: "border-l-severity-low",
    chip: "border-severity-low/30 bg-severity-low/10 text-severity-low",
    label: "Likely eligible",
  },
  NOT_ELIGIBLE: {
    title: "You do not appear to be eligible",
    tone: "border-l-severity-urgent",
    chip: "border-severity-urgent/30 bg-severity-urgent/10 text-severity-urgent",
    label: "Not eligible",
  },
  MORE_INFORMATION_NEEDED: {
    title: "A little more information is needed",
    tone: "border-l-severity-medium",
    chip: "border-severity-medium/30 bg-severity-medium/10 text-severity-medium",
    label: "More information needed",
  },
} as const;

const CRITERION_ICON = {
  PASSED: Check,
  FAILED: X,
  UNKNOWN: CircleHelp,
} as const;

const CRITERION_TONE = {
  PASSED: "text-severity-low",
  FAILED: "text-severity-urgent",
  UNKNOWN: "text-muted-foreground",
} as const;

function Criterion({ criterion }: { readonly criterion: CriterionView }) {
  const Icon = CRITERION_ICON[criterion.status];

  return (
    <li className="flex items-start gap-2.5">
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", CRITERION_TONE[criterion.status])}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm leading-relaxed",
            criterion.status === "UNKNOWN" && "text-muted-foreground",
          )}
        >
          {criterion.label}
        </p>
        {criterion.failureHint ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {criterion.failureHint}
          </p>
        ) : null}
        <span className="sr-only">
          {criterion.status === "PASSED"
            ? "Met"
            : criterion.status === "FAILED"
              ? "Not met"
              : "Not yet known"}
        </span>
      </div>
    </li>
  );
}

export function EligibilityCard({ eligibility }: { readonly eligibility: EligibilityView }) {
  const outcome = OUTCOME[eligibility.outcome];

  return (
    <Card className={cn("border-l-4", outcome.tone)}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                outcome.chip,
              )}
            >
              {outcome.label}
            </span>
            {eligibility.isDemo ? <DemoBadge /> : null}
          </div>

          <h3 className="text-base font-semibold">{outcome.title}</h3>
          <p className="text-sm text-muted-foreground">{eligibility.schemeName}</p>
        </div>

        <ul className="space-y-2.5">
          {eligibility.criteria.map((criterion) => (
            <Criterion key={criterion.id} criterion={criterion} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
