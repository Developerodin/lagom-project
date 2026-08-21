import type { Metadata } from "next";
import { AboutCtaSection } from "@/components/sections/AboutCtaSection";
import { AboutHeroBanner } from "@/components/sections/AboutHeroBanner";
import { FoundersDeskSection } from "@/components/sections/FoundersDeskSection";
import { OurProcessSection } from "@/components/sections/OurProcessSection";
import { OurServicesSection } from "@/components/sections/OurServicesSection";
import { TheStudioSection } from "@/components/sections/TheStudioSection";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Lagom Design — a branding and packaging studio rooted in Scandinavian sensibility and thoughtful, balanced design.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHeroBanner />
      <FoundersDeskSection />
      <TheStudioSection />
      <OurServicesSection variant="dark" loraTitle />
      <OurProcessSection loraTitle />
      <AboutCtaSection />
    </>
  );
}
