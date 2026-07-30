import type { Metadata } from "next";

import { StationaryCatalogSection } from "@/components/sections/StationaryCatalogSection";
import { StationaryCollectionSection } from "@/components/sections/StationaryCollectionSection";
import { StationaryCtaSection } from "@/components/sections/StationaryCtaSection";
import { StationaryHeroSection } from "@/components/sections/StationaryHeroSection";
import { StationaryRealRequestsSection } from "@/components/sections/StationaryRealRequestsSection";
import { StationaryValuesSection } from "@/components/sections/StationaryValuesSection";

export const metadata: Metadata = {
  title: "Stationary",
  description:
    "Lagom Design stationery — custom paper goods designed with intention, printed with care, and delivered to your door.",
};

export default function StationaryPage() {
  return (
    <>
      <StationaryHeroSection />
      <StationaryCatalogSection />
      <StationaryRealRequestsSection />
      <StationaryValuesSection />
      <StationaryCollectionSection />
      <StationaryCtaSection />
    </>
  );
}
