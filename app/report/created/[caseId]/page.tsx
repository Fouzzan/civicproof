import { ArrowLeft, FilePlus2, Info, Lock, MapPin, Paperclip } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AiAnalysisPanel,
  type AiAnalysisView,
} from "@/components/case/ai-analysis-panel";
import { CaseTimeline } from "@/components/case/case-timeline";
import { SeverityBadge } from "@/components/case/severity-badge";
import { StatusBadge } from "@/components/case/status-badge";
import { Container } from "@/components/layout/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAuthenticatedUser } from "@/lib/auth";
import { isValidCaseId } from "@/lib/cases/case-id";
import { prisma } from "@/lib/db";
import { getIncidentType, type IncidentTypeValue } from "@/lib/report/incident-types";

export const metadata = { title: "Your case" };

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

/**
 * A filed case: what exists, and what has actually happened to it.
 *
 * Deliberately not a dashboard. The record and its AI-assisted reading occupy
 * the main column; what the citizen can do next, and the evidence and timeline
 * that back it up, sit alongside. Nothing here implies a complaint was
 * generated or sent anywhere.
 */
export default async function CaseCreatedPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  if (!isValidCaseId(caseId)) {
    notFound();
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Scoped by reporterId: a valid case id belonging to someone else must read
  // as "not found", never as "forbidden" (Docs/13-SECURITY.md §3).
  const found = await prisma.case.findFirst({
    where: { caseId, reporterId: user.id },
    include: {
      timeline: { orderBy: { createdAt: "asc" } },
      // Metadata only. storageReference is never rendered: the blob stays
      // private and any future viewer must proxy bytes behind an
      // authorization check (Docs/13-SECURITY.md §10).
      evidence: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fileName: true, createdAt: true },
      },
      aiAnalysis: true,
    },
  });

  if (!found) {
    notFound();
  }

  const incidentType = getIncidentType(found.incidentType as IncidentTypeValue);

  // structuredData is Json in the schema, so it is narrowed defensively rather
  // than trusted - a malformed record must not break the page.
  const structured = (found.aiAnalysis?.structuredData ?? {}) as Record<string, unknown>;
  const text = (key: string): string | null =>
    typeof structured[key] === "string" ? (structured[key] as string) : null;

  const storedAnalysis: AiAnalysisView | null =
    found.aiAnalysis && found.aiAnalysis.severitySuggestion
      ? {
          summary: found.aiAnalysis.summary,
          suggestedCategory: text("suggestedCategory") ?? found.incidentType,
          severity: found.aiAnalysis.severitySuggestion,
          severityReason: text("severityReason") ?? "",
          reportingDirection: found.aiAnalysis.reportingSuggestion ?? "",
          immediateSafetyGuidance: text("immediateSafetyGuidance"),
          potentiallyRelevantRegulatoryContext: text(
            "potentiallyRelevantRegulatoryContext",
          ),
          modelLabel: found.aiAnalysis.modelLabel,
        }
      : null;

  return (
    <Container width="case">
      <div className="py-8 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/cases">
            <ArrowLeft aria-hidden="true" />
            All cases
          </Link>
        </Button>

        <header className="mt-4 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              CivicProof case
            </p>
            <h1 className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
              {found.caseId}
            </h1>
            <p className="text-sm text-muted-foreground">
              {incidentType?.label ?? found.incidentType} &middot; filed{" "}
              {formatTimestamp(found.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={found.status} />
            {found.severity ? <SeverityBadge severity={found.severity} /> : null}
            {found.isSensitive ? (
              <Badge variant="secondary">
                <Lock aria-hidden="true" />
                Private
              </Badge>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-wide uppercase">
                    Your report
                  </h2>
                  <Badge variant="secondary">Your words, unchanged</Badge>
                </div>

                <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
                  {found.description}
                </p>

                {found.location ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-4 shrink-0" />
                    {found.location}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <section aria-labelledby="ai-analysis">
              <h2 id="ai-analysis" className="sr-only">
                AI-assisted analysis
              </h2>
              <AiAnalysisPanel caseId={found.caseId} initialAnalysis={storedAnalysis} />
            </section>

            <Alert>
              <Info />
              <AlertTitle>This has not been sent to any authority</AlertTitle>
              <AlertDescription>
                Your report exists in CivicProof only. No complaint has been
                generated and nothing has been submitted to a government or
                authority system.
              </AlertDescription>
            </Alert>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="space-y-3">
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  What you can do next
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {found.reportingDirection
                    ? "Take your case reference and the suggested reporting direction to that authority yourself. CivicProof keeps the record either way."
                    : "Keep your case reference. You can run an AI-assisted review to get a suggested reporting direction."}
                </p>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button asChild size="lg">
                    <Link href="/report">
                      <FilePlus2 aria-hidden="true" />
                      Report another issue
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/cases">View my cases</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3">
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  Evidence ({found.evidence.length})
                </h2>

                {found.evidence.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No photos were attached to this report.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {found.evidence.map((item) => (
                      <li key={item.id} className="flex items-center gap-2.5 text-sm">
                        <Paperclip
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{item.fileName}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Attached files are private to you and authorised case handlers.
                  CivicProof does not treat a photo as proof simply because it was
                  uploaded.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  What has happened so far
                </h2>
                <CaseTimeline events={found.timeline} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Container>
  );
}
