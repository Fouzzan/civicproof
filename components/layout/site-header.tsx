import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Container } from "@/components/layout/container";
import { HeaderNav } from "@/components/layout/header-nav";
import { Button } from "@/components/ui/button";

/**
 * Global header: brand, three destinations, the demonstration indicator, and
 * the session control.
 *
 * Deliberately short. Sahayak is one journey, and a long navigation bar would
 * mostly offer a citizen somewhere to go instead of starting it.
 *
 * Clerk Core 3 removed the <SignedIn>/<SignedOut> control components, so the
 * session is read server-side. That keeps signed-in state off the client: the
 * browser is told what to render, never asked.
 */
export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <Brand />
            <HeaderNav isSignedIn={Boolean(userId)} />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className="hidden items-center gap-1.5 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-2.5 py-1 text-xs font-semibold text-severity-medium sm:inline-flex"
              title="Fictional services, simulated applications"
            >
              <FlaskConical aria-hidden="true" className="size-3.5" />
              Demo
            </span>

            <Button asChild className="hidden sm:inline-flex">
              <Link href="/chat">Talk to Sahayak</Link>
            </Button>

            {userId ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button type="button" variant="ghost">
                  Sign in
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
