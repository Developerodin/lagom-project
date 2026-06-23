import { BrandStatementSection } from "@/components/sections/BrandStatementSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { OurServicesSection } from "@/components/sections/OurServicesSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { OurPhilosophySection } from "@/components/sections/OurPhilosophySection";
import { TheLagomWaySection } from "@/components/sections/TheLagomWaySection";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <BrandStatementSection />
      <FeaturedWorkSection />
      <OurServicesSection />
      <TheLagomWaySection />
      <OurPhilosophySection />
      <ClientsSection />
    </>
  );
}
