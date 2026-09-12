import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilePlus2, Inbox, Lock } from "lucide-react";

import { SeverityBadge } from "@/components/case/severity-badge";
import { StatusBadge } from "@/components/case/status-badge";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getIncidentType, type IncidentTypeValue } from "@/lib/report/incident-types";

export const metadata = { title: "My cases" };

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(value);
}

/**
 * The citizen's own cases.
 *
 * Scoped by reporterId, so this can only ever list cases belonging to the
 * signed-in user - the same rule every case route applies
 * (Docs/13-SECURITY.md section 3).
 */
export default async function CasesPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  const cases = await prisma.case.findMany({
    where: { reporterId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      incidentType: true,
      description: true,
      isSensitive: true,
      status: true,
      severity: true,
      createdAt: true,
    },
  });

  return (
    <Container width="case">
      <div className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My cases
            </h1>
            <p className="text-sm text-muted-foreground">
              {cases.length === 0
                ? "Reports you file will appear here."
                : `${cases.length} case${cases.length === 1 ? "" : "s"} filed.`}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/report">
              <FilePlus2 aria-hidden="true" />
              Report an Issue
            </Link>
          </Button>
        </div>

        {cases.length === 0 ? (
          <Card className="mt-8" size="lg">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Inbox aria-hidden="true" className="size-7" />
              </span>
              <h2 className="mt-5 text-base font-semibold">No cases yet</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                When you report an issue, it gets a reference and a timeline you
                can follow from here.
              </p>
              <Button asChild className="mt-6" size="lg">
                <Link href="/report">
                  Report an Issue
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-6 space-y-3">
            {cases.map((item) => {
              const type = getIncidentType(item.incidentType as IncidentTypeValue);

              return (
                <li key={item.id}>
                  <Link
                    href={`/report/created/${item.caseId}`}
                    className="group block rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/8 transition-all duration-200 outline-none hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            {item.caseId}
                          </span>
                          {item.isSensitive ? (
                            <Badge variant="secondary">
                              <Lock aria-hidden="true" />
                              Private
                            </Badge>
                          ) : null}
                        </div>

                        <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                          {item.description}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {type?.label ?? item.incidentType} &middot;{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <ArrowRight
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      {item.severity ? (
                        <SeverityBadge severity={item.severity} />
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
