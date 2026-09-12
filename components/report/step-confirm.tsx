"use client";

import Image from "next/image";
import { Lock, Sparkles } from "lucide-react";

import { AiAnalysisCard, type AiAnalysisView } from "@/components/case/ai-analysis-card";
import type { IncidentDetailsValues } from "@/components/report/step-incident-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatFileSize, type SelectedEvidence } from "@/lib/report/evidence";
import { getIncidentType, type IncidentTypeValue } from "@/lib/report/incident-types";

type StepConfirmProps = {
  readonly incidentType: IncidentTypeValue | null;
  readonly details: IncidentDetailsValues;
  readonly evidence: readonly SelectedEvidence[];
  readonly analysis: AiAnalysisView | null;
};

function Row({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-5">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed break-words whitespace-pre-wrap">
        {children}
      </dd>
    </div>
  );
}

const NotProvided = () => (
  <span className="text-muted-foreground italic">Not provided</span>
);

/**
 * Last look before anything is written. Everything the citizen is about to file,
 * in the order it will be stored.
 */
export function StepConfirm({
  incidentType,
  details,
  evidence,
  analysis,
}: StepConfirmProps) {
  const type = getIncidentType(incidentType);
  const when = [details.date, details.time].filter(Boolean).join(" at ");

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Confirm and file</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is what will be saved. You can still go back and change anything.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Your report
            </h3>
            <Badge variant="secondary">Provided by you</Badge>
            {type?.sensitive ? (
              <Badge variant="outline">
                <Lock aria-hidden="true" />
                Private
              </Badge>
            ) : null}
          </div>

          <dl className="divide-y divide-border">
            <Row label="Type">{type?.label ?? <NotProvided />}</Row>
            <Row label="What happened">{details.description || <NotProvided />}</Row>
            <Row label="When">{when || <NotProvided />}</Row>
            <Row label="Where">{details.location || <NotProvided />}</Row>
            <Row label="Extra details">
              {details.additionalContext || <NotProvided />}
            </Row>
          </dl>
        </CardContent>
      </Card>

      {evidence.length > 0 ? (
        <Card>
          <CardContent className="space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Evidence ({evidence.length})
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {evidence.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                    <Image
                      src={item.previewUrl}
                      alt={`Preview of ${item.file.name}`}
                      fill
                      unoptimized
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Photos upload privately once you file. They are never published.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card size="lg">
        <CardContent>
          {analysis ? (
            <AiAnalysisCard analysis={analysis} />
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-4" />
                </span>
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  AI-assisted summary
                </h3>
                <Badge variant="outline">Not available</Badge>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your report will be filed without an AI summary. You can run the
                review later from the case page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>What filing does</AlertTitle>
        <AlertDescription>
          Your report is saved to CivicProof with a case reference you can keep.
          It is <strong>not</strong> sent to any authority, and no complaint has
          been generated.
        </AlertDescription>
      </Alert>
    </div>
  );
}
