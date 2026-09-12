import { Eye, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";

/**
 * Three properties of the product, stated plainly.
 *
 * These are commitments the codebase actually keeps — private blob storage,
 * a labelled AI suggestion, a timeline of recorded events — not marketing
 * claims, and there is not a statistic among them.
 */
const SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Private evidence",
    body: "Photos are stored privately and never published.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted",
    body: "Always labelled a suggestion, never a decision.",
  },
  {
    icon: Eye,
    title: "Transparent case status",
    body: "A timeline of what has actually happened.",
  },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="How CivicProof handles your report" className="border-b border-border">
      <Container>
        <ul className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-3 sm:py-5">
          {SIGNALS.map((signal) => (
            <li key={signal.title} className="flex items-start gap-3">
              <signal.icon
                aria-hidden="true"
                className="mt-0.5 size-[1.125rem] shrink-0 text-primary"
              />
              <p className="text-sm leading-snug">
                <span className="font-semibold">{signal.title}</span>
                <span className="text-muted-foreground"> — {signal.body}</span>
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
