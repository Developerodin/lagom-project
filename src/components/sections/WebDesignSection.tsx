import Image from "next/image";
import Link from "next/link";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { webDesignSectionContent } from "@/content/services";
import styles from "./WebDesignSection.module.css";

export function WebDesignSection() {
  const { title, paragraphs, cta, images } = webDesignSectionContent;

  return (
    <RevealOnScroll
      as="section"
      className={`surface-primary section-md ${styles.section}`}
      aria-labelledby="web-design-title"
    >
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.imageCol}>
            <div className={styles.imageComposition}>
              <div className={styles.imageBack}>
                <Image
                  src={images.primary.src}
                  alt={images.primary.alt}
                  fill
                  sizes="(min-width: 993px) 28vw, (min-width: 769px) 40vw, 72vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.imageFront}>
                <Image
                  src={images.secondary.src}
                  alt={images.secondary.alt}
                  fill
                  sizes="(min-width: 993px) 28vw, (min-width: 769px) 40vw, 72vw"
                  className={styles.image}
                />
              </div>
            </div>
          </div>

          <div className={styles.contentCol}>
            <h2 id="web-design-title" className={styles.title}>
              {title}
            </h2>

            <div className={styles.paragraphs}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className={`body ${styles.paragraph}`}>
                  {paragraph}
                </p>
              ))}
            </div>

            <Link href={cta.href} className={`button ${styles.cta}`}>
              {cta.label}
            </Link>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
