import { notFound } from "next/navigation";

import { CardPreview } from "@/components/dev/card-preview";
import { Container } from "@/components/layout/container";

export const metadata = { title: "Card preview" };

/**
 * Development-only gallery of every inline card.
 *
 * Gated on NODE_ENV so it cannot be reached in a deployed build: it renders
 * fabricated applications and tracking IDs, which must never be visible
 * anywhere a citizen might mistake them for their own.
 */
export default function CardPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Container width="form">
      <div className="py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Card preview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every inline card with mock data. Development only — none of this is real.
        </p>
      </div>
      <CardPreview />
    </Container>
  );
}
