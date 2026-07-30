import Image from "next/image";
import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { aboutCtaContent } from "@/content/about";
import styles from "./AboutCtaSection.module.css";

export function AboutCtaSection() {
  const { headline, cta, collage } = aboutCtaContent;

  const renderLine = (
    segments: ReadonlyArray<{ text: string; emphasis: boolean }>,
    key: string,
    className?: string,
  ) => (
    <span key={key} className={`${styles.line} ${className ?? ""}`.trim()}>
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
      aria-labelledby="about-cta-title"
    >
      <div className={styles.layout}>
        <div className={styles.collageCol} aria-hidden="true">
          <Image
            src={collage.src}
            alt=""
            className={styles.collageImage}
            sizes="(max-width: 768px) 100vw, 55vw"
            quality={100}
            loading="lazy"
          />
        </div>

        <div className={styles.contentCol}>
          <h3 id="about-cta-title" className={styles.headline}>
            {renderLine(headline.line1, "line1", styles.lineFirst)}
            {renderLine(headline.line2, "line2")}
          </h3>

          <Link href={cta.href} className="button button-primary">
            {cta.label}
          </Link>
        </div>
      </div>
    </RevealOnScroll>
  );
}
