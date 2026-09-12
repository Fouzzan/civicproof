import { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileText, ListChecks, Search } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

/**
 * My Sahayak Journey.
 *
 * The section that makes the product's claim concrete: discovery is not the
 * end. Every figure is counted from the citizen's own Application rows — there
 * is no analytics store, no event log and no new API, because the journey is
 * already recorded in the data the flow writes anyway.
 *
 * Scoped by userId, like every other read of a case.
 */
const STATUS_WORDING: Record<ApplicationStatus, string> = {
  DRAFT: "In progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

export async function JourneySummary({ userId }: { readonly userId: string }) {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      trackingId: true,
      submittedAt: true,
      eligibilityResult: true,
      applicationData: true,
      scheme: { select: { name: true, category: true } },
    },
  });

  // Nothing to show yet. An empty dashboard is worse than no dashboard.
  if (applications.length === 0) {
    return null;
  }

  const checked = applications.filter((a) => a.eligibilityResult !== null).length;
  const prepared = applications.filter(
    (a) => Object.keys((a.applicationData ?? {}) as object).length > 0,
  ).length;
  const submitted = applications.filter((a) => a.status !== ApplicationStatus.DRAFT);
  const latest = submitted[0] ?? null;

  const counts = [
    { icon: Search, value: applications.length, label: "services explored" },
    { icon: ListChecks, value: checked, label: "eligibility checks" },
    { icon: FileText, value: prepared, label: "applications prepared" },
    { icon: ClipboardCheck, value: submitted.length, label: "submitted" },
  ] as const;

  return (
    <section aria-labelledby="journey" id="journey" className="border-t border-border bg-card">
      <Container>
        <div className="py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="journey" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                My Sahayak journey
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Where you have got to so far.
              </p>
            </div>

            <Button asChild variant="outline" size="lg">
              <Link href="/chat">
                Continue
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map((count) => (
              <div
                key={count.label}
                className="rounded-xl border border-border bg-background p-5"
              >
                <count.icon aria-hidden="true" className="size-5 text-primary" />
                <dd className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                  {count.value}
                </dd>
                <dt className="mt-1 text-sm text-muted-foreground">{count.label}</dt>
              </div>
            ))}
          </dl>

          {latest ? (
            <div className="mt-5 rounded-xl border border-border bg-background p-5">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Latest application
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xl font-semibold tracking-tight">
                    {latest.trackingId}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {latest.scheme.name} &middot; {STATUS_WORDING[latest.status]}
                    <span className="text-muted-foreground"> &middot; simulated</span>
                  </p>
                </div>

                <Button asChild size="lg">
                  <Link href={`/chat?situation=${encodeURIComponent(`What is the status of ${latest.trackingId}?`)}`}>
                    View status
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
