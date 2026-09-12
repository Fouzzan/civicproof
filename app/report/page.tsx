import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ReportWizard } from "@/components/report/report-wizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthenticatedUser } from "@/lib/auth";

export const metadata = {
  title: "Report an issue",
};

/**
 * Entry point for the citizen reporting flow.
 *
 * The role is read from our own database via the server-side auth foundation —
 * never from the client (Docs/13-SECURITY.md §2).
 */
export default async function ReportPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <Container width="form">
      <div className="py-10 sm:py-14">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Report an Issue
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            Answer a few short questions. You can go back at any point, and
            nothing is saved until you choose to file it.
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock aria-hidden="true" className="size-4 shrink-0" />
            Your report is private to you and authorised case handlers.
          </p>
        </header>

        {user.role === Role.CITIZEN ? (
          <ReportWizard />
        ) : (
          <Alert>
            <AlertTitle>Reporting is for citizen accounts</AlertTitle>
            <AlertDescription>
              You are signed in as an authority user. Authority accounts review and
              update cases rather than filing them.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Container>
  );
}
