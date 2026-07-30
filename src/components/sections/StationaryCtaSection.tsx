import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { stationaryCtaContent } from "@/content/stationary";
import styles from "./StationaryCtaSection.module.css";

export function StationaryCtaSection() {
  const { headline, body, ctaLabel, ctaHref } = stationaryCtaContent;

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="stationary-cta-title"
    >
      <div className={`container ${styles.inner}`}>
        <h2 id="stationary-cta-title" className={styles.headline}>
          {headline}
        </h2>
        <p className={styles.body}>{body}</p>
        <Link href={ctaHref} className={`button ${styles.cta}`}>
          {ctaLabel}
        </Link>
      </div>
    </RevealOnScroll>
  );
}
