/**
 * Navigation structure for the CivicProof shell.
 *
 * The MVP has two audiences (see Docs/06-ARCHITECTURE-DECISION.md): the citizen
 * who reports and tracks a case, and the authority user who reviews and resolves
 * it. Those routes are built in later implementation tasks, so each item carries
 * an `enabled` flag: disabled items are rendered as inert labels rather than
 * links, so the shell never advertises a route that does not exist yet.
 */
export type NavAudience = "citizen" | "authority";

export type NavItem = {
  readonly label: string;
  readonly href: string;
  readonly audience: NavAudience;
  /** Flip to true in the task that actually creates the route. */
  readonly enabled: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Report an Incident",
    href: "/report",
    audience: "citizen",
    enabled: true,
  },
  {
    label: "My Cases",
    href: "/cases",
    audience: "citizen",
    enabled: false,
  },
  {
    label: "Authority",
    href: "/authority",
    audience: "authority",
    enabled: false,
  },
] as const;
