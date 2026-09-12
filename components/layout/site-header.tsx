import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { FlaskConical } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/**
 * Global header: brand, the demonstration indicator, and the session control.
 *
 * There is no navigation. Sahayak is one conversation on one screen, and a nav
 * bar would only offer somewhere else to go.
 *
 * Clerk Core 3 removed the <SignedIn>/<SignedOut> control components, so the
 * session is read server-side. That also keeps signed-in state off the client:
 * the browser is told what to render, never asked.
 */
export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <Container width="form">
        <div className="flex h-16 items-center justify-between gap-4">
          <Brand />

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-severity-medium/30 bg-severity-medium/10 px-2.5 py-1 text-xs font-semibold text-severity-medium sm:inline-flex">
              <FlaskConical aria-hidden="true" className="size-3.5" />
              Demo
            </span>

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
