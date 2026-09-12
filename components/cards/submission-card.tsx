import { CircleCheck } from "lucide-react";

import { SimulatedNotice } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SubmissionView } from "@/lib/agent/cards";
import type { Language } from "@/lib/i18n/language";
import { strings } from "@/lib/i18n/strings";

/**
 * The receipt for a simulated submission.
 *
 * This card renders only when submit_application actually succeeded, so its
 * presence on screen is itself evidence that a row was written. The disclosure
 * text comes from the tool result rather than being written here, so the claim
 * and its caveat can never be separated.
 */
export function SubmissionCard({
  submission,
  language = "en",
}: {
  readonly submission: SubmissionView;
  readonly language?: Language;
}) {
  const t = strings(language);
  const submittedAt = new Intl.DateTimeFormat(language === "ml" ? "ml-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(submission.submittedAt));

  return (
    <Card className="border-l-4 border-l-severity-low">
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-severity-low" />
          <div>
            <h3 className="text-base font-semibold">{t.submissionTitle}</h3>
            <p className="text-sm text-muted-foreground">{submission.schemeName}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t.submissionTrackingLabel}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
            {submission.trackingId}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t.submissionKeepHint}
          </p>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          {t.submissionRecordedAt} {submittedAt}
        </p>

        <SimulatedNotice>{submission.disclosure}</SimulatedNotice>
      </CardContent>
    </Card>
  );
}
