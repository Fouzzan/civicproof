import { FileSearch } from "lucide-react";

import { SimulatedNotice } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StatusView } from "@/lib/agent/cards";

const STATUS_WORDING: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
  DRAFT: "Draft",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/** The stored status of a simulated application. Never a predicted one. */
export function StatusCard({ status }: { readonly status: StatusView }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSearch aria-hidden="true" className="size-4" />
          </span>
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Application status
          </h3>
        </div>

        <div className="space-y-1">
          <p className="font-mono text-2xl font-semibold tracking-tight">
            {status.trackingId}
          </p>
          <p className="text-sm text-muted-foreground">{status.schemeName}</p>
        </div>

        <Separator />

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Current status
            </dt>
            <dd className="mt-1 text-sm font-semibold">
              {STATUS_WORDING[status.status] ?? status.status}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Submitted
            </dt>
            <dd className="mt-1 text-sm">{formatDate(status.submittedAt)}</dd>
          </div>
        </dl>

        <SimulatedNotice>
          This status is <strong>simulated</strong> for the demonstration. No real
          government department is processing this application.
        </SimulatedNotice>
      </CardContent>
    </Card>
  );
}
