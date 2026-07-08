import Image from "next/image";

import { aboutHeroContent } from "@/content/about";
import styles from "./AboutHeroBanner.module.css";

export function AboutHeroBanner() {
  return (
    <section className={styles.section} aria-label="About Lagom Design">
      <div className={styles.imageWrap}>
        <Image
          src={aboutHeroContent.image}
          alt={aboutHeroContent.alt}
          fill
          priority
          sizes="100vw"
          className={styles.image}
        />
      </div>
    </section>
  );
}
