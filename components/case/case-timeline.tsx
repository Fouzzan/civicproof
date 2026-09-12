import { TimelineEventType } from "@prisma/client";
import {
  CircleCheck,
  FileCheck2,
  FilePlus2,
  Landmark,
  ListChecks,
  Send,
  Sparkles,
} from "lucide-react";

type TimelineEntry = {
  readonly id: string;
  readonly eventType: TimelineEventType;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
};

const EVENT_ICON: Record<TimelineEventType, typeof FilePlus2> = {
  CASE_CREATED: FilePlus2,
  AI_ANALYSIS_COMPLETED: Sparkles,
  COMPLAINT_PREPARED: FileCheck2,
  OFFICIAL_HANDOFF: Send,
  AUTHORITY_REVIEW: Landmark,
  STATUS_UPDATED: ListChecks,
  RESOLUTION_RECORDED: CircleCheck,
};

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

/**
 * What has actually happened to this case, in order.
 *
 * Only recorded events are drawn — there are no greyed-out future stages,
 * because showing a "Handed off" step ahead of time would imply a submission
 * that CivicProof has not made (Docs/07-DATABASE.md §2.5).
 */
export function CaseTimeline({ events }: { readonly events: readonly TimelineEntry[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const Icon = EVENT_ICON[event.eventType];
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-border"
              />
            ) : null}

            <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-sm ring-1 ring-border">
              <Icon aria-hidden="true" className="size-4" />
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-semibold">{event.title}</p>
              {event.description ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              ) : null}
              <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                <time dateTime={event.createdAt.toISOString()}>
                  {formatTimestamp(event.createdAt)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
