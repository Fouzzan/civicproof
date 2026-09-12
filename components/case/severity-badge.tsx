import { CircleAlert, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import { cn } from "cn";

export type SeverityValue = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type SeverityPresentation = {
  readonly label: string;
  readonly meaning: string;
  readonly icon: typeof Info;
  readonly tone: string;
  readonly bar: string;
  /** Filled segments out of four, so severity reads as a position on a scale. */
  readonly level: 1 | 2 | 3 | 4;
};

export const SEVERITY: Record<SeverityValue, SeverityPresentation> = {
  LOW: {
    label: "Low",
    meaning: "Minor — no safety risk reported",
    icon: Info,
    tone: "border-severity-low/25 bg-severity-low/10 text-severity-low",
    bar: "bg-severity-low",
    level: 1,
  },
  MEDIUM: {
    label: "Medium",
    meaning: "Affects daily life or poses a limited hazard",
    icon: CircleAlert,
    tone: "border-severity-medium/25 bg-severity-medium/10 text-severity-medium",
    bar: "bg-severity-medium",
    level: 2,
  },
  HIGH: {
    label: "High",
    meaning: "Significant hazard, or a person was affected",
    icon: TriangleAlert,
    tone: "border-severity-high/25 bg-severity-high/10 text-severity-high",
    bar: "bg-severity-high",
    level: 3,
  },
  URGENT: {
    label: "Urgent",
    meaning: "Ongoing or imminent risk to a person",
    icon: OctagonAlert,
    tone: "border-severity-urgent/30 bg-severity-urgent/12 text-severity-urgent",
    bar: "bg-severity-urgent",
    level: 4,
  },
};

/**
 * A suggested severity.
 *
 * Three redundant signals carry the value — an icon shape, a written word, and
 * a filled position on a four-segment scale — so it survives greyscale printing
 * and colour-vision deficiency (Docs/03-REQUIREMENTS.md NFR-008). Colour alone
 * never carries it.
 */
export function SeverityBadge({
  severity,
  className,
}: {
  readonly severity: SeverityValue;
  readonly className?: string;
}) {
  const presentation = SEVERITY[severity];
  const Icon = presentation.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        presentation.tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {presentation.label}
    </span>
  );
}

/**
 * The severity badge plus its scale and plain-language meaning, for places with
 * room to explain rather than only label.
 */
export function SeverityMeter({
  severity,
  className,
}: {
  readonly severity: SeverityValue;
  readonly className?: string;
}) {
  const presentation = SEVERITY[severity];

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Suggested severity
        </span>
        <SeverityBadge severity={severity} />
      </div>

      <div
        className="flex gap-1"
        role="img"
        aria-label={`Severity ${presentation.label}, level ${presentation.level} of 4`}
      >
        {([1, 2, 3, 4] as const).map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              segment <= presentation.level ? presentation.bar : "bg-border",
            )}
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{presentation.meaning}</p>
    </div>
  );
}
