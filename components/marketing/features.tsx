import { Camera, FileSearch, Signpost, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Camera,
    title: "Evidence-backed reports",
    body: "Attach a photo and it stays with the case — stored in private blob storage, never published, and never treated as proof simply because it was uploaded.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted understanding",
    body: "Your report is summarised and given a suggested severity before you file it, so you see what CivicProof made of it while you can still change it.",
  },
  {
    icon: Signpost,
    title: "A clear reporting direction",
    body: "Find out what kind of authority usually handles this, instead of guessing where to send it. CivicProof never sends anything on your behalf.",
  },
  {
    icon: FileSearch,
    title: "Transparent tracking",
    body: "Every case gets a reference and a timeline showing only what has actually happened — no invented progress, and no implied submission.",
  },
] as const;

export function Features() {
  return (
    <section aria-labelledby="features" className="border-b border-border bg-card">
      <Container>
        <div className="py-16 sm:py-20">
          <h2 id="features" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What CivicProof does
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Enough structure to be acted on, and nothing that overstates what
            has happened.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                size="lg"
                className="bg-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15"
              >
                <CardContent className="space-y-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon aria-hidden="true" className="size-5" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
