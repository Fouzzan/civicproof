import { SignInButton } from "@clerk/nextjs";
import {
  FlaskConical,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SahayakChat } from "@/components/chat/sahayak-chat";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { JourneyVisual } from "@/components/marketing/journey-visual";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * The Sahayak chat is the product's primary and only main screen.
 *
 * Signed-out visitors get the value proposition and one action, because the
 * conversation needs an identity to attach an application to. Signing in is one
 * click and provisions the user record automatically.
 *
 * The landing stays in the same narrow column as the chat rather than widening
 * into a marketing layout: the product is one conversation, and the page before
 * it should look like the beginning of that, not a different site.
 */
export const metadata = {
  title: "Sahayak — your guide to government support",
};

const POINTS = [
  {
    icon: MessageSquareQuote,
    title: "Start with your situation",
    body: "Describe what is happening in your own words. No scheme names, no forms.",
  },
  {
    icon: Sparkles,
    title: "Find out where you stand",
    body: "Sahayak asks only what it needs, then checks the scheme's actual rules — it never decides eligibility on its own.",
  },
  {
    icon: ShieldCheck,
    title: "Review before anything is filed",
    body: "Your application is prepared for you to check and correct. Nothing is submitted until you confirm.",
  },
] as const;

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  if (user) {
    return (
      <Container width="form">
        <SahayakChat />
      </Container>
    );
  }

  return (
    <>
      <Container width="form">
        <div className="py-12 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-3 py-1 text-xs font-semibold text-severity-medium">
            <FlaskConical aria-hidden="true" className="size-3.5" />
            Demonstration build
          </span>

          <h1 className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
            Your guide to government support.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Tell Sahayak what you need help with, in your own words. It works
            out what you may qualify for, asks only the questions that matter,
            and prepares the application for you to check.
          </p>

          <div className="mt-8">
            <SignInButton mode="modal">
              <Button type="button" size="xl">
                Start a conversation
              </Button>
            </SignInButton>
          </div>

          <div className="mt-14 sm:mt-16">
            <JourneyVisual />
          </div>

          <ul className="mt-14 space-y-6 sm:mt-16">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <point.icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{point.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-14 rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
            Sahayak is a demonstration. The welfare scheme it supports is
            fictional and its eligibility rules are invented for the demo.
            Submitting an application records it in a demo system only — it is
            never sent to a real government department.
          </p>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
