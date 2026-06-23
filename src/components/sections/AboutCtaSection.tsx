import Image from "next/image";
import Link from "next/link";

import { aboutCtaCollageItems, aboutCtaContent } from "@/content/about";
import styles from "./AboutCtaSection.module.css";

export function AboutCtaSection() {
  const { headline, cta } = aboutCtaContent;

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
    <section
      className={styles.section}
      aria-labelledby="about-cta-title"
    >
      <div className={styles.layout}>
        <div className={styles.collageCol} aria-hidden="true">
          <div className={styles.collage}>
            {aboutCtaCollageItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.collageItem} ${styles[`item${item.id}`]}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 993px) 12vw, (min-width: 769px) 18vw, 44vw"
                  className={styles.collageImage}
                />
              </div>
            ))}
          </div>
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
    </section>
  );
}
