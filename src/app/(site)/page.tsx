import { BrandStatementSection } from "@/components/sections/BrandStatementSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { OurServicesSection } from "@/components/sections/OurServicesSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { OurPhilosophySection } from "@/components/sections/OurPhilosophySection";
import { TheLagomWaySection } from "@/components/sections/TheLagomWaySection";

import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <HeroBanner />
      <BrandStatementSection />
      <FeaturedWorkSection />
      <OurServicesSection />
      <TheLagomWaySection />
      <OurPhilosophySection />
      <ClientsSection />
    </div>
  );
}
