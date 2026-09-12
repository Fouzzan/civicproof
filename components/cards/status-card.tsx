import { FileSearch } from "lucide-react";

import { SimulatedNotice } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StatusView } from "@/lib/agent/cards";
import type { Language } from "@/lib/i18n/language";
import { strings } from "@/lib/i18n/strings";

function formatDate(value: string | null, language: Language, fallback: string): string {
  if (!value) {
    return fallback;
  }

  // ml-IN gives Malayalam month names; en-IN keeps the familiar English form.
  return new Intl.DateTimeFormat(language === "ml" ? "ml-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/** The stored status of a simulated application. Never a predicted one. */
export function StatusCard({
  status,
  language = "en",
}: {
  readonly status: StatusView;
  readonly language?: Language;
}) {
  const t = strings(language);
  const wording: Record<string, string> = {
    DRAFT: t.statusDRAFT,
    SUBMITTED: t.statusSUBMITTED,
    UNDER_REVIEW: t.statusUNDER_REVIEW,
    APPROVED: t.statusAPPROVED,
    REJECTED: t.statusREJECTED,
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSearch aria-hidden="true" className="size-4" />
          </span>
          <h3 className="text-sm font-semibold tracking-wide uppercase">{t.statusTitle}</h3>
        </div>

        <div className="space-y-1">
          {/* The reference is an identifier, never translated or transliterated. */}
          <p className="font-mono text-2xl font-semibold tracking-tight">
            {status.trackingId}
          </p>
          <p className="text-sm text-muted-foreground">{status.schemeName}</p>
        </div>

        <Separator />

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t.statusCurrent}
            </dt>
            <dd className="mt-1 text-sm font-semibold">
              {wording[status.status] ?? status.status}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t.statusSubmittedAt}
            </dt>
            <dd className="mt-1 text-sm">
              {formatDate(status.submittedAt, language, t.statusNotRecorded)}
            </dd>
          </div>
        </dl>

        <SimulatedNotice>{t.statusSimulated}</SimulatedNotice>
      </CardContent>
    </Card>
  );
}
