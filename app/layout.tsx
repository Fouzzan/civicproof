import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

// Variable names match the @theme tokens in app/globals.css.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sahayak — your guide to government support",
    template: "%s · Sahayak",
  },
  description:
    "Sahayak helps citizens describe their situation in plain language, find out what government support may apply, and prepare an application. Demonstration build with a fictional scheme and simulated submission.",
  applicationName: "Sahayak",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <a
            href="#main-content"
            className="sr-only rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
          >
            Skip to main content
          </a>
          <SiteHeader />
          {/*
            The footer is rendered by the landing page rather than here: the
            chat is a fixed-height app screen, and a document footer below it
            would sit under the composer where nobody will ever see it. The
            demonstration disclosure is still on every screen — the header
            carries a Demo chip and the composer restates it.
          */}
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
