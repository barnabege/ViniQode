// app/page.tsx
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { ScrollResetOnReload } from "@/components/landing/ScrollResetOnReload";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PullQuoteSection } from "@/components/landing/PullQuoteSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaFinalSection } from "@/components/landing/CtaFinalSection";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <ScrollResetOnReload />
      <main>
        <HeroSection />
        <StatsSection />
        <ComparisonSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PullQuoteSection />
        <PricingSection />
        <FaqSection />
        <CtaFinalSection />
      </main>
      <Footer />
    </>
  );
}
