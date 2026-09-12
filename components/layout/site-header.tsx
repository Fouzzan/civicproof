import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { NAV_ITEMS } from "@/components/layout/nav-items";

/**
 * Global application header: CivicProof brand plus the citizen/authority
 * navigation skeleton. Rendered as a server component - it holds no state.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          <span className="text-base font-semibold tracking-tight">
            CivicProof
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {NAV_ITEMS.map((item) =>
              item.enabled ? (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.href}>
                  <span
                    aria-disabled="true"
                    title="Available in a later implementation task"
                    className="cursor-not-allowed text-muted-foreground/50"
                  >
                    {item.label}
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
