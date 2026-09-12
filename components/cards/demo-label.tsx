import { FlaskConical, Info } from "lucide-react";
import { cn } from "cn";

import type { Language } from "@/lib/i18n/language";
import { strings } from "@/lib/i18n/strings";

/**
 * The demonstration labelling.
 *
 * Not decorative: a citizen must never leave this product believing a fictional
 * service is real, or that a simulated submission reached a government
 * department. These two components are the only approved wording, so the
 * disclosure cannot drift between screens — or between languages.
 *
 * `language` defaults to English so marketing and preview surfaces, which have
 * no conversation to take a language from, keep working untouched.
 */
export function DemoBadge({
  className,
  language = "en",
}: {
  readonly className?: string;
  readonly language?: Language;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-2.5 py-1 text-xs font-semibold text-severity-medium",
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="size-3.5" />
      {strings(language).demoBadge}
    </span>
  );
}

export function SimulatedNotice({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
