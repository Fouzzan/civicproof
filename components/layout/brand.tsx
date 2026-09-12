import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "cn";

/**
 * The Sahayak lockup.
 *
 * "Sahayak" means helper. The mark is a pair of hands rather than a crest or
 * seal: this product assists a citizen, it is not an authority and must never
 * look like one.
 */
export function BrandMark({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <HeartHandshake className="size-[1.125rem]" strokeWidth={2.25} />
    </span>
  );
}

export function Brand({
  href = "/",
  className,
}: {
  readonly href?: string;
  readonly className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span className="text-[1.0625rem] font-semibold tracking-tight">Sahayak</span>
        <span className="mt-0.5 hidden text-[0.6875rem] text-muted-foreground sm:block">
          Your guide to government support
        </span>
      </span>
    </Link>
  );
}
