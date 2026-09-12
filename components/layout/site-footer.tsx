/**
 * Global application footer.
 *
 * The disclaimer is a product constraint, not decoration: CivicProof must never
 * present itself as a replacement for emergency services or an official
 * authority (Docs/01-PROBLEM.md, "Problem Boundary").
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-5xl space-y-1 px-4 py-6 text-xs text-muted-foreground">
        <p>
          CivicProof helps you turn an incident into a structured, trackable
          case. It does not replace emergency services, the police, or any
          official authority.
        </p>
        <p>Prototype build &mdash; not an official government service.</p>
      </div>
    </footer>
  );
}
