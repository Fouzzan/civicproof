import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Briefcase,
  GraduationCap,
  House,
  Sprout,
  UsersRound,
} from "lucide-react";

import { Container } from "@/components/layout/container";

/**
 * The areas of life Sahayak covers.
 *
 * Each card opens a real conversation rather than a filtered list: the opening
 * line is a plain sentence a person in that situation might actually say, which
 * is exactly what the agent is built to start from. Nothing here is a mock —
 * clicking Education begins the same journey as typing it.
 *
 * Every category holds two fictional demonstration schemes that differ on a
 * real criterion, so discovery has to choose rather than return the only thing
 * it has. The count is stated honestly rather than implied to be a full
 * national catalogue.
 */
const CATEGORIES = [
  {
    icon: GraduationCap,
    label: "Education",
    blurb: "Course costs, study materials and support while learning.",
    opener: "I need help with education costs.",
  },
  {
    icon: Briefcase,
    label: "Employment",
    blurb: "Support while looking for work, and routes into training.",
    opener: "I am looking for work and need support.",
  },
  {
    icon: UsersRound,
    label: "Senior Citizens",
    blurb: "Regular support for older people without a pension.",
    opener: "I am a senior citizen and need support.",
  },
  {
    icon: Sprout,
    label: "Agriculture",
    blurb: "Seasonal income support for small-scale farmers.",
    opener: "I farm a small piece of land and my income is low.",
  },
  {
    icon: House,
    label: "Housing",
    blurb: "Help with rent and essential repairs.",
    opener: "I need help with housing costs.",
  },
  {
    icon: Accessibility,
    label: "Accessibility",
    blurb: "Assistive equipment and home adaptations.",
    opener: "I have a disability and need help with equipment at home.",
  },
] as const;

export function ServiceCategories() {
  return (
    <section aria-labelledby="categories" className="border-t border-border bg-card">
      <Container>
        <div className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2
              id="categories"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              What can Sahayak help with?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Six areas of life, twelve demonstration services. Pick one, or just
              describe your situation — you do not need to know which applies.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => (
              <li key={category.label}>
                <Link
                  href={`/chat?situation=${encodeURIComponent(category.opener)}`}
                  className="group flex h-full flex-col rounded-xl border border-border bg-background p-5 transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-input hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <category.icon aria-hidden="true" className="size-5" />
                  </span>

                  <h3 className="mt-4 text-base font-semibold">{category.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {category.blurb}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Start here
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
