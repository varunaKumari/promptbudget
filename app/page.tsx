import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingLogos } from "@/components/landing/logos";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingFeatures } from "@/components/landing/features";
import { LandingSocialProof } from "@/components/landing/social-proof";
import { LandingCta } from "@/components/landing/cta";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "PromptBudget — Free AI Spend Audit for Startups",
  description:
    "Find out if you're overspending on AI tools. Get a free, instant audit of your Cursor, Copilot, Claude, ChatGPT, and Gemini subscriptions — with actionable savings.",
  openGraph: {
    title: "PromptBudget — Free AI Spend Audit for Startups",
    description:
      "Find out if you're overspending on AI tools. Instant audit. Real savings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptBudget — Free AI Spend Audit",
    description:
      "Your team is probably overspending on AI tools. Find out in 2 minutes.",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <LandingLogos />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingSocialProof />
        <LandingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
