"use client";

import Image from "next/image";
import { ArrowDown, Loader2, Pencil, RotateCw, Sparkles } from "lucide-react";

import { AiAnalysisCard, type AiAnalysisView } from "@/components/case/ai-analysis-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectedEvidence } from "@/lib/report/evidence";

type StepAiReviewProps = {
  readonly status: "loading" | "ready" | "failed";
  readonly analysis: AiAnalysisView | null;
  readonly error?: string;
  readonly originalDescription: string;
  readonly evidence: readonly SelectedEvidence[];
  readonly isSensitive: boolean;
  readonly imagesAnalysed: number;
  readonly onRetry: () => void;
  readonly onEditReport: () => void;
};

/** A skeleton shaped like the analysis it replaces, so the layout does not jump. */
function ReviewSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

/**
 * The centrepiece step: what CivicProof made of the report, shown before
 * anything is saved.
 *
 * The citizen's own words sit above the AI's interpretation, in a separate card
 * with its own accent, and are never replaced. The arrow between them is the
 * whole argument of the screen — one is the input, the other is a reading of
 * it, and the interface must never let the second be mistaken for the first
 * (Docs/11-UI-UX.md §13).
 */
export function StepAiReview({
  status,
  analysis,
  error,
  originalDescription,
  evidence,
  isSensitive,
  imagesAnalysed,
  onRetry,
  onEditReport,
}: StepAiReviewProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-semibold tracking-tight">AI-assisted review</h2>
          <Badge variant="outline">Nothing saved yet</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Review what CivicProof understood, then decide whether to file it.
        </p>
      </div>

      <Card className="border-l-4 border-l-border">
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Your original report
            </h3>
            <Badge variant="secondary">Your words, unchanged</Badge>
          </div>

          <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
            {originalDescription}
          </p>

          {evidence.length > 0 ? (
            <>
              <Separator />
              <div className="space-y-2.5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Evidence ({evidence.length})
                </p>
                <ul className="flex flex-wrap gap-2">
                  {evidence.map((item) => (
                    <li
                      key={item.id}
                      className="relative size-16 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                    >
                      <Image
                        src={item.previewUrl}
                        alt={`Preview of ${item.file.name}`}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isSensitive
                    ? "Private report — your photos are not sent to any AI service."
                    : imagesAnalysed > 0
                      ? `${imagesAnalysed} photo${imagesAnalysed === 1 ? "" : "s"} included in the review below.`
                      : "Photos are attached to your report."}
                </p>
              </div>
            </>
          ) : null}

          <Button type="button" variant="ghost" size="sm" onClick={onEditReport}>
            <Pencil aria-hidden="true" />
            Edit report
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3" aria-hidden="true">
        <Separator className="flex-1" />
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ArrowDown className="size-4" />
        </span>
        <Separator className="flex-1" />
      </div>

      <Card className="border-l-4 border-l-primary" size="lg">
        <CardContent>
          {status === "loading" ? (
            <div className="space-y-5">
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Reading your report&hellip;
              </p>
              <ReviewSkeleton />
            </div>
          ) : null}

          {status === "failed" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-4" />
                </span>
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  AI-assisted summary
                </h3>
                <Badge variant="outline">Unavailable</Badge>
              </div>

              <Alert>
                <AlertTitle>The review could not run</AlertTitle>
                <AlertDescription>
                  {error ?? "The review service could not be reached."} This does
                  not affect your report — you can file it exactly as written, and
                  run the review later from your case page.
                </AlertDescription>
              </Alert>

              <Button type="button" variant="outline" size="lg" onClick={onRetry}>
                <RotateCw aria-hidden="true" />
                Try review again
              </Button>
            </div>
          ) : null}

          {status === "ready" && analysis ? <AiAnalysisCard analysis={analysis} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
