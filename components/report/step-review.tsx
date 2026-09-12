"use client";

import { Lock, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, type SelectedEvidence } from "@/lib/report/evidence";
import { getIncidentType, type IncidentTypeValue } from "@/lib/report/incident-types";
import type { IncidentDetailsValues } from "@/components/report/step-incident-details";

type StepReviewProps = {
  readonly incidentType: IncidentTypeValue | null;
  readonly details: IncidentDetailsValues;
  readonly evidence: readonly SelectedEvidence[];
};

function SummaryRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

function NotProvided() {
  return <span className="text-muted-foreground">Not provided</span>;
}

/**
 * Final review.
 *
 * Everything shown here is what the citizen typed. The AI panel is explicitly a
 * "not yet" state: the interface must never imply an analysis has happened when
 * it has not (Docs/03-REQUIREMENTS.md NFR-003).
 */
export function StepReview({ incidentType, details, evidence }: StepReviewProps) {
  const type = getIncidentType(incidentType);
  const dateTime = [details.date, details.time].filter(Boolean).join(" at ");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Review your report</h2>
        <p className="text-sm text-muted-foreground">
          Check the details below. You can go back and change anything.
        </p>
      </div>

      <section aria-labelledby="your-report" className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="your-report" className="text-sm font-semibold tracking-wide uppercase">
            Your report
          </h3>
          <Badge variant="outline">Provided by you</Badge>
        </div>

        <dl className="mt-2">
          <SummaryRow label="Type">
            {type ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                {type.label}
                {type.sensitive ? (
                  <Badge variant="secondary">
                    <Lock aria-hidden="true" />
                    Private
                  </Badge>
                ) : null}
              </span>
            ) : (
              <NotProvided />
            )}
          </SummaryRow>
          <SummaryRow label="What happened">
            {details.description || <NotProvided />}
          </SummaryRow>
          <SummaryRow label="When">{dateTime || <NotProvided />}</SummaryRow>
          <SummaryRow label="Where">{details.location || <NotProvided />}</SummaryRow>
          <SummaryRow label="Extra details">
            {details.additionalContext || <NotProvided />}
          </SummaryRow>
          <SummaryRow label="Evidence">
            {evidence.length === 0 ? (
              <NotProvided />
            ) : (
              <ul className="space-y-1">
                {evidence.map((item) => (
                  <li key={item.id}>
                    {item.file.name}{" "}
                    <span className="text-muted-foreground">
                      ({formatFileSize(item.file.size)}) &middot; selected, not yet uploaded
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SummaryRow>
        </dl>
      </section>

      <section aria-labelledby="ai-analysis" className="rounded-lg border border-dashed border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-muted-foreground" />
          <h3 id="ai-analysis" className="text-sm font-semibold tracking-wide uppercase">
            AI-assisted analysis
          </h3>
          <Badge variant="outline">Not run yet</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          CivicProof has not analysed this report. Once connected, AI will suggest
          a summary, a severity level and where to report it — always labelled as
          a suggestion, never as an official decision.
        </p>
      </section>

      <Alert>
        <AlertTitle>Nothing has been saved yet</AlertTitle>
        <AlertDescription>
          This report has not been created, stored, or sent to any authority.
          Saving arrives in the next implementation task.
        </AlertDescription>
      </Alert>
    </div>
  );
}
