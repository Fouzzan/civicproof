import { cn } from "cn";

/**
 * A drawn stand-in for an evidence photo, used only in the marketing preview.
 *
 * Deliberately an illustration rather than a stock photograph: a photograph
 * would imply a real report by a real person, and CivicProof must not put
 * fabricated evidence in front of anyone (Docs/11-UI-UX.md §6).
 *
 * It is painted from the chart tokens, so it follows the theme instead of
 * introducing colours of its own.
 */
export function EvidenceThumbnail({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={cn("size-full", className)}
    >
      <rect width="160" height="120" fill="var(--muted)" />

      {/* Sky, then a low skyline that reads as "a street somewhere". */}
      <rect width="160" height="54" fill="var(--chart-5)" opacity="0.55" />
      <rect x="6" y="26" width="24" height="28" fill="var(--chart-4)" opacity="0.45" />
      <rect x="34" y="16" width="17" height="38" fill="var(--chart-4)" opacity="0.35" />
      <rect x="112" y="22" width="21" height="32" fill="var(--chart-4)" opacity="0.4" />
      <rect x="137" y="32" width="18" height="22" fill="var(--chart-4)" opacity="0.3" />

      {/* Kerb line and road surface. */}
      <rect y="50" width="160" height="5" fill="var(--chart-3)" opacity="0.4" />
      <rect y="55" width="160" height="65" fill="var(--chart-4)" opacity="0.3" />

      {/* Standing water in a broken patch of road — the reported problem. */}
      <ellipse cx="98" cy="86" rx="40" ry="18" fill="var(--chart-2)" opacity="0.5" />
      <ellipse cx="98" cy="86" rx="26" ry="10" fill="var(--chart-1)" opacity="0.45" />
      <path
        d="M80 82c6-3 14-3 20-1"
        stroke="var(--card)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Lane markings, interrupted by the water. */}
      <g fill="var(--card)" opacity="0.65">
        <rect x="6" y="104" width="20" height="3" rx="1.5" />
        <rect x="36" y="104" width="20" height="3" rx="1.5" />
        <rect x="132" y="104" width="20" height="3" rx="1.5" />
      </g>

      {/* Streetlight, for scale. */}
      <rect x="22" y="14" width="3" height="41" fill="var(--chart-3)" opacity="0.6" />
      <path
        d="M23.5 15c0-4 3-6 7-6h6"
        stroke="var(--chart-3)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
