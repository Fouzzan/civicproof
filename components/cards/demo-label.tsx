import { FlaskConical, Info } from "lucide-react";
import { cn } from "cn";

/**
 * The demonstration labelling.
 *
 * Requirement 11 is not decorative: a citizen must never leave this product
 * believing a fictional scheme is real or that a simulated submission reached a
 * government department. These two components are the only approved wording,
 * so the disclosure cannot drift between screens.
 */
export function DemoBadge({ className }: { readonly className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-2.5 py-1 text-xs font-semibold text-severity-medium",
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="size-3.5" />
      Demo scheme
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
