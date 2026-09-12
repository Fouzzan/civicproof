import { CheckCircle2, Info, Lock, Paperclip } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth";
import { isValidCaseId } from "@/lib/cases/case-id";
import { prisma } from "@/lib/db";
import { getIncidentType, type IncidentTypeValue } from "@/lib/report/incident-types";

export const metadata = { title: "Report created" };

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

/**
 * Confirmation shown immediately after a case is created.
 *
 * This is NOT the case tracking screen — it shows only what truthfully happened:
 * a report exists, with an ID and one timeline event. Nothing claims submission
 * to any authority.
 */
export default async function CaseCreatedPage({
  params,
}: PageProps<"/report/created/[caseId]">) {
  const { caseId } = await params;

  if (!isValidCaseId(caseId)) {
    notFound();
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  // The case ID alone is never sufficient: the reporter must match. An
  // unauthorised lookup gets 404, not 403, so the response does not confirm
  // that a case exists (Docs/13-SECURITY.md §3).
  const found = await prisma.case.findFirst({
    where: { caseId, reporterId: user.id },
    include: {
      timeline: { orderBy: { createdAt: "asc" } },
      // Metadata only. storageReference is never rendered: the blob URL stays
      // server-side, and any future viewer must proxy bytes behind an
      // authorization check (Docs/13-SECURITY.md §10).
      evidence: {
        orderBy: { createdAt: "asc" },
        select: { id: true, fileName: true, createdAt: true },
      },
    },
  });

  if (!found) {
    notFound();
  }

  const incidentType = getIncidentType(found.incidentType as IncidentTypeValue);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <div className="flex items-start gap-3">
        <CheckCircle2 aria-hidden="true" className="mt-1 size-6 shrink-0 text-primary" />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Your report has been created
          </h1>
          <p className="text-sm text-muted-foreground">
            CivicProof has saved your report and given it a reference you can keep.
          </p>
        </div>
      </div>

      <section
        aria-labelledby="case-reference"
        className="mt-6 rounded-lg border border-border p-4"
      >
        <h2 id="case-reference" className="text-sm text-muted-foreground">
          Your CivicProof case
        </h2>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
          {found.caseId}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Type</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
              {incidentType?.label ?? found.incidentType}
              {found.isSensitive ? (
                <Badge variant="secondary">
                  <Lock aria-hidden="true" />
                  Private
                </Badge>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Created</dt>
            <dd className="mt-0.5 text-sm">{formatTimestamp(found.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd className="mt-0.5 text-sm">
              <Badge variant="outline">{found.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Complaint</dt>
            <dd className="mt-0.5 text-sm">
              <Badge variant="outline">{found.handoffStatus}</Badge>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="case-evidence" className="mt-6">
        <h2 id="case-evidence" className="text-sm font-semibold tracking-wide uppercase">
          Evidence
        </h2>
        {found.evidence.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No photos were attached to this report.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {found.evidence.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <Paperclip aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.fileName}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Attached files are private to you and authorised case handlers.
          CivicProof does not treat a photo as proof simply because it was
          uploaded.
        </p>
      </section>

      <section aria-labelledby="case-timeline" className="mt-6">
        <h2 id="case-timeline" className="text-sm font-semibold tracking-wide uppercase">
          What has happened so far
        </h2>
        <ol className="mt-3 space-y-3">
          {found.timeline.map((event) => (
            <li key={event.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              />
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                {event.description ? (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                ) : null}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTimestamp(event.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Alert className="mt-6">
        <Info />
        <AlertTitle>This has not been sent to any authority</AlertTitle>
        <AlertDescription>
          Your report exists in CivicProof only. No complaint has been generated
          and nothing has been submitted to a government or authority system.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/report">Report another incident</Link>
        </Button>
      </div>
    </div>
  );
}
