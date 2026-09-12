"use client";

import { useState } from "react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import { cn } from "cn";

import { BrandMark } from "@/components/layout/brand";
import type { NavItem } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavProps = {
  readonly items: readonly NavItem[];
  readonly isSignedIn: boolean;
};

/**
 * Navigation for narrow screens. The desktop header hides its links at the same
 * breakpoint this appears at, so exactly one of them is ever reachable.
 *
 * Rows are 48px tall with the full width tappable — this is the navigation a
 * citizen uses one-handed, standing in front of the problem they are reporting.
 */
export function MobileNav({ items, isSignedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="sm:hidden"
          aria-label="Open menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 p-0 sm:max-w-[20rem]">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2.5 text-left">
            <BrandMark />
            <span className="text-[1.0625rem] font-semibold tracking-tight">
              Civic<span className="text-primary">Proof</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {item.label}
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-border p-4">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-sm text-muted-foreground">Your account</span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button type="button" className="w-full" size="lg">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
