import { CaseStatus } from "@prisma/client";
import { cn } from "cn";

type StatusPresentation = {
  readonly label: string;
  readonly tone: string;
  readonly dot: string;
};

/**
 * Status wording is deliberately literal. "Filed" means saved to CivicProof and
 * nothing more — no label here may imply that a complaint reached an authority
 * when it has not (Docs/01-PROBLEM.md, "Problem Boundary").
 */
export const CASE_STATUS: Record<CaseStatus, StatusPresentation> = {
  CREATED: {
    label: "Filed",
    tone: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  READY_FOR_HANDOFF: {
    label: "Ready for handoff",
    tone: "border-primary/25 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  HANDED_OFF: {
    label: "Handed off",
    tone: "border-primary/25 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  IN_REVIEW: {
    label: "In review",
    tone: "border-severity-medium/25 bg-severity-medium/10 text-severity-medium",
    dot: "bg-severity-medium",
  },
  IN_PROGRESS: {
    label: "In progress",
    tone: "border-severity-medium/25 bg-severity-medium/10 text-severity-medium",
    dot: "bg-severity-medium",
  },
  RESOLVED: {
    label: "Resolved",
    tone: "border-severity-low/25 bg-severity-low/10 text-severity-low",
    dot: "bg-severity-low",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  readonly status: CaseStatus;
  readonly className?: string;
}) {
  const presentation = CASE_STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        presentation.tone,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", presentation.dot)} />
      {presentation.label}
    </span>
  );
}
