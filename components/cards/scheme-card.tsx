import { ClipboardList, Landmark } from "lucide-react";

import { DemoBadge } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SchemeView } from "@/lib/agent/cards";

/**
 * What Sahayak can actually help with.
 *
 * Shown the moment a scheme is matched, before any questions are asked, so the
 * citizen knows what they are being asked about and why. The criteria are the
 * scheme's own stored wording — seeing them up front is also what makes the
 * later eligibility result feel checkable rather than pronounced.
 */
export function SchemeCard({ schemes }: { readonly schemes: readonly SchemeView[] }) {
  if (schemes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {schemes.map((scheme) => (
        <Card key={scheme.slug}>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Landmark aria-hidden="true" className="size-4.5" />
              </span>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{scheme.name}</h3>
                  {scheme.isDemo ? <DemoBadge /> : null}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {scheme.summary}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <ClipboardList aria-hidden="true" className="size-3.5" />
                To qualify, you need to meet all of these
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {scheme.criteria.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-[0.4rem] size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
