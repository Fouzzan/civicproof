"use client";

import { useState } from "react";
import { Loader2, RotateCw, Sparkles } from "lucide-react";

import { AiAnalysisCard, type AiAnalysisView } from "@/components/case/ai-analysis-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type { AiAnalysisView };

type AiAnalysisPanelProps = {
  readonly caseId: string;
  readonly initialAnalysis: AiAnalysisView | null;
};

/**
 * AI analysis on a saved case.
 *
 * Most cases arrive here with an analysis already attached, because the review
 * happens during reporting. This panel covers the rest: reports filed when the
 * review was unavailable, and re-running it later.
 *
 * A failure here never makes the page unusable - the case and its details are
 * unaffected.
 */
export function AiAnalysisPanel({ caseId, initialAnalysis }: AiAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AiAnalysisView | null>(initialAnalysis);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function runAnalysis() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/cases/${caseId}/ai-analysis`, {
        method: "POST",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          payload && typeof payload === "object" && "error" in payload
            ? String((payload as { error: unknown }).error)
            : "AI analysis is temporarily unavailable.",
        );
        return;
      }

      if (payload && typeof payload === "object" && "analysis" in payload) {
        setAnalysis((payload as { analysis: AiAnalysisView }).analysis);
      }
    } catch {
      setError("We couldn't reach CivicProof. Check your connection and try again.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-l-4 border-l-primary" size="lg">
      <CardContent className="space-y-5">
        {analysis && !isRunning ? <AiAnalysisCard analysis={analysis} /> : null}

        {!analysis && !isRunning ? (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Sparkles aria-hidden="true" className="size-4" />
              </span>
              <h3 className="text-sm font-semibold tracking-wide uppercase">
                AI-assisted summary
              </h3>
              <Badge variant="outline">Not run</Badge>
            </div>
            {!error ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                This case was filed without an AI review. You can run one now to
                get a suggested severity and reporting direction.
              </p>
            ) : null}
          </div>
        ) : null}

        {isRunning ? (
          <div className="space-y-5">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Analysing your case&hellip;
            </p>
            <div className="space-y-4" aria-hidden="true">
              <Skeleton className="h-4 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Analysis unavailable</AlertTitle>
            <AlertDescription>
              {error} Your case and its details are unchanged.
            </AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="button"
          onClick={runAnalysis}
          disabled={isRunning}
          size="lg"
          variant={analysis ? "outline" : "default"}
        >
          {isRunning ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Analysing your case&hellip;
            </>
          ) : analysis || error ? (
            <>
              <RotateCw aria-hidden="true" />
              Run analysis again
            </>
          ) : (
            <>
              <Sparkles aria-hidden="true" />
              Analyse my case with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
