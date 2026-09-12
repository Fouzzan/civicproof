"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

/**
 * The three places worth going.
 *
 * "My Journey" only appears for a signed-in citizen, because for everyone else
 * it leads to an empty section — a navigation item that resolves to nothing is
 * worse than one that is absent.
 *
 * A client component solely so the current route can be marked; the signed-in
 * state is decided on the server and passed down.
 */
const ITEMS = [
  { label: "Explore services", href: "/#categories", signedInOnly: false },
  { label: "How it works", href: "/#how-it-works", signedInOnly: false },
  { label: "My journey", href: "/#journey", signedInOnly: true },
] as const;

export function HeaderNav({ isSignedIn }: { readonly isSignedIn: boolean }) {
  const pathname = usePathname();
  const visible = ITEMS.filter((item) => !item.signedInOnly || isSignedIn);

  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {visible.map((item) => {
          // Anchors all live on the landing page, so "current" is about which
          // page you are on, not which section is in view.
          const isActive = pathname === "/" && item.href.startsWith("/#");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
