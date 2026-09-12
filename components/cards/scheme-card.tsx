import { ClipboardList, Landmark } from "lucide-react";

import { DemoBadge } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SchemeView } from "@/lib/agent/cards";

/**
 * What Sahayak can help with.
 *
 * Two presentations, because the tool returns two very different things
 * depending on where the conversation is.
 *
 * A SHORTLIST of one or two services gets the full treatment: criteria up
 * front, so the eligibility result that follows feels checkable rather than
 * pronounced.
 *
 * The WHOLE CATALOGUE gets a compact index instead. Discovery currently returns
 * every active service — twelve of them — and rendering twelve full cards
 * produces a wall a citizen has to scroll past to reach the answer they came
 * for. Nothing is hidden: every service is still listed, grouped by area, with
 * the count stated. The rich card returns on its own once discovery ranks.
 */
const CATEGORY_LABEL: Record<string, string> = {
  EDUCATION: "Education",
  EMPLOYMENT: "Employment",
  SENIOR_CITIZENS: "Senior Citizens",
  AGRICULTURE: "Agriculture",
  HOUSING: "Housing",
  ACCESSIBILITY: "Accessibility",
};

/** Above this, a list of services reads as a catalogue rather than a suggestion. */
const SHORTLIST_LIMIT = 2;

function label(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}

function SchemeDetail({ scheme }: { readonly scheme: SchemeView }) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark aria-hidden="true" className="size-4.5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label(scheme.category)}
              </span>
              {scheme.isDemo ? <DemoBadge /> : null}
            </div>
            <h3 className="text-base font-semibold">{scheme.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {scheme.summary}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <ClipboardList aria-hidden="true" className="size-3.5" />
            To qualify, you need to meet all of these
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {scheme.criteria.map((criterion) => (
              <li key={criterion} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <span
                  aria-hidden="true"
                  className="mt-[0.4rem] size-1.5 shrink-0 rounded-full bg-primary"
                />
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogueIndex({ schemes }: { readonly schemes: readonly SchemeView[] }) {
  const byCategory = schemes.reduce<Record<string, SchemeView[]>>((groups, scheme) => {
    (groups[scheme.category] ??= []).push(scheme);
    return groups;
  }, {});

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark aria-hidden="true" className="size-4" />
          </span>
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Services Sahayak covers
          </h3>
          <DemoBadge />
        </div>

        <p className="text-sm text-muted-foreground">
          {schemes.length} demonstration services across{" "}
          {Object.keys(byCategory).length} areas of life. Tell me your situation
          and I&rsquo;ll work out which apply.
        </p>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(byCategory).map(([category, group]) => (
            <div key={category}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label(category)}
              </p>
              <ul className="mt-1.5 space-y-1">
                {group.map((scheme) => (
                  <li key={scheme.slug} className="text-sm leading-relaxed">
                    {scheme.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SchemeCard({ schemes }: { readonly schemes: readonly SchemeView[] }) {
  if (schemes.length === 0) {
    return null;
  }

  if (schemes.length > SHORTLIST_LIMIT) {
    return <CatalogueIndex schemes={schemes} />;
  }

  return (
    <div className="space-y-3">
      {schemes.map((scheme) => (
        <SchemeDetail key={scheme.slug} scheme={scheme} />
      ))}
    </div>
  );
}
