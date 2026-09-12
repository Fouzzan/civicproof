import {
  Accessibility,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HeartHandshake,
  House,
  ListChecks,
  Sprout,
  UsersRound,
} from "lucide-react";

/**
 * The shape of the product, in one picture.
 *
 * Six areas of life converge on one assistant, and what comes out the other
 * side is a completed journey — not a list of links. That convergence is the
 * whole argument: a citizen does not have to know which of the six they are in,
 * and the work continues past the point where a directory would stop.
 *
 * Deliberately NOT another numbered 1-2-3-4-5 sequence. The page already
 * explains the steps in "How Sahayak works"; repeating them here would be
 * three renditions of the same list.
 *
 * CSS only — no canvas, no WebGL, no animation library. The float is stilled by
 * the global prefers-reduced-motion rule.
 */
const SOURCES = [
  { icon: GraduationCap, label: "Education" },
  { icon: Briefcase, label: "Employment" },
  { icon: UsersRound, label: "Seniors" },
  { icon: Sprout, label: "Agriculture" },
  { icon: House, label: "Housing" },
  { icon: Accessibility, label: "Access" },
] as const;

const OUTCOMES = [
  { icon: ListChecks, label: "Checked" },
  { icon: FileText, label: "Prepared" },
  { icon: ClipboardCheck, label: "Tracked" },
] as const;

export function ServiceConstellation() {
  return (
    <figure
      aria-label="Six areas of life — education, employment, senior citizens, agriculture, housing and accessibility — all lead into Sahayak, which checks eligibility, prepares an application and tracks it."
      className="relative m-0"
    >
      <div aria-hidden="true" className="space-y-4">
        <ul className="grid grid-cols-3 gap-2">
          {SOURCES.map((source, index) => (
            <li
              key={source.label}
              className="animate-float flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 shadow-sm"
              style={{ animationDelay: `${index * 380}ms` }}
            >
              <source.icon className="size-4 text-primary" />
              <span className="text-[0.6875rem] font-medium text-muted-foreground">
                {source.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Converging lines: six above, one below. */}
        <div className="relative h-7">
          <span className="absolute inset-x-[16%] top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-border to-primary/50" />
        </div>

        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-4 shadow-sm">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <HeartHandshake className="size-5" strokeWidth={2.25} />
          </span>
          <span className="text-sm font-semibold">Sahayak</span>
          <span className="text-[0.6875rem] text-muted-foreground">
            understands your situation
          </span>
        </div>

        <div className="relative h-7">
          <span className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 to-border" />
          <span className="absolute inset-x-[16%] bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <ul className="grid grid-cols-3 gap-2">
          {OUTCOMES.map((outcome, index) => (
            <li
              key={outcome.label}
              className="animate-float flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 shadow-sm"
              style={{ animationDelay: `${(index + 3) * 380}ms` }}
            >
              <outcome.icon className="size-4 text-primary" />
              <span className="text-[0.6875rem] font-medium text-muted-foreground">
                {outcome.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
