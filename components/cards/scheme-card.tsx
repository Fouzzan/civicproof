import { ClipboardList, Landmark } from "lucide-react";

import { DemoBadge } from "@/components/cards/demo-label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SchemeView } from "@/lib/agent/cards";
import type { Language } from "@/lib/i18n/language";
import { strings } from "@/lib/i18n/strings";

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

/** Category display name, authored in both languages. */
function categoryLabel(category: string, language: Language): string {
  const t = strings(language);
  const byCategory: Record<string, string> = {
    EDUCATION: t.categoryEDUCATION,
    EMPLOYMENT: t.categoryEMPLOYMENT,
    SENIOR_CITIZENS: t.categorySENIOR_CITIZENS,
    AGRICULTURE: t.categoryAGRICULTURE,
    HOUSING: t.categoryHOUSING,
    ACCESSIBILITY: t.categoryACCESSIBILITY,
  };

  return byCategory[category] ?? category;
}

/** Above this, a list of services reads as a catalogue rather than a suggestion. */
const SHORTLIST_LIMIT = 2;

function SchemeDetail({
  scheme,
  language,
}: {
  readonly scheme: SchemeView;
  readonly language: Language;
}) {
  const t = strings(language);
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
                {categoryLabel(scheme.category, language)}
              </span>
              {scheme.isDemo ? <DemoBadge language={language} /> : null}
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
            {t.schemeCriteriaTitle}
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

function CatalogueIndex({
  schemes,
  language,
}: {
  readonly schemes: readonly SchemeView[];
  readonly language: Language;
}) {
  const t = strings(language);
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
            {t.schemeCatalogueTitle}
          </h3>
          <DemoBadge language={language} />
        </div>

        <p className="text-sm text-muted-foreground">
          {schemes.length} {t.schemeCatalogueLead}{" "}
          {Object.keys(byCategory).length} {t.schemeCatalogueLeadTail}
        </p>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(byCategory).map(([category, group]) => (
            <div key={category}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {categoryLabel(category, language)}
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

export function SchemeCard({
  schemes,
  language = "en",
}: {
  readonly schemes: readonly SchemeView[];
  readonly language?: Language;
}) {
  if (schemes.length === 0) {
    return null;
  }

  if (schemes.length > SHORTLIST_LIMIT) {
    return <CatalogueIndex schemes={schemes} language={language} />;
  }

  return (
    <div className="space-y-3">
      {schemes.map((scheme) => (
        <SchemeDetail key={scheme.slug} scheme={scheme} language={language} />
      ))}
    </div>
  );
}
