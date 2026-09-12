import { Container } from "@/components/layout/container";

/**
 * Global application footer.
 *
 * The disclaimer is a product constraint, not decoration: Sahayak must never
 * present itself as a government service or imply that anything it records was
 * sent to an authority. It stays on every page for that reason.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <Container width="form">
        <div className="space-y-2 py-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            Sahayak is a demonstration of an AI assistant for government welfare
            schemes. The scheme it supports is <strong>fictional</strong>, and its
            eligibility criteria are invented for the demo.
          </p>
          <p>
            Submission and status are <strong>simulated</strong>. Nothing is sent
            to a real government department, and Sahayak is not an official
            service.
          </p>
        </div>
      </Container>
    </footer>
  );
}
