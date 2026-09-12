import { TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Language } from "@/lib/i18n/language";
import { strings } from "@/lib/i18n/strings";

/**
 * Something went wrong, stated plainly.
 *
 * Never implies work was lost or that anything was submitted, because a failure
 * here leaves the draft exactly as it was.
 *
 * The heading is localised; the message itself arrives already written in the
 * citizen's language by the agent, or in English for transport-level failures
 * the agent never saw.
 */
export function ErrorCard({
  message,
  language = "en",
}: {
  readonly message: string;
  readonly language?: Language;
}) {
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardContent className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{strings(language).errorTitle}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
