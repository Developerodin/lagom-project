import Image from "next/image";
import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { packagingSectionContent } from "@/content/services";
import styles from "./PackagingSection.module.css";

export function PackagingSection() {
  const { title, paragraphs, cta, images } = packagingSectionContent;

  return (
    <RevealOnScroll
      as="section"
      className={`surface-accent section-md ${styles.section}`}
      aria-labelledby="packaging-title"
    >
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.contentCol}>
            <h2 id="packaging-title" className={styles.title}>
              {title}
            </h2>

            <div className={styles.paragraphs}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className={`body ${styles.paragraph}`}>
                  {paragraph}
                </p>
              ))}
            </div>

            <Link href={cta.href} className="button button-primary">
              {cta.label}
            </Link>
          </div>

          <div className={styles.imageCol}>
            <div className={styles.imageComposition}>
              <div className={styles.imageBack}>
                <Image
                  src={images.primary.src}
                  alt={images.primary.alt}
                  fill
                  sizes="(min-width: 993px) 28vw, (min-width: 769px) 40vw, 72vw"
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </div>
              <div className={styles.imageFront}>
                <Image
                  src={images.secondary.src}
                  alt={images.secondary.alt}
                  fill
                  sizes="(min-width: 993px) 28vw, (min-width: 769px) 40vw, 72vw"
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
