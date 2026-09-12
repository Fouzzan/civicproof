import { TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Something went wrong, stated plainly.
 *
 * Never implies that work was lost or that anything was submitted, because a
 * failure here leaves the draft exactly as it was.
 */
export function ErrorCard({ message }: { readonly message: string }) {
  return (
    <Card className="border-l-4 border-l-destructive">
      <CardContent className="flex items-start gap-3">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
