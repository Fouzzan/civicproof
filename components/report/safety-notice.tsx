import { Lock, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Immediate safety guidance for sensitive reports.
 *
 * This renders as soon as a sensitive category is chosen and stays visible for
 * the rest of the flow. It must never be gated behind AI analysis or report
 * completion (Docs/03-REQUIREMENTS.md FR-020, Docs/11-UI-UX.md §12).
 *
 * It deliberately names no specific emergency number: the product must not
 * invent an authority or contact (Docs/11-UI-UX.md §6). Verified channels come
 * from trusted configuration in the reporting-direction task.
 */
export function ImmediateSafetyGuidance() {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle>Are you in immediate danger?</AlertTitle>
      <AlertDescription>
        Contact your local emergency services now. CivicProof is not an emergency
        service and cannot send help. You do not need to finish this report, or
        wait for any analysis, to get urgent help.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Private-by-default notice for sensitive cases (Docs/04-FEATURES.md F-015).
 */
export function PrivateReportNotice() {
  return (
    <Alert>
      <Lock />
      <AlertTitle>This report is private</AlertTitle>
      <AlertDescription>
        Only you and authorised case handlers will be able to see it. CivicProof
        has no public feed and never publishes a report or names anyone publicly.
      </AlertDescription>
    </Alert>
  );
}
