import { EyeOff, FlaskConical, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";

/**
 * The privacy position, made visible in the product.
 *
 * "Why should citizens trust a private company with their data?" is the first
 * question a judge asks, and "our database is secure" is not an answer. The
 * answer is that Sahayak asks for very little and refuses the rest — which is
 * enforced in the catalogue, not just promised here: the eligibility suite
 * fails if any scheme defines a fact matching aadhaar, pan, bank, password,
 * otp or biometric.
 */
const NOT_COLLECTED = [
  "Aadhaar number",
  "PAN number",
  "Bank account details",
  "Passwords",
  "OTPs",
  "Government portal logins",
] as const;

const COLLECTED = [
  "Your age, if the service needs it",
  "Roughly what your household earns",
  "A yes or no about your situation",
  "A name and district, once you qualify",
] as const;

export function PrivacySection() {
  return (
    <section aria-labelledby="privacy" className="border-t border-border">
      <Container>
        <div className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 id="privacy" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Help without handing over everything.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Sahayak asks only for what the service in front of you actually
              requires, and only while you are working on it. It is not building
              a profile of you.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck aria-hidden="true" className="size-4 text-severity-low" />
                What it asks for
              </p>
              <ul className="mt-3 space-y-2">
                {COLLECTED.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-severity-low"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <EyeOff aria-hidden="true" className="size-4 text-muted-foreground" />
                What it never asks for
              </p>
              <ul className="mt-3 space-y-2">
                {NOT_COLLECTED.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono">
                      &times;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-severity-medium/30 bg-severity-medium/10 p-4 text-sm leading-relaxed">
            <FlaskConical
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-severity-medium"
            />
            <span>
              <strong className="font-semibold">This is a demonstration.</strong> The
              services are fictional, applications are simulated, and nothing is sent
              to a real government department. A production service would also need
              privacy notices, retention rules, audit logging and DPDP compliance —
              none of which this prototype claims to have.
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
