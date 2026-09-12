import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section aria-labelledby="get-started" className="bg-primary text-primary-foreground">
      <Container>
        <div className="flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id="get-started"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Tell Sahayak what you need.
            </h2>
            <p className="mt-3 text-lg text-primary-foreground/80">
              Start from your situation. Sahayak works out the rest.
            </p>
          </div>

          <Button asChild size="xl" variant="secondary" className="shrink-0 self-start">
            <Link href="/chat">
              Start with Sahayak
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
