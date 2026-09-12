import { Camera, MapPin, Signpost, Sparkles } from "lucide-react";

import { EvidenceThumbnail } from "@/components/marketing/evidence-thumbnail";
import { SeverityMeter } from "@/components/case/severity-badge";
import { StatusBadge } from "@/components/case/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * An illustrative CivicProof case, built from the product's own case
 * components rather than a picture of them — what the landing page shows is
 * what the product actually renders.
 *
 * The example is clearly labelled as an example. CivicProof shows no real
 * report, no real reporter, and no invented statistic anywhere in its
 * marketing (Docs/11-UI-UX.md §6).
 */
const EXAMPLE = {
  caseId: "CP-2026-000184",
  type: "Civic Problem",
  location: "Near the main bus stop, Tirur",
  description:
    "The drain at the junction is blocked and water covers the full width of the road. People are stepping into traffic to get around it.",
  summary:
    "A blocked storm drain has flooded a junction carriageway, forcing pedestrians into moving traffic. Reported as ongoing rather than a one-off.",
  direction: "Municipal corporation — roads and drainage",
  photos: 2,
} as const;

export function CasePreview() {
  return (
    <figure
      aria-label="An example of a CivicProof case, showing the case reference, the reporter's own words, an attached photo, an AI-assisted summary, a suggested severity and a suggested reporting direction."
      className="relative m-0"
    >
      {/* A second card, mostly hidden, to suggest a case list rather than a
          single one-off report. */}
      <div
        aria-hidden="true"
        className="absolute -top-3 right-3 left-3 h-16 rounded-xl bg-card shadow-sm ring-1 ring-foreground/8"
      />

      <Card className="relative" size="lg">
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-tight">
                {EXAMPLE.caseId}
              </span>
              <Badge variant="outline" className="text-[0.6875rem]">
                Example
              </Badge>
            </div>
            <StatusBadge status="CREATED" />
          </div>

          <Separator />

          <div className="flex gap-4">
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-foreground/10">
              <EvidenceThumbnail />
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-semibold">{EXAMPLE.type}</p>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {EXAMPLE.description}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                {EXAMPLE.location}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 rounded-lg bg-muted/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles aria-hidden="true" className="size-4 text-primary" />
              <h3 className="text-xs font-semibold tracking-wide uppercase">
                AI-assisted summary
              </h3>
              <Badge variant="outline" className="bg-card text-[0.6875rem]">
                Suggestion
              </Badge>
            </div>

            <p className="text-sm leading-relaxed">{EXAMPLE.summary}</p>

            <SeverityMeter severity="HIGH" />

            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <Signpost aria-hidden="true" className="size-3.5" />
                Suggested reporting direction
              </p>
              <p className="mt-1 text-sm font-medium">{EXAMPLE.direction}</p>
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera aria-hidden="true" className="size-3.5 shrink-0" />
            {EXAMPLE.photos} photos attached &middot; stored privately, never
            published
          </p>
        </CardContent>
      </Card>
    </figure>
  );
}
