import { JourneySummary } from "@/components/journey/journey-summary";
import { SiteFooter } from "@/components/layout/site-footer";
import { FinalCta } from "@/components/marketing/final-cta";
import { HowSahayakWorks } from "@/components/marketing/how-sahayak-works";
import { JourneyPreview } from "@/components/marketing/journey-preview";
import { LandingHero } from "@/components/marketing/landing-hero";
import { PrivacySection } from "@/components/marketing/privacy-section";
import { ServiceCategories } from "@/components/marketing/service-categories";
import { ValueStrip } from "@/components/marketing/value-strip";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * The Sahayak landing page.
 *
 * Deliberately NOT the chat. A citizen arriving for the first time should see
 * what the product does across the whole journey before being dropped into a
 * conversation; someone returning mid-application goes straight to /chat.
 *
 * A signed-in citizen with history gets their journey summary near the top,
 * because for them "what happened to my application" outranks the pitch.
 */
export const metadata = {
  title: "Sahayak — government support, without the government language",
};

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  return (
    <>
      <LandingHero />
      <ValueStrip />
      {user ? <JourneySummary userId={user.id} /> : null}
      <ServiceCategories />
      <HowSahayakWorks />
      <JourneyPreview />
      <PrivacySection />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
