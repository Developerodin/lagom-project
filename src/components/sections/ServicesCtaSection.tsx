import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { servicesCtaContent } from "@/content/services";
import styles from "./ServicesCtaSection.module.css";

export function ServicesCtaSection() {
  const { headline, cta } = servicesCtaContent;

  const renderLine = (
    segments: ReadonlyArray<{ text: string; emphasis: boolean }>,
    key: string,
  ) => (
    <span key={key} className={styles.line}>
      {segments.map((segment) =>
        segment.emphasis ? (
          <strong key={segment.text} className={styles.emphasis}>
            {segment.text}
          </strong>
        ) : (
          <span key={segment.text}>{segment.text}</span>
        ),
      )}
    </span>
  );

  return (
    <RevealOnScroll
      as="section"
      className={styles.section}
      aria-labelledby="services-cta-title"
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h2 id="services-cta-title" className={styles.headline}>
            {renderLine(headline.line1, "line1")}
            {renderLine(headline.line2, "line2")}
          </h2>

          <Link href={cta.href} className="button button-primary">
            {cta.label}
          </Link>
        </div>
      </div>
    </RevealOnScroll>
  );
}
