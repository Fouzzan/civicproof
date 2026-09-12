import { CircleCheck, Lock, MessageSquareQuote, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";

/**
 * Four properties of the product, each one defensible.
 *
 * Deliberately no "speak naturally" claim: voice has its own phase and is not
 * implemented, so advertising it here would be a promise the product cannot
 * keep the moment a judge presses the microphone. "Plain language" is the part
 * that is true today.
 */
const VALUES = [
  {
    icon: Sparkles,
    title: "AI guided",
    body: "Sahayak reads your situation. Eligibility is decided by fixed rules, not by the model.",
  },
  {
    icon: MessageSquareQuote,
    title: "Plain language",
    body: "No forms to start, no scheme names to look up, no official vocabulary.",
  },
  {
    icon: Lock,
    title: "Only what is needed",
    body: "Just the facts this service requires. No Aadhaar, passwords, OTPs or bank details.",
  },
  {
    icon: CircleCheck,
    title: "You stay in control",
    body: "Nothing is prepared without you, and nothing is submitted until you confirm.",
  },
] as const;

export function ValueStrip() {
  return (
    <section aria-label="How Sahayak works with you" className="border-t border-border">
      <Container>
        <ul className="grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <li key={value.title} className="flex items-start gap-3">
              <value.icon
                aria-hidden="true"
                className="mt-0.5 size-[1.125rem] shrink-0 text-primary"
              />
              <div>
                <p className="text-sm font-semibold">{value.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
