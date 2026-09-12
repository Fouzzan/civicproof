import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { ReportWizard } from "@/components/report/report-wizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAuthenticatedUser } from "@/lib/auth";

export const metadata = {
  title: "Report an incident",
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Report an Incident</h1>
        <p className="text-sm text-muted-foreground">
          Answer a few short questions. You can go back at any point.
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
  );
}
