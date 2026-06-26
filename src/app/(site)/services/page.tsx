import type { Metadata } from "next";
import { BrandStatementSection } from "@/components/sections/BrandStatementSection";
import { BrandingSection } from "@/components/sections/BrandingSection";
import { PackagingSection } from "@/components/sections/PackagingSection";
import { WebDesignSection } from "@/components/sections/WebDesignSection";
import { SocialMediaSection } from "@/components/sections/SocialMediaSection";
import { IllustrationsSection } from "@/components/sections/IllustrationsSection";
import { OurProcessSection } from "@/components/sections/OurProcessSection";
import { ServicesCtaSection } from "@/components/sections/ServicesCtaSection";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <>
      <BrandStatementSection loraTitle />
      <BrandingSection />
      <PackagingSection />
      <WebDesignSection />
      <SocialMediaSection />
      <IllustrationsSection />
      <OurProcessSection loraTitle />
      <ServicesCtaSection />
    </>
  );
}
