import { BrandStatementSection } from "@/components/sections/BrandStatementSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { OurServicesSection } from "@/components/sections/OurServicesSection";
import { WorkMeasuredSection } from "@/components/sections/WorkMeasuredSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { OurPhilosophySection } from "@/components/sections/OurPhilosophySection";
import { TheLagomWaySection } from "@/components/sections/TheLagomWaySection";

import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className={styles.home}>
      <BrandStatementSection variant="inverted" />
      <HeroBanner />
      <FeaturedWorkSection />
      <WorkMeasuredSection />
      <OurServicesSection />
      <TheLagomWaySection />
      <OurPhilosophySection />
      <ClientsSection />
      <TestimonialsSection />
    </div>
  );
}
