import { BalanceFoundSection } from "@/components/sections/BalanceFoundSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { HomeHeroSection } from "@/components/sections/HomeHeroSection";
import { OurServicesSection } from "@/components/sections/OurServicesSection";
import { SlidingImagesSection } from "@/components/sections/SlidingImagesSection";
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
      <HomeHeroSection />
      <BalanceFoundSection />
      <FeaturedWorkSection />
      <WorkMeasuredSection />
      <OurServicesSection />
      <TheLagomWaySection />
      <SlidingImagesSection />
      <OurPhilosophySection />
      <ClientsSection />
      <TestimonialsSection />
    </div>
  );
}
