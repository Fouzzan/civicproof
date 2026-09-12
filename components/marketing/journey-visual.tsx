import { CircleCheck, FileText, MessageSquareQuote } from "lucide-react";

/**
 * A depth-stacked view of the journey, for the landing page.
 *
 * Built from CSS 3D transforms rather than WebGL on purpose. A canvas library
 * would add hundreds of kilobytes to the first page a citizen loads, to
 * decorate a product whose whole point is being usable on a modest phone. This
 * renders as plain markup, costs nothing beyond the CSS already shipped, and
 * degrades to three stacked cards if transforms are unsupported.
 *
 * It also earns its place by saying something true: the three cards are the
 * three things the citizen actually gets — their own words, a checked result,
 * and a reference they can keep.
 *
 * The global prefers-reduced-motion rule in app/globals.css stills the float.
 */
const LAYERS = [
  {
    icon: MessageSquareQuote,
    label: "Your words",
    body: "I am a farmer and my income is low.",
  },
  {
    icon: CircleCheck,
    label: "Checked against the real rules",
    body: "Likely eligible — all four criteria met.",
  },
  {
    icon: FileText,
    label: "A reference you can keep",
    body: "DEMO-482913 · Submitted",
  },
] as const;

export function JourneyVisual() {
  return (
    <figure
      aria-label="Three stages of a Sahayak case: the citizen's own words, an eligibility result checked against the scheme's rules, and a tracking reference."
      className="relative m-0 [perspective:1200px]"
    >
      <div className="flex flex-col gap-3 [transform-style:preserve-3d] sm:gap-4 sm:[transform:rotateX(6deg)_rotateY(-9deg)]">
        {LAYERS.map((layer, index) => (
          <div
            key={layer.label}
            aria-hidden="true"
            className="animate-float rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/5 lg:shadow-lg"
            style={{
              transform: `translateZ(${index * 26}px)`,
              marginLeft: `${index * 14}px`,
              animationDelay: `${index * 700}ms`,
            }}
          >
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <layer.icon aria-hidden="true" className="size-3.5 text-primary" />
              {layer.label}
            </p>
            <p
              className={
                index === 2
                  ? "mt-1.5 font-mono text-sm font-semibold"
                  : "mt-1.5 text-sm leading-relaxed"
              }
            >
              {layer.body}
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
}
